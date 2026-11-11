#!/usr/bin/env node
/**
 * SOUTH CHESHIRE TRADES - AUTOMATED "CLAIM YOUR LISTING" OUTREACH GENERATOR
 * Usage:
 *   node scripts/generate-outreach-csv.mjs
 *
 * Generates ready-to-send email & WhatsApp/Facebook DM campaigns for local businesses
 * in Crewe, Nantwich & Sandbach, prioritising high-conversion targets (unclaimed profiles
 * and trades with no dedicated website).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LISTINGS_PATH = path.resolve(__dirname, '../src/data/listings.json');
const CSV_OUTPUT_PATH = path.resolve(__dirname, '../src/data/outreach-campaigns.csv');
const JSON_OUTPUT_PATH = path.resolve(__dirname, '../src/data/outreach-campaigns.json');

function escapeCsv(val) {
  const str = String(val ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function main() {
  if (!fs.existsSync(LISTINGS_PATH)) {
    console.error('Run `node scripts/import-and-enrich.mjs` first to generate listings.json');
    process.exit(1);
  }

  const listings = JSON.parse(fs.readFileSync(LISTINGS_PATH, 'utf8'));
  const unclaimed = listings.filter((l) => !l.isClaimed);

  const campaigns = unclaimed.map((biz) => {
    const profileUrl = `https://southcheshiretrades.co.uk/pro/${biz.slug}`;
    const claimUrl = `https://southcheshiretrades.co.uk/for-businesses?claim=${biz.slug}`;
    const pitchType = biz.noWebsiteOpportunity
      ? 'HIGH_PRIORITY_NO_WEBSITE'
      : 'TOP_3_SCARCITY_SLOT';

    const subjectLine = biz.noWebsiteOpportunity
      ? `Your ${biz.primaryTownName} profile on South Cheshire Trades (+ 1 Top-3 spot left in ${biz.outwardPostcode})`
      : `Quick question re: ${biz.name} (${biz.primaryTownName} Top 3 ${biz.categoryName} spot)`;

    const whatsappOrFbMessage = biz.noWebsiteOpportunity
      ? `Hi ${biz.name} team 👋 I live locally in Crewe and noticed you get great local feedback around ${biz.areaLabel}, so we've added a free profile for you on South Cheshire Trades (${profileUrl}). Since you mainly use Facebook rather than a full website, we can also switch on a full Digital Shopfront + lock in the last Top-3 Featured ${biz.categoryName} spot for ${biz.primaryTownName} (${biz.outwardPostcode}) at £29/mo. You can claim or edit your free listing here in 60 seconds: ${claimUrl}`
      : `Hi ${biz.name} 👋 We've listed your business in the ${biz.primaryTownName} (${biz.outwardPostcode}) ${biz.categoryName} directory at ${profileUrl}. Right now 2 of the 3 Featured Top-3 slots for ${biz.primaryTownName} are taken and 1 slot is still open (£29/mo – 1 job covers the whole year). You can verify your free listing or grab the last Top-3 spot here: ${claimUrl}`;

    return {
      id: biz.id,
      businessName: biz.name,
      town: biz.primaryTownName,
      postcode: biz.postcode,
      category: biz.categoryName,
      phone: biz.phone,
      email: biz.email,
      facebookUrl: biz.facebookUrl,
      hasWebsite: biz.hasWebsite,
      noWebsiteOpportunity: biz.noWebsiteOpportunity,
      pitchType,
      profileUrl,
      claimUrl,
      subjectLine,
      whatsappOrFbMessage,
    };
  });

  // Sort so HIGH_PRIORITY_NO_WEBSITE comes first
  campaigns.sort((a, b) => Number(b.noWebsiteOpportunity) - Number(a.noWebsiteOpportunity));

  const headers = [
    'Business Name',
    'Town',
    'Postcode',
    'Category',
    'Phone',
    'Email',
    'Has Website',
    'Pitch Priority',
    'Profile URL',
    'Claim URL',
    'Email Subject',
    'WhatsApp / FB Message',
  ];

  const csvRows = [
    headers.join(','),
    ...campaigns.map((c) =>
      [
        c.businessName,
        c.town,
        c.postcode,
        c.category,
        c.phone,
        c.email,
        c.hasWebsite ? 'Yes' : 'No (FB Only)',
        c.pitchType,
        c.profileUrl,
        c.claimUrl,
        c.subjectLine,
        c.whatsappOrFbMessage,
      ]
        .map(escapeCsv)
        .join(',')
    ),
  ];

  fs.writeFileSync(CSV_OUTPUT_PATH, csvRows.join('\n'), 'utf8');
  fs.writeFileSync(JSON_OUTPUT_PATH, JSON.stringify(campaigns, null, 2), 'utf8');

  console.log(`✅ Generated ${campaigns.length} automated outreach campaigns:`);
  console.log(`   • CSV:  ${CSV_OUTPUT_PATH}`);
  console.log(`   • JSON: ${JSON_OUTPUT_PATH}`);
}

main();
