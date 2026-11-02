import { describe, expect, it } from 'vitest';
import { validateContent } from '@/content/validate';
import { services } from '@/content/services';
import { pageMeta, publicRoutes } from '@/content/meta';
import { site } from '@/content/site';

describe('content model', () => {
  it('passes validation', () => {
    expect(validateContent()).toEqual([]);
  });

  it('has five services with unique routes and metadata', () => {
    expect(services).toHaveLength(5);
    const ids = new Set(services.map((s) => s.id));
    expect(ids.size).toBe(5);
    for (const s of services) expect(pageMeta[`service:${s.id}`].path).toBe(`/services/${s.id}`);
  });

  it('lists every public route exactly once and excludes 404', () => {
    expect(new Set(publicRoutes).size).toBe(publicRoutes.length);
    expect(publicRoutes).not.toContain('/404');
    expect(publicRoutes).toContain('/');
    expect(publicRoutes).toContain('/contact');
  });

  it('contains no unverified proof claims in service copy', () => {
    // Guardrails are deliberately phrased as negations ("we do not promise…"), so scan everything else.
    const text = JSON.stringify(services.map(({ guardrails: _g, ...rest }) => rest)).toLowerCase();
    for (const banned of ['trusted by', 'guaranteed', 'revolutionary', 'seamless', 'limitless', '% savings', 'roi of']) {
      expect(text, `found banned phrase: ${banned}`).not.toContain(banned);
    }
  });

  it('keeps unverified contact destinations off the site by default', () => {
    expect(site.publicEmail).toBeNull();
    expect(site.schedulingUrl).toBeNull();
  });

  it('lists the owner-supplied SBA certifications with image files present', () => {
    expect(site.certifications.map((c) => c.id)).toEqual(['edwosb', 'wosb']);
  });
});
