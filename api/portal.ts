/**
 * Paid-study client portal — one page per study, no accounts.
 *
 *  Access is a magic link: a signed token (api/studyToken.ts) carried in an email link; opening
 *  it sets a cookie scoped to that one study. Savant's admin view uses the same mechanism with a
 *  token for ref "admin". Emails are nudges only ("we need your input on DS-…"); the substance
 *  lives on the page. Storage: Cloudflare D1 (studies, messages, events); reports: R2.
 *
 *  Routes (mounted by worker/index.ts under /api/portal):
 *    GET  /auth?t=                         exchange a magic-link token for a cookie, redirect to the page
 *    POST /link        {ref,email}         re-send a magic link (always 200; no account enumeration)
 *    GET  /study/:ref                      study + messages (client cookie for :ref, or admin)
 *    POST /study/:ref/message {body}       client or admin; nudges the other side
 *    POST /study/:ref/approve              client; locks scope
 *    POST /study/:ref/status {status,scope?}  admin
 *    POST /study/:ref/report  (multipart)  admin; stores the memo in R2, marks delivered
 *    GET  /study/:ref/report               streams the memo (client or admin)
 *    GET  /admin/link                      emails Savant an admin magic link
 *    GET  /admin/auth?t=                   admin cookie
 *    GET  /admin/studies                   list
 */
import { signToken, verifyToken, type ConfirmPayload } from './studyToken';
import { portalLimits, portalStatuses, type PortalMessage, type PortalStatus, type PortalStudy, type PortalStudySummary } from '../src/lib/portalTypes';

/* ---------- Minimal Cloudflare binding shapes (so tests can fake them) ---------- */
export interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      first<T = Record<string, unknown>>(): Promise<T | null>;
      all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
      run(): Promise<unknown>;
    };
  };
}
export interface R2Like {
  put(key: string, value: ArrayBuffer | ReadableStream, opts?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
  get(key: string): Promise<{ body: ReadableStream; httpMetadata?: { contentType?: string } } | null>;
}

export interface PortalDeps {
  db: D1Like;
  reports?: R2Like;
  /** Signing secret for tokens/cookies. */
  secret: string;
  /** Resend */
  apiKey?: string;
  from?: string;
  /** Savant's inbox — also the only address that can receive an admin link. */
  adminTo?: string;
  /** Public origin of the portal, e.g. https://twindetail.savantanalytics.net */
  origin: string;
  now?: () => number;
}

const CLIENT_TTL = 30 * 24 * 3600;
const ADMIN_TTL = 7 * 24 * 3600;
const REF_RE = /^DS-\d{4}-[A-Z0-9]{6}$/;

const json = (status: number, body: Record<string, unknown>, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra } });
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export async function sha256(text: string): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(d), (b) => b.toString(16).padStart(2, '0')).join('');
}

export function cookieName(ref: string): string {
  return ref === 'admin' ? 'sp_admin' : `sp_${ref.replace(/[^A-Z0-9]/gi, '_')}`;
}
export function setCookie(name: string, value: string, maxAge: number): string {
  return `${name}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}
function readCookie(req: Request, name: string): string | null {
  const raw = req.headers.get('cookie') ?? '';
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return null;
}

/** Hosts: on twindetail.* the page is /s/<ref>; elsewhere the hidden main-site path. */
export function portalPath(origin: string, ref: string): string {
  const detail = /^https?:\/\/twindetail\./i.test(origin);
  if (ref === 'admin') return detail ? '/admin' : '/twin-detail/admin';
  if (ref === 'signin') return detail ? '/s' : '/twin-detail/s';
  return detail ? `/s/${ref}` : `/twin-detail/s/${ref}`;
}

export async function makeLink(deps: PortalDeps, p: Omit<ConfirmPayload, 'exp'>, admin = false): Promise<string> {
  const now = (deps.now ?? (() => Math.floor(Date.now() / 1000)))();
  const token = await signToken({ ...p, exp: now + (admin ? ADMIN_TTL : CLIENT_TTL) }, deps.secret);
  return `${deps.origin}/api/portal/${admin ? 'admin/auth' : 'auth'}?t=${encodeURIComponent(token)}`;
}

async function send(deps: PortalDeps, to: string, subject: string, lines: string[]): Promise<boolean> {
  if (!deps.apiKey || !deps.from) return false;
  const text = lines.join('\n');
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${deps.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: deps.from, to: [to], reply_to: deps.adminTo, subject, text, html: `<pre style="font:14px/1.5 system-ui">${esc(text)}</pre>` }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/* ---------- Data access ---------- */
interface Row {
  ref: string;
  package: string;
  status: string;
  email: string;
  name: string;
  company: string;
  answers: string;
  scope: string | null;
  scope_version: number;
  approved_scope: string | null;
  approved_scope_sha: string | null;
  approved_version: number | null;
  approved_by: string | null;
  approved_at: number | null;
  report_key: string | null;
  report_name: string | null;
  created_at: number;
  updated_at: number;
}

async function getStudy(db: D1Like, ref: string): Promise<PortalStudy | null> {
  const r = await db.prepare('SELECT * FROM studies WHERE ref = ?').bind(ref).first<Row>();
  if (!r) return null;
  const { results } = await db.prepare('SELECT id, author, body, created_at FROM messages WHERE ref = ? ORDER BY created_at, id').bind(ref).all<{ id: number; author: string; body: string; created_at: number }>();
  const messages: PortalMessage[] = results.map((m) => ({ id: m.id, author: m.author as PortalMessage['author'], body: m.body, createdAt: m.created_at }));
  const { results: sv } = await deps_db_scopes(db, ref);
  let answers: Record<string, unknown> = {};
  try {
    answers = JSON.parse(r.answers) as Record<string, unknown>;
  } catch {
    /* keep {} */
  }
  return {
    ref: r.ref,
    package: r.package,
    status: r.status as PortalStatus,
    email: r.email,
    name: r.name,
    company: r.company,
    answers,
    scope: r.scope,
    scopeSha: r.scope ? await sha256(r.scope) : null,
    scopeVersion: r.scope_version ?? 0,
    approvedScope: r.approved_scope,
    approvedScopeSha: r.approved_scope_sha,
    approvedVersion: r.approved_version,
    approvedBy: r.approved_by,
    approvedAt: r.approved_at,
    scopeVersions: sv.map((v) => ({ version: v.version, body: v.body, sha256: v.sha256, proposedAt: v.proposed_at, approvedAt: v.approved_at, approvedBy: v.approved_by })),
    hasReport: !!r.report_key,
    reportName: r.report_name,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    messages,
  };
}

function deps_db_scopes(db: D1Like, ref: string) {
  return db.prepare('SELECT version, body, sha256, proposed_at, approved_at, approved_by FROM scope_versions WHERE ref = ? ORDER BY version').bind(ref).all<{ version: number; body: string; sha256: string; proposed_at: number; approved_at: number | null; approved_by: string | null }>();
}

async function event(db: D1Like, ref: string, kind: string, detail: string | null, ts: number): Promise<void> {
  await db.prepare('INSERT INTO events (ref, kind, detail, created_at) VALUES (?, ?, ?, ?)').bind(ref, kind, detail, ts).run();
}

/** Called by the Decision Study handler after a successful submission. Returns the client's page URL + cookie. */
export async function createStudy(
  deps: PortalDeps,
  input: { ref: string; packageId: string; email: string; name: string; company: string; answers: Record<string, unknown> },
): Promise<{ url: string; cookie: string; link: string }> {
  const ts = Date.now();
  const email = input.email.trim().toLowerCase();
  await deps.db
    .prepare('INSERT INTO studies (ref, package, status, email, name, company, answers, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(input.ref, input.packageId, 'submitted', email, input.name.trim(), input.company.trim(), JSON.stringify(input.answers), ts, ts)
    .run();
  await event(deps.db, input.ref, 'status:submitted', null, ts);
  const payload = { ref: input.ref, email, company: input.company.trim(), name: input.name.trim() };
  const link = await makeLink(deps, payload);
  const token = link.split('t=')[1]!;
  return { url: `${deps.origin}${portalPath(deps.origin, input.ref)}`, cookie: setCookie(cookieName(input.ref), decodeURIComponent(token), CLIENT_TTL), link };
}

/* ---------- Auth ---------- */
type Viewer = { kind: 'client'; ref: string; email: string } | { kind: 'admin' } | null;

async function viewerFor(req: Request, deps: PortalDeps, ref: string): Promise<Viewer> {
  const admin = readCookie(req, cookieName('admin'));
  if (admin) {
    const p = await verifyToken(admin, deps.secret);
    if (p && p.ref === 'admin') return { kind: 'admin' };
  }
  const c = readCookie(req, cookieName(ref));
  if (c) {
    const p = await verifyToken(c, deps.secret);
    if (p && p.ref === ref) return { kind: 'client', ref, email: p.email };
  }
  return null;
}

/* ---------- Handler ---------- */
export async function portalHandler(req: Request, deps: PortalDeps): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api\/portal/, '') || '/';
  const ts = Date.now();

  // --- magic links ---
  if (path === '/auth' && req.method === 'GET') {
    const p = await verifyToken(url.searchParams.get('t') ?? '', deps.secret);
    if (!p || p.ref === 'admin' || !REF_RE.test(p.ref)) return new Response(null, { status: 303, headers: { Location: `${portalPath(deps.origin, 'signin')}?expired=1` } });
    return new Response(null, { status: 303, headers: { Location: portalPath(deps.origin, p.ref), 'Set-Cookie': setCookie(cookieName(p.ref), url.searchParams.get('t')!, CLIENT_TTL), 'Cache-Control': 'no-store' } });
  }
  if (path === '/admin/auth' && req.method === 'GET') {
    const p = await verifyToken(url.searchParams.get('t') ?? '', deps.secret);
    if (!p || p.ref !== 'admin') return new Response(null, { status: 303, headers: { Location: `${portalPath(deps.origin, 'admin')}?expired=1` } });
    return new Response(null, { status: 303, headers: { Location: portalPath(deps.origin, 'admin'), 'Set-Cookie': setCookie(cookieName('admin'), url.searchParams.get('t')!, ADMIN_TTL), 'Cache-Control': 'no-store' } });
  }
  if (path === '/link' && req.method === 'POST') {
    let b: { ref?: unknown; email?: unknown } = {};
    try {
      b = (await req.json()) as typeof b;
    } catch {
      /* fallthrough */
    }
    const ref = String(b.ref ?? '').trim().toUpperCase();
    const email = String(b.email ?? '').trim().toLowerCase();
    if (REF_RE.test(ref) && email) {
      const s = await getStudy(deps.db, ref);
      if (s && s.email === email) {
        const link = await makeLink(deps, { ref, email, company: s.company, name: s.name });
        await send(deps, email, `Your study page (${ref})`, [`Hello ${s.name},`, ``, `Here is a fresh link to your study page:`, link, ``, `The link works for 30 days. Savant Analytics`]);
      }
    }
    return json(200, { ok: true, message: 'If that reference and email match a study, a link is on its way.' });
  }
  if (path === '/admin/link' && req.method === 'GET') {
    if (!deps.adminTo) return json(503, { ok: false });
    const link = await makeLink(deps, { ref: 'admin', email: deps.adminTo, company: 'Savant', name: 'Savant' }, true);
    await send(deps, deps.adminTo, 'Portal admin link', ['Admin sign-in link (7 days):', link]);
    return json(200, { ok: true, message: 'Link sent to the Savant inbox.' });
  }
  if (path === '/admin/studies' && req.method === 'GET') {
    const v = await viewerFor(req, deps, 'admin');
    if (v?.kind !== 'admin') return json(401, { ok: false, message: 'Sign in required.' });
    const { results } = await deps.db
      .prepare('SELECT ref, package, status, name, company, email, created_at, updated_at FROM studies ORDER BY updated_at DESC LIMIT 200')
      .bind()
      .all<Row>();
    const studies: PortalStudySummary[] = results.map((r) => ({ ref: r.ref, package: r.package, status: r.status as PortalStatus, name: r.name, company: r.company, email: r.email, createdAt: r.created_at, updatedAt: r.updated_at }));
    return json(200, { ok: true, studies });
  }

  // --- per-study ---
  const m = /^\/study\/(DS-\d{4}-[A-Z0-9]{6})(\/(message|approve|status|report))?$/.exec(path);
  if (!m) return json(404, { ok: false, message: 'Not found.' });
  const ref = m[1]!;
  const action = m[3];
  const viewer = await viewerFor(req, deps, ref);
  if (!viewer) return json(401, { ok: false, message: 'Sign in required.' });
  const study = await getStudy(deps.db, ref);
  if (!study) return json(404, { ok: false, message: 'Not found.' });
  const clientLink = () => makeLink(deps, { ref, email: study.email, company: study.company, name: study.name });

  if (!action && req.method === 'GET') {
    return json(200, { ok: true, viewer: viewer.kind, study: viewer.kind === 'admin' ? study : { ...study, email: undefined } });
  }

  if (action === 'message' && req.method === 'POST') {
    let b: { body?: unknown } = {};
    try {
      b = (await req.json()) as typeof b;
    } catch {
      /* fallthrough */
    }
    const body = String(b.body ?? '').trim().slice(0, portalLimits.message);
    if (!body) return json(422, { ok: false, message: 'Write a message first.' });
    const author = viewer.kind === 'admin' ? 'savant' : 'client';
    await deps.db.prepare('INSERT INTO messages (ref, author, body, created_at) VALUES (?, ?, ?, ?)').bind(ref, author, body, ts).run();
    await event(deps.db, ref, `message:${author}`, null, ts);
    let status = study.status;
    if (author === 'savant' && (status === 'submitted' || status === 'reviewing')) status = 'needs_input';
    if (author === 'client' && status === 'needs_input') status = 'reviewing';
    if (status !== study.status) await deps.db.prepare('UPDATE studies SET status = ?, updated_at = ? WHERE ref = ?').bind(status, ts, ref).run();
    else await deps.db.prepare('UPDATE studies SET updated_at = ? WHERE ref = ?').bind(ts, ref).run();
    if (author === 'savant') await send(deps, study.email, `We need your input on ${ref}`, [`Hello ${study.name},`, ``, `There is a question for you on your study page:`, await clientLink(), ``, `Savant Analytics`]);
    else if (deps.adminTo) await send(deps, deps.adminTo, `[${ref}] client replied — ${study.company}`, [`${study.name} (${study.company}) replied on ${ref}.`, ``, `${deps.origin}${portalPath(deps.origin, 'admin')}`]);
    return json(200, { ok: true, status });
  }

  if (action === 'approve' && req.method === 'POST') {
    if (viewer.kind !== 'client') return json(403, { ok: false, message: 'Only the client can approve.' });
    if (study.status !== 'scope_proposed' || !study.scope) return json(409, { ok: false, message: 'There is no scope confirmation to approve yet.' });
    let b: { scopeSha?: unknown } = {};
    try {
      b = (await req.json()) as typeof b;
    } catch {
      /* fallthrough */
    }
    // The click must carry the hash of the text the client saw; a stale page cannot approve a changed scope.
    const sha = await sha256(study.scope);
    if (typeof b.scopeSha !== 'string' || b.scopeSha !== sha) return json(409, { ok: false, message: 'The scope changed since this page loaded. Reload to see the current version.' });
    await deps.db
      .prepare('UPDATE studies SET status = ?, approved_scope = ?, approved_scope_sha = ?, approved_version = ?, approved_by = ?, approved_at = ?, updated_at = ? WHERE ref = ?')
      .bind('approved', study.scope, sha, study.scopeVersion, viewer.email, ts, ts, ref)
      .run();
    await deps.db.prepare('UPDATE scope_versions SET approved_at = ?, approved_by = ? WHERE ref = ? AND version = ?').bind(ts, viewer.email, ref, study.scopeVersion).run();
    await event(deps.db, ref, 'approved', `v${study.scopeVersion} ${sha}`, ts);
    if (deps.adminTo) await send(deps, deps.adminTo, `[${ref}] SCOPE APPROVED — ${study.company}`, [`${study.name} (${study.company}) approved the scope for ${ref} at ${new Date(ts).toISOString()}.`, ``, `Next: send the invoice; schedule when payment clears.`, `${deps.origin}${portalPath(deps.origin, 'admin')}`]);
    await send(deps, study.email, `Scope approved (${ref})`, [`Hello ${study.name},`, ``, `Thank you — the scope for ${ref} is locked. We send the invoice next; the study is scheduled when payment clears.`, ``, `Your study page: ${await clientLink()}`, ``, `Savant Analytics`]);
    return json(200, { ok: true, status: 'approved' });
  }

  if (action === 'status' && req.method === 'POST') {
    if (viewer.kind !== 'admin') return json(403, { ok: false, message: 'Admin only.' });
    let b: { status?: unknown; scope?: unknown } = {};
    try {
      b = (await req.json()) as typeof b;
    } catch {
      /* fallthrough */
    }
    const status = String(b.status ?? '') as PortalStatus;
    if (!portalStatuses.includes(status)) return json(422, { ok: false, message: 'Unknown status.' });
    const scope = typeof b.scope === 'string' ? b.scope.trim().slice(0, portalLimits.scope) : study.scope;
    if (status === 'scope_proposed' && !scope) return json(422, { ok: false, message: 'Write the scope confirmation before proposing it.' });
    const scopeChanged = (scope ?? '') !== (study.scope ?? '');
    // Once a scope is approved, its text is frozen. Changing it means proposing a NEW version
    // (status scope_proposed), which the client must approve again — a change order.
    if (study.approvedScope && scopeChanged && status !== 'scope_proposed') {
      return json(409, { ok: false, message: 'An approved scope cannot be edited. To change it, propose a new version (status "Scope confirmation ready") for the client to approve.' });
    }
    let version = study.scopeVersion;
    if (status === 'scope_proposed' && (scopeChanged || version === 0 || study.approvedVersion === version)) {
      version += 1;
      await deps.db
        .prepare('INSERT INTO scope_versions (ref, version, body, sha256, proposed_at) VALUES (?, ?, ?, ?, ?)')
        .bind(ref, version, scope, await sha256(scope!), ts)
        .run();
    }
    await deps.db.prepare('UPDATE studies SET status = ?, scope = ?, scope_version = ?, updated_at = ? WHERE ref = ?').bind(status, scope ?? null, version, ts, ref).run();
    await event(deps.db, ref, `status:${status}`, status === 'scope_proposed' ? `v${version}` : null, ts);
    const nudge: Partial<Record<PortalStatus, [string, string]>> = {
      needs_input: [`We need your input on ${ref}`, 'There is a question for you on your study page:'],
      scope_proposed: [`Please approve the scope for ${ref}`, 'Our scope confirmation is ready for your approval on your study page:'],
      running: [`Your study ${ref} is running`, 'Kickoff done — the study is in progress. Follow it here:'],
      delivered: [`Your memo is ready (${ref})`, 'Your decision memo is on your study page:'],
    };
    const n = nudge[status];
    if (n) await send(deps, study.email, n[0], [`Hello ${study.name},`, ``, n[1], await clientLink(), ``, `Savant Analytics`]);
    return json(200, { ok: true, status });
  }

  if (action === 'report' && req.method === 'POST') {
    if (viewer.kind !== 'admin') return json(403, { ok: false, message: 'Admin only.' });
    if (!deps.reports) return json(503, { ok: false, message: 'Report storage is not configured (R2 binding REPORTS).' });
    const form = await req.formData();
    const file = form.get('file') as File | string | null;
    // Duck-typed: the File global differs between runtimes (Workers, Node, jsdom).
    if (!file || typeof file === 'string' || typeof file.arrayBuffer !== 'function') return json(422, { ok: false, message: 'Attach a file.' });
    if (file.size > portalLimits.reportBytes) return json(413, { ok: false, message: 'File too large (25 MB max).' });
    const rawName = (file.name && file.name !== 'blob' ? file.name : String(form.get('name') ?? '')) || 'report.pdf';
    const safeName = rawName.replace(/[^\w.\-]+/g, '_').slice(0, 120) || 'report.pdf';
    const key = `reports/${ref}/${ts}-${safeName}`;
    await deps.reports.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type || 'application/octet-stream' } });
    await deps.db.prepare('UPDATE studies SET report_key = ?, report_name = ?, status = ?, updated_at = ? WHERE ref = ?').bind(key, safeName, 'delivered', ts, ref).run();
    await event(deps.db, ref, 'report', safeName, ts);
    await send(deps, study.email, `Your memo is ready (${ref})`, [`Hello ${study.name},`, ``, `Your decision memo is on your study page:`, await clientLink(), ``, `Savant Analytics`]);
    return json(200, { ok: true, status: 'delivered', reportName: safeName });
  }

  if (action === 'report' && req.method === 'GET') {
    if (!deps.reports) return json(503, { ok: false });
    const r = await deps.db.prepare('SELECT report_key, report_name FROM studies WHERE ref = ?').bind(ref).first<{ report_key: string | null; report_name: string | null }>();
    if (!r?.report_key) return json(404, { ok: false, message: 'No report yet.' });
    const obj = await deps.reports.get(r.report_key);
    if (!obj) return json(404, { ok: false, message: 'No report yet.' });
    return new Response(obj.body, { headers: { 'Content-Type': obj.httpMetadata?.contentType ?? 'application/octet-stream', 'Content-Disposition': `attachment; filename="${r.report_name ?? 'report'}"`, 'Cache-Control': 'private, no-store' } });
  }

  return json(405, { ok: false, message: 'Method not allowed.' });
}
