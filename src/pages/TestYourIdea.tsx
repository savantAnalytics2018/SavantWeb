import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SampleReport from '@/components/SampleReport';
import { Faq } from '@/components/Sections';
import {
  analystLine,
  deliverableHeading,
  deliverableLede,
  howItWorks,
  ifYouNeedMore,
  reportOutputs,
  sampleCompact,
  studyScope,
  trackRecord,
  tyiFaq,
  tyiHero,
  useCases,
  whoWeAre,
} from '@/content/testYourIdea';
import { pageMeta } from '@/content/meta';
import { useHead } from '@/lib/head';
import { track } from '@/lib/analytics';
import { localPath } from '@/lib/host';

/**
 * Market Research landing page. Order (10 Nov review): hero → three outputs →
 * compact sample (full report behind an expander) → three-step process →
 * deeper work → FAQ → final CTA. The "How teams use it" scenarios were removed.
 */
export default function TestYourIdea() {
  useHead(pageMeta.testYourIdea);
  useEffect(() => track('tyi_landing_view'), []);

  return (
    <>
      {/* Hero — practical promise, simulation disclosure */}
      <section className="tyi-hero" aria-labelledby="tyi-heading">
        <div className="container">
          <p className="eyebrow">{tyiHero.eyebrow}</p>
          <div className="tyi-hero__inner">
            <h1 id="tyi-heading" className="tyi-headline">
              {tyiHero.headline}
            </h1>
            <p className="lede">{tyiHero.lede}</p>
            <div className="hero__actions">
              <Link to={localPath(tyiHero.primaryCta.href)} className="btn btn--primary" onClick={() => track('tyi_cta_click', { location: 'hero' })}>
                {tyiHero.primaryCta.label}
              </Link>
              <a href={tyiHero.secondaryCta.href} className="btn btn--secondary">
                {tyiHero.secondaryCta.label}
              </a>
            </div>
            <p className="tyi-trustline small">{tyiHero.trust.join(' · ')}</p>
            <p className="tyi-disclosure small">{tyiHero.disclosure}</p>
          </div>
        </div>
      </section>

      {/* What you can test */}
      <section className="section section--surface" aria-labelledby="tyi-usecases">
        <div className="container">
          <h2 id="tyi-usecases" className="visually-hidden">
            What you can test
          </h2>
          <div className="tiles tiles--4">
            {useCases.map((u) => (
              <Link key={u.id} to={localPath('/market-research/start')} className="tile" onClick={() => track('tyi_cta_click', { location: `tile-${u.id}` })}>
                <span className="tile__icon" data-icon={u.id} aria-hidden="true" />
                <span className="tile__title">{u.title}</span>
                <span className="tile__q">{u.question}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* What you receive — three outputs */}
      <section className="section section--pale" aria-labelledby="tyi-deliverable">
        <div className="container stack-lg">
          <div className="section-head">
            <p className="eyebrow">What you receive</p>
            <h2 id="tyi-deliverable">{deliverableHeading}</h2>
            <p className="lede">{deliverableLede}</p>
          </div>
          <ol className="contents">
            {reportOutputs.map((c, i) => (
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
          <ul className="chips" aria-label="First-study scope">
            {studyScope.chips.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <p className="small muted">{analystLine}</p>
        </div>
      </section>

      {/* Sample — compact, full report behind an expander */}
      <section className="section" id="sample-report" aria-labelledby="tyi-sample">
        <div className="container stack-lg">
          <div className="section-head">
            <p className="eyebrow">Sample report</p>
            <h2 id="tyi-sample">What a report looks like</h2>
            <p className="lede">An invented B2B pricing case. The format is real; the data is not.</p>
          </div>
          <dl className="sample-compact">
            <div>
              <dt>One finding</dt>
              <dd>{sampleCompact.finding}</dd>
            </div>
            <div>
              <dt>One caveat</dt>
              <dd>{sampleCompact.caveat}</dd>
            </div>
            <div className="sample-compact__next">
              <dt>One test with real buyers</dt>
              <dd>{sampleCompact.nextTest}</dd>
            </div>
          </dl>
          <details className="sample-full">
            <summary>Open the full sample report</summary>
            <SampleReport />
          </details>
        </div>
      </section>

      {/* How it works — three steps */}
      <section className="section section--surface" aria-labelledby="tyi-how">
        <div className="container stack-lg">
          <div className="section-head">
            <p className="eyebrow">How it works</p>
            <h2 id="tyi-how">Three steps from brief to report</h2>
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
          <div className="tyi-record" role="note" aria-labelledby="tyi-record-h">
            <h3 id="tyi-record-h">{trackRecord.heading}</h3>
            <p>{trackRecord.agreement ? trackRecord.published(trackRecord.agreement) : trackRecord.measuring}</p>
          </div>
          <p className="muted">
            {whoWeAre.line}{' '}
            <Link to={whoWeAre.link.href} className="link-arrow">
              {whoWeAre.link.label}
            </Link>
          </p>
        </div>
      </section>

      {/* Deeper work, no prices */}
      <section className="section" aria-labelledby="tyi-more-h">
        <div className="container">
          <div className="tyi-more">
            <h2 id="tyi-more-h">{ifYouNeedMore.heading}</h2>
            <p className="muted">{ifYouNeedMore.line}</p>
          </div>
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
          <h2 id="tyi-final">Bring the question. We’ll run the first pass.</h2>
          <p className="muted" style={{ fontSize: '1.125rem', maxWidth: 'var(--measure)' }}>
            About 10 minutes to describe your decision and audience. No account, no sales call.
          </p>
          <p>
            <Link to={localPath(tyiHero.primaryCta.href)} className="btn btn--primary on-dark" onClick={() => track('tyi_cta_click', { location: 'final' })}>
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
