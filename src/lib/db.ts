import fs from 'node:fs';
import path from 'node:path';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import initialNominations from '@/data/nominations.json';
import initialVouches from '@/data/vouches.json';
import initialLeads from '@/data/leads.json';
import initialClaims from '@/data/claims.json';
import initialApprovedListings from '@/data/approved-listings.json';
import initialSiteSettings from '@/data/site-settings.json';

export interface CommunityNomination {
  id: string;
  createdAt: string;
  tradeName: string;
  townSlug: string;
  categorySlug: string;
  phoneOrFacebook: string;
  nominatedBy: string;
  relationshipNote: string;
  reason: string;
  status: string;
}

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

export interface ApprovedListingRecord {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  categoryName: string;
  primaryTownSlug: string;
  primaryTownName: string;
  townsServed: string[];
  areaLabel: string;
  postcode: string;
  outwardPostcode: string;
  phone: string;
  whatsappNumber: string;
  facebookUrl: string;
  websiteUrl: string | null;
  shortSummary: string;
  priceGuide: string;
  nominatedBy: string;
  createdAt: string;
}

interface D1PreparedStatementLike {
  bind(...values: unknown[]): D1PreparedStatementLike;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<unknown>;
}

interface D1DatabaseLike {
  prepare(query: string): D1PreparedStatementLike;
  batch(statements: D1PreparedStatementLike[]): Promise<unknown[]>;
}

let schemaReadyPromise: Promise<void> | null = null;

async function getD1(): Promise<D1DatabaseLike | null> {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx?.env as unknown as Record<string, unknown> | undefined;
    const db = env?.DB as D1DatabaseLike | undefined;
    if (db && typeof db.prepare === 'function') {
      await ensureSchema(db);
      return db;
    }
  } catch {
    // Fallback to local JSON store during build time or plain `next dev`
  }
  return null;
}

async function ensureSchema(db: D1DatabaseLike): Promise<void> {
  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      await db.batch([
        db.prepare(`CREATE TABLE IF NOT EXISTS nominations (
          id TEXT PRIMARY KEY,
          created_at TEXT NOT NULL,
          trade_name TEXT NOT NULL,
          town_slug TEXT NOT NULL,
          category_slug TEXT NOT NULL,
          phone_or_facebook TEXT NOT NULL,
          nominated_by TEXT NOT NULL,
          relationship_note TEXT NOT NULL DEFAULT '',
          reason TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL DEFAULT 'Pending Community Review'
        )`),
        db.prepare(`CREATE TABLE IF NOT EXISTS vouches (
          slug TEXT PRIMARY KEY,
          count INTEGER NOT NULL DEFAULT 0,
          updated_at TEXT NOT NULL
        )`),
        db.prepare(`CREATE TABLE IF NOT EXISTS leads (
          id TEXT PRIMARY KEY,
          created_at TEXT NOT NULL,
          homeowner_name TEXT NOT NULL,
          phone TEXT NOT NULL,
          postcode TEXT NOT NULL,
          town_slug TEXT NOT NULL,
          category_slug TEXT NOT NULL,
          urgency TEXT NOT NULL,
          job_description TEXT NOT NULL DEFAULT '',
          estimated_value_gbp INTEGER NOT NULL DEFAULT 250,
          status TEXT NOT NULL DEFAULT 'Routed to Local Pros',
          routed_to_json TEXT NOT NULL DEFAULT '[]'
        )`),
        db.prepare(`CREATE TABLE IF NOT EXISTS claims (
          id TEXT PRIMARY KEY,
          created_at TEXT NOT NULL,
          business_name TEXT NOT NULL,
          contact_name TEXT NOT NULL,
          phone TEXT NOT NULL,
          email TEXT NOT NULL,
          town_slug TEXT NOT NULL,
          category_slug TEXT NOT NULL,
          selected_plan TEXT NOT NULL DEFAULT 'basic',
          monthly_value_gbp INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL,
          notes TEXT NOT NULL DEFAULT ''
        )`),
        db.prepare(`CREATE TABLE IF NOT EXISTS approved_listings (
          id TEXT PRIMARY KEY,
          slug TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          category_slug TEXT NOT NULL,
          category_name TEXT NOT NULL,
          primary_town_slug TEXT NOT NULL,
          primary_town_name TEXT NOT NULL,
          towns_served_json TEXT NOT NULL DEFAULT '[]',
          area_label TEXT NOT NULL,
          postcode TEXT NOT NULL,
          outward_postcode TEXT NOT NULL,
          phone TEXT NOT NULL,
          whatsapp_number TEXT NOT NULL DEFAULT '',
          facebook_url TEXT NOT NULL DEFAULT '',
          website_url TEXT,
          short_summary TEXT NOT NULL,
          price_guide TEXT NOT NULL DEFAULT 'Free local quote • Direct neighbour rate',
          nominated_by TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL
        )`),
        db.prepare(`CREATE TABLE IF NOT EXISTS site_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )`),
      ]);
    })().catch((err) => {
      schemaReadyPromise = null;
      throw err;
    });
  }
  await schemaReadyPromise;
}

// Local JSON fallbacks (used in local dev / tests when D1 binding is absent)
const memoryNominations: CommunityNomination[] = [
  ...(initialNominations as CommunityNomination[]),
];
const memoryVouches: Record<string, number> = {
  ...(initialVouches as Record<string, number>),
};
const memoryLeads: HomeownerLead[] = [...(initialLeads as HomeownerLead[])];
const memoryClaims: BusinessClaim[] = [...(initialClaims as BusinessClaim[])];
const memoryApprovedListings: ApprovedListingRecord[] = [
  ...(initialApprovedListings as ApprovedListingRecord[]),
];
let memoryShowDemoListings: boolean =
  typeof (initialSiteSettings as { showDemoListings?: boolean }).showDemoListings === 'boolean'
    ? Boolean((initialSiteSettings as { showDemoListings?: boolean }).showDemoListings)
    : true;

function readJsonFile<T>(relPath: string, fallback: T): T {
  try {
    const filePath = path.join(/*turbopackIgnore: true*/ process.cwd(), relPath);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
    }
  } catch {
    // Ignore read errors on edge runtime
  }
  return fallback;
}

function writeJsonFile(relPath: string, data: unknown): void {
  try {
    const filePath = path.join(/*turbopackIgnore: true*/ process.cwd(), relPath);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch {
    // Ignore write errors on read-only runtime
  }
}

// --- Nominations ---

export async function listNominations(): Promise<CommunityNomination[]> {
  const db = await getD1();
  if (db) {
    const { results } = await db
      .prepare(
        `SELECT id, created_at, trade_name, town_slug, category_slug, phone_or_facebook, nominated_by, relationship_note, reason, status
         FROM nominations ORDER BY created_at DESC`
      )
      .all<Record<string, unknown>>();
    return results.map((r) => ({
      id: String(r.id),
      createdAt: String(r.created_at),
      tradeName: String(r.trade_name),
      townSlug: String(r.town_slug),
      categorySlug: String(r.category_slug),
      phoneOrFacebook: String(r.phone_or_facebook),
      nominatedBy: String(r.nominated_by),
      relationshipNote: String(r.relationship_note || ''),
      reason: String(r.reason || ''),
      status: String(r.status),
    }));
  }
  return readJsonFile<CommunityNomination[]>('src/data/nominations.json', memoryNominations);
}

export async function createNomination(nom: CommunityNomination): Promise<CommunityNomination> {
  const db = await getD1();
  if (db) {
    await db
      .prepare(
        `INSERT INTO nominations (id, created_at, trade_name, town_slug, category_slug, phone_or_facebook, nominated_by, relationship_note, reason, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        nom.id,
        nom.createdAt,
        nom.tradeName,
        nom.townSlug,
        nom.categorySlug,
        nom.phoneOrFacebook,
        nom.nominatedBy,
        nom.relationshipNote,
        nom.reason,
        nom.status
      )
      .run();
    return nom;
  }

  memoryNominations.unshift(nom);
  const existing = readJsonFile<CommunityNomination[]>('src/data/nominations.json', memoryNominations);
  const updated = [nom, ...existing.filter((n) => n.id !== nom.id)];
  writeJsonFile('src/data/nominations.json', updated);
  return nom;
}

export async function updateNominationStatus(id: string, status: string): Promise<boolean> {
  const db = await getD1();
  if (db) {
    await db.prepare(`UPDATE nominations SET status = ? WHERE id = ?`).bind(status, id).run();
    return true;
  }

  const existing = readJsonFile<CommunityNomination[]>('src/data/nominations.json', memoryNominations);
  const idx = existing.findIndex((n) => n.id === id);
  if (idx !== -1) {
    existing[idx] = { ...existing[idx], status };
    writeJsonFile('src/data/nominations.json', existing);
  }
  const memIdx = memoryNominations.findIndex((n) => n.id === id);
  if (memIdx !== -1) {
    memoryNominations[memIdx] = { ...memoryNominations[memIdx], status };
  }
  return idx !== -1 || memIdx !== -1;
}

// --- Vouches ---

export async function getVouchCount(slug: string): Promise<number> {
  const db = await getD1();
  if (db) {
    const row = await db
      .prepare(`SELECT count FROM vouches WHERE slug = ?`)
      .bind(slug)
      .first<{ count: number }>();
    return Number(row?.count || 0);
  }
  const map = readJsonFile<Record<string, number>>('src/data/vouches.json', memoryVouches);
  return Number(map[slug] || 0);
}

export async function getAllVouches(): Promise<Record<string, number>> {
  const db = await getD1();
  if (db) {
    const { results } = await db
      .prepare(`SELECT slug, count FROM vouches`)
      .all<{ slug: string; count: number }>();
    const map: Record<string, number> = {};
    for (const r of results) {
      map[String(r.slug)] = Number(r.count || 0);
    }
    return map;
  }
  return readJsonFile<Record<string, number>>('src/data/vouches.json', memoryVouches);
}

export async function incrementVouch(slug: string): Promise<number> {
  const db = await getD1();
  if (db) {
    const now = new Date().toISOString();
    await db
      .prepare(
        `INSERT INTO vouches (slug, count, updated_at) VALUES (?, 1, ?)
         ON CONFLICT(slug) DO UPDATE SET count = vouches.count + 1, updated_at = excluded.updated_at`
      )
      .bind(slug, now)
      .run();
    const row = await db
      .prepare(`SELECT count FROM vouches WHERE slug = ?`)
      .bind(slug)
      .first<{ count: number }>();
    return Number(row?.count || 1);
  }

  const current = readJsonFile<Record<string, number>>('src/data/vouches.json', memoryVouches);
  const nextCount = Number(current[slug] || 0) + 1;
  current[slug] = nextCount;
  memoryVouches[slug] = nextCount;
  writeJsonFile('src/data/vouches.json', current);
  return nextCount;
}

// --- Leads ---

export async function listLeads(): Promise<HomeownerLead[]> {
  const db = await getD1();
  if (db) {
    const { results } = await db
      .prepare(
        `SELECT id, created_at, homeowner_name, phone, postcode, town_slug, category_slug, urgency, job_description, estimated_value_gbp, status, routed_to_json
         FROM leads ORDER BY created_at DESC`
      )
      .all<Record<string, unknown>>();
    return results.map((r) => ({
      id: String(r.id),
      createdAt: String(r.created_at),
      homeownerName: String(r.homeowner_name),
      phone: String(r.phone),
      postcode: String(r.postcode),
      townSlug: String(r.town_slug),
      categorySlug: String(r.category_slug),
      urgency: String(r.urgency),
      jobDescription: String(r.job_description || ''),
      estimatedValueGbp: Number(r.estimated_value_gbp || 250),
      status: String(r.status),
      routedTo: safeParseArray(r.routed_to_json),
    }));
  }
  return readJsonFile<HomeownerLead[]>('src/data/leads.json', memoryLeads);
}

export async function createLead(lead: HomeownerLead): Promise<HomeownerLead> {
  const db = await getD1();
  if (db) {
    await db
      .prepare(
        `INSERT INTO leads (id, created_at, homeowner_name, phone, postcode, town_slug, category_slug, urgency, job_description, estimated_value_gbp, status, routed_to_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        lead.id,
        lead.createdAt,
        lead.homeownerName,
        lead.phone,
        lead.postcode,
        lead.townSlug,
        lead.categorySlug,
        lead.urgency,
        lead.jobDescription,
        lead.estimatedValueGbp,
        lead.status,
        JSON.stringify(lead.routedTo)
      )
      .run();
    return lead;
  }

  memoryLeads.unshift(lead);
  const existing = readJsonFile<HomeownerLead[]>('src/data/leads.json', memoryLeads);
  const updated = [lead, ...existing.filter((l) => l.id !== lead.id)];
  writeJsonFile('src/data/leads.json', updated);
  return lead;
}

// --- Business Claims ---

export async function listClaims(): Promise<BusinessClaim[]> {
  const db = await getD1();
  if (db) {
    const { results } = await db
      .prepare(
        `SELECT id, created_at, business_name, contact_name, phone, email, town_slug, category_slug, selected_plan, monthly_value_gbp, status, notes
         FROM claims ORDER BY created_at DESC`
      )
      .all<Record<string, unknown>>();
    return results.map((r) => ({
      id: String(r.id),
      createdAt: String(r.created_at),
      businessName: String(r.business_name),
      contactName: String(r.contact_name),
      phone: String(r.phone),
      email: String(r.email),
      townSlug: String(r.town_slug),
      categorySlug: String(r.category_slug),
      selectedPlan: (String(r.selected_plan) as BusinessClaim['selectedPlan']) || 'basic',
      monthlyValueGbp: Number(r.monthly_value_gbp || 0),
      status: String(r.status),
      notes: String(r.notes || ''),
    }));
  }
  return readJsonFile<BusinessClaim[]>('src/data/claims.json', memoryClaims);
}

export async function createClaim(claim: BusinessClaim): Promise<BusinessClaim> {
  const db = await getD1();
  if (db) {
    await db
      .prepare(
        `INSERT INTO claims (id, created_at, business_name, contact_name, phone, email, town_slug, category_slug, selected_plan, monthly_value_gbp, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        claim.id,
        claim.createdAt,
        claim.businessName,
        claim.contactName,
        claim.phone,
        claim.email,
        claim.townSlug,
        claim.categorySlug,
        claim.selectedPlan,
        claim.monthlyValueGbp,
        claim.status,
        claim.notes
      )
      .run();
    return claim;
  }

  memoryClaims.unshift(claim);
  const existing = readJsonFile<BusinessClaim[]>('src/data/claims.json', memoryClaims);
  const updated = [claim, ...existing.filter((c) => c.id !== claim.id)];
  writeJsonFile('src/data/claims.json', updated);
  return claim;
}

// --- Approved Community Listings (Live D1 + Local Fallback) ---

export async function listApprovedListings(): Promise<ApprovedListingRecord[]> {
  const db = await getD1();
  if (db) {
    const { results } = await db
      .prepare(
        `SELECT id, slug, name, category_slug, category_name, primary_town_slug, primary_town_name, towns_served_json, area_label, postcode, outward_postcode, phone, whatsapp_number, facebook_url, website_url, short_summary, price_guide, nominated_by, created_at
         FROM approved_listings ORDER BY created_at DESC`
      )
      .all<Record<string, unknown>>();
    return results.map((r) => ({
      id: String(r.id),
      slug: String(r.slug),
      name: String(r.name),
      categorySlug: String(r.category_slug),
      categoryName: String(r.category_name),
      primaryTownSlug: String(r.primary_town_slug),
      primaryTownName: String(r.primary_town_name),
      townsServed: safeParseArray(r.towns_served_json),
      areaLabel: String(r.area_label),
      postcode: String(r.postcode),
      outwardPostcode: String(r.outward_postcode),
      phone: String(r.phone),
      whatsappNumber: String(r.whatsapp_number || ''),
      facebookUrl: String(r.facebook_url || ''),
      websiteUrl: r.website_url ? String(r.website_url) : null,
      shortSummary: String(r.short_summary),
      priceGuide: String(r.price_guide || 'Free local quote • Direct neighbour rate'),
      nominatedBy: String(r.nominated_by || ''),
      createdAt: String(r.created_at),
    }));
  }
  return readJsonFile<ApprovedListingRecord[]>(
    'src/data/approved-listings.json',
    memoryApprovedListings
  );
}

export async function createApprovedListing(
  record: ApprovedListingRecord
): Promise<ApprovedListingRecord> {
  const db = await getD1();
  if (db) {
    await db
      .prepare(
        `INSERT INTO approved_listings (id, slug, name, category_slug, category_name, primary_town_slug, primary_town_name, towns_served_json, area_label, postcode, outward_postcode, phone, whatsapp_number, facebook_url, website_url, short_summary, price_guide, nominated_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        record.id,
        record.slug,
        record.name,
        record.categorySlug,
        record.categoryName,
        record.primaryTownSlug,
        record.primaryTownName,
        JSON.stringify(record.townsServed),
        record.areaLabel,
        record.postcode,
        record.outwardPostcode,
        record.phone,
        record.whatsappNumber,
        record.facebookUrl,
        record.websiteUrl,
        record.shortSummary,
        record.priceGuide,
        record.nominatedBy,
        record.createdAt
      )
      .run();
    return record;
  }

  memoryApprovedListings.unshift(record);
  const existing = readJsonFile<ApprovedListingRecord[]>(
    'src/data/approved-listings.json',
    memoryApprovedListings
  );
  const updated = [record, ...existing.filter((x) => x.id !== record.id)];
  writeJsonFile('src/data/approved-listings.json', updated);
  return record;
}

export async function deleteApprovedListing(id: string): Promise<boolean> {
  const db = await getD1();
  if (db) {
    await db.prepare(`DELETE FROM approved_listings WHERE id = ?`).bind(id).run();
    return true;
  }

  const existing = readJsonFile<ApprovedListingRecord[]>(
    'src/data/approved-listings.json',
    memoryApprovedListings
  );
  const updated = existing.filter((x) => x.id !== id);
  writeJsonFile('src/data/approved-listings.json', updated);
  const idx = memoryApprovedListings.findIndex((x) => x.id === id);
  if (idx !== -1) memoryApprovedListings.splice(idx, 1);
  return true;
}

// --- Site Settings (Demo / Real Toggle) ---

export async function getShowDemoListings(): Promise<boolean> {
  const db = await getD1();
  if (db) {
    const row = await db
      .prepare(`SELECT value FROM site_settings WHERE key = 'show_demo_listings'`)
      .first<{ value: string }>();
    if (row && typeof row.value === 'string') {
      return row.value !== 'false';
    }
  } else {
    const localSettings = readJsonFile<{ showDemoListings?: boolean }>(
      'src/data/site-settings.json',
      { showDemoListings: memoryShowDemoListings }
    );
    if (typeof localSettings.showDemoListings === 'boolean') {
      return localSettings.showDemoListings;
    }
  }
  const envDefault = String(process.env.NEXT_PUBLIC_DEMO_MODE || 'true');
  return envDefault !== 'false';
}

export async function setShowDemoListings(enabled: boolean): Promise<boolean> {
  const val = enabled ? 'true' : 'false';
  const db = await getD1();
  if (db) {
    await db
      .prepare(
        `INSERT INTO site_settings (key, value) VALUES ('show_demo_listings', ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`
      )
      .bind(val)
      .run();
    return enabled;
  }

  memoryShowDemoListings = enabled;
  writeJsonFile('src/data/site-settings.json', { showDemoListings: enabled });
  return enabled;
}

function safeParseArray(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}
