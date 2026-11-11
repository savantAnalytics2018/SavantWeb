/**
 * Prerenders every public route to static HTML in dist/, then writes
 * sitemap.xml, robots.txt and a 404.html. Run after `vite build` (client)
 * and `vite build --ssr` (server). See package.json "build".
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const template = readFileSync(join(dist, 'index.html'), 'utf8');
const { render, publicRoutes, sitemapRoutes, organizationJsonLd, siteOrigin, isIndexable, validateContent } = await import(
  join(root, 'dist-server', 'entry-server.js')
);

const errors = validateContent();
if (errors.length) {
  console.error('Content validation failed:\n - ' + errors.join('\n - '));
  process.exit(1);
}

function fileFor(route) {
  if (route === '/') return join(dist, 'index.html');
  if (route === '/404') return join(dist, '404.html');
  return join(dist, route.slice(1), 'index.html');
}

const routes = [...publicRoutes, '/404'];
for (const route of routes) {
  const { html, head } = render(route);
  const jsonLd = route === '/' ? `\n    <script type="application/ld+json">${organizationJsonLd()}</script>` : '';
  const out = template.replace('<!--app-head-->', head + jsonLd).replace('<!--app-html-->', html);
  const file = fileFor(route);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, out);
  console.log('prerendered', route, '->', file.replace(dist, 'dist'));
}

// Sitemap and robots — production origin, noindex-aware.
const urls = (sitemapRoutes ?? publicRoutes).map((r) => (r === '/' ? `${siteOrigin}/` : `${siteOrigin}${r}`));
const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n') +
  `\n</urlset>\n`;
writeFileSync(join(dist, 'sitemap.xml'), sitemap);

const robots = isIndexable
  ? `User-agent: *\nAllow: /\nSitemap: ${siteOrigin}/sitemap.xml\n`
  : `# Preview build — not for indexing. Set VITE_INDEXABLE=true for the production build.\nUser-agent: *\nDisallow: /\n`;
writeFileSync(join(dist, 'robots.txt'), robots);

// The SSR bundle is only needed at build time.
if (existsSync(join(root, 'dist-server'))) rmSync(join(root, 'dist-server'), { recursive: true });

console.log(`\nBuilt ${routes.length} routes. Indexable: ${isIndexable}. Origin: ${siteOrigin}`);
