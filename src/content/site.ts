import type { Cta, NavItem } from './types';

/** Business facts. Only owner-supplied or approved items belong here. */
export const site = {
  name: 'Savant Analytics',
  tagline: 'Enterprise AI consulting',
  /** Production origin; VITE_SITE_ORIGIN overrides at build time. */
  productionOrigin: 'https://savantanalytics.net',
  /** Null until the inbox is confirmed and receipt tested (D-01). Nothing renders while null. */
  publicEmail: null as string | null,
  /** Null until ownership and booking flow are verified (D-02). */
  schedulingUrl: null as string | null,
  /** External profile links. Empty until approved (D-04). */
  externalLinks: [] as { label: string; href: string }[],
  /**
   * Certifications shown in About and the footer. Add an entry once the
   * official SBA icon file is in /public and the program is confirmed (D-11):
   * { id: 'sba', label: 'SBA 8(a) certified', image: '/sba-8a.png', alt: 'SBA 8(a) certified business' }
   * Use the SBA-approved icon only (sba.gov/brand/for-partners/sba-certified-businesses).
   */
  certifications: [
    { id: 'edwosb', label: 'SBA EDWOSB certified', image: '/sba-edwosb-certified.png', alt: 'U.S. Small Business Administration — EDWOSB Certified' },
    { id: 'wosb', label: 'SBA WOSB certified', image: '/sba-wosb-certified.png', alt: 'U.S. Small Business Administration — WOSB Certified' },
  ] as { id: string; label: string; image: string; alt: string }[],
} as const;

export const navigation: NavItem[] = [
  { id: 'services', label: 'Services', href: '/services' },
  { id: 'approach', label: 'Approach', href: '/approach' },
  { id: 'about', label: 'About', href: '/about' },
];

export const headerCta: Cta = { label: 'Contact', href: '/contact' };

export const hero = {
  eyebrow: 'Enterprise AI consulting',
  headline: 'Modernize critical systems. Put AI to work.',
  supporting: 'AI strategy, legacy modernization, evaluation, deployment, and governance for enterprise teams.',
  primaryCta: { label: 'Discuss your AI priorities', href: '/contact' } satisfies Cta,
  secondaryCta: { label: 'Explore services', href: '/services' } satisfies Cta,
  microcopy: 'Start with the problem, the constraints, and what success looks like.',
  /** One line under the orchestration animation. Real HTML text, not part of the SVG. */
  artCaption: 'AI agents orchestrated, monitored, and managed by your team.',
};

export const relevanceStrip = ['Modernize existing systems.', 'Test important decisions.', 'Build AI you can operate.'];

export const footer = {
  line: 'Enterprise AI strategy, modernization, evaluation, deployment, and governance.',
  links: [
    { id: 'services', label: 'Services', href: '/services' },
    { id: 'approach', label: 'Approach', href: '/approach' },
    { id: 'about', label: 'About', href: '/about' },
    { id: 'contact', label: 'Contact', href: '/contact' },
    { id: 'privacy', label: 'Privacy', href: '/privacy' },
  ] as NavItem[],
};

export const finalInvitation = {
  heading: 'Bring the problem. We will help you decide what to do about it.',
  body: 'Tell us the decision at stake, the systems involved, and what a good outcome looks like.',
  cta: { label: 'Discuss your AI priorities', href: '/contact' } satisfies Cta,
};
