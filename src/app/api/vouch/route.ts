import { NextResponse } from 'next/server';
import { getAllVouches, getVouchCount, incrementVouch } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  if (slug) {
    const addedVouches = await getVouchCount(slug);
    return NextResponse.json({ slug, addedVouches });
  }
  const vouches = await getAllVouches();
  return NextResponse.json({ vouches });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const slug = String(body?.slug || '').trim();
    if (!slug) {
      return NextResponse.json({ error: 'Listing slug is required.' }, { status: 400 });
    }

    const addedVouches = await incrementVouch(slug);

    return NextResponse.json({
      success: true,
      slug,
      addedVouches,
    });
  } catch {
    return NextResponse.json(
      { error: 'Unable to record neighbour vouch.' },
      { status: 500 }
    );
  }
}
