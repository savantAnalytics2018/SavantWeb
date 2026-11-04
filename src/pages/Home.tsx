import { Link } from 'react-router-dom';
import HeroArt from '@/components/HeroArt';
import { Faq } from '@/components/Sections';
import { evidence, finalCta, homeHero, howItStarts, painPoints, specialties, whatWeDo, whyUs } from '@/content/home';
import { serviceById, servicePath } from '@/content/services';
import { faq } from '@/content/approach';
import { pageMeta } from '@/content/meta';
import { useHead } from '@/lib/head';
import { track } from '@/lib/analytics';

export default function Home() {
  useHead(pageMeta.home);

  return (
    <>
      {/* Hero */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="container hero__grid">
          <div className="hero__copy">
            <p className="eyebrow">{homeHero.eyebrow}</p>
            <h1 id="hero-heading">
              {homeHero.headline.split('\n').map((l, i, arr) => {
                const m = l.match(/^(.*?)<em>(.*?)<\/em>(.*)$/);
                return (
                  <span key={l}>
                    {m ? (
                      <>
                        {m[1]}
                        <em className="hero__em">{m[2]}</em>
                        {m[3]}
                      </>
                    ) : (
                      l
                    )}
                    {i < arr.length - 1 && <br />}
                  </span>
                );
              })}
            </h1>
            <p className="lede">
              {homeHero.lines.map((l, i) => (
                <span key={l} className="line">
                  {l}
                  {i < homeHero.lines.length - 1 && <br />}
                </span>
              ))}
            </p>
            <div className="hero__actions">
              <Link to={homeHero.primaryCta.href} className="btn btn--primary" onClick={() => track('contact_cta_click', { location: 'hero' })}>
                {homeHero.primaryCta.label}
              </Link>
              <Link to={homeHero.secondaryCta.href} className="btn btn--secondary">
                {homeHero.secondaryCta.label}
              </Link>
            </div>
            <p className="hero__micro">
              {homeHero.micro}{' '}
              <span className="hero__source">
                Source:{' '}
                <a href={homeHero.source.href} rel="noopener">
                  {homeHero.source.label}
                </a>
              </span>
            </p>
          </div>
          <HeroArt />
        </div>
      </section>

      {/* Evidence strip */}
      <section className="evidence" aria-label="What the research says">
        <div className="container">
          <ul className="evidence__list">
            {evidence.map((e) => (
              <li key={e.stat}>
                <span className="evidence__stat">{e.stat}</span>
                <span className="evidence__line">{e.line}</span>
                <a className="evidence__src" href={e.href} rel="noopener">
                  {e.source}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Sound familiar */}
      <section className="section section--surface section--tight" aria-labelledby="pain-heading">
        <div className="container">
          <h2 id="pain-heading" className="eyebrow" style={{ marginBottom: 'var(--s-5)' }}>
            Sound familiar?
          </h2>
          <ul className="pain-list">
            {painPoints.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Specialties */}
      <section className="section section--specialties" aria-labelledby="spec-heading">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Where we are deepest</p>
            <h2 id="spec-heading">Two things we have done many times.</h2>
          </div>
          <div className="grid">
            {specialties.map((sp, i) => (
              <article key={sp.id} className={`col-4 col-md-6 specialty specialty--${i + 1}`}>
                <p className="eyebrow">{sp.eyebrow}</p>
                <h3>{sp.title}</h3>
                <p className="specialty__lead">{sp.lines[0]}</p>
                <p>{sp.lines[1]}</p>
                <ul className="checklist">
                  {sp.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
                <p>
                  <Link to={servicePath(sp.id)} className="link-arrow">
                    {sp.cta}
                  </Link>
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="section" aria-labelledby="services-heading" id="services">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">What we do</p>
            <h2 id="services-heading">Five things. In the order you need them.</h2>
          </div>
          <ol className="do-list">
            {whatWeDo.map((w, i) => {
              const s = serviceById(w.id);
              return (
                <li key={w.id}>
                  <span className="do-list__num" aria-hidden="true">
                    0{i + 1}
                  </span>
                  <div>
                    <Link to={servicePath(w.id)} className="do-list__title">
                      {s.shortTitle}
                    </Link>
                    <p>{w.line}</p>
                  </div>
                </li>
              );
            })}
          </ol>
          <p style={{ marginTop: 'var(--s-6)' }}>
            <Link to="/services" className="link-arrow">
              All services
            </Link>
          </p>
        </div>
      </section>

      {/* How it starts */}
      <section className="section section--surface" aria-labelledby="start-heading">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Getting started</p>
            <h2 id="start-heading">{howItStarts.heading}</h2>
          </div>
          <ol className="stages">
            {howItStarts.steps.map((st) => (
              <li key={st.n} className="stage">
                <span className="stage__num" aria-hidden="true">
                  0{st.n}
                </span>
                <h3>{st.title}</h3>
                <p>{st.body}</p>
              </li>
            ))}
          </ol>
          <p className="muted" style={{ marginTop: 'var(--s-6)', maxWidth: 'var(--measure)' }}>
            {howItStarts.note}
          </p>
        </div>
      </section>

      {/* Why us */}
      <section className="section section--dark" aria-labelledby="why-heading">
        <div className="container">
          <div className="grid">
            <div className="col-4 col-md-12 col-lg-5">
              <h2 id="why-heading">{whyUs.heading}</h2>
            </div>
            <div className="col-4 col-md-12 col-lg-7">
              <ul className="why-list">
                {whyUs.lines.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
              <p style={{ marginTop: 'var(--s-5)' }}>
                <Link to="/about" className="link-arrow on-dark" style={{ color: 'var(--color-on-dark)' }}>
                  About the team
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" aria-labelledby="faq-heading">
        <div className="container">
          <div className="grid">
            <div className="col-4 col-md-12 col-lg-4">
              <div className="section-head">
                <p className="eyebrow">Questions</p>
                <h2 id="faq-heading">Before you reach out</h2>
              </div>
            </div>
            <div className="col-4 col-md-12 col-lg-8">
              <Faq items={faq} />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section section--pale" aria-labelledby="final-cta">
        <div className="container stack">
          <h2 id="final-cta">{finalCta.heading}</h2>
          <p className="lede">{finalCta.body}</p>
          <p>
            <Link to={finalCta.cta.href} className="btn btn--primary" onClick={() => track('contact_cta_click', { location: 'final' })}>
              {finalCta.cta.label}
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
