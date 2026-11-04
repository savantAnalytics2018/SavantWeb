import type { ServiceId } from './types';

/**
 * Homepage copy. Short lines, direct address, one audience:
 * mid-market and federal technology leaders with legacy systems and an AI mandate.
 * Statistics are cited external research (see `evidence`), not claims about Savant.
 */

export const homeHero = {
  eyebrow: 'For mid-market and federal technology leaders',
  /** "\n" marks deliberate line breaks. The <em> span is highlighted. */
  headline: '94% use AI.\n<em>2%</em> run it at scale.',
  lines: ['The gap is not the model. It is legacy systems and data that are not ready.', 'We fix that — with your team, under your controls.'],
  source: { label: 'Kaufman Rossin, State of AI in the Mid-Market, 2026', href: 'https://kaufmanrossin.com/state-of-ai-in-middle-market/' },
  primaryCta: { label: 'Talk through your situation', href: '/contact' },
  secondaryCta: { label: 'See how we work', href: '/approach' },
  micro: 'One conversation. Bring one problem.',
  artCaption: 'Case files, data, batch jobs, reports, compliance — orchestrated, one by one.',
};

/** Cited evidence strip — the pain, in numbers. */
export const evidence = [
  { stat: '34%', line: 'name data quality as the #1 barrier to deploying AI.', source: 'RSM Middle Market AI Survey 2026', href: 'https://www.rsmus.com/insights/services/digital-transformation/rsm-middle-market-ai-survey' },
  { stat: '41%', line: 'of mid-market firms cite legacy-system integration as a top barrier — 55% in manufacturing.', source: 'Kaufman Rossin 2026', href: 'https://kaufmanrossin.com/state-of-ai-in-middle-market/' },
  { stat: '60%', line: 'of AI projects will be abandoned for lack of AI-ready data through 2026.', source: 'Gartner', href: 'https://www.gartner.com/en/newsroom/press-releases/2025-02-26-lack-of-ai-ready-data-puts-ai-projects-at-risk' },
];

/** "Sound familiar?" — the buyer's situation in their words. */
export const painPoints = [
  'Leadership wants AI. Nobody has a plan.',
  'The core system is twenty years old. Touching it is risky.',
  'The pilot looked great. Production never happened.',
  'Everyone is using AI tools. Nobody owns the risk.',
];

/** Where we are deepest — the two specialties, shown before the full service list. */
export const specialties = [
  {
    id: 'legacy-modernization' as ServiceId,
    eyebrow: 'Specialty 01',
    title: 'Legacy migration',
    lines: ['SAS to Python. Batch jobs. Twenty-year-old ERPs.', 'Mapped, tested, and moved module by module — with AI doing the heavy lifting and your engineers reviewing every change.'],
    points: ['Dependency map before anything moves', 'Characterization tests that lock in current behavior', 'Pilot one module, then scale on evidence'],
    cta: 'How we migrate legacy systems',
  },
  {
    id: 'digital-twins-evaluation' as ServiceId,
    eyebrow: 'Specialty 02',
    title: 'Digital twins and AI evaluation',
    lines: ['Know before you commit.', 'A decision-scoped twin of your process, and an evaluation rubric that separates a good demo from a system you can run.'],
    points: ['Scenario explorer built around one decision', 'Curated test cases and a scoring rubric', 'Failure patterns documented, not hidden'],
    cta: 'How we test before you scale',
  },
];

/** What we do — one line each, in the order a buyer experiences them. */
export const whatWeDo = [
  { id: 'ai-strategy' as ServiceId, line: 'Decide where AI pays off. Sequence it.' },
  { id: 'legacy-modernization' as ServiceId, line: 'Modernize legacy code with AI, under engineering review.' },
  { id: 'digital-twins-evaluation' as ServiceId, line: 'Test decisions and AI systems before you commit.' },
  { id: 'ai-deployment' as ServiceId, line: 'Integrate, monitor, and hand over with an owner.' },
  { id: 'ai-governance' as ServiceId, line: 'Decision rights, checkpoints, and controls that fit the system.' },
];

export const howItStarts = {
  heading: 'How it starts',
  steps: [
    { n: '1', title: 'You bring one problem.', body: 'A system, a decision, or a stalled pilot.' },
    { n: '2', title: 'We frame it together.', body: 'Who owns it, what cannot change, what good looks like.' },
    { n: '3', title: 'You get a scoped plan.', body: 'Assumptions written down. You decide what happens next.' },
  ],
  note: 'No packages. No rates on a web page. Enterprise work is scoped after someone has looked at it.',
};

export const whyUs = {
  heading: 'Why a small team',
  lines: [
    'Senior people do the work. No bench, no juniors learning on your system.',
    'We have run data and AI programs inside federal agencies and Fortune 500 companies.',
    'We have migrated legacy analytics platforms, including SAS to Python.',
    'We build the controls, not just the model.',
    'We will tell you when AI is not the answer.',
  ],
};

export const finalCta = {
  heading: 'Start with one problem.',
  body: 'Tell us the system, the decision, and what success looks like.',
  cta: { label: 'Talk through your situation', href: '/contact' },
};
