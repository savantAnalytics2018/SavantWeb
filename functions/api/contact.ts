/**
 * Cloudflare Pages Function: POST /api/contact
 * Thin adapter around the platform-neutral handler in /api/contact.ts.
 * Cloudflare passes secrets via context.env (not process.env), so we bridge them.
 *
 * Set these as encrypted environment variables in Cloudflare Pages →
 * Settings → Environment variables (Production):
 *   CONTACT_TO, CONTACT_FROM, RESEND_API_KEY
 */
import handler from '../../api/contact';

interface Env {
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
  RESEND_API_KEY?: string;
}

export const onRequest = async (context: { request: Request; env: Env }): Promise<Response> => {
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, message: 'Method not allowed.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json; charset=utf-8', Allow: 'POST' },
    });
  }
  // The shared handler reads process.env; provide it from Cloudflare's env binding.
  const g = globalThis as unknown as { process?: { env: Record<string, string | undefined> } };
  g.process = g.process ?? { env: {} };
  g.process.env.CONTACT_TO = context.env.CONTACT_TO;
  g.process.env.CONTACT_FROM = context.env.CONTACT_FROM;
  g.process.env.RESEND_API_KEY = context.env.RESEND_API_KEY;
  return handler(context.request);
};
