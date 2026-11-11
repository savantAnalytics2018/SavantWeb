/**
 * Decision Study scoping-questionnaire endpoint — POST /api/decision-study.
 * Same defenses as api/study.ts (honeypot, timing, per-IP rate limit, server validation,
 * no content logging). Emails Savant the full questionnaire tagged [DECISION STUDY] and the
 * client a copy with the reference. Standalone page, shared one-to-one; no confirmation link.
 *
 * Environment: STUDY_TO (or CONTACT_TO), CONTACT_FROM, RESEND_API_KEY.
 */
import { coerceDs, emailDomain, isFreeMail, makeDsReference, validateDs, type DsInput } from '../src/lib/decisionStudyConfig';
import { packages } from '../src/content/decisionStudy';
import { createStudy, type PortalDeps } from './portal';

const MAX_BODY_BYTES = 128 * 1024;
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
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  });
}
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const or = (s: string) => s.trim() || '—';

export function formatQuestionnaire(v: DsInput, reference: string): string {
  const pkg = packages.find((p) => p.id === v.packageId);
  const options = v.options
    .filter((o) => o.name.trim() || o.description.trim())
    .map((o, i) => [`  ${i + 1}. ${or(o.name)}`, `     ${or(o.description)}`, o.expectation.trim() ? `     Client expects: ${o.expectation.trim()}` : null].filter(Boolean).join('\n'))
    .join('\n');
  const audiences = v.audiences
    .filter((a) => a.description.trim())
    .map((a, i) =>
      [
        `  ${i + 1}. ${or(a.name)}`,
        `     Who: ${or(a.description)}`,
        `     Roles / titles: ${or(a.roles)}`,
        `     Geography: ${or(a.geography)}`,
        `     Buying stage: ${or(a.stage)}`,
        `     Known objections: ${or(a.knownObjections)}`,
      ].join('\n'),
    )
    .join('\n');
  const questions = v.questions.map((q) => q.trim()).filter(Boolean).map((q, i) => `  ${i + 1}. ${q}`).join('\n');
  return [
    `Reference: ${reference}`,
    `Package: ${pkg ? `${pkg.name} (${pkg.price})` : '—'}`,
    ``,
    `1. THE DECISION`,
    `Decision: ${v.decision.trim()}`,
    `Owner / approvers: ${v.owner.trim()}`,
    `Decide by: ${v.decideBy.trim()}`,
    `If wrong: ${v.stakes.trim()}`,
    `Decision criteria (in order): ${v.criteria.trim()}`,
    `Current leaning: ${or(v.currentLeaning)}`,
    `What would change their mind: ${v.changeMind.trim()}`,
    `Constraints: ${or(v.constraints)}`,
    ``,
    `2. OPTIONS`,
    options || '  —',
    ``,
    `3. AUDIENCES`,
    audiences || '  —',
    `Buying committee: ${or(v.buyingCommittee)}`,
    ``,
    `4. EXISTING EVIDENCE`,
    `Evidence: ${or(v.evidence)}`,
    `Competitors / alternatives: ${or(v.competitors)}`,
    `Prior research: ${or(v.priorResearch)}`,
    ``,
    `5. QUESTIONS THE MEMO MUST ANSWER`,
    questions || '  —',
    `Hypotheses: ${or(v.hypotheses)}`,
    `Out of scope: ${or(v.outOfScope)}`,
    ``,
    `6. DELIVERABLE AND TIMING`,
    `Readout attendees: ${v.readoutAttendees.trim()}`,
    `Format: ${or(v.format)}`,
    `Needed by: ${v.deadline.trim()}`,
    `Confidentiality / NDA: ${or(v.confidentiality)}`,
    ``,
    `7. COMMERCIAL`,
    `Billing contact: ${or(v.billingContact)}`,
    `Purchase order required: ${or(v.poRequired)}`,
    `Preferred payment: ${or(v.paymentMethod)}`,
    `Terms acknowledged: ${v.consent ? 'yes' : 'no'}`,
    ``,
    `8. CONTACT`,
    `Name: ${v.name.trim()}`,
    `Role: ${or(v.role)}`,
    `Company: ${v.company.trim()}`,
    `Email: ${v.email.trim()}`,
    `Company website: ${or(v.companySite)}`,
    `Phone: ${or(v.phone)}`,
  ].join('\n');
}

export function formatDsTriage(v: DsInput): string {
  return [
    `9. TRIAGE (internal)`,
    `Mailbox: ${isFreeMail(v.email) ? `consumer (${emailDomain(v.email)}); organisation given as ${or(v.companySite)}` : `company domain ${emailDomain(v.email)}`}`,
    `Source: ${or(v.source)}`,
    `Options: ${v.options.filter((o) => o.name.trim() || o.description.trim()).length} · Audiences: ${v.audiences.filter((a) => a.description.trim()).length} · Questions: ${v.questions.filter((q) => q.trim()).length}`,
    `Next: confirm scope within 2 business days, send invoice; schedule only when payment clears.`,
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

export default async function handler(req: Request, portal?: PortalDeps): Promise<Response> {
  if (req.method !== 'POST') return json(405, { ok: false, message: 'Method not allowed.' });
  const to = process.env.STUDY_TO || process.env.CONTACT_TO;
  const from = process.env.CONTACT_FROM;
  const apiKey = process.env.RESEND_API_KEY;
  if (!to || !from || !apiKey) {
    console.warn('[decision-study] delivery not configured');
    return json(503, { ok: false, message: 'The questionnaire is not being accepted yet. Please try again later.' });
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
    console.info('[decision-study] rejected: honeypot');
    return json(200, { ok: true, reference: makeDsReference(), copySent: true });
  }
  if (typeof body.elapsedMs === 'number' && body.elapsedMs < 60_000) {
    console.info('[decision-study] rejected: too fast');
    return json(429, { ok: false, message: 'Please take a moment and try again.' });
  }
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) return json(429, { ok: false, message: 'Too many requests. Please try again later.' });

  const input = coerceDs(body);
  const errors = validateDs(input);
  if (Object.keys(errors).length > 0) return json(422, { ok: false, message: 'Please correct the highlighted fields.', errors });

  const reference = makeDsReference();
  const text = formatQuestionnaire(input, reference);
  const pkg = packages.find((p) => p.id === input.packageId);
  const started = Date.now();
  try {
    const internal = await send(apiKey, {
      from,
      to: [to],
      reply_to: input.email.trim(),
      subject: `[${reference}] [DECISION STUDY] ${input.company.trim()} — ${pkg?.name ?? 'package?'}`,
      text: `Decision Study scoping questionnaire via savantanalytics.net\nStatus: New — scope, quote, invoice\n\n${text}\n\n${formatDsTriage(input)}`,
      html: `<pre style="font:14px/1.5 system-ui">${esc(`Decision Study scoping questionnaire via savantanalytics.net\nStatus: New — scope, quote, invoice\n\n${text}\n\n${formatDsTriage(input)}`)}</pre>`,
    });
    if (!internal) {
      console.error('[decision-study] provider error (internal)', { elapsed: Date.now() - started });
      return json(502, { ok: false, message: 'The questionnaire could not be delivered. Please try again shortly.' });
    }
    // Portal (paid tiers on twindetail): persist the study and give the client a page.
    let created: { url: string; cookie: string; link: string } | null = null;
    if (portal) {
      try {
        created = await createStudy(portal, { ref: reference, packageId: input.packageId, email: input.email, name: input.name, company: input.company, answers: input as unknown as Record<string, unknown> });
      } catch (err) {
        console.error('[decision-study] portal create failed', { reason: (err as Error).message });
      }
    }
    const copy = [
      `Hello ${input.name.trim()},`,
      ``,
      `Thank you — your Decision Study scoping questionnaire is in (reference ${reference}).`,
      ``,
      created
        ? `We read it within 24 hours. Any questions from us, our scope confirmation, your approval, and the finished memo all live on your study page:\n${created.link}\n\nThe link works for 30 days; you can request a fresh one from the page at any time.`
        : `We review it within two business days and reply with a scope confirmation, a kickoff date, and an invoice. The study is scheduled when payment clears. If anything needs clarifying, we ask before quoting.`,
      ``,
      `A copy of what you submitted:`,
      ``,
      text,
      ``,
      created ? `Questions in the meantime: use the message box on your study page.` : `Reply to this email to add or change anything.`,
      ``,
      `Savant Analytics`,
    ].join('\n');
    const ok = await send(apiKey, {
      from,
      to: [input.email.trim()],
      reply_to: to,
      subject: `Your Decision Study questionnaire (${reference})`,
      text: copy,
      html: `<pre style="font:14px/1.5 system-ui">${esc(copy)}</pre>`,
    });
    if (!ok) console.error('[decision-study] provider error (copy)', { elapsed: Date.now() - started });
    console.info('[decision-study] received', { elapsed: Date.now() - started, copySent: ok });
    if (created) {
      return new Response(JSON.stringify({ ok: true, reference, copySent: ok, portalUrl: created.url }), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Set-Cookie': created.cookie },
      });
    }
    return json(200, { ok: true, reference, copySent: ok });
  } catch (err) {
    console.error('[decision-study] provider unreachable', { reason: (err as Error).name });
    return json(502, { ok: false, message: 'The questionnaire could not be delivered. Please try again shortly.' });
  }
}
