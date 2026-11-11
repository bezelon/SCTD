import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import initialClaims from '@/data/claims.json';

export interface BusinessClaim {
  id: string;
  createdAt: string;
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  townSlug: string;
  categorySlug: string;
  selectedPlan: 'basic' | 'featured' | 'shopfront';
  monthlyValueGbp: number;
  status: string;
  notes: string;
}

const memoryClaims: BusinessClaim[] = [...(initialClaims as BusinessClaim[])];

function loadClaims(): BusinessClaim[] {
  try {
    const filePath = path.join(process.cwd(), 'src/data/claims.json');
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch {
    // Fallback to in-memory store
  }
  return memoryClaims;
}

export async function GET() {
  return NextResponse.json({ claims: loadClaims() });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
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
      id: `claim-${Date.now().toString().slice(-5)}`,
      createdAt: new Date().toISOString(),
      businessName: String(businessName).trim(),
      contactName: String(contactName).trim(),
      phone: String(phone).trim(),
      email: String(email).trim(),
      townSlug,
      categorySlug,
      selectedPlan,
      monthlyValueGbp,
      status,
      notes: String(notes).trim(),
    };

    memoryClaims.unshift(newClaim);

    try {
      const filePath = path.join(process.cwd(), 'src/data/claims.json');
      const existing = loadClaims();
      const updated = [newClaim, ...existing.filter((c) => c.id !== newClaim.id)];
      fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf8');
    } catch {
      // Ignore read-only filesystem on serverless deployment
    }

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
