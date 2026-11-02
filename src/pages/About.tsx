import { FinalInvitation, PageHead } from '@/components/Sections';
import { about } from '@/content/about';
import { site } from '@/content/site';
import { pageMeta } from '@/content/meta';
import { useHead } from '@/lib/head';

export default function About() {
  useHead(pageMeta.about);
  return (
    <>
      <PageHead eyebrow="About" title={about.heading} lede={about.intro} />
      <section className="section">
        <div className="container">
          <div className="grid">
            <div className="col-4 col-md-12 col-lg-7 prose">
              {about.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <h2>Where the team has worked</h2>
              <dl style={{ display: 'grid', gap: 'var(--s-4)' }}>
                {about.experience.map((e) => (
                  <div key={e.id}>
                    <dt style={{ fontWeight: 600 }}>{e.title}</dt>
                    <dd className="muted" style={{ margin: 0 }}>
                      {e.body}
                    </dd>
                  </div>
                ))}
              </dl>
              {site.certifications.length > 0 && (
                <>
                  <h2>Certifications</h2>
                  <ul className="cert-list">
                    {site.certifications.map((c) => (
                      <li key={c.id}>
                        <img src={c.image} alt={c.alt} width="120" height="149" loading="lazy" />
                        <span>{c.label}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {site.externalLinks.length > 0 && (
                <>
                  <h2>Elsewhere</h2>
                  <ul>
                    {site.externalLinks.map((l) => (
                      <li key={l.href}>
                        <a href={l.href} rel="noopener">
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <div className="col-4 col-md-12 col-lg-5">
              <div className="aside-box">
                <h2>How we work</h2>
                <dl style={{ display: 'grid', gap: 'var(--s-4)' }}>
                  {about.principles.map((p) => (
                    <div key={p.id}>
                      <dt style={{ fontWeight: 600 }}>{p.title}</dt>
                      <dd className="muted" style={{ margin: 0 }}>
                        {p.body}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>
      <FinalInvitation />
    </>
  );
}
