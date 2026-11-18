import { NextResponse } from 'next/server';
import { BusinessClaim, createClaim, listClaims } from '@/lib/db';
import { checkAdminAuthorized } from '@/lib/auth';

export type { BusinessClaim };

export async function GET(request: Request) {
  const auth = await checkAdminAuthorized(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Steward authentication required.' }, { status: 401 });
  }
  const claims = await listClaims();
  return NextResponse.json({ claims });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const {
      businessName,
      contactName,
      phone,
      email,
      townSlug = 'crewe',
      categorySlug = 'plumbers',
      selectedPlan = 'featured',
      notes = '',
    } = body;

    if (!businessName || !contactName || !phone || !email) {
      return NextResponse.json(
        { error: 'Please complete your business name, contact name, phone and email.' },
        { status: 400 }
      );
    }

    const monthlyValueGbp =
      selectedPlan === 'shopfront' ? 59 : selectedPlan === 'featured' ? 29 : 0;

    const status =
      monthlyValueGbp > 0
        ? `Pending Stripe Activation (£${monthlyValueGbp}/mo)`
        : 'Free Profile Claim Submitted';

    const newClaim: BusinessClaim = {
      id: `claim-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      businessName: String(businessName).trim(),
      contactName: String(contactName).trim(),
      phone: String(phone).trim(),
      email: String(email).trim(),
      townSlug: String(townSlug),
      categorySlug: String(categorySlug),
      selectedPlan: selectedPlan as BusinessClaim['selectedPlan'],
      monthlyValueGbp,
      status,
      notes: String(notes).trim(),
    };

    await createClaim(newClaim);

    return NextResponse.json({
      success: true,
      claim: newClaim,
    });
  } catch {
    return NextResponse.json(
      { error: 'Unable to submit business claim.' },
      { status: 500 }
    );
  }
}
