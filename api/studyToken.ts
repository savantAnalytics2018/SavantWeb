/**
 * Signed, stateless confirmation tokens for research requests (no database).
 * token = base64url(JSON payload) + "." + base64url(HMAC-SHA256(payload, secret))
 * Secret: STUDY_CONFIRM_SECRET, falling back to RESEND_API_KEY so no new variable is required.
 */
export interface ConfirmPayload {
  ref: string;
  email: string;
  company: string;
  name: string;
  /** Unix seconds. */
  exp: number;
}

const enc = new TextEncoder();
const b64u = (bytes: ArrayBuffer | Uint8Array) => {
  const u = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = '';
  for (const b of u) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const unb64u = (s: string) => {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

async function key(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function signToken(payload: ConfirmPayload, secret: string): Promise<string> {
  const body = b64u(enc.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign('HMAC', await key(secret), enc.encode(body));
  return `${body}.${b64u(sig)}`;
}

/** Returns the payload if the signature is valid and the token has not expired; otherwise null. */
export async function verifyToken(token: string, secret: string, now = Math.floor(Date.now() / 1000)): Promise<ConfirmPayload | null> {
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  let ok = false;
  try {
    ok = await crypto.subtle.verify('HMAC', await key(secret), unb64u(sig), enc.encode(body));
  } catch {
    return null;
  }
  if (!ok) return null;
  try {
    const p = JSON.parse(new TextDecoder().decode(unb64u(body))) as ConfirmPayload;
    if (typeof p.exp !== 'number' || p.exp < now) return null;
    if (typeof p.ref !== 'string' || typeof p.email !== 'string') return null;
    return p;
  } catch {
    return null;
  }
}
