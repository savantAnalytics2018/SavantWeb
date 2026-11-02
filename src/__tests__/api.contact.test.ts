import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const good = {
  name: 'Jordan Example',
  email: 'jordan@example.com',
  organization: 'Example Corp',
  service: 'ai-strategy',
  message: 'We have a legacy claims system and need to decide whether to modernize it before adding AI.',
  website: '',
  elapsedMs: 5000,
};

const post = (body: unknown, headers: Record<string, string> = {}) =>
  new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });

async function load() {
  vi.resetModules();
  return (await import('../../api/contact')).default;
}

describe('api/contact', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns 503 and never fakes success when delivery is not configured', async () => {
    vi.stubEnv('CONTACT_TO', '');
    vi.stubEnv('CONTACT_FROM', '');
    vi.stubEnv('RESEND_API_KEY', '');
    const handler = await load();
    const res = await handler(post(good));
    expect(res.status).toBe(503);
    expect((await res.json()).ok).toBe(false);
  });

  it('rejects non-POST', async () => {
    vi.stubEnv('CONTACT_TO', 'x@example.com');
    vi.stubEnv('CONTACT_FROM', 'y@example.com');
    vi.stubEnv('RESEND_API_KEY', 'k');
    const handler = await load();
    expect((await handler(new Request('http://localhost/api/contact'))).status).toBe(405);
  });

  it('validates input server-side and returns field errors', async () => {
    vi.stubEnv('CONTACT_TO', 'x@example.com');
    vi.stubEnv('CONTACT_FROM', 'y@example.com');
    vi.stubEnv('RESEND_API_KEY', 'k');
    const handler = await load();
    const res = await handler(post({ ...good, email: 'bad', message: 'short' }));
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.errors.email).toBeDefined();
    expect(body.errors.message).toBeDefined();
  });

  it('silently accepts honeypot submissions without sending', async () => {
    vi.stubEnv('CONTACT_TO', 'x@example.com');
    vi.stubEnv('CONTACT_FROM', 'y@example.com');
    vi.stubEnv('RESEND_API_KEY', 'k');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const handler = await load();
    const res = await handler(post({ ...good, website: 'http://spam' }));
    expect(res.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('delivers via provider and returns ok; provider failure maps to 502', async () => {
    vi.stubEnv('CONTACT_TO', 'x@example.com');
    vi.stubEnv('CONTACT_FROM', 'y@example.com');
    vi.stubEnv('RESEND_API_KEY', 'k');
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const handler = await load();
    const ok = await handler(post(good, { 'x-forwarded-for': '1.1.1.1' }));
    expect(ok.status).toBe(200);
    const sent = JSON.parse((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    expect(sent.to).toEqual(['x@example.com']);
    expect(sent.reply_to).toBe(good.email);
    expect(sent.html).not.toContain('<script');

    vi.stubGlobal('fetch', vi.fn(async () => new Response('err', { status: 500 })));
    const bad = await handler(post(good, { 'x-forwarded-for': '1.1.1.2' }));
    expect(bad.status).toBe(502);
    expect((await bad.json()).ok).toBe(false);
  });

  it('rate limits repeated submissions from one address', async () => {
    vi.stubEnv('CONTACT_TO', 'x@example.com');
    vi.stubEnv('CONTACT_FROM', 'y@example.com');
    vi.stubEnv('RESEND_API_KEY', 'k');
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 200 })));
    const handler = await load();
    let last = 200;
    for (let i = 0; i < 7; i++) last = (await handler(post(good, { 'x-forwarded-for': '9.9.9.9' }))).status;
    expect(last).toBe(429);
  });
});
