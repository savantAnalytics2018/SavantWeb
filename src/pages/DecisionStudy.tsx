import DecisionStudyWizard from '@/components/DecisionStudyWizard';
import { pageMeta } from '@/content/meta';
import { site } from '@/content/site';
import { useHead } from '@/lib/head';

/**
 * STANDALONE intake form for the paid Decision Study. Nothing but the questionnaire:
 * no site header, nav, footer, hero, or explanation — the client already knows the
 * offer. Not in the sitemap; noindex. Shared one-to-one by URL.
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
          <span className="ds__tag">Decision Study — scoping questionnaire</span>
        </div>
      </header>
      <main id="main" className="section">
        <div className="container ds__form">
          <h1 className="visually-hidden">Decision Study scoping questionnaire</h1>
          <DecisionStudyWizard />
        </div>
      </main>
      <footer className="ds__footer">
        <div className="container">
          <p className="small muted">© {new Date().getFullYear()} {site.name}. Shared by invitation.</p>
        </div>
      </footer>
    </div>
  );
}
