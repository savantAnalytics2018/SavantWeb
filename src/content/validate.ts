import { services } from './services';
import { buyerSituations, approachStages, faq } from './approach';
import { navigation, footer, hero, site } from './site';
import { pageMeta } from './meta';

/**
 * Lightweight content validation run by the test suite and the prerender
 * script. Fails loudly if required fields are missing or ids collide, so a
 * content edit cannot silently break the site.
 */
export function validateContent(): string[] {
  const errors: string[] = [];
  const nonEmpty = (v: unknown, label: string) => {
    if (typeof v !== 'string' || v.trim().length === 0) errors.push(`${label} is empty`);
  };

  const ids = new Set<string>();
  for (const s of services) {
    if (ids.has(s.id)) errors.push(`duplicate service id ${s.id}`);
    ids.add(s.id);
    nonEmpty(s.title, `service ${s.id} title`);
    nonEmpty(s.problem, `service ${s.id} problem`);
    nonEmpty(s.work, `service ${s.id} work`);
    nonEmpty(s.cardAction, `service ${s.id} cardAction`);
    nonEmpty(s.metaDescription, `service ${s.id} metaDescription`);
    if (s.deliverables.length === 0) errors.push(`service ${s.id} has no deliverables`);
    if (s.detail.length === 0) errors.push(`service ${s.id} has no detail paragraphs`);
    if (!/hypothetical|illustrative/i.test(`${s.example.title} ${s.example.situation}`)) {
      errors.push(`service ${s.id} example must state it is hypothetical/illustrative`);
    }
  }
  const roles = services.map((s) => s.role);
  if (roles.filter((r) => r === 'lead').length !== 1) errors.push('exactly one lead service required');
  if (roles.filter((r) => r === 'pathway').length !== 2) errors.push('exactly two pathway services required');

  for (const b of buyerSituations) {
    nonEmpty(b.heading, `situation ${b.id} heading`);
    for (const sid of b.services) if (!ids.has(sid)) errors.push(`situation ${b.id} references unknown service ${sid}`);
  }
  if (approachStages.length !== 4) errors.push('approach must have four stages');
  for (const f of faq) {
    nonEmpty(f.question, `faq ${f.id} question`);
    nonEmpty(f.answer, `faq ${f.id} answer`);
  }
  for (const n of [...navigation, ...footer.links]) {
    if (!n.href.startsWith('/')) errors.push(`nav ${n.id} href must be a site path`);
  }
  nonEmpty(hero.headline, 'hero headline');
  nonEmpty(site.name, 'site name');
  for (const [k, m] of Object.entries(pageMeta)) {
    nonEmpty(m.title, `meta ${k} title`);
    nonEmpty(m.description, `meta ${k} description`);
    if (m.description.length > 170) errors.push(`meta ${k} description exceeds 170 chars`);
    if (!m.path.startsWith('/')) errors.push(`meta ${k} path must start with /`);
  }
  return errors;
}
