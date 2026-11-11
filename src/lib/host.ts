/**
 * Two front doors, one site.
 *
 *  - savantanalytics.net            — the full site; the last nav tab points at the research subdomain.
 *  - twinresearch.savantanalytics.net — the Digital-Twin Market Research offer on its own: "/" is the
 *    landing page and "/start" the wizard (the Worker rewrites those paths), with a slim header.
 *
 * Build-time:
 *   VITE_RESEARCH_ORIGIN  e.g. https://twinresearch.savantanalytics.net — when set, the main site's
 *                         nav tab and footer link go there instead of /market-research.
 *   VITE_SITE_ORIGIN      the main site origin, used for "back to Savant" links on the research host.
 * Runtime: the research host is recognised by hostname prefix, so one deploy serves both.
 */
const viteEnv: Record<string, string | undefined> = import.meta.env ?? {};

export const RESEARCH_HOST_PREFIX = 'twinresearch.';
/** Private tier menu: "/" lists the tiers, "/start/<tier>" is the intake. See content/twinDetail.ts. */
export const DETAIL_HOST_PREFIX = 'twindetail.';
export const researchOrigin = (viteEnv.VITE_RESEARCH_ORIGIN ?? '').trim().replace(/\/$/, '');
export const mainOrigin = (viteEnv.VITE_SITE_ORIGIN ?? '').trim().replace(/\/$/, '');

export function isResearchHostname(hostname: string): boolean {
  return hostname.toLowerCase().startsWith(RESEARCH_HOST_PREFIX);
}

/** Client-only; false during prerender so the HTML is the main-site version. */
export function isResearchHost(): boolean {
  return typeof window !== 'undefined' && isResearchHostname(window.location.hostname);
}

export function isDetailHostname(hostname: string): boolean {
  return hostname.toLowerCase().startsWith(DETAIL_HOST_PREFIX);
}

/** Client-only; false during prerender. */
export function isDetailHost(): boolean {
  return typeof window !== 'undefined' && isDetailHostname(window.location.hostname);
}

/** On the detail host, prefer the short paths for in-app links. */
export function detailPath(path: string): string {
  if (!isDetailHost()) return path;
  if (path === '/twin-detail') return '/';
  if (path.startsWith('/twin-detail/start/')) return path.replace('/twin-detail', '');
  return path;
}

/** Where the research offer lives from the main site's point of view. */
export function researchHref(path: '/market-research' | '/market-research/start'): string {
  if (!researchOrigin) return path;
  return path === '/market-research' ? `${researchOrigin}/` : `${researchOrigin}/start`;
}

/** On the research host, prefer the short paths ("/" and "/start") for in-app links. */
export function localPath(path: string): string {
  if (!isResearchHost()) return path;
  if (path === '/market-research') return '/';
  if (path === '/market-research/start') return '/start';
  return path;
}

