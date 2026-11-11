import { describe, expect, it } from 'vitest';
import { isDetailHostname } from '../lib/host';
import { sitemapRoutes } from '../content/meta';

describe('twindetail subdomain', () => {
  it('recognises the detail hostname', () => {
    expect(isDetailHostname('twindetail.savantanalytics.net')).toBe(true);
    expect(isDetailHostname('twinresearch.savantanalytics.net')).toBe(false);
    expect(isDetailHostname('savantanalytics.net')).toBe(false);
  });

  it('rewrites / and /start/<tier> on the detail host only', async () => {
    const worker = (await import('../../worker/index')).default;
    const seen: string[] = [];
    const env = { ASSETS: { fetch: async (req: Request) => { seen.push(new URL(req.url).pathname); return new Response('ok'); } } };
    await worker.fetch(new Request('https://twindetail.savantanalytics.net/'), env as never);
    await worker.fetch(new Request('https://twindetail.savantanalytics.net/start/snapshot'), env as never);
    await worker.fetch(new Request('https://twindetail.savantanalytics.net/start/decision-study'), env as never);
    await worker.fetch(new Request('https://twindetail.savantanalytics.net/privacy'), env as never);
    await worker.fetch(new Request('https://savantanalytics.net/start/snapshot'), env as never);
    expect(seen).toEqual(['/twin-detail', '/twin-detail/start/snapshot', '/twin-detail/start/decision-study', '/privacy', '/start/snapshot']);
  });

  it('keeps the tier pages out of the sitemap', () => {
    expect(sitemapRoutes.some((r) => r.startsWith('/twin-detail'))).toBe(false);
  });
});

describe('client routes on the detail host', () => {
  it('renders the tier menu at / and the right intake at /start/<tier>', async () => {
    const { render, screen } = await import('@testing-library/react');
    const { MemoryRouter } = await import('react-router-dom');
    const App = (await import('@/App')).default;
    const { detailCopy, tiers } = await import('@/content/twinDetail');
    const original = window.location;
    Object.defineProperty(window, 'location', { value: { ...original, hostname: 'twindetail.savantanalytics.net', href: 'https://twindetail.savantanalytics.net/' }, writable: true, configurable: true });
    try {
      const r1 = render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(detailCopy.title);
      expect(screen.queryByRole('navigation', { name: 'Primary' })).not.toBeInTheDocument();
      for (const t of tiers) expect(screen.getByRole('link', { name: t.cta })).toHaveAttribute('href', `/start/${t.id}`);
      r1.unmount();

      const r2 = render(<MemoryRouter initialEntries={['/start/snapshot']}><App /></MemoryRouter>);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Request your snapshot');
      r2.unmount();

      const r3 = render(<MemoryRouter initialEntries={['/start/calibration']}><App /></MemoryRouter>);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Scoping questionnaire');
      r3.unmount();

      render(<MemoryRouter initialEntries={['/start/nope']}><App /></MemoryRouter>);
      expect(screen.getByRole('heading', { level: 1 })).not.toHaveTextContent('Scoping questionnaire');
    } finally {
      Object.defineProperty(window, 'location', { value: original, writable: true, configurable: true });
    }
  });
});
