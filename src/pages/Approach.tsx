import { Link } from 'react-router-dom';
import { FinalInvitation, PageHead } from '@/components/Sections';
import { approachNotes, approachStages, buyerSituations } from '@/content/approach';
import { serviceById, servicePath } from '@/content/services';
import { pageMeta } from '@/content/meta';
import { useHead } from '@/lib/head';

export default function Approach() {
  useHead(pageMeta.approach);
  return (
    <>
      <PageHead
        eyebrow="Approach"
        title="How engagements work"
        lede="Four flexible stages, not a fixed package: Frame, Examine, Build and test, Operationalize."
      />
      <section className="section">
        <div className="container">
          <ol className="stages" style={{ gridTemplateColumns: '1fr', gap: 'var(--s-7)' }}>
            {approachStages.map((st, i) => (
              <li key={st.id} className="stage" style={{ display: 'grid', gap: 'var(--s-3)' }}>
                <div className="grid">
                  <div className="col-4 col-md-4 col-lg-3">
                    <span className="stage__num" aria-hidden="true">
                      0{i + 1}
                    </span>
                    <h2 style={{ fontSize: 'clamp(1.75rem, 2.4vw, 2.25rem)' }}>{st.name}</h2>
                  </div>
                  <div className="col-4 col-md-8 col-lg-7 stack">
                    <p style={{ fontWeight: 600 }}>{st.summary}</p>
                    <p className="muted">{st.detail}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="section section--surface" aria-labelledby="scoping-heading">
        <div className="container">
          <div className="grid">
            <div className="col-4 col-md-12 col-lg-4">
              <div className="section-head">
                <p className="eyebrow">Scoping</p>
                <h2 id="scoping-heading">Honest about what is feasible</h2>
              </div>
            </div>
            <div className="col-4 col-md-12 col-lg-8 prose">
              {approachNotes.map((n) => (
                <p key={n}>{n}</p>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="section" aria-labelledby="entry-heading">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Entry points</p>
            <h2 id="entry-heading">Three ways an engagement usually starts</h2>
          </div>
          <div>
            {buyerSituations.map((b) => (
              <article key={b.id} className="situation">
                <h3>{b.heading}</h3>
                <div className="stack">
                  <p className="muted">{b.question}</p>
                  <p>{b.firstDecision}</p>
                  <ul className="situation__links" aria-label="Relevant services">
                    {b.services.map((sid) => (
                      <li key={sid}>
                        <Link to={servicePath(sid)} className="link-arrow">
                          {serviceById(sid).shortTitle}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <FinalInvitation />
    </>
  );
}
