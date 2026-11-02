import type { ServiceId } from './types';

/**
 * Homepage copy. Short lines, direct address, one audience:
 * enterprise and federal technology leaders with legacy systems and an AI mandate.
 */

export const homeHero = {
  eyebrow: 'For enterprise and federal technology leaders',
  headline: 'Your AI never reaches production.',
  lines: ['We orchestrate AI agents across your legacy workflows —', 'under your controls, with your team.'],
  primaryCta: { label: 'Talk through your situation', href: '/contact' },
  secondaryCta: { label: 'See how we work', href: '/approach' },
  micro: 'One conversation. Bring one problem.',
  /** Caption under the animation. Real text; the picture is decorative. */
  artCaption: 'Case files, data, batch jobs, reports, compliance — orchestrated, one by one.',
};

/** "Sound familiar?" — the buyer's situation in their words. */
export const painPoints = [
  'Leadership wants AI. Nobody has a plan.',
  'The core system is twenty years old. Touching it is risky.',
  'The pilot looked great. Production never happened.',
  'Everyone is using AI tools. Nobody owns the risk.',
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
