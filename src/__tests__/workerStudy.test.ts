// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { emptyStudy } from '../lib/studyConfig';

const keys = ['CONTACT_TO', 'CONTACT_FROM', 'RESEND_API_KEY', 'STUDY_TO', 'STUDY_TURNAROUND'] as const;
let saved: Record<string, string | undefined>;

beforeEach(() => {
  saved = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  vi.resetModules();
  vi.spyOn(console, 'info').mockImplementation(() => {});
});

afterEach(() => {
  for (const key of keys) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('uses the existing confirmation fallback when a Worker binding is absent, including after a configured request', async () => {
  const emails: { to: string[]; text: string; html: string }[] = [];
  vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
    emails.push(JSON.parse(init.body as string));
    return new Response('{}', { status: 200 });
  }));
  const worker = (await import('../../worker/index')).default;
  const env = {
    ASSETS: { fetch: vi.fn() },
    CONTACT_TO: 'team@example.com',
    CONTACT_FROM: 'research@example.com',
    RESEND_API_KEY: 'test-key',
  };
  const request = () => new Request('https://test.example/api/study', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...emptyStudy(),
      decisionType: 'product',
      question: 'Would owners use a bookkeeping reminder application?',
      audience: 'Small business owners who manage their own books.',
      concepts: [{ name: 'Reminder app', description: 'A monthly bookkeeping reminder.', url: '' }],
      name: 'Test User', company: 'Test Company', email: 'prospect@example.com',
      consent: true, elapsedMs: 30_000,
    }),
  });

  const configured = await worker.fetch(request(), { ...env, STUDY_TO: 'studies@example.com', STUDY_TURNAROUND: 'configured test window' });
  expect(configured.status).toBe(200);
  expect(emails[1].text).toContain('Expected delivery: configured test window.');

  const absent = await worker.fetch(request(), env);
  expect(await absent.json()).toMatchObject({ ok: true, confirmationSent: true });
  for (const body of [emails[3].text, emails[3].html]) {
    expect(body).toContain('We will review your request and confirm your delivery window by email within three business days.');
    expect(body).not.toContain('Expected delivery:');
    expect(body).not.toContain('undefined');
    expect(body).not.toContain('configured test window');
  }
  expect(emails[2].to).toEqual(['team@example.com']);
  expect(emails[3].to).toEqual(['prospect@example.com']);
  expect(process.env.STUDY_TURNAROUND).toBeUndefined();
  expect(process.env.STUDY_TO).toBeUndefined();
});
