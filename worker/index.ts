/**
 * Cloudflare Worker entry: serves the prerendered site from ./dist (static
 * assets binding) and routes POST /api/contact to the shared inquiry handler.
 * _headers and _redirects in dist/ are applied by the assets layer.
 */
import handler from '../api/contact';
import studyHandler from '../api/study';

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  /** Hostname prefix of the research front door (default "twinresearch."). */
  RESEARCH_HOST_PREFIX?: string;
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
  for (const key of ['CONTACT_TO', 'CONTACT_FROM', 'RESEND_API_KEY', 'STUDY_TO', 'STUDY_TURNAROUND'] as const) {
    // process.env can stringify undefined; missing bindings must stay absent.
    // Delete stale values too, since a Worker isolate can handle many requests.
    const value = env[key];
    if (value === undefined) delete g.process.env[key];
    else g.process.env[key] = value;
  }
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
    // Research subdomain: "/" and "/start" are the offer's own front door.
    // Everything else on that host serves the same site, so deep links keep working.
    const prefix = (env.RESEARCH_HOST_PREFIX ?? 'twinresearch.').toLowerCase();
    if (url.hostname.toLowerCase().startsWith(prefix)) {
      const map: Record<string, string> = { '/': '/market-research', '/start': '/market-research/start' };
      const target = map[url.pathname];
      if (target) {
        url.pathname = target;
        return env.ASSETS.fetch(new Request(url.toString(), request));
      }
    }
    return env.ASSETS.fetch(request);
  },
};
