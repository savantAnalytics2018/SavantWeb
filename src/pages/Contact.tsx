import { useSearchParams } from 'react-router-dom';
import ContactForm from '@/components/ContactForm';
import { PageHead } from '@/components/Sections';
import { site } from '@/content/site';
import { pageMeta } from '@/content/meta';
import { useHead } from '@/lib/head';

export default function Contact() {
  useHead(pageMeta.contact);
  const [params] = useSearchParams();
  const initialService = params.get('service') ?? '';

  return (
    <>
      <PageHead
        eyebrow="Contact"
        title="Discuss your AI priorities"
        lede="Tell us the problem, the constraints, and what success looks like. We reply with a view on fit."
      />
      <section className="section" id="inquiry">
        <div className="container detail-grid">
          <div>
            <ContactForm initialService={initialService} />
          </div>
          <aside aria-label="What to expect">
            <div className="aside-box">
              <h2>What happens next</h2>
              <ul className="checklist">
                <li>We read what you sent and consider whether the problem fits our services.</li>
                <li>We reply by email with a candid view and, where it makes sense, a proposed first conversation.</li>
                <li>No automated follow-ups, newsletters, or sales sequences.</li>
              </ul>
            </div>
            <div className="aside-box">
              <h2>What makes a useful first message</h2>
              <ul className="checklist">
                <li>The decision you are facing and who owns it.</li>
                <li>The systems, data, or processes involved, at a high level.</li>
                <li>Constraints you already know about: timing, access, regulation, staffing.</li>
              </ul>
            </div>
            {(site.publicEmail || site.schedulingUrl) && (
              <div className="aside-box">
                <h2>Other ways to reach us</h2>
                <ul className="checklist">
                  {site.publicEmail && (
                    <li>
                      Email <a href={`mailto:${site.publicEmail}`}>{site.publicEmail}</a> (opens your mail application)
                    </li>
                  )}
                  {site.schedulingUrl && (
                    <li>
                      <a href={site.schedulingUrl} rel="noopener">
                        Book a conversation
                      </a>{' '}
                      (external scheduling page)
                    </li>
                  )}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}
