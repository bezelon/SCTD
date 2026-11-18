import { cookies, headers } from 'next/headers';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export const ADMIN_COOKIE_NAME = 'sctd_steward_session';

export interface AdminAuthResult {
  authorized: boolean;
  mode: 'authenticated' | 'dev-open' | 'unconfigured' | 'required';
}

export async function getConfiguredAdminPassword(): Promise<string> {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx?.env as unknown as Record<string, unknown> | undefined;
    const cfPass = env?.ADMIN_PASSWORD;
    if (typeof cfPass === 'string' && cfPass.trim().length > 0) {
      return cfPass.trim();
    }
  } catch {
    // Fallback to process.env outside Cloudflare runtime
  }
  return String(process.env.ADMIN_PASSWORD || '').trim();
}

function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function createAdminSessionToken(password: string): Promise<string> {
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days
  const payload = `steward:v1:${expiresAt}`;
  const sig = await hmacSha256Hex(password, payload);
  return `${expiresAt}.${sig}`;
}

async function verifyAdminSessionToken(token: string, password: string): Promise<boolean> {
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [expiresStr, sig] = parts;
  const expiresAt = Number(expiresStr);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;
  const expectedSig = await hmacSha256Hex(password, `steward:v1:${expiresAt}`);
  return timingSafeEqualString(sig, expectedSig);
}

export async function checkAdminAuthorized(request?: Request): Promise<AdminAuthResult> {
  const configuredPassword = await getConfiguredAdminPassword();

  if (!configuredPassword) {
    if (process.env.NODE_ENV === 'production') {
      return { authorized: false, mode: 'unconfigured' };
    }
    return { authorized: true, mode: 'dev-open' };
  }

  // 1. Check Authorization: Basic header (useful for API clients & curls)
  const reqHeaders = request ? request.headers : await headers();
  const authHeader = reqHeaders.get('authorization') || '';
  if (authHeader.startsWith('Basic ')) {
    try {
      const decoded = atob(authHeader.slice(6));
      const colonIdx = decoded.indexOf(':');
      const providedPass = colonIdx >= 0 ? decoded.slice(colonIdx + 1) : decoded;
      if (timingSafeEqualString(providedPass, configuredPassword)) {
        return { authorized: true, mode: 'authenticated' };
      }
    } catch {
      // Invalid base64
    }
  }

  // 2. Check signed session cookie
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (token && (await verifyAdminSessionToken(token, configuredPassword))) {
    return { authorized: true, mode: 'authenticated' };
  }

  return { authorized: false, mode: 'required' };
}
