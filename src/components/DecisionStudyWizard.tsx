import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { packages, studyCopy, studySteps, terms } from '@/content/decisionStudy';
import {
  coerceDs,
  dsConfig,
  dsLimits,
  emptyAudience,
  emptyDs,
  emptyOption,
  isFreeMail,
  validateDsStep,
  type DsErrors,
  type DsInput,
} from '@/lib/decisionStudyConfig';
import { captureSource } from '@/components/StudyWizard';
import { track } from '@/lib/analytics';

type Status = 'idle' | 'submitting' | 'success' | 'error';

function loadDraft(): DsInput | null {
  try {
    const raw = window.localStorage.getItem(dsConfig.draftKey);
    if (!raw) return null;
    const d = coerceDs(JSON.parse(raw) as Record<string, unknown>);
    if (d.options.length < 2) d.options = [...d.options, ...Array.from({ length: 2 - d.options.length }, emptyOption)];
    if (d.audiences.length < 1) d.audiences = [emptyAudience()];
    if (d.questions.length < 3) d.questions = [...d.questions, ...Array.from({ length: 3 - d.questions.length }, () => '')];
    return d;
  } catch {
    return null;
  }
}
function saveDraft(v: DsInput): void {
  try {
    window.localStorage.setItem(dsConfig.draftKey, JSON.stringify(v));
  } catch {
    /* convenience only */
  }
}
function clearDraft(): void {
  try {
    window.localStorage.removeItem(dsConfig.draftKey);
  } catch {
    /* ignore */
  }
}

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

export interface DecisionStudyWizardProps {
  fetchImpl?: typeof fetch;
}

export default function DecisionStudyWizard({ fetchImpl }: DecisionStudyWizardProps) {
  const id = useId();
  const fid = (k: string) => `${id}-${k}`;
  const [values, setValues] = useState<DsInput>(emptyDs);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<DsErrors>({});
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [serverMessage, setServerMessage] = useState('');
  const [reference, setReference] = useState('');
  const [copySent, setCopySent] = useState(true);
  const [restored, setRestored] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const startedAt = useRef<number>(Date.now());

  useEffect(() => {
    const d = loadDraft();
    if (d) {
      setValues(d);
      setRestored(true);
    }
  }, []);
  useEffect(() => {
    if (status !== 'success') saveDraft(values);
  }, [values, status]);
  useEffect(() => {
    if (step > 0 || status === 'idle') headingRef.current?.focus();
  }, [step, status]);
  useEffect(() => {
    if (status === 'success' || status === 'error') statusRef.current?.focus();
  }, [status]);

  const set = (key: keyof DsInput) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [key]: e.target.value }));
  const setOption = (i: number, key: keyof DsInput['options'][number]) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, options: v.options.map((o, j) => (j === i ? { ...o, [key]: e.target.value } : o)) }));
  const setAudience = (i: number, key: keyof DsInput['audiences'][number]) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, audiences: v.audiences.map((a, j) => (j === i ? { ...a, [key]: e.target.value } : a)) }));
  const setQuestion = (i: number) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, questions: v.questions.map((q, j) => (j === i ? e.target.value : q)) }));

  function focusFirstError(errs: DsErrors) {
    const first = Object.keys(errs)[0];
    if (!first) return;
    const el = document.getElementById(fid(first));
    const target =
      el && !(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement)
        ? el.querySelector<HTMLElement>('input, textarea, select')
        : el;
    target?.focus();
  }

  const stepFor = (k: string): number => {
    if (k === 'reference' || k === 'reportFeedback') return 0;
    if (['decision', 'owner', 'decideBy', 'stakes', 'criteria', 'currentLeaning', 'changeMind', 'constraints'].includes(k)) return 1;
    if (k.startsWith('option')) return 2;
    if (k.startsWith('audience') || k === 'buyingCommittee') return 3;
    if (['evidence', 'competitors', 'priorResearch'].includes(k)) return 4;
    if (k.startsWith('question') || k === 'hypotheses' || k === 'outOfScope') return 5;
    if (['readoutAttendees', 'format', 'deadline', 'confidentiality'].includes(k)) return 6;
    return 7;
  };

  function next() {
    const errs = validateDsStep(step, values);
    setErrors(errs);
    if (Object.keys(errs).length) {
      focusFirstError(errs);
      return;
    }
    setStep((s) => Math.min(s + 1, studySteps.length - 1));
    window.scrollTo({ top: 0 });
  }
  function back() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0 });
  }

  const disabled = !dsConfig.enabled || status === 'submitting';

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (step < studySteps.length - 1) {
      next();
      return;
    }
    if (disabled) return;
    const errs = validateDsStep(7, values);
    if (Object.keys(errs).length) {
      setErrors(errs);
      focusFirstError(errs);
      return;
    }
    setStatus('submitting');
    setServerMessage('');
    track('ds_form_submitted', { packageId: values.packageId });
    try {
      const res = await (fetchImpl ?? fetch)(dsConfig.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...values, source: captureSource(), website: honeypot, elapsedMs: Date.now() - startedAt.current }),
      });
      let data: { ok?: boolean; message?: string; errors?: DsErrors; reference?: string; copySent?: boolean } = {};
      try {
        data = await res.json();
      } catch {
        /* failure below */
      }
      if (res.ok && data.ok) {
        setReference(data.reference ?? '');
        setCopySent(data.copySent !== false);
        setStatus('success');
        clearDraft();
        track('ds_form_accepted', { packageId: values.packageId });
      } else {
        if (data.errors) {
          setErrors(data.errors);
          setStep(Math.min(...Object.keys(data.errors).map(stepFor)));
        }
        setServerMessage(data.message || 'The questionnaire could not be sent. Your answers are still here — please try again.');
        setStatus('error');
        track('ds_form_failed', { httpStatus: res.status });
      }
    } catch {
      setServerMessage('We could not reach the server. Check your connection and try again — your answers are still here.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="wizard-success">
        <p className="eyebrow">Received</p>
        <h2>{studyCopy.successHeadline}</h2>
        {reference && (
          <p className="wizard-success__ref">
            Your reference: <strong>{reference}</strong>
          </p>
        )}
        <p>{studyCopy.successBody}</p>
        {!copySent && <p className="notice notice--warning">{studyCopy.successNotSent(values.email.trim())}</p>}
        <p>
          <Link to="/" className="link-arrow">
            Back to Savant Analytics
          </Link>
        </p>
      </div>
    );
  }

  const current = studySteps[step];
  const isLast = step === studySteps.length - 1;
  const textarea = (key: keyof DsInput, rows = 4, max = dsLimits.text.max) => (a: object) => (
    <textarea {...a} name={key} rows={rows} maxLength={max} value={String(values[key])} onChange={set(key)} />
  );
  const input = (key: keyof DsInput, max = dsLimits.short.max, extra: Record<string, string> = {}) => (a: object) => (
    <input {...a} type="text" name={key} maxLength={max} value={String(values[key])} onChange={set(key)} {...extra} />
  );

  return (
    <form className="wizard" onSubmit={onSubmit} noValidate aria-labelledby={fid('heading')}>
      <ol className="stepper stepper--dense" aria-label="Progress">
        {studySteps.map((s, i) => (
          <li key={s.id} className="stepper__item" data-state={i < step ? 'done' : i === step ? 'current' : 'todo'} aria-current={i === step ? 'step' : undefined}>
            <span className="stepper__num" aria-hidden="true">
              {i + 1}
            </span>
            <span className="stepper__label">{s.title}</span>
          </li>
        ))}
      </ol>

      <div className="wizard__panel">
        <p className="wizard__hint">
          Step {step + 1} of {studySteps.length}
        </p>
        <h2 id={fid('heading')} ref={headingRef} tabIndex={-1}>
          {current.title}
        </h2>

        {!dsConfig.enabled && (
          <div className="notice notice--warning" role="status">
            <p>{studyCopy.preview}</p>
          </div>
        )}
        {restored && step === 0 && (
          <p className="notice" role="status">
            We restored your earlier answers from this browser.{' '}
            <button
              type="button"
              className="link-button"
              onClick={() => {
                clearDraft();
                setValues(emptyDs());
                setRestored(false);
              }}
            >
              Start over
            </button>
          </p>
        )}
        {status === 'error' && (
          <div ref={statusRef} tabIndex={-1} role="alert" className="notice notice--error">
            <p>{serverMessage}</p>
          </div>
        )}

        {/* 0 — free report */}
        {step === 0 && (
          <>
            <Field id={fid('reference')} label="Free-report reference" optional hint={studyCopy.referenceHelper} error={errors.reference}>
              {input('reference', 40, { placeholder: 'TYI-2026-AB12CD', autoCapitalize: 'characters' })}
            </Field>
            <Field id={fid('reportFeedback')} label="What was useful, and what was missing?" optional hint={studyCopy.usefulHelper} error={errors.reportFeedback}>
              {textarea('reportFeedback', 5)}
            </Field>
          </>
        )}

        {/* 1 — decision */}
        {step === 1 && (
          <>
            <Field id={fid('decision')} label="The decision, in one or two sentences" hint={studyCopy.decisionHelper} error={errors.decision}>
              {textarea('decision', 3)}
            </Field>
            <div className="wizard__row">
              <Field id={fid('owner')} label="Who decides, and who must agree?" hint={studyCopy.ownerHelper} error={errors.owner}>
                {input('owner')}
              </Field>
              <Field id={fid('decideBy')} label="Decision date" error={errors.decideBy}>
                {input('decideBy', dsLimits.short.max, { placeholder: 'e.g. 15 January, or "end of Q1"' })}
              </Field>
            </div>
            <Field id={fid('stakes')} label="What happens if this goes wrong?" error={errors.stakes}>
              {textarea('stakes', 3)}
            </Field>
            <Field id={fid('criteria')} label="Decision criteria, in order of importance" hint={studyCopy.criteriaHelper} error={errors.criteria}>
              {textarea('criteria', 4)}
            </Field>
            <Field id={fid('currentLeaning')} label="Which way are you leaning today, and why?" optional error={errors.currentLeaning}>
              {textarea('currentLeaning', 3)}
            </Field>
            <Field id={fid('changeMind')} label="What finding would change your mind?" hint={studyCopy.changeMindHelper} error={errors.changeMind}>
              {textarea('changeMind', 3)}
            </Field>
            <Field id={fid('constraints')} label="Constraints we should know about" optional hint="Budget, regulatory, technical, contractual, timing." error={errors.constraints}>
              {textarea('constraints', 3)}
            </Field>
          </>
        )}

        {/* 2 — options */}
        {step === 2 && (
          <>
            <p className="muted" style={{ marginTop: 0 }}>
              {studyCopy.optionsIntro}
            </p>
            {errors.options && (
              <p className="field__error" id={fid('options')}>
                {errors.options}
              </p>
            )}
            {values.options.map((o, i) => (
              <fieldset key={i} className="concept">
                <legend>Option {i + 1}</legend>
                <Field id={fid(`option-${i}-name`)} label="Name" error={errors[`option-${i}-name`]}>
                  {(a) => <input {...a} type="text" maxLength={dsLimits.short.max} value={o.name} onChange={setOption(i, 'name')} />}
                </Field>
                <Field id={fid(`option-${i}-description`)} label="Description — what actually differs" error={errors[`option-${i}-description`]}>
                  {(a) => <textarea {...a} rows={4} maxLength={dsLimits.text.max} value={o.description} onChange={setOption(i, 'description')} />}
                </Field>
                <Field id={fid(`option-${i}-expectation`)} label="What you expect this option to do" optional hint="Stated so the study can test it, not assume it." error={errors[`option-${i}-expectation`]}>
                  {(a) => <textarea {...a} rows={2} maxLength={dsLimits.text.max} value={o.expectation} onChange={setOption(i, 'expectation')} />}
                </Field>
                {values.options.length > 2 && (
                  <button type="button" className="link-button" onClick={() => setValues((v) => ({ ...v, options: v.options.filter((_, j) => j !== i) }))}>
                    Remove option {i + 1}
                  </button>
                )}
              </fieldset>
            ))}
            {values.options.length < dsConfig.maxOptions && (
              <button type="button" className="btn btn--secondary" onClick={() => setValues((v) => ({ ...v, options: [...v.options, emptyOption()] }))}>
                Add an option ({values.options.length} of {dsConfig.maxOptions})
              </button>
            )}
          </>
        )}

        {/* 3 — audiences */}
        {step === 3 && (
          <>
            <p className="muted" style={{ marginTop: 0 }}>
              {studyCopy.audiencesIntro}
            </p>
            {errors.audiences && (
              <p className="field__error" id={fid('audiences')}>
                {errors.audiences}
              </p>
            )}
            {values.audiences.map((a, i) => (
              <fieldset key={i} className="concept">
                <legend>Audience {i + 1}</legend>
                <Field id={fid(`audience-${i}-name`)} label="Short name" error={errors[`audience-${i}-name`]}>
                  {(p) => <input {...p} type="text" maxLength={dsLimits.short.max} placeholder="e.g. Risk-cautious IT" value={a.name} onChange={setAudience(i, 'name')} />}
                </Field>
                <Field id={fid(`audience-${i}-description`)} label="Who they are" error={errors[`audience-${i}-description`]}>
                  {(p) => <textarea {...p} rows={3} maxLength={dsLimits.text.max} value={a.description} onChange={setAudience(i, 'description')} />}
                </Field>
                <div className="wizard__row">
                  <Field id={fid(`audience-${i}-roles`)} label="Roles / titles" optional error={errors[`audience-${i}-roles`]}>
                    {(p) => <input {...p} type="text" maxLength={dsLimits.short.max} value={a.roles} onChange={setAudience(i, 'roles')} />}
                  </Field>
                  <Field id={fid(`audience-${i}-geography`)} label="Geography" optional error={errors[`audience-${i}-geography`]}>
                    {(p) => <input {...p} type="text" maxLength={dsLimits.short.max} value={a.geography} onChange={setAudience(i, 'geography')} />}
                  </Field>
                </div>
                <Field id={fid(`audience-${i}-stage`)} label="Where they are in the buying process" optional hint="New to the category, evaluating, existing customer at renewal…" error={errors[`audience-${i}-stage`]}>
                  {(p) => <input {...p} type="text" maxLength={dsLimits.short.max} value={a.stage} onChange={setAudience(i, 'stage')} />}
                </Field>
                <Field id={fid(`audience-${i}-knownObjections`)} label="Objections you already hear from them" optional error={errors[`audience-${i}-knownObjections`]}>
                  {(p) => <textarea {...p} rows={2} maxLength={dsLimits.text.max} value={a.knownObjections} onChange={setAudience(i, 'knownObjections')} />}
                </Field>
                {values.audiences.length > 1 && (
                  <button type="button" className="link-button" onClick={() => setValues((v) => ({ ...v, audiences: v.audiences.filter((_, j) => j !== i) }))}>
                    Remove audience {i + 1}
                  </button>
                )}
              </fieldset>
            ))}
            {values.audiences.length < dsConfig.maxAudiences && (
              <button type="button" className="btn btn--secondary" onClick={() => setValues((v) => ({ ...v, audiences: [...v.audiences, emptyAudience()] }))}>
                Add an audience ({values.audiences.length} of {dsConfig.maxAudiences})
              </button>
            )}
            <Field id={fid('buyingCommittee')} label="Who else is involved in the purchase decision?" optional hint="Finance, security, procurement, end users — and what each cares about." error={errors.buyingCommittee}>
              {textarea('buyingCommittee', 3)}
            </Field>
          </>
        )}

        {/* 4 — evidence */}
        {step === 4 && (
          <>
            <p className="muted" style={{ marginTop: 0 }}>
              {studyCopy.evidenceIntro}
            </p>
            <Field id={fid('evidence')} label="Evidence you already have" optional error={errors.evidence}>
              {textarea('evidence', 6, dsLimits.long.max)}
            </Field>
            <Field id={fid('competitors')} label="Competitors and alternatives your audience compares you to" optional hint="Including 'do nothing' and 'build it ourselves'." error={errors.competitors}>
              {textarea('competitors', 3)}
            </Field>
            <Field id={fid('priorResearch')} label="Prior research on this question" optional hint="Internal or external, and what it concluded." error={errors.priorResearch}>
              {textarea('priorResearch', 3)}
            </Field>
          </>
        )}

        {/* 5 — questions */}
        {step === 5 && (
          <>
            <p className="muted" style={{ marginTop: 0 }}>
              {studyCopy.questionsIntro}
            </p>
            {errors.questions && (
              <p className="field__error" id={fid('questions')}>
                {errors.questions}
              </p>
            )}
            {values.questions.map((q, i) => (
              <Field key={i} id={fid(`question-${i}`)} label={`Question ${i + 1}`} optional={i > 0} error={errors[`question-${i}`]}>
                {(a) => <input {...a} type="text" maxLength={dsLimits.short.max * 2} value={q} onChange={setQuestion(i)} />}
              </Field>
            ))}
            {values.questions.length < dsConfig.maxQuestions && (
              <button type="button" className="btn btn--secondary" onClick={() => setValues((v) => ({ ...v, questions: [...v.questions, ''] }))}>
                Add a question ({values.questions.length} of {dsConfig.maxQuestions})
              </button>
            )}
            <Field id={fid('hypotheses')} label="Hypotheses you want tested" optional hint="'Cost controllers will reject per-seat pricing above $12.' The study tries to disprove each one." error={errors.hypotheses}>
              {textarea('hypotheses', 4)}
            </Field>
            <Field id={fid('outOfScope')} label="Explicitly out of scope" optional hint="Anything we should not test or mention." error={errors.outOfScope}>
              {textarea('outOfScope', 2)}
            </Field>
          </>
        )}

        {/* 6 — logistics */}
        {step === 6 && (
          <>
            <p className="muted" style={{ marginTop: 0 }}>
              {studyCopy.logisticsIntro}
            </p>
            <Field id={fid('readoutAttendees')} label="Who attends the readout?" hint="Names and roles. The decision owner should be in the room." error={errors.readoutAttendees}>
              {input('readoutAttendees', dsLimits.short.max * 2)}
            </Field>
            <Field id={fid('format')} label="Preferred memo format" optional hint="PDF memo is standard; say if you need slides, a board-ready one-pager, or raw tables." error={errors.format}>
              {input('format', dsLimits.short.max * 2)}
            </Field>
            <Field id={fid('deadline')} label="When do you need the memo?" hint="Decision Study: 5 business days from kickoff. With Human Calibration: 10." error={errors.deadline}>
              {input('deadline')}
            </Field>
            <Field id={fid('confidentiality')} label="Confidentiality requirements" optional hint="If you need an NDA before kickoff, say so; our standard terms include mutual confidentiality." error={errors.confidentiality}>
              {textarea('confidentiality', 2)}
            </Field>
          </>
        )}

        {/* 7 — commercial + contact */}
        {step === 7 && (
          <>
            <div className="field" role="radiogroup" aria-labelledby={fid('packageId-label')} id={fid('packageId')}>
              <p id={fid('packageId-label')} className="field__label">
                Package
              </p>
              {errors.packageId && <p className="field__error">{errors.packageId}</p>}
              <div className="packages">
                {packages.map((p) => (
                  <label key={p.id} className="package" data-selected={values.packageId === p.id ? 'true' : undefined}>
                    <input type="radio" name="packageId" value={p.id} checked={values.packageId === p.id} onChange={() => setValues((v) => ({ ...v, packageId: p.id }))} />
                    <span className="package__head">
                      <strong>{p.name}</strong>
                      <span className="package__price">{p.price}</span>
                    </span>
                    <span className="small muted">{p.intro}</span>
                    <span className="package__summary">{p.summary}</span>
                    <ul className="checklist small">
                      {p.includes.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </label>
                ))}
              </div>
            </div>

            <div className="wizard__row">
              <Field id={fid('name')} label="Your name" error={errors.name}>
                {input('name', dsLimits.short.max, { autoComplete: 'name' })}
              </Field>
              <Field id={fid('role')} label="Role" optional error={errors.role}>
                {input('role', dsLimits.short.max, { autoComplete: 'organization-title' })}
              </Field>
            </div>
            <div className="wizard__row">
              <Field id={fid('company')} label="Company" error={errors.company}>
                {input('company', dsLimits.short.max, { autoComplete: 'organization' })}
              </Field>
              <Field id={fid('email')} label="Email" hint="Company email preferred; with a personal address we ask for your company website." error={errors.email}>
                {(a) => <input {...a} type="email" name="email" autoComplete="email" maxLength={dsLimits.email.max} value={values.email} onChange={set('email')} />}
              </Field>
            </div>
            {isFreeMail(values.email) && (
              <Field id={fid('companySite')} label="Company website" error={errors.companySite}>
                {input('companySite', 200, { placeholder: 'example.com', inputMode: 'url' })}
              </Field>
            )}
            <div className="wizard__row">
              <Field id={fid('phone')} label="Phone" optional error={errors.phone}>
                {(a) => <input {...a} type="tel" name="phone" autoComplete="tel" maxLength={40} value={values.phone} onChange={set('phone')} />}
              </Field>
              <Field id={fid('billingContact')} label="Billing contact" optional hint="If invoices go to someone else." error={errors.billingContact}>
                {input('billingContact', dsLimits.short.max * 2)}
              </Field>
            </div>
            <div className="wizard__row">
              <div className="field" role="radiogroup" aria-labelledby={fid('poRequired-label')} id={fid('poRequired')}>
                <p id={fid('poRequired-label')} className="field__label">
                  Do you need a purchase order?
                </p>
                {(['yes', 'no'] as const).map((o) => (
                  <label key={o} className="check">
                    <input type="radio" name="poRequired" value={o} checked={values.poRequired === o} onChange={() => setValues((v) => ({ ...v, poRequired: o }))} />
                    <span>{o === 'yes' ? 'Yes — we will need to raise a PO' : 'No'}</span>
                  </label>
                ))}
                {errors.poRequired && <p className="field__error">{errors.poRequired}</p>}
              </div>
              <div className="field" role="radiogroup" aria-labelledby={fid('paymentMethod-label')} id={fid('paymentMethod')}>
                <p id={fid('paymentMethod-label')} className="field__label">
                  Preferred payment
                </p>
                {(
                  [
                    ['card', 'Card'],
                    ['ach', 'ACH (US bank transfer)'],
                    ['wire', 'Wire'],
                  ] as const
                ).map(([o, l]) => (
                  <label key={o} className="check">
                    <input type="radio" name="paymentMethod" value={o} checked={values.paymentMethod === o} onChange={() => setValues((v) => ({ ...v, paymentMethod: o }))} />
                    <span>{l}</span>
                  </label>
                ))}
                {errors.paymentMethod && <p className="field__error">{errors.paymentMethod}</p>}
              </div>
            </div>

            <div className="notice" role="note">
              <p>
                <strong>Terms.</strong> These are the terms of the engagement letter you will receive with the invoice.
              </p>
              <ol className="terms">
                {terms.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ol>
            </div>
            <div className="field">
              <label className="check" data-invalid={errors.consent ? 'true' : undefined}>
                <input id={fid('consent')} type="checkbox" name="consent" checked={values.consent} onChange={(e) => setValues((v) => ({ ...v, consent: e.target.checked }))} aria-invalid={errors.consent ? 'true' : undefined} />
                <span>{studyCopy.consent}</span>
              </label>
              {errors.consent && <p className="field__error">{errors.consent}</p>}
            </div>
          </>
        )}

        <div className="honeypot" aria-hidden="true">
          <label htmlFor={fid('website')}>Website</label>
          <input id={fid('website')} name="website" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
        </div>

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
              {status === 'submitting' ? 'Sending…' : studyCopy.submit}
            </button>
          ) : (
            <button type="submit" className="btn btn--primary">
              Next
            </button>
          )}
        </div>
        <span className="small muted" aria-live="polite">
          {status === 'submitting' ? 'Sending your questionnaire.' : ''}
        </span>
      </div>
    </form>
  );
}
