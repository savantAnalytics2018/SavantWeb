/**
 * "Market Research" research-request endpoint — Web-standard Request/Response.
 *
 * Same shape and defenses as api/contact.ts (honeypot, timing check, per-IP
 * rate limit, server-side validation, no content logging). On success it:
 *   1. generates a request reference (TYI-YYYY-XXXXXX),
 *   2. emails Savant a structured brief (reply-to the prospect),
 *   3. emails the prospect a confirmation that repeats the brief and reference,
 *   4. returns { ok: true, reference } so the success screen can show it.
 *
 * Environment (server-only, never VITE_-prefixed):
 *   STUDY_TO          inbox for new research requests (falls back to CONTACT_TO)
 *   CONTACT_FROM      sending address on a domain verified with the provider
 *   RESEND_API_KEY    Resend API key — only if Resend is the approved processor
 *   STUDY_TURNAROUND  optional fixed window for the confirmation email, e.g. "within 48 business hours"
 *
 * If delivery is not configured the endpoint returns 503 and the wizard shows
 * an error — it never fakes a successful submission.
 *
 * Request states (New → Needs Clarification → Accepted → In Progress →
 * Delivered / Declined) are tracked by Savant in the inbox or CRM for phase
 * one; no database is introduced here.
 */

import { coerceStudy, emailDomain, makeReference, studyPriority, validateStudy, type StudyInput } from '../src/lib/studyConfig';
import { buyerTypes, decisionTypes } from '../src/content/testYourIdea';
import { signToken, verifyToken } from './studyToken';

const CONFIRM_TTL_S = 7 * 24 * 60 * 60;
const confirmSecret = () => process.env.STUDY_CONFIRM_SECRET || process.env.RESEND_API_KEY || '';

const MAX_BODY_BYTES = 48 * 1024;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const hits = new Map<string, number[]>();
function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > MAX_PER_WINDOW;
}

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const label = (list: { id: string; label: string }[], id: string) => list.find((x) => x.id === id)?.label ?? (id || '—');
const or = (s: string) => s.trim() || '—';

/** Plain-text brief shared by both emails. */
export function formatBrief(v: StudyInput, reference: string): string {
  const concepts = v.concepts
    .filter((c) => c.name.trim() || c.description.trim())
    .map((c, i) => [`  ${i + 1}. ${or(c.name)}`, `     ${or(c.description)}`, c.url.trim() ? `     Link: ${c.url.trim()}` : null].filter(Boolean).join('\n'))
    .join('\n');
  return [
    `Request reference: ${reference}`,
    ``,
    `1. DECISION`,
    `Type: ${label(decisionTypes, v.decisionType)}${v.decisionType === 'other' && v.otherDetail.trim() ? ` — ${v.otherDetail.trim()}` : ''}`,
    `Question: ${v.question.trim()}`,
    `Context / alternatives: ${or(v.context)}`,
    `Decide by: ${or(v.decideBy)}`,
    `If wrong: ${or(v.stakes)}`,
    ``,
    `2. AUDIENCE`,
    `Description: ${v.audience.trim()}`,
    `Geography: ${or(v.geography)}`,
    `Buyer type: ${label(buyerTypes, v.buyerType)}`,
    ``,
    `3. CONCEPTS TO COMPARE`,
    concepts || '  —',
    `Questions to include: ${or(v.extraQuestions)}`,
    ``,
    `4. CONTACT`,
    `Name: ${v.name.trim()}`,
    `Company: ${v.company.trim()}`,
    `Work email: ${v.email.trim()}`,
    `Company website: ${or(v.companySite)}`,
    `Role: ${or(v.role)}`,
    `Processing consent: ${v.consent ? 'yes' : 'no'}`,
  ].join('\n');
}

/** Internal-only lines appended to the Savant copy (never sent to the prospect). */
export function formatTriage(v: StudyInput): string {
  const priority = studyPriority(v.email);
  return [
    `5. TRIAGE (internal)`,
    `Priority: ${priority === 'review' ? `REVIEW — consumer mailbox; organisation given as ${or(v.companySite)}` : 'standard — company domain'}`,
    `Company domain: ${emailDomain(v.email) || '—'}  (limits: one request per person, two per company)`,
    `Source: ${or(v.source)}`,
    `Decision type: ${label(decisionTypes, v.decisionType)}`,
    `Decision-Study candidate: ${v.decideBy.trim() || v.stakes.trim() ? 'possibly — has a date or stakes' : 'unknown'}`,
  ].join('\n');
}

async function send(apiKey: string, payload: Record<string, unknown>): Promise<boolean> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.ok;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json(405, { ok: false, message: 'Method not allowed.' });

  const to = process.env.STUDY_TO || process.env.CONTACT_TO;
  const from = process.env.CONTACT_FROM;
  const apiKey = process.env.RESEND_API_KEY;
  if (!to || !from || !apiKey) {
    console.warn('[study] delivery not configured');
    return json(503, { ok: false, message: 'Research requests are not being accepted yet. Please try again later.' });
  }

  const len = Number(req.headers.get('content-length') ?? '0');
  if (len > MAX_BODY_BYTES) return json(413, { ok: false, message: 'The request is too large.' });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return json(400, { ok: false, message: 'Invalid request.' });
  }

  if (typeof body.website === 'string' && body.website.length > 0) {
    console.info('[study] rejected: honeypot');
    return json(200, { ok: true, reference: makeReference(), confirmationSent: true }); // do not tip off bots
  }
  if (typeof body.elapsedMs === 'number' && body.elapsedMs < 20_000) {
    console.info('[study] rejected: too fast');
    return json(429, { ok: false, message: 'Please take a moment and try again.' });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) {
    console.info('[study] rejected: rate limit');
    return json(429, { ok: false, message: 'Too many requests. Please try again later.' });
  }

  const input = coerceStudy(body);
  const errors = validateStudy(input);
  if (Object.keys(errors).length > 0) return json(422, { ok: false, message: 'Please correct the highlighted fields.', errors });

  const reference = makeReference();
  const brief = formatBrief(input, reference);
  const triage = formatTriage(input);
  const priority = studyPriority(input.email);
  const turnaround = process.env.STUDY_TURNAROUND?.trim();
  const turnaroundLine = turnaround
    ? `Expected delivery: ${turnaround}.`
    : 'We will review your request and confirm your delivery window by email within three business days.';

  const started = Date.now();
  const origin = (process.env.SITE_ORIGIN?.trim() || new URL(req.url).origin).replace(/\/$/, '');
  try {
    const internal = await send(apiKey, {
      from,
      to: [to],
      reply_to: input.email.trim(),
      subject: `[${reference}] [UNCONFIRMED]${priority === 'review' ? ' [REVIEW]' : ''} Research request — ${input.company.trim()} — ${label(decisionTypes, input.decisionType)}`,
      text: `New Market Research request via savantanalytics.net\nStatus: Awaiting email confirmation (a CONFIRMED note follows when the requester clicks the link)\n\n${brief}\n\n${triage}`,
      html: `<pre style="font:14px/1.5 system-ui">${esc(`New Market Research request via savantanalytics.net\nStatus: Awaiting email confirmation (a CONFIRMED note follows when the requester clicks the link)\n\n${brief}\n\n${triage}`)}</pre>`,
    });
    if (!internal) {
      console.error('[study] provider error (internal)', { elapsed: Date.now() - started });
      return json(502, { ok: false, message: 'The request could not be delivered. Please try again shortly.' });
    }

    const token = await signToken(
      { ref: reference, email: input.email.trim().toLowerCase(), company: input.company.trim(), name: input.name.trim(), exp: Math.floor(Date.now() / 1000) + CONFIRM_TTL_S },
      confirmSecret(),
    );
    const confirmUrl = `${origin}/api/study/confirm?t=${encodeURIComponent(token)}`;
    const confirmation = [
      `Hello ${input.name.trim()},`,
      ``,
      `Please confirm your research request by opening this link:`,
      confirmUrl,
      ``,
      `Your request enters our queue only once you confirm. The link works for 7 days. ${turnaroundLine}`,
      ``,
      `Please note: your report uses AI-simulated respondents and is decision support, not a forecast. It ends with the tests we recommend running with real buyers or users before you commit.`,
      ``,
      `A copy of what you submitted:`,
      ``,
      brief,
      ``,
      `Reply to this email if you want to add or change anything.`,
      ``,
      `Savant Analytics`,
    ].join('\n');
    const ok = await send(apiKey, {
      from,
      to: [input.email.trim()],
      reply_to: to,
      subject: `Confirm your research request (${reference})`,
      text: confirmation,
      html: `<pre style="font:14px/1.5 system-ui">${esc(confirmation).replace(esc(confirmUrl), `<a href="${esc(confirmUrl)}">${esc(confirmUrl)}</a>`)}</pre>`,
    });
    if (!ok) console.error('[study] provider error (confirmation)', { elapsed: Date.now() - started });

    console.info('[study] received', { elapsed: Date.now() - started, confirmationSent: ok });
    return json(200, { ok: true, reference, confirmationSent: ok });
  } catch (err) {
    console.error('[study] provider unreachable', { reason: (err as Error).name });
    return json(502, { ok: false, message: 'The request could not be delivered. Please try again shortly.' });
  }
}


/**
 * GET /api/study/confirm?t=<token> — the requester clicks the emailed link.
 * On success: Savant gets a CONFIRMED note and the browser is redirected to the
 * wizard with ?confirmed=1; on failure, ?confirmed=0. Stateless; no database.
 */
export async function confirmHandler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const token = url.searchParams.get('t') ?? '';
  const research = url.hostname.toLowerCase().startsWith('twinresearch.');
  const back = (ok: boolean) => new Response(null, { status: 303, headers: { Location: `${research ? '/start' : '/market-research/start'}?confirmed=${ok ? '1' : '0'}`, 'Cache-Control': 'no-store' } });
  const payload = token ? await verifyToken(token, confirmSecret()) : null;
  if (!payload) {
    console.info('[study] confirm rejected');
    return back(false);
  }
  const to = process.env.STUDY_TO || process.env.CONTACT_TO;
  const from = process.env.CONTACT_FROM;
  const apiKey = process.env.RESEND_API_KEY;
  if (to && from && apiKey) {
    try {
      await send(apiKey, {
        from,
        to: [to],
        reply_to: payload.email,
        subject: `[${payload.ref}] [CONFIRMED] Research request — ${payload.company}`,
        text: `The requester has confirmed their email address.\n\nReference: ${payload.ref}\nName: ${payload.name}\nCompany: ${payload.company}\nEmail: ${payload.email}\n\nStatus: New — ready for triage. Reply to the original [UNCONFIRMED] email with the delivery date.`,
      });
    } catch (err) {
      console.error('[study] confirm: provider unreachable', { reason: (err as Error).name });
    }
  }
  console.info('[study] confirmed');
  return back(true);
}
