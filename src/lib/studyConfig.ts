/**
 * "Market Research" intake — shared client/server validation and delivery config.
 *
 * Mirrors contactConfig.ts: the wizard only submits when VITE_STUDY_ENDPOINT is
 * set at build time. Otherwise it renders in preview mode (clear notice,
 * submission disabled, never a simulated success).
 */
const viteEnv: Record<string, string | undefined> = import.meta.env ?? {};
const endpoint = viteEnv.VITE_STUDY_ENDPOINT?.trim() ?? '';

export const studyConfig = {
  endpoint,
  enabled: endpoint.length > 0,
  /** sessionStorage key for in-browser autosave of a draft brief. */
  draftKey: 'savant.tyi.draft.v1',
} as const;

export const studyLimits = {
  short: { max: 160 },
  text: { min: 20, max: 2000 },
  audienceMin: 10,
  optionalText: { max: 2000 },
  concept: { max: 1200 },
  url: { max: 300 },
  email: { max: 254 },
  maxConcepts: 3,
} as const;

export const decisionTypeIds = ['product', 'price', 'message', 'problem', 'other'] as const;
export const buyerTypeIds = ['', 'consumer', 'business', 'both'] as const;

export interface StudyConcept {
  name: string;
  description: string;
  url: string;
}

export interface StudyInput {
  // Screen 1
  decisionType: string;
  otherDetail: string;
  question: string;
  context: string;
  /** Optional: what the decision feeds and when (scoping + lead quality). */
  decideBy: string;
  stakes: string;
  // Screen 2
  audience: string;
  geography: string;
  buyerType: string;
  // Screen 3
  concepts: StudyConcept[];
  extraQuestions: string;
  // Screen 4
  name: string;
  company: string;
  email: string;
  role: string;
  consent: boolean;
  marketingOptIn: boolean;
  /** Attribution captured on the landing page (referrer / UTM), never shown to the visitor. */
  source: string;
}

export type StudyErrors = Partial<Record<keyof StudyInput | `concept${number}`, string>>;

export const emptyConcept = (): StudyConcept => ({ name: '', description: '', url: '' });

export const emptyStudy = (): StudyInput => ({
  decisionType: '',
  otherDetail: '',
  question: '',
  context: '',
  decideBy: '',
  stakes: '',
  audience: '',
  geography: '',
  buyerType: '',
  concepts: [emptyConcept()],
  extraQuestions: '',
  name: '',
  company: '',
  email: '',
  role: '',
  consent: false,
  marketingOptIn: false,
  source: '',
});

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const urlPattern = /^https?:\/\/[^\s]+$/i;

/** Validates one wizard screen (0–3). Returns an empty object when valid. */
export function validateStep(step: number, v: StudyInput): StudyErrors {
  const e: StudyErrors = {};
  const tooLong = (s: string, max: number) => s.length > max;

  if (step === 0) {
    if (!decisionTypeIds.includes(v.decisionType as (typeof decisionTypeIds)[number]) || v.decisionType === '')
      e.decisionType = 'Choose the kind of decision you want to test.';
    if (v.decisionType === 'other') {
      const od = v.otherDetail.trim();
      if (od.length < 3) e.otherDetail = 'Tell us what kind of decision it is.';
      else if (tooLong(od, studyLimits.short.max)) e.otherDetail = `Keep this under ${studyLimits.short.max} characters.`;
    }
    const q = v.question.trim();
    if (q.length < studyLimits.text.min)
      e.question = `Give us a sentence or two (at least ${studyLimits.text.min} characters) so we can scope the study.`;
    else if (tooLong(q, studyLimits.text.max)) e.question = `Keep this under ${studyLimits.text.max} characters.`;
    if (tooLong(v.context, studyLimits.optionalText.max)) e.context = `Keep this under ${studyLimits.optionalText.max} characters.`;
    if (tooLong(v.decideBy, studyLimits.short.max)) e.decideBy = `Keep this under ${studyLimits.short.max} characters.`;
    if (tooLong(v.stakes, studyLimits.short.max * 2)) e.stakes = `Keep this under ${studyLimits.short.max * 2} characters.`;
  }

  if (step === 1) {
    const a = v.audience.trim();
    if (a.length < studyLimits.audienceMin) e.audience = `Tell us who they are in a few words (at least ${studyLimits.audienceMin} characters).`;
    else if (tooLong(a, studyLimits.text.max)) e.audience = `Keep this under ${studyLimits.text.max} characters.`;
    if (tooLong(v.geography, studyLimits.short.max)) e.geography = `Keep this under ${studyLimits.short.max} characters.`;
    if (!buyerTypeIds.includes(v.buyerType as (typeof buyerTypeIds)[number])) e.buyerType = 'Choose a listed option.';
  }

  if (step === 2) {
    if (v.concepts.length < 1 || v.concepts.length > studyLimits.maxConcepts)
      e.concepts = `Add between one and ${studyLimits.maxConcepts} concepts.`;
    v.concepts.forEach((c, i) => {
      const key = `concept${i}` as const;
      const name = c.name.trim();
      const desc = c.description.trim();
      if (i === 0 && !desc) e[key] = 'Describe at least one concept, message, price, or option.';
      else if (i > 0 && !desc) e[key] = 'Describe this concept or remove it.';
      else if (tooLong(name, studyLimits.short.max) || tooLong(desc, studyLimits.concept.max))
        e[key] = `Keep the name under ${studyLimits.short.max} and the description under ${studyLimits.concept.max} characters.`;
      else if (c.url.trim() && (!urlPattern.test(c.url.trim()) || tooLong(c.url, studyLimits.url.max)))
        e[key] = 'Enter a full link starting with http:// or https://, or leave it blank.';
    });
    if (tooLong(v.extraQuestions, studyLimits.optionalText.max))
      e.extraQuestions = `Keep this under ${studyLimits.optionalText.max} characters.`;
  }

  if (step === 3) {
    const name = v.name.trim();
    const email = v.email.trim();
    if (name.length < 2) e.name = 'Please enter your name.';
    else if (tooLong(name, studyLimits.short.max)) e.name = `Keep this under ${studyLimits.short.max} characters.`;
    if (v.company.trim().length < 2) e.company = 'Please enter your company or organization.';
    else if (tooLong(v.company, studyLimits.short.max)) e.company = `Keep this under ${studyLimits.short.max} characters.`;
    if (!email) e.email = 'Please enter your email so we can send the report.';
    else if (email.length > studyLimits.email.max || !emailPattern.test(email)) e.email = 'Please enter a valid email address.';
    if (tooLong(v.role, studyLimits.short.max)) e.role = `Keep this under ${studyLimits.short.max} characters.`;
    if (v.consent !== true) e.consent = 'We need your permission to process the request and email the report.';
  }

  return e;
}

/** Full validation across all screens (used server-side). */
export function validateStudy(v: StudyInput): StudyErrors {
  return { ...validateStep(0, v), ...validateStep(1, v), ...validateStep(2, v), ...validateStep(3, v) };
}

/** Coerces an untrusted JSON body into a StudyInput with lengths capped. */
export function coerceStudy(body: unknown): StudyInput {
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const s = (k: string, max: number) => String(b[k] ?? '').slice(0, max + 1);
  const rawConcepts = Array.isArray(b.concepts) ? b.concepts.slice(0, studyLimits.maxConcepts + 1) : [];
  const concepts: StudyConcept[] = rawConcepts.map((c) => {
    const o = (c && typeof c === 'object' ? c : {}) as Record<string, unknown>;
    return {
      name: String(o.name ?? '').slice(0, studyLimits.short.max + 1),
      description: String(o.description ?? '').slice(0, studyLimits.concept.max + 1),
      url: String(o.url ?? '').slice(0, studyLimits.url.max + 1),
    };
  });
  return {
    decisionType: s('decisionType', 40),
    otherDetail: s('otherDetail', studyLimits.short.max),
    question: s('question', studyLimits.text.max),
    context: s('context', studyLimits.optionalText.max),
    decideBy: s('decideBy', studyLimits.short.max),
    stakes: s('stakes', studyLimits.short.max * 2),
    audience: s('audience', studyLimits.text.max),
    geography: s('geography', studyLimits.short.max),
    buyerType: s('buyerType', 40),
    concepts: concepts.length ? concepts : [emptyConcept()],
    extraQuestions: s('extraQuestions', studyLimits.optionalText.max),
    name: s('name', studyLimits.short.max),
    company: s('company', studyLimits.short.max),
    email: s('email', studyLimits.email.max),
    role: s('role', studyLimits.short.max),
    consent: b.consent === true,
    marketingOptIn: b.marketingOptIn === true,
    source: s('source', 300),
  };
}

/* ---------- Lead gate: company domain and free-mail detection ---------- */

/** Common consumer mailbox domains. A match does not reject the request; it routes it to review. */
export const freeMailDomains = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.uk', 'ymail.com', 'hotmail.com', 'hotmail.co.uk', 'outlook.com', 'live.com',
  'msn.com', 'aol.com', 'icloud.com', 'me.com', 'mac.com', 'protonmail.com', 'proton.me', 'pm.me', 'gmx.com', 'gmx.de', 'mail.com',
  'zoho.com', 'yandex.com', 'yandex.ru', 'fastmail.com', 'hey.com', 'duck.com', 'tutanota.com', 'mail.ru', 'qq.com', '163.com',
]);

export function emailDomain(email: string): string {
  const at = email.trim().toLowerCase().lastIndexOf('@');
  return at >= 0 ? email.trim().toLowerCase().slice(at + 1) : '';
}

export function isFreeMail(email: string): boolean {
  return freeMailDomains.has(emailDomain(email));
}

/**
 * Request priority for the Savant inbox. 'standard' = company domain;
 * 'review' = consumer mailbox — accepted, but a human decides before work starts.
 */
export function studyPriority(email: string): 'standard' | 'review' {
  return isFreeMail(email) ? 'review' : 'standard';
}

/** Request reference shown to the visitor and used in the Savant notification. e.g. TYI-2026-A7K3QD */
export function makeReference(now = new Date(), rand = Math.random): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let tail = '';
  for (let i = 0; i < 6; i++) tail += alphabet[Math.floor(rand() * alphabet.length)];
  return `TYI-${now.getUTCFullYear()}-${tail}`;
}
