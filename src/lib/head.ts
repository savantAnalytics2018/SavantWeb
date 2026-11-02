import { useEffect } from 'react';
import type { PageMeta } from '@/content/types';
import { site } from '@/content/site';

export const siteOrigin: string =
  (import.meta.env.VITE_SITE_ORIGIN as string | undefined)?.replace(/\/$/, '') || site.productionOrigin;

export const isIndexable: boolean = import.meta.env.VITE_INDEXABLE === 'true';

export function canonicalFor(path: string): string {
  return path === '/' ? `${siteOrigin}/` : `${siteOrigin}${path}`;
}

/**
 * Builds the <head> tags for a route. Used by the prerender script so each
 * static HTML file ships with its own title, description, canonical and
 * social tags; the client hook below keeps the title in sync on navigation.
 */
export function headTagsFor(meta: PageMeta, opts: { noindex?: boolean } = {}): string {
  const canonical = canonicalFor(meta.path);
  const robots = opts.noindex || !isIndexable ? 'noindex, nofollow' : 'index, follow';
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  return [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}">`,
    `<meta name="robots" content="${robots}">`,
    `<link rel="canonical" href="${canonical}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${esc(site.name)}">`,
    `<meta property="og:title" content="${esc(meta.title)}">`,
    `<meta property="og:description" content="${esc(meta.description)}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:image" content="${siteOrigin}/og-image.png">`,
    `<meta name="twitter:card" content="summary_large_image">`,
  ].join('\n    ');
}

/** Organization structured data — only facts that are supported. */
export function organizationJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    url: `${siteOrigin}/`,
  });
}

/** Client-side: keep document.title and description current on navigation. */
export function useHead(meta: PageMeta): void {
  useEffect(() => {
    document.title = meta.title;
    const d = document.querySelector('meta[name="description"]');
    if (d) d.setAttribute('content', meta.description);
    const c = document.querySelector('link[rel="canonical"]');
    if (c) c.setAttribute('href', canonicalFor(meta.path));
  }, [meta]);
}
