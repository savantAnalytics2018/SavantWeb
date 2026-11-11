/**
 * twindetail.<domain> — a private "menu" site for people who have already expressed interest.
 *
 *  - "/"               the three tiers side by side
 *  - "/start/<tier>"   the intake for that tier (same lead gate on every tier)
 *
 * It is UNLISTED: not linked from the main site or the twinresearch funnel, not in the
 * sitemap, and marked noindex. The Worker rewrites the short paths on this host to the
 * hidden main-site paths below so one deploy serves it.
 *
 * Tier prices come from decisionStudy.ts (single source of truth); only the free tier is
 * described here.
 */
import { packages } from '@/content/decisionStudy';
import { studyScope } from '@/content/testYourIdea';

export const DETAIL_HOST_PREFIX = 'twindetail.';
export const detailBasePath = '/twin-detail';

export type TierId = 'snapshot' | 'decision-study' | 'calibration';

export interface Tier {
  id: TierId;
  name: string;
  price: string;
  priceNote: string;
  summary: string;
  includes: readonly string[];
  bestFor: string;
  cta: string;
  /** Package id in decisionStudy.ts for paid tiers; undefined for the free snapshot. */
  packageId?: (typeof packages)[number]['id'];
}

const ds = packages.find((p) => p.id === 'decision-study')!;
const hc = packages.find((p) => p.id === 'human-calibration')!;

export const tiers: readonly Tier[] = [
  {
    id: 'snapshot',
    name: 'Research Snapshot',
    price: 'Complimentary',
    priceNote: `One per person, ${studyScope.studiesPerCompany} per company`,
    summary: 'A reviewed read on one decision from a simulated audience: what each segment leans toward, the objections that come up, and what to test with real people next.',
    includes: [
      `Up to ${studyScope.maxConcepts} concepts, ${studyScope.markets} market`,
      `${studyScope.questions} questions, up to ${studyScope.maxRespondents} simulated respondents`,
      'Named reviewer; unstable results flagged',
      'Delivered by email — no sales call required',
    ],
    bestFor: 'Deciding whether a question deserves a closer test.',
    cta: 'Request a snapshot',
  },
  {
    id: 'decision-study',
    name: ds.name,
    price: ds.price,
    priceNote: ds.intro,
    summary: ds.summary,
    includes: ds.includes,
    bestFor: 'One decision with real money behind it, needed inside two weeks.',
    cta: 'Scope a Decision Study',
    packageId: ds.id,
  },
  {
    id: 'calibration',
    name: hc.name,
    price: hc.price,
    priceNote: hc.intro,
    summary: hc.summary,
    includes: hc.includes,
    bestFor: 'When the memo will be challenged and you need to show where real people agreed.',
    cta: 'Scope with calibration',
    packageId: hc.id,
  },
];

export function tierById(id: string | undefined): Tier | undefined {
  return tiers.find((t) => t.id === id);
}

export const detailCopy = {
  eyebrow: 'Digital-Twin Research',
  title: 'Three ways to get an answer.',
  lede: 'Pick the tier that matches the decision. Every tier asks for a company email (or your company website if you use a personal address), and every report is reviewed by a named analyst before it goes out.',
  compareNote: 'Not sure which? Start with the snapshot. If the answer needs more weight, the paid tiers pick up where it leaves off, and we agree scope and fee before any paid work starts.',
  tag: 'Shared by invitation',
  back: 'All tiers',
};
