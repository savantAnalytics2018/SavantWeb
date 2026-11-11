import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createStudy, portalHandler, type D1Like, type PortalDeps, type R2Like } from '../../api/portal';
import { signToken } from '../../api/studyToken';

/** Tiny in-memory stand-in for D1 covering the SQL the portal uses. */
function fakeDb() {
  const studies = new Map<string, Record<string, unknown>>();
  const messages: Record<string, unknown>[] = [];
  const events: Record<string, unknown>[] = [];
  let id = 0;
  const db: D1Like = {
    prepare(sql: string) {
      return {
        bind(...v: unknown[]) {
          const exec = () => {
            if (sql.startsWith('INSERT INTO studies')) {
              const [ref, pkg, status, email, name, company, answers, c, u] = v;
              studies.set(ref as string, { ref, package: pkg, status, email, name, company, answers, scope: null, approved_at: null, report_key: null, report_name: null, created_at: c, updated_at: u });
              return null;
            }
            if (sql.startsWith('INSERT INTO messages')) {
              messages.push({ id: ++id, ref: v[0], author: v[1], body: v[2], created_at: v[3] });
              return null;
            }
            if (sql.startsWith('INSERT INTO events')) {
              events.push({ ref: v[0], kind: v[1] });
              return null;
            }
            if (sql.startsWith('SELECT * FROM studies')) return studies.get(v[0] as string) ?? null;
            if (sql.startsWith('SELECT report_key')) return studies.get(v[0] as string) ?? null;
            if (sql.startsWith('SELECT id, author')) return messages.filter((m) => m.ref === v[0]);
            if (sql.startsWith('SELECT ref, package')) return [...studies.values()];
            if (sql.startsWith('UPDATE studies SET status = ?, approved_at')) {
              Object.assign(studies.get(v[3] as string)!, { status: v[0], approved_at: v[1], updated_at: v[2] });
              return null;
            }
            if (sql.startsWith('UPDATE studies SET status = ?, scope')) {
              Object.assign(studies.get(v[3] as string)!, { status: v[0], scope: v[1], updated_at: v[2] });
              return null;
            }
            if (sql.startsWith('UPDATE studies SET status = ?, updated_at')) {
              Object.assign(studies.get(v[2] as string)!, { status: v[0], updated_at: v[1] });
              return null;
            }
            if (sql.startsWith('UPDATE studies SET updated_at')) {
              Object.assign(studies.get(v[1] as string)!, { updated_at: v[0] });
              return null;
            }
            if (sql.startsWith('UPDATE studies SET report_key')) {
              Object.assign(studies.get(v[4] as string)!, { report_key: v[0], report_name: v[1], status: v[2], updated_at: v[3] });
              return null;
            }
            throw new Error(`unhandled sql: ${sql}`);
          };
          return {
            first: async <T,>() => exec() as T | null,
            all: async <T,>() => ({ results: (exec() ?? []) as T[] }),
            run: async () => exec(),
          };
        },
      };
    },
  };
  return { db, studies, messages, events };
}

function fakeR2(): R2Like & { store: Map<string, ArrayBuffer> } {
  const store = new Map<string, ArrayBuffer>();
  return {
    store,
    put: async (k, v) => {
      store.set(k, v as ArrayBuffer);
    },
    get: async (k) =>
      store.has(k)
        ? {
            body: new ReadableStream({
              start(c) {
                c.enqueue(new Uint8Array(store.get(k)!));
                c.close();
              },
            }),
            httpMetadata: { contentType: 'application/pdf' },
          }
        : null,
  };
}

const ORIGIN = 'https://twindetail.savantanalytics.net';
const sent: { to: string; subject: string; text: string }[] = [];

beforeEach(() => {
  sent.length = 0;
  vi.stubGlobal('fetch', async (_url: string, init: { body: string }) => {
    const b = JSON.parse(init.body) as { to: string[]; subject: string; text: string };
    sent.push({ to: b.to[0]!, subject: b.subject, text: b.text });
    return new Response('{}', { status: 200 });
  });
});

function deps(over: Partial<PortalDeps> = {}): PortalDeps & { fake: ReturnType<typeof fakeDb> } {
  const fake = fakeDb();
  return { db: fake.db, reports: fakeR2(), secret: 'test-secret', apiKey: 'k', from: 'Savant <no-reply@x>', adminTo: 'team@savant.test', origin: ORIGIN, fake, ...over };
}

const REF = 'DS-2026-ABC123';
const client = { ref: REF, packageId: 'decision-study', email: 'Jane@Client.com', name: 'Jane', company: 'Client Co', answers: { decision: 'Launch?' } };
const req = (path: string, init: RequestInit & { cookie?: string } = {}) =>
  new Request(`${ORIGIN}/api/portal${path}`, { ...init, headers: { ...(init.headers ?? {}), ...(init.cookie ? { cookie: init.cookie } : {}), 'content-type': 'application/json' } });

describe('portal: creation and magic-link access', () => {
  it('creates the study, returns a page URL, a cookie and a link', async () => {
    const d = deps();
    const r = await createStudy(d, client);
    expect(r.url).toBe(`${ORIGIN}/s/${REF}`);
    expect(r.cookie).toMatch(/^sp_DS_2026_ABC123=.+; Path=\/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax$/);
    expect(r.link).toMatch(new RegExp(`^${ORIGIN}/api/portal/auth\\?t=`));
    expect(d.fake.studies.get(REF)).toMatchObject({ status: 'submitted', email: 'jane@client.com' });
  });

  it('exchanges the link for a cookie and redirects to the page; rejects bad tokens', async () => {
    const d = deps();
    const { link } = await createStudy(d, client);
    const ok = await portalHandler(new Request(link), d);
    expect(ok.status).toBe(303);
    expect(ok.headers.get('location')).toBe(`/s/${REF}`);
    expect(ok.headers.get('set-cookie')).toContain('sp_DS_2026_ABC123=');
    const bad = await portalHandler(new Request(`${ORIGIN}/api/portal/auth?t=nope`), d);
    expect(bad.headers.get('location')).toBe('/s?expired=1');
  });

  it('requires the cookie for the study and scopes it to that one study', async () => {
    const d = deps();
    const { cookie } = await createStudy(d, client);
    const c = cookie.split(';')[0]!;
    expect((await portalHandler(req(`/study/${REF}`), d)).status).toBe(401);
    const good = await portalHandler(req(`/study/${REF}`, { cookie: c }), d);
    expect(good.status).toBe(200);
    const body = (await good.json()) as { viewer: string; study: { email?: string; status: string } };
    expect(body.viewer).toBe('client');
    expect(body.study.status).toBe('submitted');
    expect(body.study.email).toBeUndefined();
    // same cookie, different study
    expect((await portalHandler(req('/study/DS-2026-ZZZZZZ', { cookie: c }), d)).status).toBe(401);
  });

  it('re-sends a link only when reference and email match, and never reveals which', async () => {
    const d = deps();
    await createStudy(d, client);
    sent.length = 0;
    const r1 = await portalHandler(req('/link', { method: 'POST', body: JSON.stringify({ ref: REF, email: 'JANE@client.com' }) }), d);
    expect(r1.status).toBe(200);
    expect(sent).toHaveLength(1);
    expect(sent[0]!.to).toBe('jane@client.com');
    const r2 = await portalHandler(req('/link', { method: 'POST', body: JSON.stringify({ ref: REF, email: 'someone@else.com' }) }), d);
    expect(r2.status).toBe(200);
    expect(sent).toHaveLength(1);
  });
});

describe('portal: the review → clarify → approve → deliver flow', () => {
  async function setup() {
    const d = deps();
    const { cookie } = await createStudy(d, client);
    const clientCookie = cookie.split(';')[0]!;
    const adminToken = await signToken({ ref: 'admin', email: 'team@savant.test', company: 'Savant', name: 'Savant', exp: Math.floor(Date.now() / 1000) + 3600 }, 'test-secret');
    const adminCookie = `sp_admin=${adminToken}`;
    sent.length = 0;
    return { d, clientCookie, adminCookie };
  }

  it('admin message → needs_input + client nudge; client reply → reviewing + admin nudge', async () => {
    const { d, clientCookie, adminCookie } = await setup();
    const a = await portalHandler(req(`/study/${REF}/message`, { method: 'POST', body: JSON.stringify({ body: 'Which price band?' }), cookie: adminCookie }), d);
    expect((await a.json()).status).toBe('needs_input');
    expect(sent.at(-1)).toMatchObject({ to: 'jane@client.com', subject: `We need your input on ${REF}` });
    expect(sent.at(-1)!.text).not.toContain('Which price band?'); // nudge only
    const c = await portalHandler(req(`/study/${REF}/message`, { method: 'POST', body: JSON.stringify({ body: '$40–60' }), cookie: clientCookie }), d);
    expect((await c.json()).status).toBe('reviewing');
    expect(sent.at(-1)!.to).toBe('team@savant.test');
    expect(d.fake.messages).toHaveLength(2);
  });

  it('client cannot approve before a scope is proposed; admin cannot approve at all', async () => {
    const { d, clientCookie, adminCookie } = await setup();
    expect((await portalHandler(req(`/study/${REF}/approve`, { method: 'POST', body: '{}', cookie: clientCookie }), d)).status).toBe(409);
    expect((await portalHandler(req(`/study/${REF}/approve`, { method: 'POST', body: '{}', cookie: adminCookie }), d)).status).toBe(403);
    expect((await portalHandler(req(`/study/${REF}/status`, { method: 'POST', body: JSON.stringify({ status: 'running' }), cookie: clientCookie }), d)).status).toBe(403);
  });

  it('scope_proposed needs scope text and nudges the client; approval locks and notifies both', async () => {
    const { d, clientCookie, adminCookie } = await setup();
    const noScope = await portalHandler(req(`/study/${REF}/status`, { method: 'POST', body: JSON.stringify({ status: 'scope_proposed', scope: '' }), cookie: adminCookie }), d);
    expect(noScope.status).toBe(422);
    const ok = await portalHandler(req(`/study/${REF}/status`, { method: 'POST', body: JSON.stringify({ status: 'scope_proposed', scope: '3 segments, 12 questions, memo by Dec 5, $4,500' }), cookie: adminCookie }), d);
    expect(ok.status).toBe(200);
    expect(sent.at(-1)).toMatchObject({ to: 'jane@client.com', subject: `Please approve the scope for ${REF}` });
    const ap = await portalHandler(req(`/study/${REF}/approve`, { method: 'POST', body: '{}', cookie: clientCookie }), d);
    expect(ap.status).toBe(200);
    expect(d.fake.studies.get(REF)).toMatchObject({ status: 'approved' });
    expect(d.fake.studies.get(REF)!.approved_at).toBeTypeOf('number');
    expect(sent.slice(-2).map((m) => m.to).sort()).toEqual(['jane@client.com', 'team@savant.test']);
    expect(sent.find((m) => m.subject.includes('SCOPE APPROVED'))).toBeTruthy();
  });

  it('report upload stores the file, marks delivered, nudges; client can download it', async () => {
    const { d, clientCookie, adminCookie } = await setup();
    const fd = new FormData();
    fd.append('file', new File([new Uint8Array([37, 80, 68, 70])], 'memo final.pdf', { type: 'application/pdf' }), 'memo final.pdf');
    fd.append('name', 'memo final.pdf');
    const up = await portalHandler(new Request(`${ORIGIN}/api/portal/study/${REF}/report`, { method: 'POST', body: fd, headers: { cookie: adminCookie } }), d);
    expect(up.status).toBe(200);
    expect((await up.json()).reportName).toBe('memo_final.pdf');
    expect(d.fake.studies.get(REF)).toMatchObject({ status: 'delivered' });
    expect(sent.at(-1)!.subject).toBe(`Your memo is ready (${REF})`);
    const dl = await portalHandler(new Request(`${ORIGIN}/api/portal/study/${REF}/report`, { headers: { cookie: clientCookie } }), d);
    expect(dl.status).toBe(200);
    expect(dl.headers.get('content-disposition')).toContain('memo_final.pdf');
    expect((await portalHandler(new Request(`${ORIGIN}/api/portal/study/${REF}/report`), d)).status).toBe(401);
  });

  it('admin list requires the admin cookie', async () => {
    const { d, clientCookie, adminCookie } = await setup();
    expect((await portalHandler(req('/admin/studies', { cookie: clientCookie }), d)).status).toBe(401);
    const ok = await portalHandler(req('/admin/studies', { cookie: adminCookie }), d);
    expect(((await ok.json()) as { studies: unknown[] }).studies).toHaveLength(1);
  });
});
