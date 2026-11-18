import { NextResponse } from 'next/server';
import {
  ApprovedListingRecord,
  createApprovedListing,
  deleteApprovedListing,
  listApprovedListings,
  updateNominationStatus,
} from '@/lib/db';
import { checkAdminAuthorized } from '@/lib/auth';
import { getTownBySlug } from '@/config/region';
import { getCategoryBySlug } from '@/config/categories';

function toSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function normalizePhoneAndSocial(contact: string): {
  phone: string;
  whatsappNumber: string;
  facebookUrl: string;
} {
  const trimmed = contact.trim();
  const isUrlOrFb =
    trimmed.toLowerCase().includes('facebook.com') ||
    trimmed.toLowerCase().includes('fb.com') ||
    trimmed.startsWith('http');

  if (isUrlOrFb) {
    const fbUrl = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    return {
      phone: 'Via Facebook Page',
      whatsappNumber: '',
      facebookUrl: fbUrl,
    };
  }

  const digits = trimmed.replace(/\D/g, '');
  const wa =
    digits.startsWith('07') && digits.length >= 10
      ? `44${digits.slice(1)}`
      : digits.startsWith('447')
      ? digits
      : '';

  return {
    phone: trimmed,
    whatsappNumber: wa,
    facebookUrl: '',
  };
}

export async function GET(request: Request) {
  const auth = await checkAdminAuthorized(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Steward authentication required.' }, { status: 401 });
  }
  const listings = await listApprovedListings();
  return NextResponse.json({ listings });
}

export async function POST(request: Request) {
  const auth = await checkAdminAuthorized(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Steward authentication required.' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = String(body?.name || '').trim();
    const townSlug = String(body?.townSlug || 'crewe').trim().toLowerCase();
    const categorySlug = String(body?.categorySlug || 'plumbers').trim().toLowerCase();
    const contact = String(body?.phoneOrFacebook || body?.phone || '').trim();
    const areaLabel = String(body?.areaLabel || '').trim();
    const postcode = String(body?.postcode || '').trim().toUpperCase();
    const websiteUrlRaw = String(body?.websiteUrl || '').trim();
    const shortSummary = String(body?.shortSummary || '').trim();
    const priceGuide = String(body?.priceGuide || '').trim();
    const nominatedBy = String(body?.nominatedBy || '').trim();
    const nominationId = String(body?.nominationId || '').trim();

    if (!name || !contact) {
      return NextResponse.json(
        { error: 'Business name and phone or Facebook link are required.' },
        { status: 400 }
      );
    }

    const town = getTownBySlug(townSlug);
    const category = getCategoryBySlug(categorySlug);
    const primaryTownName = town?.name || 'Crewe';
    const categoryName = category?.name || 'Local Tradesperson';
    const defaultOutward = town?.postcodes[0] || 'CW1';

    const { phone, whatsappNumber, facebookUrl } = normalizePhoneAndSocial(contact);
    const slugBase = toSlug(`${name}-${townSlug}`) || 'cw-local-trade';
    const uniqueSuffix = Date.now().toString().slice(-4);
    const slug = `${slugBase}-${uniqueSuffix}`;

    const record: ApprovedListingRecord = {
      id: `cw-real-${Date.now().toString().slice(-6)}`,
      slug,
      name,
      categorySlug: category?.slug || categorySlug,
      categoryName,
      primaryTownSlug: town?.slug || townSlug,
      primaryTownName,
      townsServed: [town?.slug || townSlug],
      areaLabel: areaLabel || `${primaryTownName} & Surrounding Villages`,
      postcode: postcode || defaultOutward,
      outwardPostcode: postcode ? postcode.split(/\s+/)[0] : defaultOutward,
      phone,
      whatsappNumber,
      facebookUrl,
      websiteUrl: websiteUrlRaw
        ? websiteUrlRaw.startsWith('http')
          ? websiteUrlRaw
          : `https://${websiteUrlRaw}`
        : null,
      shortSummary:
        shortSummary ||
        `Neighbour-recommended ${categoryName.toLowerCase()} serving ${primaryTownName} and wider CW1–CW11 communities.`,
      priceGuide: priceGuide || 'Free local quote • Direct neighbour rate',
      nominatedBy,
      createdAt: new Date().toISOString(),
    };

    await createApprovedListing(record);

    if (nominationId) {
      await updateNominationStatus(nominationId, 'Approved & Live');
    }

    return NextResponse.json({
      success: true,
      listing: record,
    });
  } catch {
    return NextResponse.json(
      { error: 'Unable to publish local trade listing.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const auth = await checkAdminAuthorized(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Steward authentication required.' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = String(searchParams.get('id') || '').trim();
  if (!id) {
    return NextResponse.json({ error: 'Listing id is required.' }, { status: 400 });
  }
  await deleteApprovedListing(id);
  return NextResponse.json({ success: true });
}
