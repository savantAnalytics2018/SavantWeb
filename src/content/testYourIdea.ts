import type { Cta, FaqItem } from './types';

/**
 * "Market Research" — complimentary research preview (feature brief, Nov 2026;
 * revised after the 5 Nov independent review). All copy for the landing page,
 * intake wizard and sample report lives here.
 *
 * Nav label settled 5 Nov: "Market Research". URL /market-research.
 */

export const tyiPaths = {
  landing: '/market-research',
  start: '/market-research/start',
  sample: '/market-research#sample-report',
} as const;

/** Short, repeatable AI-simulation disclosure. Used in the hero and the sample report only. */
export const tyiDisclosure = 'Uses AI-simulated respondents — built to surface objections, weak claims, and segment differences fast.';

export const tyiHero = {
  eyebrow: 'Digital-Twin Market Research',
  /** Practical promise, no borrowed statistic (10 Nov review). */
  headline: 'Before you commit, find what deserves a closer test.',
  lede: 'Comparing a product idea, price, or message? We explore how a simulated audience might respond, review the findings, and send you a free report with the objections and assumptions worth testing next.',
  primaryCta: { label: 'Start my free study', href: tyiPaths.start } satisfies Cta,
  secondaryCta: { label: 'View a sample report', href: tyiPaths.sample } satisfies Cta,
  trust: ['About 10 minutes', 'First study free', 'No sales call'],
  disclosure: tyiDisclosure,
};

export interface UseCaseTile {
  id: 'product' | 'price' | 'message' | 'survey';
  title: string;
  question: string;
}

export const useCases: UseCaseTile[] = [
  { id: 'product', title: 'Test a product or feature', question: 'Which concept is worth a real test?' },
  { id: 'price', title: 'Explore a price or offer', question: 'What objections and value signals come up?' },
  { id: 'message', title: 'Compare messages', question: 'Which claims are worth testing with each buyer group?' },
  { id: 'survey', title: 'Explore audience perspectives', question: 'What objections might differ across audiences?' },
];

export const howItWorks: { id: string; name: string; summary: string }[] = [
  { id: 'describe', name: 'Submit your brief', summary: 'Your decision, the audience whose perspective matters, and up to three options. About 10 minutes.' },
  { id: 'simulate', name: 'We simulate and review', summary: 'We build personas from your brief, run the questions, and an accountable reviewer checks the findings.' },
  { id: 'snapshot', name: 'Receive your report', summary: 'A short PDF: likely objections, how the options compare, and what to test with real buyers next.' },
];

/** One line on who Savant is, with a link — answers "why trust them with research?" */
export const whoWeAre = {
  line: 'Savant Analytics specialises in simulated evaluation and digital twins for enterprise technology leaders.',
  link: { label: 'See our approach', href: '/approach' } satisfies Cta,
};

/** "How teams use it" — illustrative scenarios (not client stories). Situation → asked → showed → next. */
export interface UseCaseStory {
  id: string;
  who: string;
  situation: string;
  asked: string;
  showed: string;
  next: string;
}

export const useCaseStories: UseCaseStory[] = [
  {
    id: 'saas-product',
    who: 'Product lead, mid-market SaaS',
    situation: 'Two roadmap features, budget for one.',
    asked: 'Which matters more to operations managers at 200–2,000-employee companies?',
    showed: 'Feature A won on stated interest — but B surfaced a compliance objection nobody had raised internally.',
    next: 'Eight customer calls focused on that objection before committing.',
  },
  {
    id: 'b2b-services',
    who: 'Marketing director, B2B services firm',
    situation: 'Three homepage headlines, one slot.',
    asked: 'Which claim lands with IT buyers vs. finance buyers?',
    showed: '“Fastest” drew scepticism from finance; “lowest risk” leaned strong with both.',
    next: 'A/B the top two headlines on the live site for 30 days.',
  },
  {
    id: 'startup',
    who: 'Founder, pre-launch startup',
    situation: 'A bookkeeping tool for small businesses. Is the problem real enough to pay for?',
    asked: 'Do owners of 2–20-person service businesses feel this pain — and how do they cope today?',
    showed: 'The pain was real, but the spreadsheet workaround read as “good enough” — except for owners with 10+ staff.',
    next: 'Fifteen interviews with 10+-staff owners and a waitlist landing page aimed at them.',
  },
  {
    id: 'consumer',
    who: 'Brand manager, consumer goods',
    situation: 'Three new flavour concepts, one retail pilot.',
    asked: 'Which concept should go to shelf, and with which shopper segment?',
    showed: 'Concept C polarized — strong with younger flavour explorers, weak with value shoppers; A was safe but unexciting.',
    next: 'Shelf-test A and C in two stores for four weeks, plus a 10-person taste panel on C.',
  },
];

/** What the complimentary snapshot contains. Shown on the landing page. */
/** The three outputs shown on the landing page. */
export const reportOutputs: { title: string; detail: string }[] = [
  { title: 'Likely objections', detail: 'What a simulated audience pushes back on, by segment, and which objections to take seriously.' },
  { title: 'How the options compare', detail: 'Where each option leans, where results are unstable, and what the comparison does not settle.' },
  { title: 'What to test next', detail: 'Two to four practical tests with real buyers or users — the part most teams act on first.' },
];

export const snapshotContents: { title: string; detail: string }[] = [
  { title: 'Executive overview', detail: 'Your question, the concepts tested, the key simulated themes, the main caveats.' },
  { title: 'How we asked', detail: 'Personas, selection assumptions, synthetic sample size, and the exact questions.' },
  { title: 'Results', detail: 'Where each concept leans by segment, with labeled synthetic responses.' },
  { title: 'Interpretation', detail: 'Competing hypotheses, surprising objections, where results are unstable.' },
  { title: 'What to test with real people next', detail: 'Two to four practical tests with actual buyers or users.' },
];

/** What the reviewers do — makes "reviewed" concrete. */
export const analystLine =
  'Every report is reviewed by a named member of the Savant Research Team before it is sent. We check unsupported claims, contradictory responses, and sensitivity to assumptions. Any exclusions are documented; surprising or inconvenient findings are not removed because they are surprising.';
export const deliverableHeading = 'A reviewed first pass — and a recommendation for what to test with real people.';
export const deliverableLede = 'A short PDF, reviewed by an accountable person before it reaches you. Simulated responses, clearly labelled, with their limits stated.';

/**
 * Track record. Every snapshot is scored against a small human panel; the
 * agreement rate is published here once measured. Until then the slot shows
 * its status honestly rather than an implied number.
 */
export const trackRecord = {
  heading: 'Does the free report include real people?',
  /** Set once a defined metric exists (tasks, audiences, exclusions). null = nothing published. */
  agreement: null as string | null,
  measuring:
    'No. The free report uses simulated responses only. Separately, we are evaluating selected studies against human responses to understand where the simulation holds and where it does not. Any human evidence included in a report is identified as such.',
  published: (rate: string) => `On the studies we have compared so far, the simulated audience agreed with a human panel on the leading option ${rate}. The method and exclusions are described in each report.`,
};

/** Signpost to paid work. Intake page only — no prices here. */
export const ifYouNeedMore = {
  heading: 'Need a deeper answer?',
  line: 'Your free report is yours to use, with no sales call required. If you want help testing the findings with real buyers, comparing more options, or developing a fuller recommendation, reply to the report email. We agree the scope and fee before any paid work begins.',
};

/** Operational caps for the first complimentary study (configurable). Shown as chips. */
export const studyScope = {
  studiesPerCompany: 1,
  markets: 1,
  maxConcepts: 3,
  questions: '8–10',
  maxRespondents: 100,
  chips: ['1 market', 'Up to 3 concepts', '8–10 questions', 'Up to 100 simulated respondents'],
};

/** Examples of what can be tested. Extend freely; shown in the FAQ. */
export const testExamples: string[] = [
  'Product survey — would this audience want it?',
  'Feature test — which of three features matters most?',
  'Pricing test — $15/seat vs. usage-based vs. included',
  'Campaign test — which message or headline lands?',
  'Offer test — bundle, trial, or discount?',
  'Naming or packaging test',
  'Consumer survey — which concept wins with which shopper segment?',
  'Customer-problem check — is this pain real and urgent?',
];

export const tyiFaq: FaqItem[] = [
  {
    id: 'why-free',
    question: 'Why is it free?',
    answer: 'It’s how we show our work. If the report is useful, you’ll know where to find us. If not, you’ve lost ten minutes. One complimentary study per organisation (we check by company domain), and we prioritise requests from company email addresses.',
  },
  {
    id: 'real',
    question: 'Are these real people?',
    answer:
      'No. These are AI-generated responses based on the audience and concepts in your brief. They can surface possible objections and questions to investigate, but they do not measure actual demand or replace research with real customers. Any human evidence included in your report is clearly identified.',
  },
  {
    id: 'method',
    question: 'What does the research say about simulated respondents?',
    answer:
      'Published work is mixed and specific. Argyle et al. (Political Analysis, 2023) found language models conditioned on demographic profiles reproduced binary vote-choice patterns with tetrachoric correlations above 0.90; Park et al. (2024, preprint) found interview-grounded agents reproduced individuals’ General Social Survey answers at about 85% of those individuals’ own test-retest consistency. Other studies find simulated panels flatten variance, overstate consensus, and perform worst on price and purchase questions. None of this validates our workflow for your decision — it is why every report ends with tests to run with real people.',
  },
  {
    id: 'submission',
    question: 'What happens to what I submit?',
    answer: 'Only the Savant team preparing your report sees it. It arrives by email and is not published. Ask and we’ll delete it. Still, describe concepts at the level you would share with a prospective customer — no confidential, personal, or regulated information. The privacy notice lists the services that handle it.',
  },
  {
    id: 'reviewer',
    question: 'Who reviews the results?',
    answer: 'A named member of the Savant Research Team, identified on your report. They check unsupported claims, contradictory responses, and sensitivity to assumptions, document any exclusions, and write the interpretation and next tests.',
  },
  {
    id: 'what',
    question: 'What can I test?',
    answer: `One concept, or up to three to compare. For example: ${testExamples.join(' · ')}.`,
  },
  {
    id: 'when',
    question: 'How soon will I receive it?',
    answer: 'We confirm fit within three business days and give you a delivery date before starting. If a request is outside what a simulated audience can usefully answer, we say so in the same email.',
  },
  {
    id: 'more',
    question: 'What if I need more than the snapshot?',
    answer:
      'Reply to the report email. We can scope a fuller decision study, test the findings with real buyers, or set up ongoing research support — and agree scope and fee before any paid work starts.',
  },
  {
    id: 'decline',
    question: 'Will every request be accepted?',
    answer:
      'Most are. We may decline or ask to reshape a request that is outside what a simulated audience can usefully answer — for example, forecasting a specific sales number — and we will say so within three business days. The snapshot is decision support, not a forecast.',
  },
  {
    id: 'call',
    question: 'Do I need a sales call?',
    answer: 'No. A follow-up discussion is optional, and the report is not conditional on one.',
  },
];

/* ---------- Sample report (illustrative, B2B) ---------- */

export const sampleReport = {
  label: 'Illustrative example — invented concept, simulated data, example reviewer',
  pageLabel: 'Research snapshot · illustrative · 7 pages',
  overview: [
    'Prioritise A and B for testing with real buyers. In this illustration their main trade-off is predictable budgeting (A) versus paying only for selected users (B).',
    'B is worth testing as an add-on for a few power users rather than every seat — cost controllers objected to the all-seats framing.',
    'Before testing C, specify the spending cap and typical usage. Budget predictability is an objection to investigate, not evidence that buyers will reject it.',
  ],
  caveats: [
    'Part of what this example tests is incomplete pricing information: C’s cap and A’s base price were not specified, and several objections turn on that.',
    'Early adopters leaned strong on both A and B — the simulation could not separate them; a real pilot is needed to.',
    'Results for cost controllers were stable across runs; results for risk-cautious IT on option B shifted between runs and are flagged as unstable.',
  ],
  questions: [
    'Which of these three pricing options would you choose for your team, and why?',
    'Which of these options would you be willing to adopt in the next 12 months? (select all that apply)',
    'What is the first objection you would raise to each option?',
    'How would you forecast annual spend under each option?',
    'Who else in your organization would need to approve this, and what would they ask?',
    'At what price per seat would option B stop being worth it?',
    'What would make the “included” option feel like a price increase?',
    'Which option is easiest to explain to your CFO?',
    'Would any option make you consider switching vendors?',
  ],
  /** Top objection per concept, counted when respondents were asked for their first objection (Q3). */
  objections: [
    { concept: 'A', text: '“Included” is a hidden 8% price rise', count: 19 },
    { concept: 'B', text: 'Paying for seats that won’t use it', count: 27 },
    { concept: 'C', text: 'Can’t forecast annual spend', count: 38 },
  ],
  reviewedBy: 'Reviewed by [reviewer name], Savant Research Team — example line; real reports name the reviewer',
  title: 'Pricing an AI add-on for a mid-market workflow platform',
  question: 'Which way of pricing a new AI assistant should a mid-market SaaS vendor take to a pilot?',
  audience:
    'IT and operations leaders at U.S. companies with 200–2,000 employees that already use workflow software (modeled; 60 synthetic respondents, 20 per segment).',
  concepts: [
    { id: 'A', name: 'Included in Enterprise tier', note: 'No extra fee; Enterprise price rises 8% (from $60 to $65 per user per month)' },
    { id: 'B', name: '$15 per user per month add-on', note: 'Opt-in per seat' },
    { id: 'C', name: 'Usage-based', note: '$0.10 per AI action, capped at $20 per user per month' },
  ],
  segments: ['Cost controllers', 'Early adopters', 'Risk-cautious IT'],
  /** Share selecting each option in Q2 ("willing to adopt in the next 12 months", multi-select). n = 20 per segment, so values are multiples of 5. Illustrative only. */
  wouldAdopt: [
    { concept: 'A', values: [60, 80, 75] },
    { concept: 'B', values: [35, 80, 55] },
    { concept: 'C', values: [30, 55, 25] },
  ],
  themes: [
    '“Included” reads as safe and simple, but cost controllers notice the 8% Enterprise rise and ask what they are paying for if they don’t use it.',
    'Per-seat add-on polarizes: early adopters accept it; cost controllers want to buy it for a few power users, not everyone.',
    'Usage-based pricing triggers budget-predictability objections from risk-cautious IT (“how do I forecast this?”), even with a cap.',
  ],
  exampleResponses: [
    { segment: 'Risk-cautious IT', text: 'A cap helps, but my CFO wants a number for the year, not a ceiling. I’d push for the per-seat option and limit the seats.' },
    { segment: 'Cost controllers', text: 'If it’s “included” and my renewal goes up 8%, it isn’t included. Show me the usage before I pay for it.' },
  ],
  nextSteps: [
    'Pilot option A and option B with five existing customers each, for one renewal cycle.',
    'A/B the pricing page: “included” vs “add-on” wording, measuring demo requests from 200+ employee companies.',
    'Eight 30-minute interviews with IT buyers on how they forecast usage-based spend before committing to option C.',
  ],
};

/** Compact sample shown on the landing page; the full report sits behind an expander. */
export const sampleCompact = {
  finding: 'Option B (per-seat add-on) polarised: early adopters accepted it, cost controllers wanted it for a few power users only.',
  caveat: 'Risk-cautious IT shifted between runs on option B — flagged as unstable.',
  nextTest: 'Pilot A and B with five existing customers each for one renewal cycle.',
};

/* ---------- Intake wizard ---------- */

export const intakeSteps: { id: string; title: string }[] = [
  { id: 'decision', title: 'What would you like to test?' },
  { id: 'audience', title: 'Whose perspective should we explore?' },
  { id: 'concepts', title: 'What are the options?' },
  { id: 'contact', title: 'Where should we send the results?' },
];

export const decisionTypes: { id: string; label: string }[] = [
  { id: 'product', label: 'Product or feature' },
  { id: 'price', label: 'Price or offer' },
  { id: 'message', label: 'Marketing message' },
  { id: 'problem', label: 'A problem worth solving' },
  { id: 'other', label: 'Other' },
];

export const buyerTypes: { id: string; label: string }[] = [
  { id: '', label: 'Not sure' },
  { id: 'consumer', label: 'Consumers' },
  { id: 'business', label: 'Business buyers' },
  { id: 'both', label: 'A mix' },
];

export const intakeCopy = {
  lede: 'Four short screens, about 10 minutes if you have your question and options to hand. We save your answers in this tab as you go — closing the tab clears them. Nothing is sent until you submit.',
  intro: 'Answer what you can — “not sure” is a fine answer. Questions are required unless marked optional.',
  questionExamples: [
    '“What objections should we test before offering automated bookkeeping reminders to small-business owners at $49/month?”',
    '“Which of our three onboarding messages gets IT managers at 500-person companies to book a demo?”',
  ],
  audienceHelper:
    'Describe them the way you would to a colleague: who they are, what they buy or do today, what they care about. For business buyers, include company size, industry, and role if you know them. No names or personal data.',
  extraQuestionsHelper: 'We’ll write the survey questions, but tell us anything you specifically want asked.',
  emailHelper: 'This is where the report will be sent. A work address is preferred.',
  dataHandling:
    'Only the Savant team preparing your snapshot can read your request; our email provider handles delivery. We keep it only while preparing your snapshot, and you can ask us to delete it at any time.',
  previewNotice: 'This is a preview: requests can’t be sent yet, but you can walk through every screen.',
  errorSummary: 'Please fix the highlighted fields.',
  conceptsIntro:
    'You told us your question. Now show us the options — up to three concepts, messages, or prices. One is fine. Describe each at the level you would share with a prospective customer: no confidential, personal, or regulated information.',
  conceptsIntroProblem:
    'For a problem worth solving, describe the problem and any proposed approach. A developed concept is not required — one entry is enough.',
  consent:
    'I agree that Savant Analytics may process this submission to prepare and email my complimentary research snapshot. I understand the snapshot uses AI-simulated respondents and is decision support, not a forecast.',
  stakesHelper: 'Helps us judge how much depth the snapshot needs. One sentence is plenty.',
  decideByHelper: 'A month or a date. “Not sure” is fine.',
  marketing: 'Send me occasional Savant research notes. Not required for your report.',
  disclosure: tyiDisclosure,
  submit: 'Submit my research request',
  successHeadline: 'Your research request is in.',
  conceptLabelProblem: 'Describe the problem or proposed approach',
  successSent: (email: string) =>
    `We’ve sent a confirmation to ${email}. We’ll confirm your delivery window there within three business days — reply to that email if anything changes. If the confirmation doesn’t arrive within a few minutes, check your spam folder.`,
  successNotSent: (email: string) =>
    `Your request reached us, but we couldn’t send a confirmation to ${email}. Please check the address — we’ll confirm your delivery window within three business days once we can reach you.`,
};

/**
 * Turnaround wording. Keep the neutral line until operations confirm a fixed
 * window; then set `fixedTurnaround` to e.g. "within 48 business hours".
 */
export const turnaround = {
  fixedTurnaround: null as string | null,
  /** How quickly Savant commits to confirming receipt and a delivery window. */
  confirmationWindow: 'within three business days',
  neutralLine: 'We’ll confirm your delivery window by email within three business days.',
};

export function turnaroundLine(): string {
  return turnaround.fixedTurnaround ? `Expected delivery: ${turnaround.fixedTurnaround}.` : turnaround.neutralLine;
}
