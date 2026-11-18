-- Cloudflare D1 schema for South Cheshire Locals (CW1-CW11)
-- Run locally:  npx wrangler d1 execute sctd-community-db --local --file=./migrations/0001_init.sql
-- Run remotely: npx wrangler d1 execute sctd-community-db --remote --file=./migrations/0001_init.sql

CREATE TABLE IF NOT EXISTS nominations (
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
);

CREATE TABLE IF NOT EXISTS vouches (
  slug TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS leads (
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
);

CREATE TABLE IF NOT EXISTS claims (
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
);

CREATE TABLE IF NOT EXISTS approved_listings (
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
);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('show_demo_listings', 'true');

INSERT OR IGNORE INTO nominations (
  id, created_at, trade_name, town_slug, category_slug, phone_or_facebook, nominated_by, relationship_note, reason, status
) VALUES
  (
    'nom-1001',
    '2026-11-12T10:15:00.000Z',
    'Cheshire Brick & Chimney Repairs (Mick Turner)',
    'crewe',
    'roofers',
    '07742 319840',
    'Claire B. (Wistaston, CW2)',
    'Neighbour & family friend',
    'Fixed our ridge tiles after the storm for a fair local price, turned up when he promised and tidied everything up.',
    'Pending Community Review'
  ),
  (
    'nom-1002',
    '2026-11-13T16:40:00.000Z',
    'Nantwich Handyman & Joinery (Pete & Son)',
    'nantwich',
    'handyman',
    'facebook.com/NantwichHandymanPete',
    'Graham H. (Willaston, CW5)',
    'Used twice for doors & fencing',
    'Father and son team from Willaston — no website, just honest word-of-mouth work.',
    'Pending Community Review'
  );
