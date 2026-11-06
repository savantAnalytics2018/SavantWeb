import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { buyerTypes, decisionTypes, intakeCopy, intakeSteps } from '@/content/testYourIdea';
import {
  emptyConcept,
  emptyStudy,
  studyConfig,
  studyLimits,
  validateStep,
  type StudyErrors,
  type StudyInput,
} from '@/lib/studyConfig';
import { track } from '@/lib/analytics';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export interface StudyWizardProps {
  /** Injectable for tests; defaults to window.fetch. */
  fetchImpl?: typeof fetch;
}

/* ---------- Draft autosave (current browser session only) ---------- */

function loadDraft(): StudyInput | null {
  try {
    const raw = window.sessionStorage.getItem(studyConfig.draftKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StudyInput>;
    return { ...emptyStudy(), ...parsed, concepts: parsed.concepts?.length ? parsed.concepts : [emptyConcept()] };
  } catch {
    return null;
  }
}
function saveDraft(v: StudyInput): void {
  try {
    window.sessionStorage.setItem(studyConfig.draftKey, JSON.stringify(v));
  } catch {
    /* storage unavailable — autosave is a convenience only */
  }
}
function clearDraft(): void {
  try {
    window.sessionStorage.removeItem(studyConfig.draftKey);
  } catch {
    /* ignore */
  }
}

/* ---------- Small field helpers ---------- */

function Field({
  id,
  label,
  optional,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: (a: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: 'true' }) => ReactNode;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(' ') || undefined;
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {optional && (
          <span className="muted" style={{ fontWeight: 400 }}>
            {' '}
            (optional)
          </span>
        )}
      </label>
      {hint && (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      )}
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? 'true' : undefined })}
      {error && (
        <p id={errId} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}

export default function StudyWizard({ fetchImpl }: StudyWizardProps) {
  const id = useId();
  const [values, setValues] = useState<StudyInput>(emptyStudy);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<StudyErrors>({});
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [serverMessage, setServerMessage] = useState('');
  const [reference, setReference] = useState('');
  const [confirmationSent, setConfirmationSent] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const [restored, setRestored] = useState(false);
  const [linkOpen, setLinkOpen] = useState<Record<number, boolean>>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const startedAt = useRef<number>(Date.now());
  const started = useRef(false);

  // Restore a draft from this browser session, once, after hydration.
  useEffect(() => {
    const d = loadDraft();
    if (d) {
      setValues(d);
      setRestored(true);
    }
  }, []);

  // Autosave on every change.
  useEffect(() => {
    if (status === 'success') return;
    saveDraft(values);
  }, [values, status]);

  // Move focus to the step heading on step change; to the status region on a result.
  useEffect(() => {
    if (step > 0 || status === 'idle') headingRef.current?.focus();
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (status === 'success' || status === 'error') statusRef.current?.focus();
  }, [status]);

  const disabled = !studyConfig.enabled || status === 'submitting';
  const fid = (k: string) => `${id}-${k}`;

  const set = (k: keyof StudyInput) => (e: { target: { value: string } }) => {
    if (!started.current) {
      started.current = true;
      track('tyi_form_start');
    }
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };
  const setBool = (k: 'consent' | 'marketingOptIn') => (e: { target: { checked: boolean } }) => {
    setValues((v) => ({ ...v, [k]: e.target.checked }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };
  const setConcept = (i: number, k: 'name' | 'description' | 'url') => (e: { target: { value: string } }) => {
    setValues((v) => {
      const concepts = v.concepts.map((c, j) => (j === i ? { ...c, [k]: e.target.value } : c));
      return { ...v, concepts };
    });
    const key = `concept${i}` as const;
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };
  const addConcept = () =>
    setValues((v) => (v.concepts.length < studyLimits.maxConcepts ? { ...v, concepts: [...v.concepts, emptyConcept()] } : v));
  const removeConcept = (i: number) => {
    setValues((v) => ({ ...v, concepts: v.concepts.filter((_, j) => j !== i) }));
    setErrors((er) => Object.fromEntries(Object.entries(er).filter(([k]) => !k.startsWith('concept'))) as StudyErrors);
    setLinkOpen({});
  };

  function focusFirstError(errs: StudyErrors) {
    setShowSummary(true);
    const first = Object.keys(errs)[0];
    if (!first) return;
    // Radio groups: focus the first input inside the group, not the wrapper.
    const el = document.getElementById(fid(first));
    const target = el && !(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement)
      ? el.querySelector<HTMLElement>('input, textarea, select')
      : el;
    (target ?? el)?.focus();
  }

  function next() {
    const errs = validateStep(step, values);
    if (Object.keys(errs).length) {
      setErrors(errs);
      focusFirstError(errs);
      return;
    }
    setErrors({});
    setShowSummary(false);
    track('tyi_form_step', { step: step + 2 });
    setStep((s) => Math.min(s + 1, intakeSteps.length - 1));
  }
  function back() {
    setErrors({});
    setShowSummary(false);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (step < intakeSteps.length - 1) {
      next();
      return;
    }
    if (disabled) return;
    const errs = validateStep(3, values);
    if (Object.keys(errs).length) {
      setErrors(errs);
      focusFirstError(errs);
      return;
    }
    setStatus('submitting');
    setServerMessage('');
    track('tyi_form_submitted');
    try {
      const res = await (fetchImpl ?? fetch)(studyConfig.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...values, website: honeypot, elapsedMs: Date.now() - startedAt.current }),
      });
      let data: { ok?: boolean; message?: string; errors?: StudyErrors; reference?: string; confirmationSent?: boolean } = {};
      try {
        data = await res.json();
      } catch {
        /* treated as failure below */
      }
      if (res.ok && data.ok) {
        setReference(data.reference ?? '');
        setConfirmationSent(data.confirmationSent !== false);
        setStatus('success');
        clearDraft();
        track('tyi_form_accepted');
      } else {
        if (data.errors) {
          setErrors(data.errors);
          // Jump to the first screen that has an error so the visitor can fix it.
          const keys = Object.keys(data.errors);
          const screen = (k: string) =>
            ['decisionType', 'question', 'context'].includes(k)
              ? 0
              : ['audience', 'geography', 'buyerType'].includes(k)
                ? 1
                : k.startsWith('concept') || k === 'extraQuestions'
                  ? 2
                  : 3;
          setStep(Math.min(...keys.map(screen)));
        }
        setServerMessage(data.message || 'The request could not be sent. Your answers are still here — please try again.');
        setStatus('error');
        track('tyi_form_failed', { httpStatus: res.status });
      }
    } catch {
      setServerMessage('We could not reach the server. Check your connection and try again — your answers are still here.');
      setStatus('error');
      track('tyi_form_failed', { httpStatus: 0 });
    }
  }

  /* ---------- Success screen ---------- */
  if (status === 'success') {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="wizard-success">
        <p className="eyebrow">Request received</p>
        <h2>{intakeCopy.successHeadline}</h2>
        {reference && (
          <p className="wizard-success__ref">
            Your request reference: <strong>{reference}</strong>
          </p>
        )}
        {confirmationSent ? (
          <p>{intakeCopy.successSent(values.email.trim())}</p>
        ) : (
          <p className="notice notice--warning">{intakeCopy.successNotSent(values.email.trim())}</p>
        )}
        <p className="muted small">{intakeCopy.disclosure}</p>
        <BriefSummary values={values} heading="A copy of what you submitted" />
        <p>
          <Link to="/market-research" className="link-arrow">
            Back to Market Research
          </Link>
        </p>
      </div>
    );
  }

  const current = intakeSteps[step];
  const isLast = step === intakeSteps.length - 1;

  return (
    <form className="wizard" onSubmit={onSubmit} noValidate aria-labelledby={fid('heading')}>
      {/* Stepper */}
      <ol className="stepper" aria-label="Progress">
        {intakeSteps.map((s, i) => (
          <li
            key={s.id}
            className="stepper__item"
            data-state={i < step ? 'done' : i === step ? 'current' : 'todo'}
            aria-current={i === step ? 'step' : undefined}
          >
            <span className="stepper__num" aria-hidden="true">
              {i + 1}
            </span>
            <span className="stepper__label">{s.title}</span>
          </li>
        ))}
      </ol>

      <div className="wizard__panel">
        <p className="wizard__hint">
          Step {step + 1} of {intakeSteps.length}
        </p>
        <h2 id={fid('heading')} ref={headingRef} tabIndex={-1}>
          {current.title}
        </h2>

        {step === 0 && (
          <p className="muted" style={{ marginTop: 0 }}>
            {intakeCopy.intro}
          </p>
        )}

        {!studyConfig.enabled && (
          <div className="notice notice--warning" role="status">
            <p>
              <strong>{intakeCopy.previewNotice}</strong>
            </p>
          </div>
        )}

        {restored && step === 0 && (
          <p className="small muted" role="status">
            We restored the answers you started earlier in this browser session.
          </p>
        )}

        {status === 'error' && (
          <div ref={statusRef} tabIndex={-1} role="alert" className="notice notice--error">
            <p>
              <strong>Not sent.</strong> {serverMessage}
            </p>
          </div>
        )}

        {showSummary && Object.keys(errors).length > 0 && status !== 'error' && (
          <div ref={summaryRef} role="alert" className="notice notice--error">
            <p>
              <strong>{intakeCopy.errorSummary}</strong>
            </p>
          </div>
        )}

        {/* ---------- Screen 1 ---------- */}
        {step === 0 && (
          <>
            <fieldset className="field choice-group" aria-describedby={errors.decisionType ? fid('decisionType-error') : undefined}>
              <legend>What kind of decision is it?</legend>
              <div className="choice-grid" id={fid('decisionType')}>
                {decisionTypes.map((d) => (
                  <label key={d.id} className="choice" data-checked={values.decisionType === d.id}>
                    <input
                      type="radio"
                      name="decisionType"
                      value={d.id}
                      checked={values.decisionType === d.id}
                      onChange={set('decisionType')}
                      disabled={status === 'submitting'}
                    />
                    <span>{d.label}</span>
                  </label>
                ))}
              </div>
              {errors.decisionType && (
                <p id={fid('decisionType-error')} className="field__error">
                  {errors.decisionType}
                </p>
              )}
            </fieldset>

            {values.decisionType === 'other' && (
              <Field id={fid('otherDetail')} label="What kind of decision is it?" error={errors.otherDetail}>
                {(a) => (
                  <input
                    {...a}
                    type="text"
                    name="otherDetail"
                    required
                    maxLength={studyLimits.short.max}
                    value={values.otherDetail}
                    onChange={set('otherDetail')}
                  />
                )}
              </Field>
            )}

            <Field
              id={fid('question')}
              label="What question are you trying to answer?"
              hint={`One or two sentences. For example: ${intakeCopy.questionExamples[0]} or ${intakeCopy.questionExamples[1]}`}
              error={errors.question}
            >
              {(a) => (
                <textarea
                  {...a}
                  name="question"
                  required
                  maxLength={studyLimits.text.max}
                  value={values.question}
                  onChange={set('question')}
                  style={{ minHeight: '7rem' }}
                />
              )}
            </Field>

            <Field
              id={fid('context')}
              label="Decision context and alternatives"
              optional
              hint="What is at stake, what else you are considering, and anything you have already tried."
              error={errors.context}
            >
              {(a) => (
                <textarea
                  {...a}
                  name="context"
                  maxLength={studyLimits.optionalText.max}
                  value={values.context}
                  onChange={set('context')}
                  style={{ minHeight: '7rem' }}
                />
              )}
            </Field>
          </>
        )}

        {/* ---------- Screen 2 ---------- */}
        {step === 1 && (
          <>
            <Field
              id={fid('audience')}
              label="Who are the people whose perspective matters?"
              hint={intakeCopy.audienceHelper}
              error={errors.audience}
            >
              {(a) => (
                <textarea
                  {...a}
                  name="audience"
                  required
                  maxLength={studyLimits.text.max}
                  value={values.audience}
                  onChange={set('audience')}
                  style={{ minHeight: '7rem' }}
                />
              )}
            </Field>

            <div className="wizard__row">
              <Field id={fid('geography')} label="Geography" optional hint="Country, region, or “U.S. metro areas”." error={errors.geography}>
                {(a) => (
                  <input
                    {...a}
                    type="text"
                    name="geography"
                    placeholder="United States"
                    maxLength={studyLimits.short.max}
                    value={values.geography}
                    onChange={set('geography')}
                  />
                )}
              </Field>
              <Field id={fid('buyerType')} label="Consumers or business buyers?" optional error={errors.buyerType}>
                {(a) => (
                  <select {...a} name="buyerType" value={values.buyerType} onChange={set('buyerType')}>
                    {buyerTypes.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
            </div>

          </>
        )}

        {/* ---------- Screen 3 ---------- */}
        {step === 2 && (
          <>
            <p className="muted" style={{ marginTop: 0 }}>
              {intakeCopy.conceptsIntro}
            </p>
            {errors.concepts && <p className="field__error">{errors.concepts}</p>}
            {values.concepts.map((c, i) => {
              const key = `concept${i}` as const;
              return (
                <fieldset key={i} className="concept" aria-describedby={errors[key] ? fid(`${key}-error`) : undefined}>
                  <legend>
                    Concept {String.fromCharCode(65 + i)}
                    <span className="muted" style={{ fontWeight: 400 }}>
                      {i === 0 ? ' — description required' : ' (optional)'}
                    </span>
                  </legend>
                  <div className="field">
                    <label htmlFor={fid(`${key}-name`)}>
                      Short name{' '}
                      <span className="muted" style={{ fontWeight: 400 }}>
                        (optional)
                      </span>
                    </label>
                    <input
                      id={fid(`${key}-name`)}
                      type="text"
                      maxLength={studyLimits.short.max}
                      value={c.name}
                      onChange={setConcept(i, 'name')}
                      aria-invalid={errors[key] ? 'true' : undefined}
                      disabled={status === 'submitting'}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={fid(key)}>Description, message, or price</label>
                    <textarea
                      id={fid(key)}
                      maxLength={studyLimits.concept.max}
                      value={c.description}
                      onChange={setConcept(i, 'description')}
                      aria-invalid={errors[key] ? 'true' : undefined}
                      style={{ minHeight: '6rem' }}
                      disabled={status === 'submitting'}
                    />
                  </div>
                  {c.url || linkOpen[i] ? (
                    <div className="field">
                      <label htmlFor={fid(`${key}-url`)}>
                        Link to non-sensitive material{' '}
                        <span className="muted" style={{ fontWeight: 400 }}>
                          (optional)
                        </span>
                      </label>
                      <input
                        id={fid(`${key}-url`)}
                        type="url"
                        inputMode="url"
                        maxLength={studyLimits.url.max}
                        placeholder="https://"
                        value={c.url}
                        onChange={setConcept(i, 'url')}
                        disabled={status === 'submitting'}
                      />
                    </div>
                  ) : (
                    <button type="button" className="btn-link" onClick={() => setLinkOpen((o) => ({ ...o, [i]: true }))}>
                      + Add a link to non-sensitive material
                    </button>
                  )}
                  {errors[key] && (
                    <p id={fid(`${key}-error`)} className="field__error">
                      {errors[key]}
                    </p>
                  )}
                  {values.concepts.length > 1 && (
                    <button type="button" className="btn btn--secondary btn--small" onClick={() => removeConcept(i)}>
                      Remove concept {String.fromCharCode(65 + i)}
                    </button>
                  )}
                </fieldset>
              );
            })}
            {values.concepts.length < studyLimits.maxConcepts && (
              <p>
                <button type="button" className="btn btn--secondary" onClick={addConcept}>
                  + Add another concept
                </button>
              </p>
            )}

            <Field
              id={fid('extraQuestions')}
              label="Questions you would like included"
              optional
              hint={intakeCopy.extraQuestionsHelper}
              error={errors.extraQuestions}
            >
              {(a) => (
                <textarea
                  {...a}
                  name="extraQuestions"
                  maxLength={studyLimits.optionalText.max}
                  value={values.extraQuestions}
                  onChange={set('extraQuestions')}
                  style={{ minHeight: '6rem' }}
                />
              )}
            </Field>
          </>
        )}

        {/* ---------- Screen 4 ---------- */}
        {step === 3 && (
          <>
            <div className="wizard__row">
              <Field id={fid('name')} label="Name" error={errors.name}>
                {(a) => (
                  <input
                    {...a}
                    type="text"
                    name="name"
                    autoComplete="name"
                    required
                    maxLength={studyLimits.short.max}
                    value={values.name}
                    onChange={set('name')}
                  />
                )}
              </Field>
              <Field id={fid('company')} label="Company" error={errors.company}>
                {(a) => (
                  <input
                    {...a}
                    type="text"
                    name="company"
                    autoComplete="organization"
                    required
                    maxLength={studyLimits.short.max}
                    value={values.company}
                    onChange={set('company')}
                  />
                )}
              </Field>
            </div>
            <div className="wizard__row">
              <Field id={fid('email')} label="Email" hint={intakeCopy.emailHelper} error={errors.email}>
                {(a) => (
                  <input
                    {...a}
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    maxLength={studyLimits.email.max}
                    value={values.email}
                    onChange={set('email')}
                  />
                )}
              </Field>
              <Field id={fid('role')} label="Role" optional error={errors.role}>
                {(a) => (
                  <input
                    {...a}
                    type="text"
                    name="role"
                    autoComplete="organization-title"
                    maxLength={studyLimits.short.max}
                    value={values.role}
                    onChange={set('role')}
                  />
                )}
              </Field>
            </div>

            <details className="brief-details">
              <summary>Review your brief</summary>
              <BriefSummary values={values} heading="Your brief" compact />
            </details>

            <div className="notice" role="note">
              <p>
                <strong>Before you submit.</strong> {intakeCopy.disclosure} {intakeCopy.dataHandling}{' '}
                <Link to="/privacy">Privacy notice</Link>.
              </p>
            </div>

            <div className="field">
              <label className="check" data-invalid={errors.consent ? 'true' : undefined}>
                <input
                  id={fid('consent')}
                  type="checkbox"
                  name="consent"
                  required
                  checked={values.consent}
                  onChange={setBool('consent')}
                  aria-invalid={errors.consent ? 'true' : undefined}
                  aria-describedby={errors.consent ? fid('consent-error') : undefined}
                />
                <span>{intakeCopy.consent}</span>
              </label>
              {errors.consent && (
                <p id={fid('consent-error')} className="field__error">
                  {errors.consent}
                </p>
              )}
            </div>
          </>
        )}

        {/* Honeypot — hidden from people, visible to naive bots */}
        <div className="honeypot" aria-hidden="true">
          <label htmlFor={fid('website')}>Website</label>
          <input id={fid('website')} name="website" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
        </div>

        {/* Navigation */}
        <div className="wizard__nav">
          {step > 0 ? (
            <button type="button" className="btn btn--secondary" onClick={back} disabled={status === 'submitting'}>
              Back
            </button>
          ) : (
            <span />
          )}
          {isLast ? (
            <button type="submit" className="btn btn--primary" disabled={disabled} aria-disabled={disabled}>
              {status === 'submitting' ? 'Sending…' : intakeCopy.submit}
            </button>
          ) : (
            <button type="submit" className="btn btn--primary">
              Next
            </button>
          )}
        </div>
        <span className="small muted" aria-live="polite">
          {status === 'submitting' ? 'Sending your request.' : ''}
        </span>
      </div>
    </form>
  );
}

/** Read-only summary of the brief, used on the review step and the success screen. */
function BriefSummary({ values, heading, compact }: { values: StudyInput; heading: string; compact?: boolean }) {
  const dtBase = decisionTypes.find((d) => d.id === values.decisionType)?.label ?? '—';
  const dt = values.decisionType === 'other' && values.otherDetail.trim() ? `${dtBase}: ${values.otherDetail.trim()}` : dtBase;
  const bt = buyerTypes.find((b) => b.id === values.buyerType)?.label ?? 'Not sure';
  const concepts = values.concepts.filter((c) => c.name.trim() || c.description.trim());
  const or = (s: string) => s.trim() || '—';
  return (
    <section className="brief" data-compact={compact ? 'true' : undefined} aria-label={heading}>
      <h3>{heading}</h3>
      <dl>
        <div>
          <dt>Decision</dt>
          <dd>
            <strong>{dt}.</strong> {or(values.question)}
            {values.context.trim() && (
              <>
                <br />
                <span className="muted">Context: {values.context.trim()}</span>
              </>
            )}
          </dd>
        </div>
        <div>
          <dt>Audience</dt>
          <dd>
            {or(values.audience)}
            <br />
            <span className="muted">
              {[values.geography.trim(), bt !== 'Not sure' ? bt : ''].filter(Boolean).join(' · ') || '—'}
            </span>
          </dd>
        </div>
        <div>
          <dt>Concepts</dt>
          <dd>
            {concepts.length ? (
              <ol className="brief__concepts">
                {concepts.map((c, i) => (
                  <li key={i}>
                    <strong>{c.name.trim() || `Concept ${String.fromCharCode(65 + i)}`}</strong>
                    {c.description.trim() && <> — {c.description.trim()}</>}
                    {c.url.trim() && (
                      <>
                        {' '}
                        <span className="muted">({c.url.trim()})</span>
                      </>
                    )}
                  </li>
                ))}
              </ol>
            ) : (
              '—'
            )}
            {values.extraQuestions.trim() && <span className="muted">Questions to include: {values.extraQuestions.trim()}</span>}
          </dd>
        </div>
        {!compact && (
          <div>
            <dt>Send to</dt>
            <dd>
              {or(values.name)}, {or(values.company)} · {or(values.email)}
              {values.role.trim() && <> · {values.role.trim()}</>}
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}
