import { Link } from 'react-router-dom';
import { PageHead } from '@/components/Sections';
import { services, servicePath } from '@/content/services';
import { pageMeta } from '@/content/meta';
import { useHead } from '@/lib/head';

export default function NotFound() {
  useHead(pageMeta.notFound);
  return (
    <>
      <PageHead eyebrow="404" title="That page does not exist" lede="The address may be out of date, or it may have moved when the site was rebuilt. Here is where to go instead." />
      <section className="section">
        <div className="container grid">
          <div className="col-4 col-md-6 stack">
            <h2 style={{ fontSize: '1.5rem' }}>Main pages</h2>
            <ul className="checklist">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/services">Services</Link>
              </li>
              <li>
                <Link to="/approach">Approach</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
            </ul>
          </div>
          <div className="col-4 col-md-6 stack">
            <h2 style={{ fontSize: '1.5rem' }}>Services</h2>
            <ul className="checklist">
              {services.map((s) => (
                <li key={s.id}>
                  <Link to={servicePath(s.id)}>{s.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
