import { useState, type FormEvent } from 'react';
import { packages } from '@/content/decisionStudy';
import { fmtDate, portalApi } from '@/lib/portalClient';
import { portalSteps, statusLabel, type PortalMessage, type PortalStatus, type PortalStudy } from '@/lib/portalTypes';

/** Status strip: the linear steps, with 'needs_input' / 'closed' shown as a badge on the current step. */
export function StatusStrip({ status }: { status: PortalStatus }) {
  const linear: PortalStatus = status === 'needs_input' ? 'reviewing' : status === 'closed' ? 'delivered' : status;
  const idx = portalSteps.findIndex((s) => s.id === linear);
  return (
    <ol className="stepper stepper--dense portal-strip" aria-label="Study progress">
      {portalSteps.map((s, i) => (
        <li key={s.id} className="stepper__item" data-state={i < idx ? 'done' : i === idx ? 'current' : 'todo'} aria-current={i === idx ? 'step' : undefined}>
          <span className="stepper__num" aria-hidden="true">
            {i + 1}
          </span>
          <span className="stepper__label">
            {s.label}
            {i === idx && (status === 'needs_input' || status === 'closed') && <span className="portal-badge">{statusLabel[status]}</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function Thread({ messages, viewer }: { messages: PortalMessage[]; viewer: 'client' | 'admin' }) {
  if (!messages.length) return <p className="muted small">No messages yet.</p>;
  return (
    <ol className="portal-thread">
      {messages.map((m) => {
        const mine = (viewer === 'admin') === (m.author === 'savant');
        return (
          <li key={m.id} className="portal-msg" data-mine={mine ? 'true' : undefined}>
            <p className="portal-msg__meta small muted">
              {m.author === 'savant' ? 'Savant' : 'You'} · {fmtDate(m.createdAt)}
            </p>
            <p className="portal-msg__body">{m.body}</p>
          </li>
        );
      })}
    </ol>
  );
}

export function Composer({ studyRef, onSent, label = 'Send' }: { studyRef: string; onSent: () => void; label?: string }) {
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    setErr('');
    const r = await portalApi.message(studyRef, body.trim());
    setBusy(false);
    if (r.ok) {
      setBody('');
      onSent();
    } else setErr(r.message ?? 'Could not send.');
  }
  return (
    <form className="portal-composer" onSubmit={submit}>
      <label className="visually-hidden" htmlFor="portal-msg">
        Message
      </label>
      <textarea id="portal-msg" rows={4} maxLength={4000} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a message…" />
      {err && <p className="field__error">{err}</p>}
      <p>
        <button type="submit" className="btn btn--primary" disabled={busy || !body.trim()}>
          {busy ? 'Sending…' : label}
        </button>
      </p>
    </form>
  );
}

/** Read-only rendering of the questionnaire answers, in the order the client filled them. */
export function Answers({ a }: { a: Record<string, unknown> }) {
  const s = (k: string) => (typeof a[k] === 'string' && (a[k] as string).trim() ? (a[k] as string) : '—');
  const pkg = packages.find((p) => p.id === a.packageId);
  const options = Array.isArray(a.options) ? (a.options as { name?: string; description?: string; expectation?: string }[]).filter((o) => o?.name || o?.description) : [];
  const audiences = Array.isArray(a.audiences) ? (a.audiences as Record<string, string>[]).filter((x) => x?.description) : [];
  const questions = Array.isArray(a.questions) ? (a.questions as string[]).filter((q) => q?.trim()) : [];
  const Row = ({ k, v }: { k: string; v: string }) => (
    <div>
      <dt>{k}</dt>
      <dd>{v}</dd>
    </div>
  );
  return (
    <div className="portal-answers">
      <h3>Package</h3>
      <p>{pkg ? `${pkg.name} (${pkg.price})` : s('packageId')}</p>
      <h3>The decision</h3>
      <dl>
        <Row k="Decision" v={s('decision')} />
        <Row k="Owner / approvers" v={s('owner')} />
        <Row k="Decide by" v={s('decideBy')} />
        <Row k="If wrong" v={s('stakes')} />
        <Row k="Criteria" v={s('criteria')} />
        <Row k="Current leaning" v={s('currentLeaning')} />
        <Row k="What would change their mind" v={s('changeMind')} />
        <Row k="Constraints" v={s('constraints')} />
      </dl>
      <h3>Options</h3>
      <ol>
        {options.map((o, i) => (
          <li key={i}>
            <strong>{o.name || `Option ${i + 1}`}</strong> — {o.description || '—'}
            {o.expectation ? <span className="muted"> (expects: {o.expectation})</span> : null}
          </li>
        ))}
      </ol>
      <h3>Audiences</h3>
      <ol>
        {audiences.map((x, i) => (
          <li key={i}>
            <strong>{x.name || `Audience ${i + 1}`}</strong> — {x.description}
            {[x.roles, x.geography, x.stage].filter(Boolean).length ? <span className="muted"> · {[x.roles, x.geography, x.stage].filter(Boolean).join(' · ')}</span> : null}
            {x.knownObjections ? <span className="muted"> · objections: {x.knownObjections}</span> : null}
          </li>
        ))}
      </ol>
      <dl>
        <Row k="Buying committee" v={s('buyingCommittee')} />
      </dl>
      <h3>What you already know</h3>
      <dl>
        <Row k="Evidence" v={s('evidence')} />
        <Row k="Competitors / alternatives" v={s('competitors')} />
        <Row k="Prior research" v={s('priorResearch')} />
      </dl>
      <h3>Questions the memo must answer</h3>
      <ol>
        {questions.map((q, i) => (
          <li key={i}>{q}</li>
        ))}
      </ol>
      <dl>
        <Row k="Hypotheses" v={s('hypotheses')} />
        <Row k="Out of scope" v={s('outOfScope')} />
      </dl>
      <h3>Deliverable and timing</h3>
      <dl>
        <Row k="Readout attendees" v={s('readoutAttendees')} />
        <Row k="Format" v={s('format')} />
        <Row k="Needed by" v={s('deadline')} />
        <Row k="Confidentiality" v={s('confidentiality')} />
      </dl>
      <h3>Commercial</h3>
      <dl>
        <Row k="Billing contact" v={s('billingContact')} />
        <Row k="Purchase order required" v={s('poRequired')} />
        <Row k="Preferred payment" v={s('paymentMethod')} />
      </dl>
    </div>
  );
}

export function ReportBox({ study }: { study: PortalStudy }) {
  if (!study.hasReport) return null;
  return (
    <div className="aside-box portal-report">
      <h2>Your memo</h2>
      <p>
        <a className="btn btn--primary" href={`/api/portal/study/${study.ref}/report`}>
          Download {study.reportName ?? 'report'}
        </a>
      </p>
    </div>
  );
}
