import type { ApproachStage, BuyerSituation, FaqItem } from './types';

export const buyerSituations: BuyerSituation[] = [
  {
    id: 'need-strategy',
    heading: 'We need a practical AI strategy.',
    question: 'Competing proposals, no shared basis for choosing.',
    firstDecision: 'First decision: which two or three opportunities justify scoped work now.',
    services: ['ai-strategy', 'ai-governance'],
  },
  {
    id: 'modernize-application',
    heading: 'We need to modernize a critical application.',
    question: 'Hard to change, poorly documented, too few people who understand it.',
    firstDecision: 'First decision: where change is safest and most valuable, backed by a dependency map and tests.',
    services: ['legacy-modernization', 'ai-deployment'],
  },
  {
    id: 'evidence-before-scaling',
    heading: 'We need evidence before scaling an AI initiative.',
    question: 'The prototype demos well. Budget and reputation are now on the line.',
    firstDecision: 'First decision: which tasks are ready, which need controls, which stay with people.',
    services: ['digital-twins-evaluation', 'ai-governance', 'ai-deployment'],
  },
];

export const approachStages: ApproachStage[] = [
  {
    id: 'frame',
    name: 'Frame',
    summary: 'Agree the problem, stakeholders, constraints, and success criteria.',
    detail: 'What decision must the work inform, who owns it, what cannot change, and how will everyone recognize a good outcome. Short, and skipped at your peril.',
  },
  {
    id: 'examine',
    name: 'Examine',
    summary: 'Assess the current system, evidence, dependencies, and risks.',
    detail: 'Code, data, workflows, prior attempts, and the people involved. An honest picture of readiness and risk, written down so it can be challenged.',
  },
  {
    id: 'build-and-test',
    name: 'Build and test',
    summary: 'Implement a scoped solution or evaluation. Test assumptions. Document trade-offs.',
    detail: 'Sized to produce evidence fast: a pilot migration, an evaluated model, a decision-scoped simulation.',
  },
  {
    id: 'operationalize',
    name: 'Operationalize',
    summary: 'Establish ownership, deployment requirements, monitoring, and next steps.',
    detail: 'Who runs it, what is monitored, how problems escalate, and what to do next.',
  },
];

export const approachNotes = [
  'An engagement may focus on one stage or span several.',
  'Scope, data, system access, and organizational constraints determine what is feasible. We say so early.',
  'No published rates, minimums, or durations. Enterprise work is scoped after someone has looked at it.',
];

export const faq: FaqItem[] = [
  {
    id: 'fit',
    question: 'What kinds of organizations and problems fit?',
    answer: 'Enterprise teams with systems and decisions that matter: a critical application to modernize, an AI initiative that needs evidence, or a portfolio of ideas to prioritize. If an off-the-shelf tool would do, we will say so.',
  },
  {
    id: 'existing-teams',
    question: 'How do you work with our existing teams?',
    answer: 'Alongside them. Your teams know the systems and history; we bring method, evidence, and delivery capacity, and leave your people able to run the result.',
  },
  {
    id: 'sensitive-systems',
    question: 'Can you work with sensitive or regulated systems?',
    answer: 'Yes. Access, review checkpoints, and data-handling rules are agreed before work starts. No production changes outside your review process.',
  },
  {
    id: 'scoping',
    question: 'How is an engagement scoped and priced?',
    answer: 'After a short framing conversation and usually a look at the current state. You get a clear scope and assumptions before committing.',
  },
  {
    id: 'not-ai',
    question: 'What if we do not need AI for this?',
    answer: 'Then that is the recommendation.',
  },
];
