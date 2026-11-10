import { describe, expect, it } from 'vitest';
import { emailDomain, emptyStudy, isFreeMail, studyPriority, coerceStudy } from '@/lib/studyConfig';
import { formatTriage } from '../../api/study';

describe('lead gate', () => {
  it('extracts the domain case-insensitively', () => {
    expect(emailDomain(' Jane@Acme.COM ')).toBe('acme.com');
    expect(emailDomain('nope')).toBe('');
  });
  it('routes consumer mailboxes to review and company domains to standard', () => {
    expect(isFreeMail('a@gmail.com')).toBe(true);
    expect(studyPriority('a@gmail.com')).toBe('review');
    expect(studyPriority('a@savantanalytics.net')).toBe('standard');
  });
  it('coerces the new scoping and source fields', () => {
    const v = coerceStudy({ decideBy: 'Q1', stakes: 'lose the pilot', source: 'source=linkedin ref=linkedin.com' });
    expect(v.decideBy).toBe('Q1');
    expect(v.stakes).toBe('lose the pilot');
    expect(v.source).toBe('source=linkedin ref=linkedin.com');
  });
  it('writes an internal triage block with priority, domain and source', () => {
    const v = { ...emptyStudy(), email: 'x@yahoo.com', source: 'direct', decideBy: 'March' };
    const t = formatTriage(v);
    expect(t).toContain('REVIEW');
    expect(t).toContain('yahoo.com');
    expect(t).toContain('Source: direct');
    expect(t).toContain('possibly');
  });
});
