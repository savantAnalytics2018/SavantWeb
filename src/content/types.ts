/**
 * Content schema. Everything a non-developer may want to change lives in
 * src/content/*.ts and conforms to these types. Presentation components
 * never hard-code marketing copy.
 */

export type ServiceId =
  | 'ai-strategy'
  | 'legacy-modernization'
  | 'digital-twins-evaluation'
  | 'ai-deployment'
  | 'ai-governance';

export type ServiceRole = 'lead' | 'pathway' | 'support';

export interface IllustrativeExample {
  /** Shown verbatim; must make clear this is hypothetical. */
  title: string;
  situation: string;
  possibleWork: string;
  outcome: string;
}

export interface Service {
  id: ServiceId;
  /** Where the service sits in the strategy-to-delivery hierarchy. */
  role: ServiceRole;
  /** Short name used in navigation, cards and the contact form select. */
  shortTitle: string;
  title: string;
  /** One-sentence problem statement. */
  problem: string;
  /** Short description of the work. */
  work: string;
  /** Longer detail-page paragraphs. */
  detail: string[];
  audience: string;
  deliverables: string[];
  /** Engagement considerations — honest scoping notes, not promises. */
  considerations: string[];
  /** Guardrail text shown to the buyer as "What we do not promise". */
  guardrails: string[];
  example: IllustrativeExample;
  cardAction: string;
  metaDescription: string;
}

export interface BuyerSituation {
  id: string;
  heading: string;
  question: string;
  firstDecision: string;
  services: ServiceId[];
}

export interface ApproachStage {
  id: string;
  name: string;
  summary: string;
  detail: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  /** Optional bullet list rendered after `answer`. */
  points?: string[];
  /** Optional closing paragraph rendered after `points`. */
  after?: string;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  /** Optional smaller second line under the label (header and mobile menu). */
  sub?: string;
}

export interface Cta {
  label: string;
  href: string;
}

export interface PageMeta {
  title: string;
  description: string;
  /** Path beginning with "/" — combined with the production origin for canonicals. */
  path: string;
  /** Prerendered but noindex and excluded from the sitemap; shared by link only. */
  unlisted?: boolean;
}
