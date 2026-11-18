import { NextResponse } from 'next/server';
import { getShowDemoListings, setShowDemoListings } from '@/lib/db';
import { checkAdminAuthorized } from '@/lib/auth';

export async function GET() {
  const showDemoListings = await getShowDemoListings();
  return NextResponse.json({ showDemoListings });
}

export async function POST(request: Request) {
  const auth = await checkAdminAuthorized(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Steward authentication required.' }, { status: 401 });
  }
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const showDemoListings = Boolean(body?.showDemoListings);
    await setShowDemoListings(showDemoListings);
    return NextResponse.json({ success: true, showDemoListings });
  } catch {
    return NextResponse.json({ error: 'Unable to update settings.' }, { status: 500 });
  }
}
