import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  getConfiguredAdminPassword,
} from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const configured = await getConfiguredAdminPassword();
    if (!configured) {
      return NextResponse.json(
        {
          error:
            'ADMIN_PASSWORD is not configured on this deployment. Add it in Cloudflare Workers Variables & Secrets.',
        },
        { status: 503 }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const password = String(body?.password || '').trim();

    if (!password || password !== configured) {
      return NextResponse.json(
        { error: 'Incorrect steward password. Please try again.' },
        { status: 401 }
      );
    }

    const isHttps =
      request.headers.get('x-forwarded-proto') === 'https' ||
      request.url.startsWith('https://');

    const token = await createAdminSessionToken(configured);
    const res = NextResponse.json({ success: true });
    res.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isHttps,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Unable to sign in.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const isHttps =
    request.headers.get('x-forwarded-proto') === 'https' ||
    request.url.startsWith('https://');
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isHttps,
    path: '/',
    maxAge: 0,
  });
  return res;
}
