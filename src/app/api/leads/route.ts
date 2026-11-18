import { NextResponse } from 'next/server';
import { HomeownerLead, createLead, listLeads } from '@/lib/db';
import { checkAdminAuthorized } from '@/lib/auth';
import { getLiveListingsByTownAndCategory } from '@/lib/listings';

export type { HomeownerLead };

export async function GET(request: Request) {
  const auth = await checkAdminAuthorized(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Steward authentication required.' }, { status: 401 });
  }
  const leads = await listLeads();
  return NextResponse.json({ leads });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const {
      homeownerName,
      phone,
      postcode,
      townSlug = 'crewe',
      categorySlug = 'plumbers',
      urgency = 'This Week',
      jobDescription = '',
    } = body;

    if (!homeownerName || !phone || !postcode) {
      return NextResponse.json(
        { error: 'Please provide your name, phone number and CW postcode.' },
        { status: 400 }
      );
    }

    const { listings } = await getLiveListingsByTownAndCategory(
      String(townSlug),
      String(categorySlug)
    );
    const matchedPros = listings
      .filter((l) => l.isFeatured || l.isVerifiedLocal)
      .slice(0, 3);

    const newLead: HomeownerLead = {
      id: `lead-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      homeownerName: String(homeownerName).trim(),
      phone: String(phone).trim(),
      postcode: String(postcode).trim().toUpperCase(),
      townSlug: String(townSlug),
      categorySlug: String(categorySlug),
      urgency: String(urgency),
      jobDescription: String(jobDescription).trim(),
      estimatedValueGbp: String(urgency).includes('Emergency') ? 240 : 320,
      status: 'Routed to Local Pros',
      routedTo: matchedPros.map((p) => p.name),
    };

    await createLead(newLead);

    return NextResponse.json({
      success: true,
      lead: newLead,
      matchedPros: matchedPros.map((p) => ({
        name: p.name,
        phone: p.phone,
        slug: p.slug,
        responseTimeMinutes: p.responseTimeMinutes,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: 'Unable to submit quote request.' },
      { status: 500 }
    );
  }
}
