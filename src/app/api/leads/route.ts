import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import initialLeads from '@/data/leads.json';
import { getListingsByTownAndCategory } from '@/lib/listings';

export interface HomeownerLead {
  id: string;
  createdAt: string;
  homeownerName: string;
  phone: string;
  postcode: string;
  townSlug: string;
  categorySlug: string;
  urgency: string;
  jobDescription: string;
  estimatedValueGbp: number;
  status: string;
  routedTo: string[];
}

const memoryLeads: HomeownerLead[] = [...(initialLeads as HomeownerLead[])];

function loadLeads(): HomeownerLead[] {
  try {
    const filePath = path.join(process.cwd(), 'src/data/leads.json');
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch {
    // Fallback to in-memory store on serverless edge
  }
  return memoryLeads;
}

export async function GET() {
  return NextResponse.json({ leads: loadLeads() });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
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

    const matchedPros = getListingsByTownAndCategory(townSlug, categorySlug)
      .filter((l) => l.isFeatured || l.isVerifiedLocal)
      .slice(0, 3);

    const newLead: HomeownerLead = {
      id: `lead-${Date.now().toString().slice(-5)}`,
      createdAt: new Date().toISOString(),
      homeownerName: String(homeownerName).trim(),
      phone: String(phone).trim(),
      postcode: String(postcode).trim().toUpperCase(),
      townSlug,
      categorySlug,
      urgency,
      jobDescription: String(jobDescription).trim(),
      estimatedValueGbp: urgency.includes('Emergency') ? 240 : 320,
      status: 'Routed to Top 3 Pros',
      routedTo: matchedPros.map((p) => p.name),
    };

    memoryLeads.unshift(newLead);

    try {
      const filePath = path.join(process.cwd(), 'src/data/leads.json');
      const existing = loadLeads();
      const updated = [newLead, ...existing.filter((l) => l.id !== newLead.id)];
      fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf8');
    } catch {
      // Ignore read-only filesystem on serverless deployment
    }

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
