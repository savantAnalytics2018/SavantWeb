/**
 * Contact inquiry endpoint — Web-standard Request/Response handler.
 *
 * Works as-is on Vercel (api/contact.ts, Node or Edge runtime) and ports with a
 * thin wrapper to Netlify Functions or Cloudflare Workers. It is intentionally
 * dependency-free.
 *
 * Environment (server-only, never VITE_-prefixed):
 *   CONTACT_TO       verified recipient inbox (owner-confirmed, receipt tested)
 *   CONTACT_FROM     sending address on a domain verified with the provider
 *   RESEND_API_KEY   Resend API key — only if Resend is the approved processor
 *
 * If any of these are missing the endpoint returns 503 with a clear message
 * and the browser form shows an error — it never fakes success.
 *
 * Logging: only operational diagnostics (status, elapsed, reason). Message
 * content and personal information are never logged.
 */

import { limits, validateInquiry, type InquiryInput } from '../src/lib/contactConfig';
import { services } from '../src/content/services';

const serviceIds = services.map((s) => s.id) as readonly string[];
const MAX_BODY_BYTES = 16 * 1024;

// Proportionate in-memory rate limit per instance (brief §15). Serverless
// instances are ephemeral, so this is a speed bump, not a guarantee; pair with
// the host's own rate limiting / WAF where available.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
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

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json(405, { ok: false, message: 'Method not allowed.' });

  const to = process.env.CONTACT_TO;
  const from = process.env.CONTACT_FROM;
  const apiKey = process.env.RESEND_API_KEY;
  if (!to || !from || !apiKey) {
    console.warn('[contact] delivery not configured');
    return json(503, { ok: false, message: 'Inquiry delivery is not configured yet. Please try again later.' });
  }

  const len = Number(req.headers.get('content-length') ?? '0');
  if (len > MAX_BODY_BYTES) return json(413, { ok: false, message: 'Message is too large.' });

  let body: Partial<InquiryInput> & { website?: string; elapsedMs?: number };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return json(400, { ok: false, message: 'Invalid request.' });
  }

  // Spam defenses: honeypot must be empty; forms filled in under 2s are suspect.
  if (typeof body.website === 'string' && body.website.length > 0) {
    console.info('[contact] rejected: honeypot');
    return json(200, { ok: true }); // do not tip off bots
  }
  if (typeof body.elapsedMs === 'number' && body.elapsedMs < 2000) {
    console.info('[contact] rejected: too fast');
    return json(429, { ok: false, message: 'Please take a moment and try again.' });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) {
    console.info('[contact] rejected: rate limit');
    return json(429, { ok: false, message: 'Too many requests. Please try again later.' });
  }

  const input: InquiryInput = {
    name: String(body.name ?? '').slice(0, limits.name.max + 1),
    email: String(body.email ?? '').slice(0, limits.email.max + 1),
    organization: String(body.organization ?? '').slice(0, limits.organization.max + 1),
    service: String(body.service ?? ''),
    message: String(body.message ?? '').slice(0, limits.message.max + 1),
  };
  const errors = validateInquiry(input, serviceIds);
  if (Object.keys(errors).length > 0) return json(422, { ok: false, message: 'Please correct the highlighted fields.', errors });

  const serviceTitle = services.find((s) => s.id === input.service)?.title ?? 'Not specified';
  const text = [
    `New inquiry via savantanalytics.net`,
    ``,
    `Name: ${input.name.trim()}`,
    `Email: ${input.email.trim()}`,
    `Organization: ${input.organization.trim() || '—'}`,
    `Service interest: ${serviceTitle}`,
    ``,
    `Message:`,
    input.message.trim(),
  ].join('\n');

  const started = Date.now();
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: input.email.trim(),
        subject: `Inquiry: ${serviceTitle} — ${input.name.trim()}`,
        text,
        html: `<pre style="font:14px/1.5 system-ui">${esc(text)}</pre>`,
      }),
    });
    const elapsed = Date.now() - started;
    if (!res.ok) {
      console.error('[contact] provider error', { status: res.status, elapsed });
      return json(502, { ok: false, message: 'The inquiry could not be delivered. Please try again shortly.' });
    }
    console.info('[contact] accepted', { elapsed });
    return json(200, { ok: true });
  } catch (err) {
    console.error('[contact] provider unreachable', { reason: (err as Error).name });
    return json(502, { ok: false, message: 'The inquiry could not be delivered. Please try again shortly.' });
  }
}
