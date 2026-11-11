/**
 * Decision Study — the paid, fixed-scope engagement that follows a free report.
 *
 * This page is UNLISTED: not in the nav, footer, or sitemap, and marked noindex.
 * It is shared one-to-one with a client who has asked for more after their free
 * report. The intake is deliberately comprehensive — it is the scoping document
 * for a paid engagement, not a lead form.
 *
 * Prices are a single source of truth here; change them in one place.
 */

export const packages = [
  {
    id: 'decision-study',
    name: 'Decision Study',
    price: '$4,500',
    intro: '$3,500 for the first twenty clients',
    summary: 'A fixed-scope study of one decision with up to five options and up to three audiences, run on a simulated audience and reviewed by a named analyst. Delivered as a decision memo with a readout call.',
    includes: ['Up to 5 options, up to 3 audience segments', 'Up to 300 simulated respondents, 12–15 questions', 'Sensitivity checks and documented exclusions', 'Decision memo (PDF) + 45-minute readout', 'One revision round', 'Delivered within 5 business days of kickoff'],
  },
  {
    id: 'human-calibration',
    name: 'Decision Study + Human Calibration',
    price: '$7,500',
    intro: 'plus panel costs at cost (typically $600–$2,000)',
    summary: 'Everything in the Decision Study, plus a small panel of real respondents from your target audience on the same questions, so the memo shows where the simulation and real people agree and where they do not.',
    includes: ['Everything in the Decision Study', 'Real-respondent panel on the key questions (n sized to the decision)', 'Side-by-side simulated vs. human comparison', 'Delivered within 10 business days of kickoff'],
  },
] as const;

export type PackageId = (typeof packages)[number]['id'];

/** Commercial terms the client acknowledges on the last step. Keep in step with the engagement letter. */
export const terms = [
  'Scope is fixed to what this questionnaire describes; new options, audiences, or questions are a change order, agreed and paid before work continues.',
  'Payment in full before kickoff (card or ACH). The study is not scheduled until payment clears.',
  'The deliverable is defined by the agreed scope, not by whether you like the conclusion. Remedy for a scope miss is one revision round, not a refund.',
  'No refund after the memo is delivered. Cancellation before kickoff: refund less a 15% scheduling fee. After kickoff: no refund.',
  'The study uses AI-simulated respondents (and, if selected, a real-respondent panel). It is decision support, not a forecast; no outcome is warranted. Liability is capped at fees paid.',
  'Both sides keep the other’s information confidential. Savant may use anonymised learnings to improve its methods; nothing identifying you or your options is published without written consent.',
];

export const studySteps = [
  { id: 'decision', title: 'The decision' },
  { id: 'options', title: 'The options' },
  { id: 'audiences', title: 'The audiences' },
  { id: 'evidence', title: 'What you already know' },
  { id: 'questions', title: 'Questions and hypotheses' },
  { id: 'logistics', title: 'Deliverable and timing' },
  { id: 'commercial', title: 'Package and terms' },
] as const;

export const studyCopy = {
  preview: 'Preview — this questionnaire is not connected yet, so answers can be saved in your browser but not sent.',
  decisionHelper: 'One sentence a colleague would recognise: "Whether to launch X in Q1 at price Y to audience Z."',
  ownerHelper: 'Who makes the final call, and who else has to agree?',
  criteriaHelper: 'What would make you choose one option over another? List the factors in the order they matter.',
  changeMindHelper: 'What finding would change your current leaning? If nothing would, say so — it changes how we design the study.',
  optionsIntro: 'Up to five. Describe each at the level you would share with a prospective customer. Include the price, the terms, the message, or whatever actually differs between them.',
  audiencesIntro: 'Up to three. The more specific the segment, the more useful the comparison. "IT directors at 200–2,000-person US firms who renewed in the last year" beats "enterprise buyers".',
  evidenceIntro: 'Anything already pointing one way: sales calls, support tickets, surveys, win/loss notes, analytics, prior research. Links are fine; do not paste confidential documents.',
  questionsIntro: 'The questions the memo must answer, in priority order. We design the instrument around these.',
  logisticsIntro: 'Who attends the readout, what format the memo takes, and when you need it.',
  consent:
    'I confirm I am authorised to commission this study for my organisation, I have read the terms above, and I agree that Savant Analytics may process this questionnaire to scope and quote the engagement.',
  submit: 'Submit scoping questionnaire',
  successHeadline: 'Questionnaire received.',
  successBody:
    'We review it within two business days and reply with a scope confirmation, a kickoff date, and an invoice. The study is scheduled when payment clears. If anything in your answers needs clarifying, we ask before quoting.',
  successBodyPortal:
    'We read it within 24 hours. Any questions from us, our scope confirmation, your approval, and the finished memo all live on your study page — we email you whenever it needs your attention.',
  successNotSent: (email: string) => `Your questionnaire reached us, but we could not send a copy to ${email}. We will reply to that address within two business days; if nothing arrives, contact us.`,
};
