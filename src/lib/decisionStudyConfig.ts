/**
 * Decision Study scoping questionnaire — shared client/server validation.
 * Submits only when VITE_DECISION_STUDY_ENDPOINT is set at build time.
 */
import type { PackageId } from '@/content/decisionStudy';
import { packages } from '@/content/decisionStudy';
import { emailDomain, isFreeMail } from '@/lib/studyConfig';

const viteEnv: Record<string, string | undefined> = import.meta.env ?? {};
const endpoint = viteEnv.VITE_DECISION_STUDY_ENDPOINT?.trim() ?? '';

export const dsConfig = {
  endpoint,
  enabled: endpoint.length > 0,
  draftKey: 'savant.ds.draft.v1',
  maxOptions: 5,
  maxAudiences: 3,
  maxQuestions: 10,
} as const;

export const dsLimits = {
  short: { max: 200 },
  text: { min: 20, max: 3000 },
  long: { max: 5000 },
  email: { max: 254 },
};

export interface DsOption {
  name: string;
  description: string;
  /** What the client currently expects this option to do — stated so the study can test it. */
  expectation: string;
}
export interface DsAudience {
  name: string;
  description: string;
  roles: string;
  geography: string;
  stage: string;
  knownObjections: string;
}
export interface DsInput {
  // 1. free report
  reference: string;
  reportFeedback: string;
  // 2. decision
  decision: string;
  owner: string;
  decideBy: string;
  stakes: string;
  criteria: string;
  currentLeaning: string;
  changeMind: string;
  constraints: string;
  // 3. options
  options: DsOption[];
  // 4. audiences
  audiences: DsAudience[];
  buyingCommittee: string;
  // 5. evidence
  evidence: string;
  competitors: string;
  priorResearch: string;
  // 6. questions
  questions: string[];
  hypotheses: string;
  outOfScope: string;
  // 7. logistics
  readoutAttendees: string;
  format: string;
  deadline: string;
  confidentiality: string;
  // 8. commercial
  packageId: PackageId | '';
  billingContact: string;
  poRequired: 'yes' | 'no' | '';
  paymentMethod: 'card' | 'ach' | 'wire' | '';
  // contact
  name: string;
  role: string;
  company: string;
  email: string;
  companySite: string;
  phone: string;
  consent: boolean;
  source: string;
}

export const emptyOption = (): DsOption => ({ name: '', description: '', expectation: '' });
export const emptyAudience = (): DsAudience => ({ name: '', description: '', roles: '', geography: '', stage: '', knownObjections: '' });

export const emptyDs = (): DsInput => ({
  reference: '',
  reportFeedback: '',
  decision: '',
  owner: '',
  decideBy: '',
  stakes: '',
  criteria: '',
  currentLeaning: '',
  changeMind: '',
  constraints: '',
  options: [emptyOption(), emptyOption()],
  audiences: [emptyAudience()],
  buyingCommittee: '',
  evidence: '',
  competitors: '',
  priorResearch: '',
  questions: ['', '', ''],
  hypotheses: '',
  outOfScope: '',
  readoutAttendees: '',
  format: '',
  deadline: '',
  confidentiality: '',
  packageId: '',
  billingContact: '',
  poRequired: '',
  paymentMethod: '',
  name: '',
  role: '',
  company: '',
  email: '',
  companySite: '',
  phone: '',
  consent: false,
  source: '',
});

export type DsErrors = Partial<Record<string, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const sitePattern = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i;
const refPattern = /^TYI-\d{4}-[A-Z0-9]{6}$/i;
const tooLong = (s: string, max: number) => s.trim().length > max;
const tooShort = (s: string, min: number) => s.trim().length < min;

/** Validate one step (0–7). Returns {} when valid. */
export function validateDsStep(step: number, v: DsInput): DsErrors {
  const e: DsErrors = {};
  const need = (key: keyof DsInput, msg: string, min = dsLimits.text.min, max = dsLimits.text.max) => {
    const val = String(v[key] ?? '');
    if (tooShort(val, min)) e[key] = msg;
    else if (tooLong(val, max)) e[key] = `Keep this under ${max} characters.`;
  };
  const optional = (key: keyof DsInput, max: number) => {
    if (tooLong(String(v[key] ?? ''), max)) e[key] = `Keep this under ${max} characters.`;
  };

  switch (step) {
    case 0:
      if (v.reference.trim() && !refPattern.test(v.reference.trim())) e.reference = 'References look like TYI-2026-AB12CD.';
      optional('reportFeedback', dsLimits.text.max);
      break;
    case 1:
      need('decision', 'State the decision in one or two sentences.');
      need('owner', 'Tell us who decides.', 2, dsLimits.short.max);
      need('decideBy', 'Give a date or a month.', 2, dsLimits.short.max);
      need('stakes', 'What happens if this goes wrong?');
      need('criteria', 'List the factors that will decide it.');
      optional('currentLeaning', dsLimits.text.max);
      need('changeMind', 'Tell us what would change your mind — or that nothing would.', 5);
      optional('constraints', dsLimits.text.max);
      break;
    case 2: {
      const filled = v.options.filter((o) => o.name.trim() || o.description.trim());
      if (filled.length < 2) e.options = 'Describe at least two options to compare.';
      v.options.forEach((o, i) => {
        const active = o.name.trim() || o.description.trim() || o.expectation.trim();
        if (!active) return;
        if (!o.name.trim()) e[`option-${i}-name`] = 'Name this option.';
        if (tooShort(o.description, dsLimits.text.min)) e[`option-${i}-description`] = 'Describe it in a sentence or two at least.';
        if (tooLong(o.description, dsLimits.text.max)) e[`option-${i}-description`] = `Keep this under ${dsLimits.text.max} characters.`;
        if (tooLong(o.expectation, dsLimits.text.max)) e[`option-${i}-expectation`] = `Keep this under ${dsLimits.text.max} characters.`;
      });
      break;
    }
    case 3: {
      const filled = v.audiences.filter((a) => a.description.trim());
      if (filled.length < 1) e.audiences = 'Describe at least one audience.';
      v.audiences.forEach((a, i) => {
        const active = Object.values(a).some((x) => x.trim());
        if (!active) return;
        if (!a.name.trim()) e[`audience-${i}-name`] = 'Give this segment a short name.';
        if (tooShort(a.description, dsLimits.text.min)) e[`audience-${i}-description`] = 'Describe who they are — role, company size, situation.';
        for (const k of ['description', 'roles', 'geography', 'stage', 'knownObjections'] as const) {
          if (tooLong(a[k], dsLimits.text.max)) e[`audience-${i}-${k}`] = `Keep this under ${dsLimits.text.max} characters.`;
        }
      });
      optional('buyingCommittee', dsLimits.text.max);
      break;
    }
    case 4:
      optional('evidence', dsLimits.long.max);
      optional('competitors', dsLimits.text.max);
      optional('priorResearch', dsLimits.text.max);
      break;
    case 5: {
      const qs = v.questions.map((q) => q.trim()).filter(Boolean);
      if (qs.length < 1) e.questions = 'Give us at least one question the memo must answer.';
      v.questions.forEach((q, i) => {
        if (tooLong(q, dsLimits.short.max * 2)) e[`question-${i}`] = `Keep this under ${dsLimits.short.max * 2} characters.`;
      });
      optional('hypotheses', dsLimits.text.max);
      optional('outOfScope', dsLimits.text.max);
      break;
    }
    case 6:
      need('readoutAttendees', 'Who should be at the readout?', 2, dsLimits.short.max * 2);
      optional('format', dsLimits.short.max * 2);
      need('deadline', 'When do you need the memo?', 2, dsLimits.short.max);
      optional('confidentiality', dsLimits.text.max);
      break;
    case 7: {
      if (!packages.some((p) => p.id === v.packageId)) e.packageId = 'Choose a package.';
      if (!v.name.trim()) e.name = 'Please enter your name.';
      if (!v.company.trim()) e.company = 'Please enter your company.';
      const email = v.email.trim();
      if (!email) e.email = 'Please enter your email.';
      else if (email.length > dsLimits.email.max || !emailPattern.test(email)) e.email = 'Please enter a valid email address.';
      else if (isFreeMail(email)) {
        const site = v.companySite.trim();
        if (!site) e.companySite = 'For a personal email address, please add your company website.';
        else if (!sitePattern.test(site) || site.length > 200) e.companySite = 'Please enter a website like example.com.';
      }
      optional('role', dsLimits.short.max);
      optional('phone', 40);
      optional('billingContact', dsLimits.short.max * 2);
      if (!v.poRequired) e.poRequired = 'Tell us whether you need a purchase order.';
      if (!v.paymentMethod) e.paymentMethod = 'Choose how you would prefer to pay.';
      if (v.consent !== true) e.consent = 'We need your confirmation to proceed.';
      break;
    }
  }
  return e;
}

export function validateDs(v: DsInput): DsErrors {
  let all: DsErrors = {};
  for (let i = 0; i < 8; i++) all = { ...all, ...validateDsStep(i, v) };
  return all;
}

/** Server-side coercion of an untrusted JSON body. */
export function coerceDs(b: Record<string, unknown>): DsInput {
  const s = (k: string, max: number) => (typeof b[k] === 'string' ? (b[k] as string).slice(0, max) : '');
  const arr = <T,>(k: string, max: number, map: (x: Record<string, unknown>) => T): T[] =>
    Array.isArray(b[k]) ? (b[k] as unknown[]).slice(0, max).map((x) => map((x && typeof x === 'object' ? x : {}) as Record<string, unknown>)) : [];
  const str = (o: Record<string, unknown>, k: string, max: number) => (typeof o[k] === 'string' ? (o[k] as string).slice(0, max) : '');
  const pkg = packages.some((p) => p.id === b.packageId) ? (b.packageId as PackageId) : '';
  const oneOf = <T extends string>(k: string, allowed: readonly T[]): T | '' => (allowed.includes(b[k] as T) ? (b[k] as T) : '');
  return {
    reference: s('reference', 40),
    reportFeedback: s('reportFeedback', dsLimits.text.max),
    decision: s('decision', dsLimits.text.max),
    owner: s('owner', dsLimits.short.max),
    decideBy: s('decideBy', dsLimits.short.max),
    stakes: s('stakes', dsLimits.text.max),
    criteria: s('criteria', dsLimits.text.max),
    currentLeaning: s('currentLeaning', dsLimits.text.max),
    changeMind: s('changeMind', dsLimits.text.max),
    constraints: s('constraints', dsLimits.text.max),
    options: arr('options', dsConfig.maxOptions, (o) => ({ name: str(o, 'name', dsLimits.short.max), description: str(o, 'description', dsLimits.text.max), expectation: str(o, 'expectation', dsLimits.text.max) })),
    audiences: arr('audiences', dsConfig.maxAudiences, (a) => ({
      name: str(a, 'name', dsLimits.short.max),
      description: str(a, 'description', dsLimits.text.max),
      roles: str(a, 'roles', dsLimits.text.max),
      geography: str(a, 'geography', dsLimits.text.max),
      stage: str(a, 'stage', dsLimits.text.max),
      knownObjections: str(a, 'knownObjections', dsLimits.text.max),
    })),
    buyingCommittee: s('buyingCommittee', dsLimits.text.max),
    evidence: s('evidence', dsLimits.long.max),
    competitors: s('competitors', dsLimits.text.max),
    priorResearch: s('priorResearch', dsLimits.text.max),
    questions: Array.isArray(b.questions) ? (b.questions as unknown[]).slice(0, dsConfig.maxQuestions).map((q) => (typeof q === 'string' ? q.slice(0, dsLimits.short.max * 2) : '')) : [],
    hypotheses: s('hypotheses', dsLimits.text.max),
    outOfScope: s('outOfScope', dsLimits.text.max),
    readoutAttendees: s('readoutAttendees', dsLimits.short.max * 2),
    format: s('format', dsLimits.short.max * 2),
    deadline: s('deadline', dsLimits.short.max),
    confidentiality: s('confidentiality', dsLimits.text.max),
    packageId: pkg,
    billingContact: s('billingContact', dsLimits.short.max * 2),
    poRequired: oneOf('poRequired', ['yes', 'no'] as const),
    paymentMethod: oneOf('paymentMethod', ['card', 'ach', 'wire'] as const),
    name: s('name', dsLimits.short.max),
    role: s('role', dsLimits.short.max),
    company: s('company', dsLimits.short.max),
    email: s('email', dsLimits.email.max),
    companySite: s('companySite', 200),
    phone: s('phone', 40),
    consent: b.consent === true,
    source: s('source', 300),
  };
}

export { emailDomain, isFreeMail };

export function makeDsReference(now = new Date()): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let tail = '';
  for (let i = 0; i < 6; i++) tail += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `DS-${now.getUTCFullYear()}-${tail}`;
}
