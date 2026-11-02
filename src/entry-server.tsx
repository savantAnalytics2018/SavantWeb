import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App';
import { pageMeta, publicRoutes } from './content/meta';
import { headTagsFor, organizationJsonLd, siteOrigin, isIndexable } from './lib/head';
import { validateContent } from './content/validate';
import './styles/global.css';

export function render(url: string): { html: string; head: string } {
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );
  const meta = Object.values(pageMeta).find((m) => m.path === url) ?? pageMeta.notFound;
  const head = headTagsFor(meta, { noindex: meta === pageMeta.notFound });
  return { html, head };
}

export { publicRoutes, organizationJsonLd, siteOrigin, isIndexable, validateContent };
