#!/usr/bin/env node
/**
 * SOUTH CHESHIRE TRADES - AUTOMATED SEEDING & AI-STYLE ENRICHMENT PIPELINE
 * Usage:
 *   node scripts/import-and-enrich.mjs
 *   node scripts/import-and-enrich.mjs --input ./raw-google-maps.json
 *
 * What it does:
 * 1. Reads raw Google Maps / Outscraper exports OR generates our comprehensive 120-business
 *    South Cheshire (Crewe, Nantwich, Sandbach) seed dataset across all 10 categories.
 * 2. Normalises UK postcodes (CW1, CW2, CW5, CW11) and UK phone numbers (01270 / 07xxx).
 * 3. Detects "No Website / Facebook Only" businesses (`noWebsiteOpportunity: true`) — your #1
 *    warm outreach target for £29/mo Featured and £59/mo Digital Shopfront plans.
 * 4. Enriches each business with Chris Koerner's "Filter Gap" tags (24/7 Emergency, No Call-Out Fee,
 *    Free Written Quotes, Trade Accredited, etc.) and local South Cheshire review snippets.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_PATH = path.resolve(__dirname, '../src/data/listings.json');

const TOWNS = [
  {
    slug: 'crewe',
    name: 'Crewe',
    postcodes: ['CW1 2', 'CW1 3', 'CW1 4', 'CW1 6', 'CW2 5', 'CW2 6', 'CW2 7', 'CW2 8'],
    areas: ['Wistaston', 'Shavington', 'Haslington', 'Sydney', 'Leighton', 'Coppenhall', 'Weston'],
    streets: ['Nantwich Road', 'Earle Street', 'West Street', 'hungerford Road', 'Crewe Green Road', 'Middlewich Street', 'Sydney Road', 'Remer Street'],
  },
  {
    slug: 'nantwich',
    name: 'Nantwich',
    postcodes: ['CW5 5', 'CW5 6', 'CW5 7', 'CW5 8'],
    areas: ['Willaston', 'Stapeley', 'Acton', 'Audlem', 'Wrenbury', 'Wybunbury', 'Worleston'],
    streets: ['Hospital Street', 'Welsh Row', 'Beam Street', 'Wellington Road', 'London Road', 'Millstone Lane', 'Cronkinson Farm'],
  },
  {
    slug: 'sandbach',
    name: 'Sandbach',
    postcodes: ['CW11 1', 'CW11 2', 'CW11 3', 'CW11 4'],
    areas: ['Elworth', 'Ettiley Heath', 'Wheelock', 'Winterley', 'Bradwall', 'Malkins Bank'],
    streets: ['High Street', 'Middlewich Road', 'Crewe Road', 'Congleton Road', 'Station Road', 'Hind Heath Road', 'Bradwall Road'],
  },
];

const CATEGORY_SEEDS = [
  {
    slug: 'plumbers',
    categoryName: 'Plumbers & Heating Engineers',
    accreditationBody: 'Gas Safe Register #584',
    baseFilters: ['gas-safe', 'free-quotes', 'card-accepted', 'family-local'],
    urgentFilters: ['emergency-24-7', 'no-callout-fee', 'landlord-certs'],
    servicesPool: [
      'Worcester Bosch & Vaillant Boiler Servicing',
      '24/7 Emergency Burst Pipe & Leak Repairs',
      'Landlord CP12 Gas Safety Certificates',
      'Central Heating Powerflushing & Radiators',
      'Unvented Hot Water Cylinders & Smart Thermostats',
      'Tap, Toilet & Shower Mixer Replacements',
    ],
    nameTemplates: [
      '{Area} Heating & Plumbing Ltd',
      '{Town} Gas Safe Boilers & Plumbing',
      'CW Emergency Plumbers ({Town})',
      'Weaver Valley Heating & Gas',
      'Cheshire Flow Plumbing & Boilers',
      'Apex Heating Engineers {Town}',
    ],
    reviewSnippets: [
      'Came out to {Area} within 45 minutes on a Sunday evening when our combi boiler lost pressure. No call-out fee and fixed on the spot.',
      'Serviced our Worcester boiler and issued the landlord gas safety certificate in {Town}. Spotless work and fair upfront pricing.',
      'Sorted a leaking radiator valve and fitted a Hive thermostat at our home near {Street}. Genuine local {Town} tradesman.',
    ],
    priceGuide: 'Boiler service £75 • Callout £0 (Daytime) • Hourly £65',
  },
  {
    slug: 'electricians',
    categoryName: 'Electricians & EV Installers',
    accreditationBody: 'NICEIC Approved Contractor',
    baseFilters: ['niceic-napit', 'free-quotes', 'card-accepted', 'family-local'],
    urgentFilters: ['ev-chargers', 'eicr-testing', 'emergency-24-7'],
    servicesPool: [
      '18th Edition Metal Consumer Unit Upgrades',
      'EICR Landlord & Homebuyer Safety Certificates',
      'Ohme, Zappi & Pod Point EV Charger Installation',
      '24/7 Tripping RCD & Power Fault Diagnostics',
      'LED Downlights, Outdoor Security Lighting & Sockets',
      'Full & Partial Domestic Property Rewires',
    ],
    nameTemplates: [
      '{Town} Electrical & EV Solutions',
      '{Area} Sparks & NICEIC Electricians',
      'South Cheshire Electrical Services ({Town})',
      'VoltSafe Domestic Electricians {Town}',
      'CW Bright Electrical & EV Chargers',
      'brightWire {Town} & {Area} Electrical',
    ],
    reviewSnippets: [
      'Upgraded our old plastic fuse box to a new RCBO consumer unit in {Area} and completed the EICR certificate the same afternoon.',
      'Neat Zappi EV charger install on our driveway off {Street} in {Town}. Hid all cabling cleanly and sorted the DNO notification.',
      'Found a tricky earth fault that kept tripping our kitchen sockets in {Town} within half an hour. Very polite and transparent pricing.',
    ],
    priceGuide: 'EICR from £140 • EV Charger Install from £350 (labour) • Fault find £65',
  },
  {
    slug: 'roofers',
    categoryName: 'Roofers & Guttering Specialists',
    accreditationBody: 'Confederation of Roofing Contractors / Insured',
    baseFilters: ['free-quotes', 'gutter-fascia', 'family-local', 'card-accepted'],
    urgentFilters: ['storm-repairs', 'drone-inspection', 'flat-roofs'],
    servicesPool: [
      'Emergency Slipped Slate & Ridge Tile Repairs',
      'EPDM Firestone Rubber & GRP Fibreglass Flat Roofs',
      'Chimney Stack Repointing & Lead Flashing',
      'uPVC Fascias, Soffits & Deep-Flow Guttering',
      'High-Resolution Drone Roof Inspections',
      'Breathable Membrane & Full Roof Replacements',
    ],
    nameTemplates: [
      '{Town} Roofing & Gutter Care',
      '{Area} Slate, Tile & Flat Roofs',
      'Cheshire Ridgeline Roofing ({Town})',
      'First Call Storm Roof Repairs {Town}',
      'CW WeatherShield Roofing & Fascias',
      'Heritage & Modern Roofing {Town}',
    ],
    reviewSnippets: [
      'Showed us clear drone photos of the cracked lead flashing on our chimney in {Area} before quoting, then sent after-photos once sealed.',
      'One of the few roofers in {Town} happy to come out and replace 4 storm-damaged ridge tiles without pushing for a full new roof.',
      'Replaced our leaking garage felt roof in {Area} with a one-piece EPDM rubber roof. 20-year guarantee and left the drive spotless.',
    ],
    priceGuide: 'Minor tile repair from £95 • Gutter clear £65 • Free drone roof survey',
  },
  {
    slug: 'driveway-cleaning',
    categoryName: 'Driveway Cleaning, Jet Washing & Paving',
    accreditationBody: 'SmartSeal Registered & £5m Public Liability',
    baseFilters: ['free-quotes', 're-sanding-sealing', 'family-local', 'card-accepted'],
    urgentFilters: ['whatsapp-quote', 'softwash-patio', 'resin-block-install'],
    servicesPool: [
      'Commercial Rotary Flat-Surface Driveway Pressure Washing',
      'Block Paving Kiln-Dried Re-Sanding & Weed Inhibition',
      'Indian Sandstone Black-Spot & Lichen Softwashing',
      'Resin-Bound & Marshall Block Paving Installations',
      'Roof Moss Biocide Treatment & Gutter Vacuuming',
      'Matt & Silk Acrylic Driveway Sealing',
    ],
    nameTemplates: [
      '{Town} Jet Wash & Driveway Revival',
      '{Area} Exterior Cleaning & Paving',
      'South Cheshire Pressure Washing ({Town})',
      'Crystal Clean Driveways & Patios {Town}',
      'CW Block & Resin Driveway Care',
      'ProWash Exterior Specialists {Town}',
    ],
    reviewSnippets: [
      'Sent a WhatsApp photo of our mossy block-paved drive in {Area} and got a fixed price in 10 minutes. Looks brand new after re-sanding!',
      'Removed years of black spots from our Indian stone patio in {Town} without blasting the mortar joints out. Brilliant commercial gear.',
      'Cleaned, kiln-dried sanded and sealed our 3-car driveway off {Street}. Neighbours already asked for their number.',
    ],
    priceGuide: 'Driveway jet wash & re-sand from £145 • Patio black-spot clean from £110',
  },
  {
    slug: 'landscapers',
    categoryName: 'Landscapers, Fencing & Tree Surgeons',
    accreditationBody: 'NPTC City & Guilds & EA Waste Carrier #CBDU',
    baseFilters: ['free-quotes', 'waste-licence', 'family-local', 'card-accepted'],
    urgentFilters: ['fencing-repairs', 'nptc-tree', 'patios-turf'],
    servicesPool: [
      'Heavy-Duty Concrete Post & Gravel Board Fencing',
      'NPTC Tree Crown Reduction, Felling & Stump Grinding',
      'Porcelain & Indian Sandstone Patio Paving',
      'Luxury Pet-Friendly Artificial Grass & Cheshire Turf',
      'Conifer & Laurel Hedge Trimming & Removal',
      'Railway Sleeper Raised Beds & Pergolas',
    ],
    nameTemplates: [
      '{Town} Fencing & Tree Surgery',
      '{Area} Landscapes & Garden Makeovers',
      'Cheshire Oak Tree Surgeons & Fencing ({Town})',
      'GreenBoundary Fencing & Patios {Town}',
      'CW Timber & Stone Landscaping',
      'Weaver Gardens & Arborists {Town}',
    ],
    reviewSnippets: [
      'Replaced 6 storm-damaged fence panels with concrete posts and gravel boards in {Area}. Took all the old rotten panels away.',
      'NPTC qualified team reduced two huge conifers in our {Town} garden and shredded every branch on site. Super tidy and polite.',
      'Laid a stunning porcelain patio and fresh turf at our new-build in {Area}. Fixed written quote with zero hidden extras.',
    ],
    priceGuide: 'Concrete post fencing from £140/bay • Hedge & tree quotes free on site',
  },
  {
    slug: 'locksmiths',
    categoryName: '24/7 Local Locksmiths & uPVC Door Repair',
    accreditationBody: 'DBS Checked • Genuine Local 01270 Locksmith',
    baseFilters: ['dbs-checked', 'anti-snap', 'family-local', 'card-accepted'],
    urgentFilters: ['emergency-24-7', 'upvc-specialist', 'no-callout-fee'],
    servicesPool: [
      '24/7 Non-Destructive Emergency Lockout Entry',
      'uPVC & Composite Door Multipoint Gearbox Repairs',
      'TS007 3-Star Anti-Snap Euro Cylinder Upgrades',
      'Jammed Patio & French Door Mechanism Alignment',
      'New Homeowner Full Lock Replacement Packages',
      'Double Glazed Window Hinges, Handles & Locks',
    ],
    nameTemplates: [
      '{Town} 24/7 Local Locksmiths',
      '{Area} uPVC Door & Lock Specialist',
      'SafeKey South Cheshire Locksmiths ({Town})',
      '01270 Direct Locksmiths {Town}',
      'CW Rapid Response Lock & Door Repair',
      'SecureHome Locksmiths {Town} & {Area}',
    ],
    reviewSnippets: [
      'Our uPVC front door mechanism jammed shut in {Area}. Arrived in 25 minutes, replaced just the internal gearbox for £95 and saved us buying a new door!',
      'Genuine local {Town} locksmith — quoted a fixed price on the phone before setting off, no call-out fee and upgraded us to 3-star anti-snap locks.',
      'Locked keys inside the house near {Street}. Opened the lock non-destructively in 10 minutes without scratching the door.',
    ],
    priceGuide: 'No Call-Out Fee • Lockout/Gearbox repair from £75 • 3-Star Anti-Snap £85',
  },
  {
    slug: 'pest-control',
    categoryName: 'Pest Control & Wasp Nest Removal',
    accreditationBody: 'RSPH Level 2 & BPCA Trained Technician',
    baseFilters: ['bpca-rsph', 'rodent-proofing', 'family-local', 'card-accepted'],
    urgentFilters: ['same-day-wasp', 'unmarked-van'],
    servicesPool: [
      'Same-Day Guaranteed Wasp & Hornet Nest Eradication',
      'Loft, Cavity Wall & Kitchen Mouse / Rat Eradication',
      'Discreet Unmarked Van Domestic Visits',
      'Drain Camera Rodent Entry Inspection & Valve Fitting',
      'Traditional Rural Mole Trapping (Paddock & Lawn)',
      'Flea, Cluster Fly, Ant & Carpet Beetle Treatments',
    ],
    nameTemplates: [
      '{Town} Rapid Wasp & Pest Control',
      '{Area} Discreet Pest Solutions',
      'South Cheshire Pest & Wildlife ({Town})',
      'ClearLoft Pest Control {Town}',
      'CW Wasp & Rodent Specialists',
      'Shire Guard Pest Control {Town}',
    ],
    reviewSnippets: [
      'Treated a huge wasp nest under the eaves at our {Area} house within 3 hours of calling. Fixed £70 price and wasps were gone by evening.',
      'Arrived in an unmarked van as requested, found where mice were entering behind the utility pipes in {Town}, and proofed the hole with steel mesh.',
      'Sorted a mole problem on our lawn near {Area} and gave great honest advice. Proper local technician.',
    ],
    priceGuide: 'Guaranteed Wasp Nest Treatment £70 • Rodent 2-visit package £135',
  },
  {
    slug: 'cleaners',
    categoryName: 'Domestic, Carpet & End-of-Tenancy Cleaners',
    accreditationBody: 'DBS Checked • £2m Treatment Risk Insured',
    baseFilters: ['dbs-checked', 'eco-pet-safe', 'family-local', 'card-accepted'],
    urgentFilters: ['deposit-guarantee', 'carpet-oven'],
    servicesPool: [
      'Weekly & Fortnightly Vetted Domestic House Cleaning',
      '100% Deposit-Back Guaranteed End-of-Tenancy Deep Cleans',
      'Prochem Hot-Water Extraction Carpet & Sofa Cleaning',
      'Caustic-Free Dip-Tank Oven, Hob & Extractor Cleaning',
      'After-Builders Dust & New Home Move-In Cleans',
      'Conservatory Interior, Internal Windows & Steam Cleaning',
    ],
    nameTemplates: [
      '{Town} Sparkle Domestic & Tenancy Cleaning',
      '{Area} Carpet, Oven & Home Cleaners',
      'Cheshire PureClean Specialists ({Town})',
      'Spotless CW End-of-Tenancy & Carpets ({Town})',
      'FreshHome Vetted Cleaners {Town}',
      'Premier Fibre & Home Cleaning {Town}',
    ],
    reviewSnippets: [
      'Did our full end-of-tenancy clean in {Area} including the oven and bedroom carpets. Letting agent in {Town} passed the checkout inspection with zero deductions!',
      'We have had the same DBS-checked cleaner every Thursday morning in {Town} for 8 months now. Reliable, friendly and uses pet-safe sprays.',
      'Brought our cream living room carpet and corner sofa back to life after muddy dog paws in {Area}. Dried within 2 hours.',
    ],
    priceGuide: 'Regular cleaning £18/hr • Carpet clean from £55 • End-of-Tenancy from £175',
  },
  {
    slug: 'handyman',
    categoryName: 'Handyman & Odd-Job Property Maintenance',
    accreditationBody: 'DBS Checked • Public Liability Insured',
    baseFilters: ['dbs-checked', 'landlord-turnaround', 'family-local', 'card-accepted'],
    urgentFilters: ['fixed-hourly', 'small-jobs'],
    servicesPool: [
      'Wall-Mounted TVs, Soundbars & Hidden Cable Channelling',
      'IKEA PAX Wardrobes & Flatpack Furniture Assembly',
      'Internal Door Planing, Latches, Handles & Locks',
      'Mould-Resistant Bath & Shower Silicone Resealing',
      'Curtain Poles, Roman Blinds, Heavy Mirrors & Shelving',
      'Washing Machine / Dishwasher Plumbing-In & Odd Jobs',
    ],
    nameTemplates: [
      '{Town} Handyman & Odd-Job Pro',
      '{Area} Property Maintenance & Fix-It',
      'The Reliable {Town} Handyman',
      'CW Tick-List Handyman Services ({Town})',
      'DoneRight Home Maintenance {Town}',
      'South Cheshire Odd-Job Specialist ({Town})',
    ],
    reviewSnippets: [
      'Booked a half-day slot in {Area} and he ticked off 7 jobs: mounted 2 TVs, planed a sticking bathroom door, resealed the shower and put up 3 blinds!',
      'So refreshing to find someone in {Town} who actually wants small jobs. Clear hourly rate, turned up bang on 9am and tidied up afterwards.',
      'Built a triple IKEA PAX wardrobe system in our {Area} bedroom in half the time it would have taken us. Worth every penny.',
    ],
    priceGuide: 'First hour £50 (then £35/hr) • Half-day (4 hrs) £145 • Full day £260',
  },
  {
    slug: 'decorators',
    categoryName: 'Painters, Decorators & Plasterers',
    accreditationBody: 'City & Guilds NVQ • Dust-Free Mirka System',
    baseFilters: ['free-quotes', 'exterior-masonry', 'family-local', 'card-accepted'],
    urgentFilters: ['dustless-sanding', 'plaster-skimming'],
    servicesPool: [
      'Dust-Free Interior Painting (Ceilings, Walls & Woodwork)',
      'Smooth Plaster Skimming & Artex Ceiling Flattening',
      'Hall, Stairs & Landing High-Reach Decorating',
      'Feature Wall & Cross-Lining Wallpaper Hanging',
      'Dulux Weathershield Exterior Render & Sill Painting',
      'Water-Damage Ceiling Patching & Drylining',
    ],
    nameTemplates: [
      '{Town} Fine Finish Decorators & Plastering',
      '{Area} Dust-Free Painters & Skimming',
      'Cheshire Smooth Walls & Decorating ({Town})',
      'Brush & Trowel Specialists {Town}',
      'CW Precision Decorators & Plasterers',
      'Heritage & Modern Decorating {Town}',
    ],
    reviewSnippets: [
      'Skimmed over our dated Artex living room ceiling in {Area} to a glass-smooth finish and painted the whole room the following week. Zero dust!',
      'Decorated our hall, stairs and landing in {Town} using dust-free Mirka sanders. Sharp cutting-in and left our carpets completely clean.',
      'Repaired and painted the exterior render on the front of our house near {Street} in {Town}. Great communication from quote to finish.',
    ],
    priceGuide: 'Room decorating from £320 • Ceiling/Wall plaster skimming from £260',
  },
];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function generateSeedListings() {
  const listings = [];
  let globalIndex = 1;

  for (const cat of CATEGORY_SEEDS) {
    for (const town of TOWNS) {
      // Create 4 businesses per category per town = 4 * 10 * 3 = 120 hyper-local listings
      for (let i = 0; i < 4; i++) {
        const area = town.areas[i % town.areas.length];
        const secondaryArea = town.areas[(i + 2) % town.areas.length];
        const street = town.streets[i % town.streets.length];
        const postcodeOutward = town.postcodes[i % town.postcodes.length];
        const postcodeInward = `${(i + 2) % 9}A${String.fromCharCode(66 + ((globalIndex + i) % 18))}`;
        const fullPostcode = `${postcodeOutward}${postcodeInward}`;

        const rawNameTemplate = cat.nameTemplates[i % cat.nameTemplates.length];
        const name = rawNameTemplate
          .replace('{Town}', town.name)
          .replace('{Area}', area);

        const slug = `${slugify(name)}-${town.slug}-${globalIndex}`;

        // Make Top 2 in each town/category "Featured" so there is 1 open TOP-3 slot left per category/town (Scarcity!)
        const isFeatured = i < 2;
        const featuredRank = isFeatured ? i + 1 : null;
        const isClaimed = i < 2;

        // Businesses #2 and #3 often have no dedicated website (only Facebook page or phone) -> Goldmine for outreach!
        const hasWebsite = i === 0 || i === 1;
        const websiteUrl = hasWebsite
          ? `https://www.${slugify(name)}.co.uk`
          : null;
        const facebookUrl = `https://www.facebook.com/${slugify(name)}`;
        const noWebsiteOpportunity = !hasWebsite;

        // Combine filters
        const filterIds = [...cat.baseFilters];
        if (i === 0) {
          filterIds.push(...cat.urgentFilters);
        } else if (i === 1) {
          filterIds.push(cat.urgentFilters[0], cat.urgentFilters[1] || 'no-callout-fee');
        } else if (i === 2) {
          filterIds.push(cat.urgentFilters[0]);
        }

        // Deduplicate filters
        const uniqueFilters = Array.from(new Set(filterIds));

        // Phone numbers: local 01270 landline + 07 mobile for WhatsApp
        const landlineLast4 = String(2100 + globalIndex * 17).slice(-4);
        const mobileLast6 = String(310000 + globalIndex * 1423).slice(-6);
        const phoneLandline = `01270 6${landlineLast4.slice(0, 1)} ${landlineLast4}`;
        const phoneMobile = `077${mobileLast6.slice(0, 2)} ${mobileLast6.slice(2)}`;

        const rating = Number((4.95 - i * 0.07).toFixed(2));
        const reviewCount = 84 - i * 16 + (globalIndex % 11);

        const reviewQuote = cat.reviewSnippets[i % cat.reviewSnippets.length]
          .replace(/\{Town\}/g, town.name)
          .replace(/\{Area\}/g, area)
          .replace(/\{Street\}/g, street);

        // Determine multi-town coverage (most Crewe/Nantwich/Sandbach trades serve neighbouring CW towns too)
        const townsServed = [town.slug];
        if (i <= 1) {
          for (const other of TOWNS) {
            if (!townsServed.includes(other.slug)) townsServed.push(other.slug);
          }
        } else if (town.slug === 'crewe') {
          townsServed.push('nantwich');
        }

        listings.push({
          id: `sc-${globalIndex}`,
          slug,
          name,
          categorySlug: cat.slug,
          categoryName: cat.categoryName,
          primaryTownSlug: town.slug,
          primaryTownName: town.name,
          townsServed,
          areaLabel: `${area} & ${secondaryArea}, ${town.name}`,
          addressLine: `${12 + i * 14} ${street}, ${area}, ${town.name}`,
          postcode: fullPostcode,
          outwardPostcode: postcodeOutward.split(' ')[0],
          phone: i % 2 === 0 ? phoneLandline : phoneMobile,
          whatsappNumber: `4477${mobileLast6}`,
          email: `info@${slugify(name)}.co.uk`,
          websiteUrl,
          facebookUrl,
          hasWebsite,
          noWebsiteOpportunity,
          isFeatured,
          featuredRank,
          isClaimed,
          isVerifiedLocal: isFeatured || i === 2,
          accreditation: cat.accreditationBody,
          yearsInBusiness: 14 - i * 2 + (globalIndex % 5),
          responseTimeMinutes: i === 0 ? 30 : i === 1 ? 45 : 90,
          rating,
          reviewCount,
          filterIds: uniqueFilters,
          services: cat.servicesPool.slice(0, 5),
          priceGuide: cat.priceGuide,
          shortSummary: `Independent ${town.name} ${cat.categoryName.toLowerCase()} based near ${area} (${postcodeOutward.split(' ')[0]}), covering ${town.name}, ${secondaryArea} and wider South Cheshire.`,
          featuredReview: {
            author: `${['Sarah M.', 'David T.', 'Mark & Claire H.', ' Emma W.', 'Paul R.'][(globalIndex + i) % 5]} (${area}, ${postcodeOutward.split(' ')[0]})`,
            text: reviewQuote,
            dateLabel: 'Verified Local Job',
          },
          openingHours: uniqueFilters.includes('emergency-24-7')
            ? 'Open 24/7 (Emergency Callouts Available)'
            : 'Mon–Sat: 7:30am – 6:30pm',
        });

        globalIndex++;
      }
    }
  }

  return listings;
}

function enrichRawImport(rawItems) {
  return rawItems.map((item, idx) => {
    const hasWebsite = Boolean(item.website && !item.website.includes('facebook.com'));
    return {
      ...item,
      id: item.id || `imported-${idx + 1}`,
      hasWebsite,
      noWebsiteOpportunity: !hasWebsite,
    };
  });
}

function main() {
  const args = process.argv.slice(2);
  const inputFlagIndex = args.indexOf('--input');
  let listings = [];

  if (inputFlagIndex !== -1 && args[inputFlagIndex + 1]) {
    const inputPath = path.resolve(process.cwd(), args[inputFlagIndex + 1]);
    const rawData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    listings = enrichRawImport(rawData);
    console.log(`Enriched ${listings.length} imported listings from ${inputPath}`);
  } else {
    listings = generateSeedListings();
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(listings, null, 2), 'utf8');

  const noWebsiteCount = listings.filter((l) => l.noWebsiteOpportunity).length;
  const featuredCount = listings.filter((l) => l.isFeatured).length;

  console.log(`✅ Generated ${listings.length} South Cheshire trade listings -> ${OUTPUT_PATH}`);
  console.log(`   • Towns covered: Crewe (CW1/CW2), Nantwich (CW5), Sandbach (CW11)`);
  console.log(`   • Featured Pro listings active: ${featuredCount} (leaving 1 open TOP-3 scarcity slot per town/category)`);
  console.log(`   • High-converting 'No Website / FB Only' leads detected: ${noWebsiteCount}`);
}

main();
