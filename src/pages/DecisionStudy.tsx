import DecisionStudyWizard from '@/components/DecisionStudyWizard';
import { decisionStudyMeta, packages, terms, whatYouGet } from '@/content/decisionStudy';
import { pageMeta } from '@/content/meta';
import { site } from '@/content/site';
import { useHead } from '@/lib/head';

/**
 * STANDALONE page for the paid Decision Study. Renders outside the site Layout:
 * no site header, nav, or footer; no links to the rest of the site or to the free
 * report. Not in the sitemap; noindex. Shared one-to-one by URL.
 */
export default function DecisionStudy() {
  useHead(pageMeta.decisionStudy);
  return (
    <div className="ds">
      <header className="ds__header">
        <div className="container ds__header-inner">
          <span className="wordmark" aria-label={site.name}>
            <img className="wordmark__mark" src="/logo-mark.svg" alt="" width="28" height="28" aria-hidden="true" />
            <span className="wordmark__text">
              <span className="wordmark__a">Savant</span> <span className="wordmark__b">Analytics</span>
            </span>
          </span>
          <span className="ds__tag">{decisionStudyMeta.eyebrow}</span>
        </div>
      </header>

      <main id="main">
        <section className="ds__hero">
          <div className="container">
            <p className="eyebrow">{decisionStudyMeta.eyebrow}</p>
            <h1 className="ds__title">{decisionStudyMeta.title}</h1>
            <p className="lede">{decisionStudyMeta.lede}</p>
            <p>
              <a href="#scope" className="btn btn--primary">
                Scope the study
              </a>
            </p>
          </div>
        </section>

        <section className="section section--pale" aria-labelledby="ds-what">
          <div className="container stack-lg">
            <div className="section-head">
              <p className="eyebrow">What you get</p>
              <h2 id="ds-what">What {packages[0].price} buys</h2>
            </div>
            <ol className="contents">
              {whatYouGet.map((c, i) => (
                <li key={c.title}>
                  <span className="contents__num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div>
                    <strong>{c.title}</strong>
                    <p className="muted small">{c.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="ds__packages">
              {packages.map((p) => (
                <div key={p.id} className="aside-box">
                  <h3>
                    {p.name} — {p.price}
                  </h3>
                  <p className="small muted">{p.intro}</p>
                  <p className="small">{p.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="scope" aria-labelledby="ds-scope">
          <div className="container wizard-grid">
            <div>
              <div className="section-head">
                <p className="eyebrow">Questionnaire</p>
                <h2 id="ds-scope">{decisionStudyMeta.formTitle}</h2>
                <p className="lede">{decisionStudyMeta.formLede}</p>
              </div>
              <DecisionStudyWizard />
            </div>
            <aside aria-label="How the engagement works">
              <div className="aside-box">
                <h2>How it works</h2>
                <ul className="checklist small">
                  <li>You complete this questionnaire; it is the scope.</li>
                  <li>We review within two business days and confirm scope, or ask first.</li>
                  <li>You receive an engagement letter and invoice. Kickoff is scheduled when payment clears.</li>
                  <li>Memo and readout within five business days of kickoff (ten with Human Calibration).</li>
                </ul>
              </div>
              <div className="aside-box">
                <h2>Terms in brief</h2>
                <ul className="checklist small">
                  {terms.slice(0, 4).map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <p className="small muted">The full terms are on the last step and in the engagement letter.</p>
              </div>
              <div className="aside-box">
                <h2>Please note</h2>
                <p className="small">
                  AI-simulated respondents; decision support, not a forecast. Describe options at the level you would share with a prospective
                  customer — no personal data or regulated information.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <footer className="ds__footer">
        <div className="container">
          <p className="small muted">
            © {new Date().getFullYear()} {site.name}. Shared by invitation; please do not forward this link outside your organisation.
          </p>
        </div>
      </footer>
    </div>
  );
}
