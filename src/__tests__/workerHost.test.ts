import { describe, expect, it } from 'vitest';
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
