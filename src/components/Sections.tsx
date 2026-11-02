import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { IllustrativeExample, Service } from '@/content/types';
import { servicePath, services } from '@/content/services';
import { approachStages, faq } from '@/content/approach';
import { finalInvitation } from '@/content/site';
import { track } from '@/lib/analytics';

export function PageHead({
  eyebrow,
  title,
  lede,
  crumbs,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  crumbs?: { label: string; href?: string }[];
}) {
  return (
    <div className="page-head">
      <div className="container">
        {crumbs && (
          <nav aria-label="Breadcrumb">
            <ol className="breadcrumb">
              {crumbs.map((c, i) => (
                <li key={i}>{c.href ? <Link to={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}</li>
              ))}
            </ol>
          </nav>
        )}
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="h1--page">{title}</h1>
        {lede && <p className="lede">{lede}</p>}
      </div>
    </div>
  );
}

export function ServiceCard({ service, variant }: { service: Service; variant: 'lead' | 'pathway' | 'support' }) {
  const roleLabel = { lead: 'Start here', pathway: 'Implementation pathway', support: 'Operating support' }[variant];
  const Heading = variant === 'support' ? 'h4' : 'h3';
  return (
    <article className={`card card--${variant}`}>
      <p className="eyebrow">{roleLabel}</p>
      <Heading>{service.title}</Heading>
      <p className="card__problem muted">{service.problem}</p>
      {variant !== 'support' && <p>{service.work}</p>}
      {variant !== 'support' && (
        <ul className="card__deliverables" aria-label="Example deliverables">
          {service.deliverables.slice(0, variant === 'lead' ? 6 : 4).map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      )}
      <div className="card__footer">
        <Link to={servicePath(service.id)} className="link-arrow">
          {service.cardAction}
        </Link>
      </div>
    </article>
  );
}

export function ServicesOverview({ heading, children }: { heading?: ReactNode; children?: ReactNode }) {
  const lead = services.find((s) => s.role === 'lead')!;
  const pathways = services.filter((s) => s.role === 'pathway');
  const support = services.filter((s) => s.role === 'support');
  return (
    <>
      {heading}
      <div className="services-overview">
        <div className="services-overview__lead">
          <ServiceCard service={lead} variant="lead" />
        </div>
        {pathways.map((s) => (
          <div key={s.id} className="services-overview__pathway">
            <ServiceCard service={s} variant="pathway" />
          </div>
        ))}
        <p className="services-overview__support-label eyebrow">Keeping it running responsibly</p>
        {support.map((s) => (
          <div key={s.id} className="services-overview__support">
            <ServiceCard service={s} variant="support" />
          </div>
        ))}
      </div>
      {children}
    </>
  );
}

export function ApproachStages({ dark = false }: { dark?: boolean }) {
  return (
    <ol className="stages" data-dark={dark}>
      {approachStages.map((st, i) => (
        <li key={st.id} className="stage">
          <span className="stage__num" aria-hidden="true">
            0{i + 1}
          </span>
          <h3>{st.name}</h3>
          <p>{st.summary}</p>
        </li>
      ))}
    </ol>
  );
}

export function ExampleBox({ example }: { example: IllustrativeExample }) {
  return (
    <section className="example" aria-labelledby={`ex-${example.title.replace(/\W+/g, '-')}`}>
      <span className="example__label">Illustrative example — hypothetical, not a client case study</span>
      <h3 id={`ex-${example.title.replace(/\W+/g, '-')}`} style={{ fontSize: '1.25rem', marginBottom: 'var(--s-3)' }}>
        {(() => {
          const t = example.title.replace(/^Illustrative example — /, '');
          return t.charAt(0).toUpperCase() + t.slice(1);
        })()}
      </h3>
      <dl>
        <div>
          <dt>Starting situation</dt>
          <dd>{example.situation}</dd>
        </div>
        <div>
          <dt>Possible work</dt>
          <dd>{example.possibleWork}</dd>
        </div>
        <div>
          <dt>Decision or artifact produced</dt>
          <dd>{example.outcome}</dd>
        </div>
      </dl>
    </section>
  );
}

export function Faq({ items = faq }: { items?: typeof faq }) {
  return (
    <div className="faq">
      {items.map((f) => (
        <details key={f.id}>
          <summary>{f.question}</summary>
          <div className="faq__answer">
            <p>{f.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}

export function FinalInvitation({ context }: { context?: string }) {
  return (
    <section className="section section--dark" aria-labelledby="final-cta">
      <div className="container">
        <div className="grid">
          <div className="col-4 col-md-12 col-lg-8 stack">
            <h2 id="final-cta">{finalInvitation.heading}</h2>
            <p className="muted" style={{ fontSize: '1.125rem', maxWidth: 'var(--measure)' }}>
              {context ?? finalInvitation.body}
            </p>
            <p>
              <Link
                to={finalInvitation.cta.href}
                className="btn btn--primary on-dark"
                onClick={() => track('contact_cta_click', { location: 'final' })}
              >
                {finalInvitation.cta.label}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
