import { Link } from 'react-router-dom';
import DecisionStudyWizard from '@/components/DecisionStudyWizard';
import { PageHead } from '@/components/Sections';
import { decisionStudyMeta, packages } from '@/content/decisionStudy';
import { pageMeta } from '@/content/meta';
import { useHead } from '@/lib/head';

/**
 * UNLISTED. Not linked from the nav, footer, or any page; noindex; absent from the sitemap.
 * Shared one-to-one with a client who has asked for more after their free report.
 */
export default function DecisionStudy() {
  useHead(pageMeta.decisionStudy);
  return (
    <>
      <PageHead eyebrow={decisionStudyMeta.eyebrow} title={decisionStudyMeta.title} lede={decisionStudyMeta.lede} />
      <section className="section">
        <div className="container wizard-grid">
          <div>
            <DecisionStudyWizard />
          </div>
          <aside aria-label="About the Decision Study">
            <div className="aside-box">
              <h2>What this is</h2>
              <p className="small">
                A fixed-scope, paid study of one decision. The questionnaire is the scoping document: what you answer here is what the study
                covers. Anything added later is a change order.
              </p>
            </div>
            <div className="aside-box">
              <h2>Packages</h2>
              <ul className="checklist small">
                {packages.map((p) => (
                  <li key={p.id}>
                    <strong>{p.name}</strong> — {p.price}
                    <br />
                    <span className="muted">{p.intro}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="aside-box">
              <h2>What happens next</h2>
              <ul className="checklist small">
                <li>We review within two business days and confirm scope, or ask first.</li>
                <li>You receive an engagement letter and invoice; kickoff is scheduled when payment clears.</li>
                <li>Memo and readout within 5 business days of kickoff (10 with Human Calibration).</li>
              </ul>
            </div>
            <div className="aside-box">
              <h2>Please note</h2>
              <p className="small">
                AI-simulated respondents; decision support, not a forecast. Describe options at the level you would share with a prospective
                customer — no personal data or regulated information. <Link to="/privacy">Privacy notice</Link>.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
