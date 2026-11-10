import { sampleReport as r } from '@/content/testYourIdea';

/**
 * Static, clearly labeled illustrative preview of a research report,
 * presented as a report page. Bars show the share selecting each option in
 * Q2 (willing to adopt, multi-select) by segment (n = 20 per segment, so values are multiples of 5); a hidden table
 * carries the same data for assistive tech.
 */
export default function SampleReport() {
  return (
    <article className="report" aria-labelledby="sample-report-title">
      <div className="report__banner" role="note">
        {r.label}
      </div>

      <div className="report__page">
        <header className="report__head">
          <div className="report__meta">
            <span className="report__brand">Savant Analytics</span>
            <span>{r.pageLabel}</span>
          </div>
          <h3 id="sample-report-title">{r.title}</h3>
          <p className="muted">{r.question}</p>
        </header>

        <div className="report__grid">
          <section className="report__block report__block--wide report__overview" aria-labelledby="sr-overview">
            <h4 id="sr-overview">Executive overview</h4>
            <ol className="report__overview-list">
              {r.overview.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ol>
          </section>

          <section className="report__block" aria-labelledby="sr-audience">
            <h4 id="sr-audience">Audience model</h4>
            <p>{r.audience}</p>
          </section>

          <section className="report__block" aria-labelledby="sr-concepts">
            <h4 id="sr-concepts">Concepts shown</h4>
            <ul className="report__concepts">
              {r.concepts.map((c) => (
                <li key={c.id}>
                  <span className="report__swatch" data-concept={c.id} aria-hidden="true" />
                  <strong>
                    {c.id}. {c.name}
                  </strong>{' '}
                  <span className="muted">— {c.note}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="report__block report__block--wide" aria-labelledby="sr-questions">
            <h4 id="sr-questions">Survey instrument — {r.questions.length} questions asked of every persona</h4>
            <ol className="report__questions">
              {r.questions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ol>
          </section>

          <section className="report__block report__block--wide" aria-labelledby="sr-results">
            <h4 id="sr-results">Share willing to adopt each option (Q2, select all that apply)</h4>
            <div className="report__chart" role="img" aria-describedby="sr-table-caption">
              {r.segments.map((seg, si) => (
                <div key={seg} className="report__group">
                  <span className="report__seg">{seg}</span>
                  <div className="report__bars">
                    {r.wouldAdopt.map((w) => (
                      <div key={w.concept} className="report__bar" data-concept={w.concept}>
                        <span className="report__fill" style={{ width: `${w.values[si]}%` }} />
                        <span className="report__val">
                          {w.concept} {w.values[si]}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="visually-hidden">
              <table>
                <caption id="sr-table-caption">
                  Share of simulated respondents selecting each option in Q2 (willing to adopt in the next 12 months), by segment; 20 per segment. Illustrative values only.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Concept</th>
                    {r.segments.map((s) => (
                      <th key={s} scope="col">
                        {s}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {r.wouldAdopt.map((w) => (
                    <tr key={w.concept}>
                      <th scope="row">{w.concept}</th>
                      {w.values.map((v, i) => (
                        <td key={i}>{v}%</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="small muted">20 simulated respondents per segment. Directional, for comparing options; not a demand estimate.</p>
          </section>

          <section className="report__block" aria-labelledby="sr-objections">
            <h4 id="sr-objections">Top objection per concept</h4>
            <ul className="objections">
              {r.objections.map((o) => (
                <li key={o.concept} className="objection" data-concept={o.concept}>
                  <div className="objection__head">
                    <span className="report__swatch" data-concept={o.concept} aria-hidden="true" />
                    <strong>{o.concept}</strong>
                    <span className="objection__text">{o.text}</span>
                    <span className="objection__count">{o.count} of 60</span>
                  </div>
                  <div className="objection__track">
                    <span className="objection__fill" style={{ width: `${Math.round((o.count / 60) * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
            <p className="small muted">Number of simulated respondents mentioning each objection when asked for their first objection (Q3).</p>
          </section>

          <section className="report__block" aria-labelledby="sr-caveats">
            <h4 id="sr-caveats">Interpretation — where results are unstable</h4>
            <ul className="checklist">
              {r.caveats.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </section>

          <section className="report__block" aria-labelledby="sr-themes">
            <h4 id="sr-themes">Key simulated themes</h4>
            <ul className="checklist">
              {r.themes.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>

          <section className="report__block report__block--next" aria-labelledby="sr-next">
            <h4 id="sr-next">What to test with real people next</h4>
            <ol className="report__next">
              {r.nextSteps.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ol>
          </section>

          <section className="report__block report__block--wide" aria-labelledby="sr-quotes">
            <h4 id="sr-quotes">Example responses</h4>
            <ul className="report__quotes">
              {r.exampleResponses.map((q) => (
                <li key={q.text} className="report__quote">
                  <span className="report__quote-tag">Synthetic response · {q.segment}</span>
                  <p>{q.text}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <footer className="report__foot">
          <span>{r.reviewedBy}</span>
        </footer>
      </div>
    </article>
  );
}
