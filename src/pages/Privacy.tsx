import { PageHead } from '@/components/Sections';
import { site } from '@/content/site';
import { pageMeta } from '@/content/meta';
import { contactConfig } from '@/lib/contactConfig';
import { studyConfig } from '@/lib/studyConfig';
import { useHead } from '@/lib/head';

/**
 * Privacy page written from the actual operating setup (brief §16).
 * Sections marked "Owner review required" must be confirmed before launch;
 * they are rendered so the page is honest about what is not yet settled.
 */
export default function Privacy() {
  useHead(pageMeta.privacy);
  return (
    <>
      <PageHead eyebrow="Privacy" title="Privacy" lede={`What this website collects, why, and how to reach ${site.name} about it.`} />
      <section className="section">
        <div className="container prose">
          <h2>What this site collects</h2>
          <p>
            This website does not use analytics, advertising pixels, session replay, or marketing cookies. It sets no
            cookies of its own. If you pause the hero animation, that choice is kept in your browser&rsquo;s session
            storage only and is not transmitted anywhere.
          </p>
          <h2>The inquiry form</h2>
          {contactConfig.enabled ? (
            <p>
              When you submit the inquiry form, we receive the name, email address, optional organization, optional
              service interest, and message you enter. We use this information only to respond to your inquiry and to
              assess whether an engagement is a good fit. Please do not include credentials, confidential source code,
              regulated data, or other sensitive information in the form.
            </p>
          ) : (
            <p>
              The inquiry form is not yet connected to a delivery destination. Until it is, submitting the form sends
              nothing and no information is collected through it.
            </p>
          )}
          <h2>Research requests (Market Research)</h2>
          {studyConfig.enabled ? (
            <p>
              When you submit a research request, we receive the decision, audience, and concepts you describe, plus your
              name, organization, work email, and optional role. We use this only to prepare and email your research
              snapshot. The request is delivered to the Savant team
              by email; it is not published, shared with third parties, or used to train AI models. You can ask us to
              delete it at any time. The snapshot itself is produced with AI-simulated respondents, not real people.
            </p>
          ) : (
            <p>
              The research-request form is not yet connected to a delivery destination. Until it is, submitting the form
              sends nothing and no information is collected through it.
            </p>
          )}
          <h2>Where inquiries go and how long they are kept</h2>
          <p className="notice notice--warning">
            <strong>Owner review required before launch.</strong> The delivery destination (email provider or service),
            the processor involved, and the retention period for inquiries and research requests must be confirmed by the site owner and
            recorded here before this page is published. Nothing in this section should be invented.
          </p>
          <h2>Hosting</h2>
          <p className="notice notice--warning">
            <strong>Owner review required before launch.</strong> The hosting provider may keep standard server logs
            (such as IP address, requested page, and timestamp) for security and operations. Name the provider and link
            to its privacy terms once hosting is confirmed.
          </p>
          <h2>Contact</h2>
          {site.publicEmail ? (
            <p>
              Questions about privacy can be sent to{' '}
              <a href={`mailto:${site.publicEmail}`}>{site.publicEmail}</a> (opens your mail application).
            </p>
          ) : (
            <p className="notice notice--warning">
              <strong>Owner review required before launch.</strong> A confirmed contact address for privacy questions
              must be added here.
            </p>
          )}
          <p className="small muted">
            This page describes the site&rsquo;s actual operation. It is not legal advice and does not assert
            compliance with any specific regulation.
          </p>
        </div>
      </section>
    </>
  );
}
