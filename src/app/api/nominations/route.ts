import { NextResponse } from 'next/server';
import {
  CommunityNomination,
  createNomination,
  listNominations,
  updateNominationStatus,
} from '@/lib/db';
import { checkAdminAuthorized } from '@/lib/auth';

export type { CommunityNomination };

export async function GET(request: Request) {
  const auth = await checkAdminAuthorized(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Steward authentication required.' }, { status: 401 });
  }
  const nominations = await listNominations();
  return NextResponse.json({ nominations });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const {
      tradeName,
      townSlug = 'crewe',
      categorySlug = 'plumbers',
      phoneOrFacebook,
      nominatedBy,
      relationshipNote = 'Local neighbour recommendation',
      reason = '',
    } = body;

    if (!tradeName || !phoneOrFacebook || !nominatedBy) {
      return NextResponse.json(
        {
          error:
            'Please provide the tradesperson name, phone or Facebook link, and your name/area.',
        },
        { status: 400 }
      );
    }

    const newNomination: CommunityNomination = {
      id: `nom-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      tradeName: String(tradeName).trim(),
      townSlug: String(townSlug),
      categorySlug: String(categorySlug),
      phoneOrFacebook: String(phoneOrFacebook).trim(),
      nominatedBy: String(nominatedBy).trim(),
      relationshipNote: String(relationshipNote).trim(),
      reason: String(reason).trim(),
      status: 'Pending Community Review',
    };

    await createNomination(newNomination);

    return NextResponse.json({
      success: true,
      nomination: newNomination,
    });
  } catch {
    return NextResponse.json(
      { error: 'Unable to submit community nomination.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const auth = await checkAdminAuthorized(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Steward authentication required.' }, { status: 401 });
  }
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const id = String(body?.id || '').trim();
    const status = String(body?.status || '').trim();
    if (!id || !status) {
      return NextResponse.json({ error: 'id and status are required.' }, { status: 400 });
    }
    await updateNominationStatus(id, status);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unable to update nomination.' }, { status: 500 });
  }
}
