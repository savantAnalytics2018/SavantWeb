import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import DetailShell from '@/components/DetailShell';
import { Answers, Composer, ReportBox, StatusStrip, Thread } from '@/components/PortalParts';
import { pageMeta } from '@/content/meta';
import { useHead } from '@/lib/head';
import { fmtDate, portalApi } from '@/lib/portalClient';
import { portalSteps, statusLabel, type PortalStudy } from '@/lib/portalTypes';

/**
 * The client's study page (twindetail.<domain>/s/<reference>). Client-rendered: the prerendered
 * shell is served for any /s/* path and this component fetches the study with the cookie set by
 * the magic link. Without a valid cookie it shows the sign-in box (reference + email → new link).
 */
export default function StudyPortal() {
  useHead(pageMeta.twinDetailPortal);
  const params = useParams();
  const location = useLocation();
  // On the detail host the route is /s/:ref; on the main host /twin-detail/s/:ref. During prerender there is no ref.
  const ref = (params.ref ?? location.pathname.split('/').filter(Boolean).pop() ?? '').toUpperCase();
  const isRef = /^DS-\d{4}-[A-Z0-9]{6}$/.test(ref);
  const expired = new URLSearchParams(location.search).get('expired') === '1';

  const [state, setState] = useState<'loading' | 'ready' | 'signin' | 'error'>(isRef ? 'loading' : 'signin');
  const [study, setStudy] = useState<PortalStudy | null>(null);
  const [viewer, setViewer] = useState<'client' | 'admin'>('client');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!isRef) return;
    const r = await portalApi.study(ref);
    if (r.ok && r.data?.study) {
      setStudy(r.data.study);
      setViewer(r.data.viewer);
      setState('ready');
    } else if (r.status === 401 || r.status === 404) {
      setState('signin');
    } else {
      setError(r.message ?? 'Something went wrong.');
      setState('error');
    }
  }, [ref, isRef]);

  useEffect(() => {
    void load();
  }, [load]);

  if (state === 'signin') return <SignIn presetRef={isRef ? ref : ''} expired={expired} />;

  return (
    <DetailShell tag={study ? `Study ${study.ref}` : 'Your study'}>
      <div className="container portal">
        {state === 'loading' && <p className="muted">Loading your study…</p>}
        {state === 'error' && (
          <div className="notice notice--error" role="alert">
            <p>{error}</p>
          </div>
        )}
        {state === 'ready' && study && (
          <>
            <header className="portal__head">
              <p className="eyebrow">{study.company}</p>
              <h1 className="h1--page" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
                {study.ref}
              </h1>
              <p className="lede">
                <strong>{statusLabel[study.status]}.</strong> {portalSteps.find((s) => s.id === (study.status === 'needs_input' ? 'reviewing' : study.status))?.client ?? ''}
                {study.status === 'needs_input' && ' There is a question for you below.'}
              </p>
            </header>
            <StatusStrip status={study.status} />

            <div className="portal__grid">
              <div className="stack">
                <ReportBox study={study} />

                {study.scope && (
                  <section className="aside-box portal-scope" aria-labelledby="scope-h">
                    <h2 id="scope-h">Scope confirmation</h2>
                    <p className="portal-scope__text">{study.scope}</p>
                    {study.status === 'scope_proposed' && viewer === 'client' && <ApproveButton studyRef={study.ref} onDone={load} />}
                    {study.approvedAt && (
                      <p className="small muted">
                        Approved {fmtDate(study.approvedAt)}
                        {study.status !== 'scope_proposed' ? '.' : ''}
                      </p>
                    )}
                  </section>
                )}

                <section aria-labelledby="thread-h">
                  <h2 id="thread-h">Messages</h2>
                  <Thread messages={study.messages} viewer={viewer} />
                  {study.status !== 'closed' && <Composer studyRef={study.ref} onSent={load} />}
                </section>
              </div>

              <aside>
                <details className="portal-answers-wrap" open={study.messages.length === 0}>
                  <summary>Your questionnaire</summary>
                  <Answers a={study.answers} />
                </details>
                <p className="small muted" style={{ marginTop: 'var(--s-4)' }}>
                  Submitted {fmtDate(study.createdAt)}. We read every questionnaire within 24 hours. Need a fresh link to this page later? Request one from the sign-in box.
                </p>
              </aside>
            </div>
          </>
        )}
      </div>
    </DetailShell>
  );
}

function ApproveButton({ studyRef, onDone }: { studyRef: string; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [armed, setArmed] = useState(false);
  async function go() {
    setBusy(true);
    setErr('');
    const r = await portalApi.approve(studyRef);
    setBusy(false);
    if (r.ok) onDone();
    else setErr(r.message ?? 'Could not approve.');
  }
  return (
    <div className="portal-approve">
      {!armed ? (
        <p>
          <button type="button" className="btn btn--primary" onClick={() => setArmed(true)}>
            Approve this scope
          </button>
        </p>
      ) : (
        <>
          <p className="small">Approving locks the scope above. Changes afterwards are a change order, agreed and paid before work continues.</p>
          <p className="portal-approve__row">
            <button type="button" className="btn btn--primary" onClick={go} disabled={busy}>
              {busy ? 'Approving…' : 'Yes, approve'}
            </button>
            <button type="button" className="btn btn--secondary" onClick={() => setArmed(false)} disabled={busy}>
              Not yet
            </button>
          </p>
        </>
      )}
      {err && <p className="field__error">{err}</p>}
    </div>
  );
}

function SignIn({ presetRef, expired }: { presetRef: string; expired: boolean }) {
  const [ref, setRef] = useState(presetRef);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    await portalApi.requestLink(ref.trim(), email.trim());
    setBusy(false);
    setSent(true);
  }
  return (
    <DetailShell tag="Your study">
      <div className="container ds__form">
        <p className="eyebrow">Study page</p>
        <h1 className="h1--page" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
          Sign in with a link
        </h1>
        <p className="lede">No password. Enter your study reference and the email you used, and we send a link that opens your page.</p>
        {expired && (
          <p className="notice notice--warning" role="status">
            That link has expired or was already used. Request a new one below.
          </p>
        )}
        {sent ? (
          <p className="notice" role="status">
            If that reference and email match a study, a link is on its way. It arrives within a minute; check spam if not.
          </p>
        ) : (
          <form className="form" onSubmit={submit} style={{ maxWidth: '28rem' }}>
            <div className="field">
              <label htmlFor="si-ref">Study reference</label>
              <input id="si-ref" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="DS-2026-ABC123" required pattern="[Dd][Ss]-\d{4}-[A-Za-z0-9]{6}" />
              <p className="field__hint">It is in the subject line of the email you received.</p>
            </div>
            <div className="field">
              <label htmlFor="si-email">Email</label>
              <input id="si-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <p>
              <button type="submit" className="btn btn--primary" disabled={busy}>
                {busy ? 'Sending…' : 'Email me a link'}
              </button>
            </p>
          </form>
        )}
      </div>
    </DetailShell>
  );
}
