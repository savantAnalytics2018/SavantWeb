import { describe, expect, it } from "vitest";
import { isResearchHostname } from '../lib/host';

describe('research subdomain', () => {
  it('recognises the research hostname', () => {
    expect(isResearchHostname('twinresearch.savantanalytics.net')).toBe(true);
    expect(isResearchHostname('TwinResearch.SavantAnalytics.net')).toBe(true);
    expect(isResearchHostname('savantanalytics.net')).toBe(false);
    expect(isResearchHostname('www.savantanalytics.net')).toBe(false);
  });

  it('rewrites / and /start on the research host, leaves the main host alone', async () => {
    const worker = (await import('../../worker/index')).default;
    const seen: string[] = [];
    const env = { ASSETS: { fetch: async (req: Request) => { seen.push(new URL(req.url).pathname); return new Response('ok'); } } };
    await worker.fetch(new Request('https://twinresearch.savantanalytics.net/'), env as never);
    await worker.fetch(new Request('https://twinresearch.savantanalytics.net/start'), env as never);
    await worker.fetch(new Request('https://twinresearch.savantanalytics.net/about'), env as never);
    await worker.fetch(new Request('https://savantanalytics.net/'), env as never);
    expect(seen).toEqual(['/market-research', '/market-research/start', '/about', '/']);
  });
});

describe('client routes on the research host', () => {
  it('renders the research landing at / and the wizard at /start, with the slim header', async () => {
    const { render, screen, waitFor, within } = await import('@testing-library/react');
    const { MemoryRouter } = await import('react-router-dom');
    const App = (await import('@/App')).default;
    const { tyiHero } = await import('@/content/testYourIdea');
    const original = window.location;
    Object.defineProperty(window, 'location', { value: { ...original, hostname: 'twinresearch.savantanalytics.net', href: 'https://twinresearch.savantanalytics.net/' }, writable: true, configurable: true });
    try {
      const r1 = render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(tyiHero.headline);
      const nav = screen.getByRole('navigation', { name: 'Primary' });
      await waitFor(() => expect(within(nav).getByRole('link', { name: 'Savant Analytics →' })).toBeInTheDocument());
      expect(within(nav).queryByRole('link', { name: 'Approach' })).not.toBeInTheDocument();
      r1.unmount();
      render(<MemoryRouter initialEntries={['/start']}><App /></MemoryRouter>);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Start your free study');
    } finally {
      Object.defineProperty(window, 'location', { value: original, writable: true, configurable: true });
    }
  });
});
