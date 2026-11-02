import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { services } from '@/content/services';
import { site } from '@/content/site';
import { contactConfig, limits, validateInquiry, type FieldErrors, type InquiryInput } from '@/lib/contactConfig';
import { track } from '@/lib/analytics';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const serviceIds = services.map((s) => s.id);

export interface ContactFormProps {
  /** Preselects the service interest (from ?service= on the contact route). */
  initialService?: string;
  /** Injectable for tests; defaults to window.fetch. */
  fetchImpl?: typeof fetch;
}

export default function ContactForm({ initialService = '', fetchImpl }: ContactFormProps) {
  const id = useId();
  const [values, setValues] = useState<InquiryInput>({
    name: '',
    email: '',
    organization: '',
    service: serviceIds.includes(initialService as (typeof serviceIds)[number]) ? initialService : '',
    message: '',
  });
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [serverMessage, setServerMessage] = useState<string>('');
  const statusRef = useRef<HTMLDivElement>(null);
  const firstErrorRef = useRef<string | null>(null);
  const startedAt = useRef<number>(Date.now());

  // Move focus to the status region after a result so screen readers announce it once.
  useEffect(() => {
    if (status === 'success' || status === 'error') statusRef.current?.focus();
  }, [status]);

  const set = (k: keyof InquiryInput) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!contactConfig.enabled || status === 'submitting') return;

    const fieldErrors = validateInquiry(values, serviceIds);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      const first = (Object.keys(fieldErrors) as (keyof InquiryInput)[])[0];
      firstErrorRef.current = `${id}-${first}`;
      document.getElementById(`${id}-${first}`)?.focus();
      return;
    }

    setStatus('submitting');
    setServerMessage('');
    track('inquiry_submitted');
    try {
      const res = await (fetchImpl ?? fetch)(contactConfig.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...values,
          website: honeypot, // honeypot: must be empty
          elapsedMs: Date.now() - startedAt.current,
        }),
      });
      let data: { ok?: boolean; message?: string; errors?: FieldErrors } = {};
      try {
        data = await res.json();
      } catch {
        /* non-JSON response treated as failure below */
      }
      if (res.ok && data.ok) {
        setStatus('success');
        track('inquiry_accepted');
      } else {
        if (data.errors) setErrors(data.errors);
        setServerMessage(data.message || 'The inquiry could not be sent. Your message is still below — please try again.');
        setStatus('error');
        track('inquiry_failed', { httpStatus: res.status });
      }
    } catch {
      setServerMessage('We could not reach the server. Check your connection and try again — your message is still below.');
      setStatus('error');
      track('inquiry_failed', { httpStatus: 0 });
    }
  }

  if (status === 'success') {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="notice notice--success">
        <p>
          <strong>Your inquiry has been received.</strong>
        </p>
        <p>Thank you. We will review what you sent and reply by email about fit and a suggested first conversation.</p>
      </div>
    );
  }

  const disabled = !contactConfig.enabled || status === 'submitting';
  const errorId = (k: keyof InquiryInput) => `${id}-${k}-error`;

  return (
    <form className="form" onSubmit={onSubmit} noValidate aria-describedby={`${id}-intro`}>
      <p id={`${id}-intro`}>
        Describe the problem, the constraints, and the next step you want. Please do not include credentials,
        confidential source code, regulated data, or other sensitive information.
      </p>

      {!contactConfig.enabled && (
        <div className="notice notice--warning" role="status">
          <p>
            <strong>Preview: the inquiry form is not yet connected.</strong>
          </p>
          <p>
            Submission is disabled until a delivery destination is configured and tested.
            {site.publicEmail ? (
              <>
                {' '}
                In the meantime you can email{' '}
                <a href={`mailto:${site.publicEmail}`}>{site.publicEmail}</a> (opens your mail application).
              </>
            ) : null}
          </p>
        </div>
      )}

      {status === 'error' && (
        <div ref={statusRef} tabIndex={-1} role="alert" className="notice notice--error">
          <p>
            <strong>Not sent.</strong> {serverMessage}
          </p>
        </div>
      )}

      <div className="field">
        <label htmlFor={`${id}-name`}>Name</label>
        <input
          id={`${id}-name`}
          name="name"
          type="text"
          autoComplete="name"
          required
          maxLength={limits.name.max}
          value={values.name}
          onChange={set('name')}
          aria-invalid={errors.name ? 'true' : undefined}
          aria-describedby={errors.name ? errorId('name') : undefined}
          disabled={disabled}
        />
        {errors.name && (
          <p id={errorId('name')} className="field__error">
            {errors.name}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor={`${id}-email`}>Email</label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={limits.email.max}
          value={values.email}
          onChange={set('email')}
          aria-invalid={errors.email ? 'true' : undefined}
          aria-describedby={errors.email ? errorId('email') : undefined}
          disabled={disabled}
        />
        {errors.email && (
          <p id={errorId('email')} className="field__error">
            {errors.email}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor={`${id}-organization`}>
          Organization <span className="muted" style={{ fontWeight: 400 }}>(optional)</span>
        </label>
        <input
          id={`${id}-organization`}
          name="organization"
          type="text"
          autoComplete="organization"
          maxLength={limits.organization.max}
          value={values.organization}
          onChange={set('organization')}
          aria-invalid={errors.organization ? 'true' : undefined}
          aria-describedby={errors.organization ? errorId('organization') : undefined}
          disabled={disabled}
        />
        {errors.organization && (
          <p id={errorId('organization')} className="field__error">
            {errors.organization}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor={`${id}-service`}>
          Service interest <span className="muted" style={{ fontWeight: 400 }}>(optional)</span>
        </label>
        <select id={`${id}-service`} name="service" value={values.service} onChange={set('service')} disabled={disabled}>
          <option value="">Not sure yet</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor={`${id}-message`}>What are you trying to decide or change?</label>
        <p className="field__hint" id={`${id}-message-hint`}>
          The business problem, the systems or constraints involved, and what a good outcome would look like.
        </p>
        <textarea
          id={`${id}-message`}
          name="message"
          required
          minLength={limits.message.min}
          maxLength={limits.message.max}
          value={values.message}
          onChange={set('message')}
          aria-invalid={errors.message ? 'true' : undefined}
          aria-describedby={[`${id}-message-hint`, errors.message ? errorId('message') : null].filter(Boolean).join(' ')}
          disabled={disabled}
        />
        {errors.message && (
          <p id={errorId('message')} className="field__error">
            {errors.message}
          </p>
        )}
      </div>

      {/* Honeypot — hidden from people, visible to naive bots */}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>

      <div className="cluster">
        <button type="submit" className="btn btn--primary" disabled={disabled} aria-disabled={disabled}>
          {status === 'submitting' ? 'Sending…' : 'Send inquiry'}
        </button>
        <span className="small muted" aria-live="polite">
          {status === 'submitting' ? 'Sending your inquiry.' : ''}
        </span>
      </div>
    </form>
  );
}
