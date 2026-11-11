import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { emptyStudy, validateStudy } from '@/lib/studyConfig';
import { signToken, verifyToken } from '../../api/studyToken';

const base = () => ({
  ...emptyStudy(),
  decisionType: 'pricing',
  question: 'Which pricing model should go to pilot?',
  audience: 'IT directors at 200-2000 person firms',
  buyerType: 'business',
  concepts: [{ name: 'A', description: 'Included in Enterprise', url: '' }],
  name: 'Jane',
  company: 'Acme',
  email: 'jane@acme.com',
  consent: true,
});

describe('company email gate', () => {
  it('accepts a company address without a website', () => {
    expect(validateStudy(base()).companySite).toBeUndefined();
  });
  it('requires a company website for a consumer mailbox', () => {
    const e = validateStudy({ ...base(), email: 'jane@gmail.com' });
    expect(e.companySite).toMatch(/company website/i);
  });
  it('accepts a consumer mailbox with a plausible website', () => {
    expect(validateStudy({ ...base(), email: 'jane@gmail.com', companySite: 'acme.com' }).companySite).toBeUndefined();
    expect(validateStudy({ ...base(), email: 'jane@gmail.com', companySite: 'https://www.acme.co.uk/about' }).companySite).toBeUndefined();
    expect(validateStudy({ ...base(), email: 'jane@gmail.com', companySite: 'not a site' }).companySite).toMatch(/example\.com/);
  });
});

describe('confirmation token', () => {
  const payload = { ref: 'TYI-2026-ABC123', email: 'jane@acme.com', company: 'Acme', name: 'Jane', exp: Math.floor(Date.now() / 1000) + 600 };
  it('round-trips with the right secret', async () => {
    const t = await signToken(payload, 'secret-1');
    expect(await verifyToken(t, 'secret-1')).toEqual(payload);
  });
  it('rejects a wrong secret, a tampered body, and an expired token', async () => {
    const t = await signToken(payload, 'secret-1');
    expect(await verifyToken(t, 'secret-2')).toBeNull();
    const [body, sig] = t.split('.');
    expect(await verifyToken(`${body}x.${sig}`, 'secret-1')).toBeNull();
    const old = await signToken({ ...payload, exp: Math.floor(Date.now() / 1000) - 1 }, 'secret-1');
    expect(await verifyToken(old, 'secret-1')).toBeNull();
  });
});

describe('confirm endpoint', () => {
  const env = { STUDY_TO: 'team@savant.test', CONTACT_FROM: 'noreply@savant.test', RESEND_API_KEY: 'k', STUDY_CONFIRM_SECRET: 's' };
  const saved: Record<string, string | undefined> = {};
  const sent: unknown[] = [];
  beforeEach(() => {
    for (const [k, v] of Object.entries(env)) { saved[k] = process.env[k]; process.env[k] = v; }
    vi.stubGlobal('fetch', vi.fn(async (_u: string, init: RequestInit) => { sent.push(JSON.parse(String(init.body))); return new Response('{}', { status: 200 }); }));
  });
  afterEach(() => { for (const k of Object.keys(env)) process.env[k] = saved[k]; vi.unstubAllGlobals(); sent.length = 0; });

  it('redirects with confirmed=1 and emails Savant on a valid token; confirmed=0 otherwise', async () => {
    const { confirmHandler } = await import('../../api/study');
    const t = await signToken({ ref: 'TYI-2026-ABC123', email: 'jane@acme.com', company: 'Acme', name: 'Jane', exp: Math.floor(Date.now() / 1000) + 600 }, 's');
    const ok = await confirmHandler(new Request(`https://savantanalytics.net/api/study/confirm?t=${encodeURIComponent(t)}`));
    expect(ok.status).toBe(303);
    expect(ok.headers.get('Location')).toBe('/market-research/start?confirmed=1');
    expect((sent[0] as { subject: string }).subject).toContain('[CONFIRMED]');
    const research = await confirmHandler(new Request(`https://twinresearch.savantanalytics.net/api/study/confirm?t=${encodeURIComponent(t)}`));
    expect(research.headers.get('Location')).toBe('/start?confirmed=1');
    const bad = await confirmHandler(new Request('https://savantanalytics.net/api/study/confirm?t=nope'));
    expect(bad.headers.get('Location')).toBe('/market-research/start?confirmed=0');
  });
});
