import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SampleReport from '@/components/SampleReport';
import { Faq } from '@/components/Sections';
import { analystLine, deliverableHeading, deliverableLede, howItWorks, snapshotContents, studyScope, tyiFaq, tyiHero, useCases, useCaseStories, whoWeAre } from '@/content/testYourIdea';
import { pageMeta } from '@/content/meta';
import { useHead } from '@/lib/head';
import { track } from '@/lib/analytics';

export default function TestYourIdea() {
  useHead(pageMeta.testYourIdea);
  useEffect(() => track('tyi_landing_view'), []);

  return (
    <>
      {/* Hero — problem first, backed by data */}
      <section className="tyi-hero" aria-labelledby="tyi-heading">
        <div className="container tyi-hero__inner">
          <p className="eyebrow">{tyiHero.eyebrow}</p>
          <p className="tyi-stat">
            {tyiHero.stat}
            <span className="tyi-stat__source">{tyiHero.statSource}</span>
          </p>
          <p className="tyi-problem">{tyiHero.problem}</p>
          <h1 id="tyi-heading" className="tyi-headline">
            {tyiHero.headline}
          </h1>
          <div className="hero__actions">
            <Link to={tyiHero.primaryCta.href} className="btn btn--primary" onClick={() => track('tyi_cta_click', { location: 'hero' })}>
              {tyiHero.primaryCta.label}
            </Link>
            <a href={tyiHero.secondaryCta.href} className="btn btn--secondary">
              {tyiHero.secondaryCta.label}
            </a>
          </div>
          <ul className="tyi-trust" aria-label="What to expect">
            {tyiHero.trust.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p className="tyi-disclosure small">{tyiHero.disclosure}</p>
        </div>
      </section>

      {/* Use-case tiles */}
      <section className="section section--surface" aria-labelledby="tyi-usecases">
        <div className="container">
          <h2 id="tyi-usecases" className="visually-hidden">
            What you can test
          </h2>
          <div className="tiles tiles--4">
            {useCases.map((u) => (
              <Link key={u.id} to="/market-research/start" className="tile" onClick={() => track('tyi_cta_click', { location: `tile-${u.id}` })}>
                <span className="tile__icon" data-icon={u.id} aria-hidden="true" />
                <span className="tile__title">{u.title}</span>
                <span className="tile__q">{u.question}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section" aria-labelledby="tyi-how">
        <div className="container stack-lg">
          <div className="section-head">
            <p className="eyebrow">How it works</p>
            <h2 id="tyi-how">Four steps from question to snapshot</h2>
          </div>
          <ol className="stages">
            {howItWorks.map((s, i) => (
              <li key={s.id} className="stage">
                <span className="stage__num" aria-hidden="true">
                  0{i + 1}
                </span>
                <h3>{s.name}</h3>
                <p>{s.summary}</p>
              </li>
            ))}
          </ol>
          <p className="muted">
            {whoWeAre.line}{' '}
            <Link to={whoWeAre.link.href} className="link-arrow">
              {whoWeAre.link.label}
            </Link>
          </p>
        </div>
      </section>

      {/* How teams use it */}
      <section className="section section--surface" aria-labelledby="tyi-stories">
        <div className="container stack-lg">
          <div className="section-head">
            <p className="eyebrow">How teams use it · illustrative scenarios</p>
            <h2 id="tyi-stories">One decision, one question, one snapshot</h2>
          </div>
          <ul className="stories">
            {useCaseStories.map((st) => (
              <li key={st.id} className="story">
                <p className="story__who">{st.who}</p>
                <p className="story__situation">{st.situation}</p>
                <dl>
                  <div>
                    <dt>Asked</dt>
                    <dd>{st.asked}</dd>
                  </div>
                  <div>
                    <dt>Snapshot showed</dt>
                    <dd>{st.showed}</dd>
                  </div>
                  <div className="story__next">
                    <dt>Next, with real people</dt>
                    <dd>{st.next}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* What you receive */}
      <section className="section section--pale" aria-labelledby="tyi-deliverable">
        <div className="container stack-lg">
          <div className="section-head">
            <p className="eyebrow">What you receive</p>
            <h2 id="tyi-deliverable">{deliverableHeading}</h2>
            <p className="lede">{deliverableLede}</p>
          </div>
          <ul className="chips" aria-label="What's included in the first study">
            {studyScope.chips.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <ol className="contents">
            {snapshotContents.map((c, i) => (
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
          <p className="small muted">{analystLine}</p>
        </div>
      </section>

      {/* Sample report */}
      <section className="section" id="sample-report" aria-labelledby="tyi-sample">
        <div className="container stack-lg">
          <div className="section-head">
            <p className="eyebrow">Sample report</p>
            <h2 id="tyi-sample">What a snapshot looks like</h2>
            <p className="lede">An invented B2B pricing case. The format is real; the data is not.</p>
          </div>
          <SampleReport />
        </div>
      </section>

      {/* FAQ */}
      <section className="section section--surface" aria-labelledby="tyi-faq">
        <div className="container stack-lg">
          <div className="section-head">
            <p className="eyebrow">Questions</p>
            <h2 id="tyi-faq">Before you start</h2>
          </div>
          <Faq items={tyiFaq} />
        </div>
      </section>

      {/* Final CTA */}
      <section className="section section--dark" aria-labelledby="tyi-final">
        <div className="container stack">
          <h2 id="tyi-final">Bring the question. We’ll run the study.</h2>
          <p className="muted" style={{ fontSize: '1.125rem', maxWidth: 'var(--measure)' }}>
            About 10 minutes to describe your decision and audience. No account, no sales call.
          </p>
          <p>
            <Link to={tyiHero.primaryCta.href} className="btn btn--primary on-dark" onClick={() => track('tyi_cta_click', { location: 'final' })}>
              {tyiHero.primaryCta.label}
            </Link>
          </p>
          <p className="small" style={{ color: 'var(--color-on-dark-muted)', maxWidth: 'var(--measure)' }}>
            AI-simulated respondents. Please don’t include confidential information.{' '}
            <Link to="/privacy" className="on-dark" style={{ color: 'var(--color-on-dark)' }}>
              Privacy notice
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
