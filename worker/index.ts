/**
 * Cloudflare Worker entry: serves the prerendered site from ./dist (static
 * assets binding) and routes POST /api/contact to the shared inquiry handler.
 * _headers and _redirects in dist/ are applied by the assets layer.
 */
import handler from '../api/contact';
import studyHandler from '../api/study';

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
  RESEND_API_KEY?: string;
  STUDY_TO?: string;
  STUDY_TURNAROUND?: string;
}

function bridgeEnv(env: Env): void {
  // The shared handlers read process.env; bridge Cloudflare's env bindings.
  const g = globalThis as unknown as { process?: { env: Record<string, string | undefined> } };
  g.process = g.process ?? { env: {} };
  g.process.env.CONTACT_TO = env.CONTACT_TO;
  g.process.env.CONTACT_FROM = env.CONTACT_FROM;
  g.process.env.RESEND_API_KEY = env.RESEND_API_KEY;
  g.process.env.STUDY_TO = env.STUDY_TO;
  g.process.env.STUDY_TURNAROUND = env.STUDY_TURNAROUND;
}

const methodNotAllowed = () =>
  new Response(JSON.stringify({ ok: false, message: 'Method not allowed.' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json; charset=utf-8', Allow: 'POST' },
  });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/contact') {
      if (request.method !== 'POST') return methodNotAllowed();
      bridgeEnv(env);
      return handler(request);
    }
    if (url.pathname === '/api/study') {
      if (request.method !== 'POST') return methodNotAllowed();
      bridgeEnv(env);
      return studyHandler(request);
    }
    return env.ASSETS.fetch(request);
  },
};
