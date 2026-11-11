import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';
import { pageMeta, sitemapRoutes, publicRoutes } from '@/content/meta';
import { coerceDs, emptyDs, validateDs, validateDsStep } from '@/lib/decisionStudyConfig';
import { formatQuestionnaire } from '../../api/decisionStudy';

describe('Decision Study page', () => {
  it('is unlisted: prerendered, noindex, not in the sitemap, not in the nav or footer', () => {
    expect(pageMeta.decisionStudy.unlisted).toBe(true);
    expect(publicRoutes).toContain('/decision-study');
    expect(sitemapRoutes).not.toContain('/decision-study');
    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>);
    for (const nav of screen.getAllByRole('navigation')) expect(within(nav).queryByRole('link', { name: /decision study/i })).toBeNull();
  });
  it('renders standalone: no site navigation, seven questionnaire steps, the price', () => {
    render(<MemoryRouter initialEntries={['/decision-study']}><App /></MemoryRouter>);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Decision Study scoping questionnaire');
    expect(screen.queryByRole('navigation', { name: 'Primary' })).toBeNull();
    expect(screen.queryByRole('link', { name: /market research/i })).toBeNull();
    expect(screen.getByText('Step 1 of 7')).toBeInTheDocument();
    expect(screen.queryByText(/what you get/i)).toBeNull();
  });
});

describe('Decision Study validation', () => {
  const full = (): ReturnType<typeof emptyDs> => ({
    ...emptyDs(),
    decision: 'Whether to launch usage-based pricing for the AI assistant in Q1.',
    owner: 'VP Product; CFO must agree',
    decideBy: '15 January',
    stakes: 'A wrong pricing model costs a year of renewals and a public reversal.',
    criteria: 'Net revenue retention, adoption rate, support load.',
    changeMind: 'If cost controllers reject usage-based pricing outright.',
    options: [
      { name: 'Included', description: 'Bundle into Enterprise; raise price 8%.', expectation: '' },
      { name: 'Per seat', description: '$15 per user per month add-on, opt-in.', expectation: '' },
    ],
    audiences: [{ name: 'IT directors', description: 'IT directors at 200–2,000-person US firms renewing this year.', roles: '', geography: '', stage: '', knownObjections: '' }],
    questions: ['Which option do IT directors choose and why?', '', ''],
    readoutAttendees: 'VP Product, CFO',
    deadline: '10 January',
    packageId: 'decision-study',
    name: 'Jane',
    company: 'Acme',
    email: 'jane@acme.com',
    poRequired: 'no',
    paymentMethod: 'ach',
    consent: true,
  });
  it('accepts a complete questionnaire', () => {
    expect(validateDs(full())).toEqual({});
  });
  it('requires two options, one audience, one question, a package, and terms', () => {
    const v = { ...full(), options: [full().options[0], { name: '', description: '', expectation: '' }], audiences: [], questions: [''], packageId: '' as const, consent: false };
    const e = validateDs(v);
    expect(e.options).toBeTruthy();
    expect(e.audiences).toBeTruthy();
    expect(e.questions).toBeTruthy();
    expect(e.packageId).toBeTruthy();
    expect(e.consent).toBeTruthy();
  });
  it('applies the consumer-mailbox gate on the last step', () => {
    expect(validateDsStep(6, { ...full(), email: 'jane@gmail.com' }).companySite).toBeTruthy();
    expect(validateDsStep(6, { ...full(), email: 'jane@gmail.com', companySite: 'acme.com' }).companySite).toBeUndefined();
  });
  it('coerces untrusted bodies and formats the questionnaire', () => {
    const v = coerceDs({ ...full(), options: [...full().options, 'junk'], questions: ['a', 3, 'b'], packageId: 'bogus' });
    expect(v.options).toHaveLength(3);
    expect(v.questions).toEqual(['a', '', 'b']);
    expect(v.packageId).toBe('');
    const text = formatQuestionnaire(full(), 'DS-2026-ABC123');
    expect(text).toContain('Reference: DS-2026-ABC123');
    expect(text).toContain('Package: Decision Study ($4,500)');
    expect(text).toContain('2. Per seat');
  });
});
