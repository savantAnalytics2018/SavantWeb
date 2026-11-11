import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import DetailShell from '@/components/DetailShell';
import { Answers, Composer, StatusStrip, Thread } from '@/components/PortalParts';
import { pageMeta } from '@/content/meta';
import { useHead } from '@/lib/head';
import { fmtDate, portalApi } from '@/lib/portalClient';
import { portalStatuses, statusLabel, type PortalStatus, type PortalStudy, type PortalStudySummary } from '@/lib/portalTypes';

/**
 * Savant's view (twindetail.<domain>/admin): every study by status; open one to message,
 * write the scope confirmation, change status, or upload the memo. Signed in by a magic link
 * sent to the STUDY_TO inbox.
 */
export default function AdminPortal() {
  useHead(pageMeta.twinDetailAdmin);
  const location = useLocation();
  const expired = new URLSearchParams(location.search).get('expired') === '1';
  const [state, setState] = useState<'loading' | 'signin' | 'list'>('loading');
  const [studies, setStudies] = useState<PortalStudySummary[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [linkSent, setLinkSent] = useState(false);

  const load = useCallback(async () => {
    const r = await portalApi.adminStudies();
    if (r.ok && r.data?.studies) {
      setStudies(r.data.studies);
      setState('list');
    } else setState('signin');
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  if (state === 'signin') {
    return (
      <DetailShell tag="Admin">
        <div className="container ds__form">
          <h1 className="h1--page" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
            Admin sign-in
          </h1>
          {expired && <p className="notice notice--warning">That link has expired. Request a new one.</p>}
          {linkSent ? (
            <p className="notice">Link sent to the Savant inbox. It works for 7 days.</p>
          ) : (
            <p>
              <button
                type="button"
                className="btn btn--primary"
                onClick={async () => {
                  await portalApi.adminLink();
                  setLinkSent(true);
                }}
              >
                Email me a sign-in link
              </button>
            </p>
          )}
        </div>
      </DetailShell>
    );
  }

  return (
    <DetailShell tag="Admin">
      <div className="container portal">
        {state === 'loading' && <p className="muted">Loading…</p>}
        {state === 'list' && !open && (
          <>
            <h1 className="h1--page" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
              Studies
            </h1>
            {studies.length === 0 ? (
              <p className="muted">No studies yet.</p>
            ) : (
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Company</th>
                    <th>Package</th>
                    <th>Status</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {studies.map((s) => (
                    <tr key={s.ref}>
                      <td>
                        <button type="button" className="link-button" onClick={() => setOpen(s.ref)}>
                          {s.ref}
                        </button>
                      </td>
                      <td>
                        {s.company}
                        <br />
                        <span className="small muted">
                          {s.name} · {s.email}
                        </span>
                      </td>
                      <td>{s.package}</td>
                      <td>
                        <span className="portal-badge" data-status={s.status}>
                          {statusLabel[s.status]}
                        </span>
                      </td>
                      <td className="small">{fmtDate(s.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
        {open && (
          <AdminStudy
            studyRef={open}
            onBack={() => {
              setOpen(null);
              void load();
            }}
          />
        )}
      </div>
    </DetailShell>
  );
}

function AdminStudy({ studyRef, onBack }: { studyRef: string; onBack: () => void }) {
  const [study, setStudy] = useState<PortalStudy | null>(null);
  const [scope, setScope] = useState('');
  const [status, setStatus] = useState<PortalStatus>('submitted');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const r = await portalApi.study(studyRef);
    if (r.ok && r.data?.study) {
      setStudy(r.data.study);
      setScope(r.data.study.scope ?? '');
      setStatus(r.data.study.status);
    }
  }, [studyRef]);
  useEffect(() => {
    void load();
  }, [load]);

  async function saveStatus(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    const r = await portalApi.setStatus(studyRef, status, scope);
    setBusy(false);
    setMsg(r.ok ? `Saved — status is now "${statusLabel[status]}".` : r.message ?? 'Could not save.');
    if (r.ok) void load();
  }
  async function upload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = (e.currentTarget.elements.namedItem('file') as HTMLInputElement | null)?.files?.[0];
    if (!file) return;
    setBusy(true);
    setMsg('');
    const r = await portalApi.uploadReport(studyRef, file);
    setBusy(false);
    setMsg(r.ok ? `Uploaded ${r.data?.reportName}; status is now Delivered and the client has been emailed.` : r.message ?? 'Upload failed.');
    if (r.ok) void load();
  }

  if (!study) return <p className="muted">Loading {studyRef}…</p>;
  return (
    <>
      <p>
        <button type="button" className="link-button" onClick={onBack}>
          ← All studies
        </button>
      </p>
      <header className="portal__head">
        <p className="eyebrow">
          {study.company} · {study.name} · {study.email}
        </p>
        <h1 className="h1--page" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
          {study.ref}
        </h1>
        <p className="muted">
          {study.package} · submitted {fmtDate(study.createdAt)}
          {study.approvedAt ? ` · approved ${fmtDate(study.approvedAt)}` : ''}
          {study.hasReport ? ` · memo: ${study.reportName}` : ''}
        </p>
      </header>
      <StatusStrip status={study.status} />
      {msg && (
        <p className="notice" role="status">
          {msg}
        </p>
      )}

      <div className="portal__grid">
        <div className="stack">
          {study.approvedScope && (
            <section className="aside-box portal-scope" aria-labelledby="adm-approved">
              <h2 id="adm-approved">Approved scope (frozen)</h2>
              <p className="portal-scope__text">{study.approvedScope}</p>
              <p className="small muted">
                v{study.approvedVersion} · {study.approvedBy} · {study.approvedAt ? fmtDate(study.approvedAt) : ''} · sha256 {study.approvedScopeSha}
              </p>
            </section>
          )}
          <section className="aside-box" aria-labelledby="adm-scope">
            <h2 id="adm-scope">{study.approvedScope ? 'Change order (new scope version) & status' : 'Scope confirmation & status'}</h2>
            {study.scopeVersions.length > 0 && (
              <p className="small muted">
                Versions: {study.scopeVersions.map((v) => `v${v.version}${v.approvedAt ? ' ✓' : ''}`).join(' · ')}
              </p>
            )}
            <form className="form" onSubmit={saveStatus}>
              <div className="field">
                <label htmlFor="adm-scope-text">Scope confirmation (shown to the client above the Approve button)</label>
                <textarea id="adm-scope-text" rows={8} maxLength={8000} value={scope} onChange={(e) => setScope(e.target.value)} placeholder={'Our read of the decision…\nSegments we will simulate…\nQuestions…\nDelivery date…\nFee…'} />
              </div>
              <div className="field">
                <label htmlFor="adm-status">Status</label>
                <select id="adm-status" value={status} onChange={(e) => setStatus(e.target.value as PortalStatus)}>
                  {portalStatuses.map((s) => (
                    <option key={s} value={s}>
                      {statusLabel[s]}
                    </option>
                  ))}
                </select>
                <p className="field__hint">
                  Setting "Scope confirmation ready", "Needs your input", "Running" or "Delivered" emails the client a nudge with their link.
                  {study.approvedScope ? ' The approved text is frozen; editing it here and choosing "Scope confirmation ready" proposes a new version the client must approve again.' : ''}
                </p>
              </div>
              <p>
                <button type="submit" className="btn btn--primary" disabled={busy}>
                  Save
                </button>
              </p>
            </form>
          </section>

          <section className="aside-box" aria-labelledby="adm-report">
            <h2 id="adm-report">Deliver the memo</h2>
            <form onSubmit={upload} className="form">
              <div className="field">
                <label htmlFor="adm-file">PDF (max 25 MB)</label>
                <input id="adm-file" name="file" type="file" accept="application/pdf,.pdf" />
              </div>
              <p>
                <button type="submit" className="btn btn--secondary" disabled={busy}>
                  Upload &amp; mark delivered
                </button>
              </p>
            </form>
          </section>

          <section aria-labelledby="adm-thread">
            <h2 id="adm-thread">Messages</h2>
            <Thread messages={study.messages} viewer="admin" />
            <Composer studyRef={study.ref} onSent={load} label="Send to client" />
          </section>
        </div>
        <aside>
          <details open>
            <summary>Questionnaire</summary>
            <Answers a={study.answers} />
          </details>
        </aside>
      </div>
    </>
  );
}
