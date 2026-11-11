import { Link } from 'react-router-dom';
import StudyWizard from '@/components/StudyWizard';
import { PageHead } from '@/components/Sections';
import { intakeCopy, studyScope, turnaroundLine } from '@/content/testYourIdea';
import { pageMeta } from '@/content/meta';
import { useHead } from '@/lib/head';

export default function StartStudy() {
  useHead(pageMeta.startStudy);

  return (
    <>
      <PageHead
        eyebrow="Complimentary research preview"
        title="Start your free study"
        lede={intakeCopy.lede}
        crumbs={[{ label: 'Market Research', href: '/market-research' }, { label: 'Start' }]}
      />
      <section className="section">
        <div className="container wizard-grid">
          <div>
            <StudyWizard />
          </div>
          <aside aria-label="Good to know">
            <div className="aside-box">
              <h2>What happens next</h2>
              <ul className="checklist">
                <li>We review the brief for completeness, fit, and scope.</li>
                <li>{turnaroundLine()} If something is unclear, we ask first.</li>
                <li>You receive a reviewed research report. A follow-up conversation is optional.</li>
              </ul>
            </div>
            <div className="aside-box">
              <h2>First-study scope</h2>
              <ul className="checklist">
                <li>One complimentary request per person, {studyScope.studiesPerCompany} per company — company email, or your company website</li>
                <li>{studyScope.markets} market, up to {studyScope.maxConcepts} concepts</li>
                <li>{studyScope.questions} questions, up to {studyScope.maxRespondents} simulated respondents</li>
              </ul>
            </div>
            <div className="aside-box">
              <h2>Please note</h2>
              <p className="small">{intakeCopy.disclosure}</p>
              <p className="small">
                Describe concepts at the level you would share with a prospective customer — no confidential, personal, or regulated
                information. {intakeCopy.dataHandling}{' '}
                <Link to="/privacy">Privacy notice</Link>.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
