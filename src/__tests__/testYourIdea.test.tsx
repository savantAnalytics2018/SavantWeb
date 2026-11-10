import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';
import { tyiHero, intakeCopy } from '@/content/testYourIdea';
import { emptyStudy, makeReference, validateStep, validateStudy, coerceStudy } from '@/lib/studyConfig';

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );

const validStudy = () => ({
  ...emptyStudy(),
  decisionType: 'product',
  question: 'Would small-business owners pay for automated bookkeeping reminders?',
  audience: 'Owners of U.S. service businesses with 2–20 staff who do their own books today.',
  concepts: [{ name: 'Reminder app', description: 'A monthly nudge with a one-click reconciliation.', url: '' }],
  name: 'Jordan Example',
  company: 'Example Co',
  email: 'jordan@example.com',
  consent: true,
});

describe('Market Research pages', () => {
  it('adds the nav tab and renders the landing page with the brief headline, CTAs and disclosure', () => {
    renderAt('/market-research');
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(nav).getByRole('link', { name: /Digital-Twin Market Research/ })).toHaveAttribute('href', '/market-research');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(tyiHero.headline);
    expect(screen.getAllByRole('link', { name: tyiHero.primaryCta.label })[0]).toHaveAttribute('href', '/market-research/start');
    expect(screen.getByRole('link', { name: tyiHero.secondaryCta.label })).toHaveAttribute('href', '/market-research#sample-report');
    expect(screen.getAllByText(/AI-simulated respondents/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Illustrative example — invented concept, simulated data/i)).toBeInTheDocument();
    expect(screen.queryByText(/of failed products had no market need/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/How teams use it/i)).not.toBeInTheDocument();
    expect(screen.getByText(/One test with real buyers/i)).toBeInTheDocument();
  });

  it('existing routes still render', () => {
    renderAt('/services');
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});

describe('validateStep / validateStudy', () => {
  it('accepts a complete minimal brief', () => {
    expect(validateStudy(validStudy())).toEqual({});
  });
  it('requires a decision type and question on screen 1', () => {
    const e = validateStep(0, { ...validStudy(), decisionType: '', question: 'short' });
    expect(Object.keys(e).sort()).toEqual(['decisionType', 'question']);
  });
  it('requires a description for Concept A (a name alone is not enough) and a valid URL when given', () => {
    expect(validateStep(2, { ...validStudy(), concepts: [{ name: '', description: '', url: '' }] }).concept0).toBeDefined();
    expect(validateStep(2, { ...validStudy(), concepts: [{ name: 'Only a name', description: '', url: '' }] }).concept0).toBeDefined();
    expect(validateStep(2, { ...validStudy(), concepts: [{ name: '', description: 'A described option.', url: '' }] })).toEqual({});
    expect(validateStep(2, { ...validStudy(), concepts: [{ name: 'A', description: 'x', url: 'not a url' }] }).concept0).toBeDefined();
  });
  it('requires a detail line when the decision type is Other, and accepts a short audience', () => {
    expect(validateStep(0, { ...validStudy(), decisionType: 'other' }).otherDetail).toBeDefined();
    expect(validateStep(0, { ...validStudy(), decisionType: 'other', otherDetail: 'Partnership' })).toEqual({});
    expect(validateStep(1, { ...validStudy(), audience: 'SMB owners' })).toEqual({});
  });
  it('requires name, company, email and processing consent; marketing stays optional', () => {
    const e = validateStep(3, { ...validStudy(), name: '', company: '', email: 'nope', consent: false, marketingOptIn: false });
    expect(Object.keys(e).sort()).toEqual(['company', 'consent', 'email', 'name']);
  });
  it('coerces untrusted input and caps concepts', () => {
    const v = coerceStudy({ concepts: [1, 2, 3, 4, 5], consent: 'yes', question: 42 });
    expect(v.concepts.length).toBe(4); // one over the cap so validation rejects it
    expect(v.consent).toBe(false);
    expect(v.question).toBe('42');
  });
  it('makes a readable reference', () => {
    expect(makeReference(new Date('2026-11-04T00:00:00Z'), () => 0)).toMatch(/^TYI-2026-[A-Z2-9]{6}$/);
  });
});

async function loadWizard(endpoint: string) {
  vi.resetModules();
  vi.stubEnv('VITE_STUDY_ENDPOINT', endpoint);
  return (await import('@/components/StudyWizard')).default;
}

async function walkToLastStep(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByLabelText('Product or feature'));
  await user.type(screen.getByLabelText(/What question are you trying to answer/), validStudy().question);
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.type(screen.getByLabelText(/Who are the people/), validStudy().audience);
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.type(screen.getByLabelText(/Short name/), 'Reminder app');
  await user.type(screen.getByLabelText(/Description, message, or price/), 'A monthly nudge.');
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.type(screen.getByLabelText('Name'), 'Jordan Example');
  await user.type(screen.getByLabelText('Company'), 'Example Co');
  await user.type(screen.getByLabelText('Email', { exact: true }), 'jordan@example.com');
}

describe('StudyWizard', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    window.sessionStorage.clear();
  });
  afterEach(() => vi.restoreAllMocks());

  it('preview mode: notice shown, final submit disabled, but screens can be walked', async () => {
    const Wizard = await loadWizard('');
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Wizard />
      </MemoryRouter>,
    );
    expect(screen.getByText(/requests can’t be sent yet/i)).toBeInTheDocument();
    await walkToLastStep(user);
    expect(screen.getByRole('button', { name: intakeCopy.submit })).toBeDisabled();
  });

  it('blocks Next on an empty first screen and reports the errors', async () => {
    const Wizard = await loadWizard('/api/study');
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Wizard />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText(/Choose the kind of decision/)).toBeInTheDocument();
    expect(screen.getByText(/Give us a sentence or two/)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/fix the highlighted fields/i);
    expect(document.activeElement).toBe(screen.getByLabelText('Product or feature'));
  });

  it('submits the brief and shows the reference on success', async () => {
    const Wizard = await loadWizard('/api/study');
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ ok: true, reference: 'TYI-2026-TEST01', confirmationSent: true }), { status: 200 }));
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Wizard fetchImpl={fetchImpl as unknown as typeof fetch} />
      </MemoryRouter>,
    );
    await walkToLastStep(user);
    // Consent required
    await user.click(screen.getByRole('button', { name: intakeCopy.submit }));
    expect(fetchImpl).not.toHaveBeenCalled();
    await user.click(screen.getByLabelText(/I agree that Savant Analytics may process/));
    await user.click(screen.getByRole('button', { name: intakeCopy.submit }));
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const body = JSON.parse((fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    expect(body.consent).toBe(true);
    expect(body.concepts[0].name).toBe('Reminder app');
    expect(await screen.findByText(intakeCopy.successHeadline)).toBeInTheDocument();
    expect(screen.getByText('TYI-2026-TEST01')).toBeInTheDocument();
    expect(screen.getByText(/sent a confirmation to jordan@example.com/i)).toBeInTheDocument();
    expect(window.sessionStorage.getItem('savant.tyi.draft.v1')).toBeNull();
  });

  it('shows a server error without faking success', async () => {
    const Wizard = await loadWizard('/api/study');
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ ok: false, message: 'Not configured.' }), { status: 503 }));
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Wizard fetchImpl={fetchImpl as unknown as typeof fetch} />
      </MemoryRouter>,
    );
    await walkToLastStep(user);
    await user.click(screen.getByLabelText(/I agree that Savant Analytics may process/));
    await user.click(screen.getByRole('button', { name: intakeCopy.submit }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Not configured/);
    expect(screen.queryByText(intakeCopy.successHeadline)).toBeNull();
  });
});

describe('api/study', () => {
  const post = (body: unknown, headers: Record<string, string> = {}) =>
    new Request('http://localhost/api/study', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    });
  const good = () => ({ ...validStudy(), website: '', elapsedMs: 60_000 });
  async function load() {
    vi.resetModules();
    return (await import('../../api/study')).default;
  }
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

  it('returns 503 when delivery is not configured', async () => {
    vi.stubEnv('STUDY_TO', '');
    vi.stubEnv('CONTACT_TO', '');
    vi.stubEnv('CONTACT_FROM', '');
    vi.stubEnv('RESEND_API_KEY', '');
    const handler = await load();
    const res = await handler(post(good()));
    expect(res.status).toBe(503);
    expect((await res.json()).ok).toBe(false);
  });

  it('validates server-side (422) and rejects too-fast submissions (429)', async () => {
    vi.stubEnv('STUDY_TO', 'studies@example.com');
    vi.stubEnv('CONTACT_FROM', 'site@example.com');
    vi.stubEnv('RESEND_API_KEY', 'key');
    const handler = await load();
    expect((await handler(post({ ...good(), consent: false }))).status).toBe(422);
    expect((await handler(post({ ...good(), elapsedMs: 100 }))).status).toBe(429);
  });

  it('sends the internal brief and the prospect confirmation, and returns a reference', async () => {
    vi.stubEnv('STUDY_TO', 'studies@example.com');
    vi.stubEnv('CONTACT_FROM', 'site@example.com');
    vi.stubEnv('RESEND_API_KEY', 'key');
    vi.stubEnv('STUDY_TURNAROUND', '');
    const calls: Record<string, unknown>[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init: RequestInit) => {
        calls.push(JSON.parse(init.body as string));
        return new Response('{}', { status: 200 });
      }),
    );
    const handler = await load();
    const res = await handler(post(good(), { 'x-forwarded-for': '203.0.113.9' }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.reference).toMatch(/^TYI-\d{4}-[A-Z2-9]{6}$/);
    expect(data.confirmationSent).toBe(true);
    expect(calls).toHaveLength(2);
    expect(calls[0].to).toEqual(['studies@example.com']);
    expect(calls[0].reply_to).toBe('jordan@example.com');
    expect(String(calls[0].text)).toContain('Reminder app');
    expect(calls[1].to).toEqual(['jordan@example.com']);
    expect(String(calls[1].text)).toContain('within three business days');
    expect(String(calls[1].text)).toContain(data.reference);
  });
});
