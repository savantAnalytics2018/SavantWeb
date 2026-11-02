import { Link } from 'react-router-dom';
import { FinalInvitation, PageHead, ServicesOverview } from '@/components/Sections';
import { services, servicePath } from '@/content/services';
import { pageMeta } from '@/content/meta';
import { useHead } from '@/lib/head';

export default function Services() {
  useHead(pageMeta.services);
  return (
    <>
      <PageHead
        eyebrow="Services"
        title="Five connected service areas"
        lede="Strategy sets priorities. Modernization and evaluation are the pathways. Deployment and governance keep it running. Deliverables are proposed scope, agreed during framing."
      />
      <section className="section" aria-labelledby="overview-heading">
        <div className="container">
          <ServicesOverview
            heading={
              <div className="section-head">
                <h2 id="overview-heading">How the services fit together</h2>
              </div>
            }
          />
        </div>
      </section>
      <section className="section section--surface" aria-labelledby="all-services">
        <div className="container">
          <div className="section-head">
            <h2 id="all-services">Each service in brief</h2>
          </div>
          <div>
            {services.map((s) => (
              <article key={s.id} className="situation">
                <h3>{s.title}</h3>
                <div className="stack">
                  <p className="muted">{s.problem}</p>
                  <p>{s.work}</p>
                  <p>
                    <Link to={servicePath(s.id)} className="link-arrow">
                      {s.cardAction}
                    </Link>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <FinalInvitation context="Not sure which service fits? Describe the decision you are facing and we will suggest where to start." />
    </>
  );
}
