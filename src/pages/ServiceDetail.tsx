import { Link, useParams } from 'react-router-dom';
import { ExampleBox, FinalInvitation, PageHead } from '@/components/Sections';
import { services, servicePath } from '@/content/services';
import type { ServiceId } from '@/content/types';
import { pageMeta } from '@/content/meta';
import { useHead } from '@/lib/head';
import NotFound from './NotFound';

const roleLabel = { lead: 'Start here', pathway: 'Implementation pathway', support: 'Operating support' } as const;

export default function ServiceDetail() {
  const { serviceId } = useParams();
  const service = services.find((s) => s.id === serviceId);
  if (!service) return <NotFound />;
  return <ServiceDetailInner id={service.id} />;
}

function ServiceDetailInner({ id }: { id: ServiceId }) {
  const service = services.find((s) => s.id === id)!;
  useHead(pageMeta[`service:${service.id}`]);
  const related = services.filter((s) => s.id !== service.id);

  return (
    <>
      <PageHead
        crumbs={[{ label: 'Services', href: '/services' }, { label: service.shortTitle }]}
        eyebrow={roleLabel[service.role]}
        title={service.title}
        lede={service.problem}
      />
      <section className="section">
        <div className="container detail-grid">
          <div className="prose">
            <h2>Who this is for</h2>
            <p>{service.audience}</p>
            <h2>The work</h2>
            <p>{service.work}</p>
            {service.detail.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <h2>Engagement considerations</h2>
            <ul className="checklist">
              {service.considerations.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <h2>What we do not promise</h2>
            <ul className="checklist">
              {service.guardrails.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
            <h2>An illustrative example</h2>
            <ExampleBox example={service.example} />
          </div>
          <aside aria-label="Summary">
            <div className="aside-box">
              <h2>Possible deliverables</h2>
              <ul>
                {service.deliverables.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
              <p className="small muted" style={{ marginTop: 'var(--s-3)' }}>
                Proposed scope elements. The actual set is agreed during framing.
              </p>
            </div>
            <div className="aside-box">
              <h2>Related services</h2>
              <ul>
                {related.map((r) => (
                  <li key={r.id}>
                    <Link to={servicePath(r.id)}>{r.shortTitle}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="aside-box">
              <h2>Talk it through</h2>
              <p className="small">
                Describe the system, the decision, and the constraints. We will say whether this service fits.
              </p>
              <p style={{ marginTop: 'var(--s-3)' }}>
                <Link to={`/contact?service=${service.id}`} className="btn btn--primary">
                  Discuss this service
                </Link>
              </p>
            </div>
          </aside>
        </div>
      </section>
      <FinalInvitation />
    </>
  );
}
