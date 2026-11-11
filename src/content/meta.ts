import type { PageMeta } from './types';
import { services, servicePath } from './services';

export const pageMeta: Record<string, PageMeta> = {
  home: {
    path: '/',
    title: 'Savant Analytics — Enterprise AI consulting',
    description:
      '94% of mid-market firms use AI; 2% run it at scale. Savant Analytics closes the gap: legacy migration, digital twins and evaluation, deployment, and governance.',
  },
  services: {
    path: '/services',
    title: 'Services — Savant Analytics',
    description:
      'Five connected service areas: AI strategy, AI-assisted legacy modernization, digital twins and AI evaluation, AI deployment and integration, and AI governance.',
  },
  approach: {
    path: '/approach',
    title: 'Approach — Savant Analytics',
    description:
      'How Savant Analytics engagements work: Frame, Examine, Build and test, Operationalize. Flexible stages, honest scoping, no fixed packages.',
  },
  about: {
    path: '/about',
    title: 'About — Savant Analytics',
    description:
      'A consulting team with large-consultancy, federal, and Fortune 500 experience in data and AI modernization, evaluation, and governance.',
  },
  contact: {
    path: '/contact',
    title: 'Contact — Savant Analytics',
    description:
      'Describe your business problem, constraints, and desired next step. Savant Analytics will respond with a view on fit and a suggested first conversation.',
  },
  testYourIdea: {
    path: '/market-research',
    title: 'Digital-Twin Market Research — run it here, free — Savant Analytics',
    description:
      'Comparing a product idea, price, or message? Savant explores how a simulated audience might respond and sends a reviewed free report with what to test next.',
  },
  startStudy: {
    path: '/market-research/start',
    title: 'Start your free study — Savant Analytics',
    description: 'Four short screens: your decision, your audience, what to compare, and where to send the results.',
  },
  decisionStudy: {
    path: '/decision-study',
    title: 'Scope your Decision Study — Savant Analytics',
    description: 'Scoping questionnaire for a fixed-scope Decision Study: the decision, the options, the audiences, the evidence, and the questions the memo must answer.',
    unlisted: true,
  },
  privacy: {
    path: '/privacy',
    title: 'Privacy — Savant Analytics',
    description: 'What the Savant Analytics website collects, why, and how to contact us about it.',
  },
  notFound: {
    path: '/404',
    title: 'Page not found — Savant Analytics',
    description: 'The page you requested does not exist.',
  },
};

for (const s of services) {
  pageMeta[`service:${s.id}`] = {
    path: servicePath(s.id),
    title: `${s.title} — Savant Analytics`,
    description: s.metaDescription,
  };
}

/** Routes to prerender (everything except the 404 page), including unlisted ones. */
export const publicRoutes: string[] = Object.values(pageMeta)
  .map((m) => m.path)
  .filter((p) => p !== '/404');

/** Routes listed in the sitemap: public and not unlisted. */
export const sitemapRoutes: string[] = Object.values(pageMeta)
  .filter((m) => m.path !== '/404' && !m.unlisted)
  .map((m) => m.path);
