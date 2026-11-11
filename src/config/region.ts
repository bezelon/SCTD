export interface TownConfig {
  slug: string;
  name: string;
  county: string;
  postcodes: string[];
  population: string;
  nearbyVillages: string[];
  tagline: string;
  seoDescription: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  localLandmarks: string[];
}

export interface PricingTier {
  id: 'basic' | 'featured' | 'shopfront';
  name: string;
  priceMonthlyGbp: number;
  badgeText: string;
  scarcityNote?: string;
  description: string;
  features: string[];
  ctaText: string;
  stripePaymentUrl: string;
  popular?: boolean;
}

export interface RegionConfig {
  brandName: string;
  brandShortName: string;
  domain: string;
  regionName: string;
  countyName: string;
  heroTitle: string;
  heroSubtitle: string;
  primaryPhonePrefix: string;
   postcodePrefix: string;
  supportEmail: string;
  monetization: {
    enableFeaturedListings: boolean; // Phase 1: Featured TOP 3 Pro
    enableLeadGenQuotes: boolean;    // Phase 2: Get 3 Free Local Quotes
    maxFeaturedPerCategoryTown: number;
    averageTradeJobValueGbp: number;
  };
  towns: TownConfig[];
  pricingTiers: PricingTier[];
}

/**
 * COPY & PASTE MULTI-CITY CONFIGURATION
 * To launch this directory in another UK cluster (e.g. Chester & Ellesmere Port,
 * Warrington, or Macclesfield & Wilmslow), simply duplicate this file or update
 * the towns array and brand strings below, then run `npm run seed`.
 */
export const REGION_CONFIG: RegionConfig = {
  brandName: 'South Cheshire Trades',
  brandShortName: 'SC Trades',
  domain: 'southcheshiretrades.co.uk',
  regionName: 'South Cheshire',
  countyName: 'Cheshire East',
  heroTitle: 'Find Verified Local Tradespeople in Crewe, Nantwich & Sandbach',
  heroSubtitle:
    'Skip endless Facebook group threads. Filter vetted local pros by 24/7 emergency callout, free quotes, Gas Safe / NICEIC registration, and real local reviews across CW1–CW11.',
  primaryPhonePrefix: '01270',
  postcodePrefix: 'CW',
  supportEmail: 'hello@southcheshiretrades.co.uk',
  monetization: {
    enableFeaturedListings: true,
    enableLeadGenQuotes: true,
    maxFeaturedPerCategoryTown: 3,
    averageTradeJobValueGbp: 340,
  },
  towns: [
    {
      slug: 'crewe',
      name: 'Crewe',
      county: 'Cheshire East',
      postcodes: ['CW1', 'CW2'],
      population: '55,000+',
      nearbyVillages: [
        'Wistaston',
        'Shavington',
        'Haslington',
        'Sydney',
        'Leighton',
        'Weston',
        'Hough',
      ],
      tagline: 'Fast-response tradespeople serving CW1, CW2 & surrounding villages',
      seoDescription:
        'Compare trusted local tradespeople in Crewe (CW1 & CW2), including Wistaston, Shavington, Haslington and Leighton. Filter by 24/7 emergency callouts, no call-out fee and free local quotes.',
      coordinates: { lat: 53.0988, lng: -2.4405 },
      localLandmarks: ['Queens Park', 'Grand Junction Retail Park', 'Crewe Station', 'Leighton Hospital area'],
    },
    {
      slug: 'nantwich',
      name: 'Nantwich',
      county: 'Cheshire East',
      postcodes: ['CW5'],
      population: '18,500+',
      nearbyVillages: [
        'Willaston',
        'Stapeley',
        'Acton',
        'Worleston',
        'Wrenbury',
        'Audlem',
        'Wybunbury',
      ],
      tagline: 'Heritage-trusted & domestic specialists across Nantwich & CW5 rural areas',
      seoDescription:
        'Find vetted home improvement specialists and emergency trades in Nantwich (CW5), Willaston, Stapeley, Audlem and Wrenbury. Direct phone & WhatsApp contact with zero middleman markup.',
      coordinates: { lat: 53.0672, lng: -2.5219 },
      localLandmarks: ['Nantwich Town Square', 'Barony Park', 'Stapeley Water Gardens estate', 'Welsh Row'],
    },
    {
      slug: 'sandbach',
      name: 'Sandbach',
      county: 'Cheshire East',
      postcodes: ['CW11'],
      population: '22,000+',
      nearbyVillages: [
        'Elworth',
        'Ettiley Heath',
        'Wheelock',
        'Winterley',
        'Bradwall',
        'Arclid',
        'Malkins Bank',
      ],
      tagline: 'Reliable local trades covering Sandbach, Elworth, Wheelock & CW11',
      seoDescription:
        'Browse top-rated local tradespeople in Sandbach (CW11), Elworth, Wheelock and Winterley. Check verified qualifications, transparent call-out policies and request free quotes.',
      coordinates: { lat: 53.1456, lng: -2.3627 },
      localLandmarks: ['Sandbach Cobbles', 'Elworth', 'Wheelock Rail Trail', 'J17 M6 Corridor'],
    },
  ],
  pricingTiers: [
    {
      id: 'basic',
      name: 'Basic Local Listing',
      priceMonthlyGbp: 0,
      badgeText: 'Standard Unclaimed Profile',
      description: 'Essential directory presence for local trades operating in Crewe, Nantwich or Sandbach.',
      features: [
        'Standard placement below Verified & Featured pros',
        'Town & postcode coverage tags (CW1, CW2, CW5, CW11)',
        'Basic phone number display',
        'Up to 2 service filter tags',
      ],
      ctaText: 'Claim Free Basic Profile',
      stripePaymentUrl: '/for-businesses?plan=basic#claim-form',
    },
    {
      id: 'featured',
      name: 'Verified TOP 3 Pro',
      priceMonthlyGbp: 29,
      badgeText: 'Most Popular • Max 3 Per Town',
      scarcityNote: 'Strictly limited to 3 tradespeople per category in each town (Crewe, Nantwich, Sandbach)',
      description: 'Lock in a guaranteed Top 3 spot at the very top of your trade category and capture high-intent local calls.',
      features: [
        'Pinned in the TOP 3 Featured Box for your town & category',
        'Green "Verified South Cheshire Pro" trust badge',
        'Direct 1-Click Call & WhatsApp Quote buttons on cards',
        'All Filter Gap badges unlocked (24/7, Free Quote, No Call-Out Fee)',
        'DoFollow SEO backlink to your website or Facebook page',
        'Cancel anytime – 1 job pays for a full year',
      ],
      ctaText: 'Lock In Your Top 3 Spot (£29/mo)',
      stripePaymentUrl: '/for-businesses?plan=featured#claim-form',
      popular: true,
    },
    {
      id: 'shopfront',
      name: 'Digital Shopfront + Lead Priority',
      priceMonthlyGbp: 59,
      badgeText: 'Best For Trades With No Website',
      scarcityNote: 'Includes instant SMS/Email alerts for "Get 3 Free Quotes" homeowner leads',
      description: 'Your complete SEO-optimised mini-website on our domain plus priority delivery of homeowner quote requests.',
      features: [
        'Everything in Verified TOP 3 Pro across ALL 3 towns (Crewe, Nantwich & Sandbach)',
        'Priority routing of "Get 3 Free Quotes" homeowner enquiries',
        'Full dedicated webpage with photo gallery, price guide & accreditation check',
        'Custom short link (e.g. southcheshiretrades.co.uk/pro/your-name) for your van & Facebook page',
        'We write and optimise your profile copy for Google search',
      ],
      ctaText: 'Upgrade to Shopfront + Leads (£59/mo)',
      stripePaymentUrl: '/for-businesses?plan=shopfront#claim-form',
    },
  ],
};

export function getTownBySlug(slug: string): TownConfig | undefined {
  return REGION_CONFIG.towns.find((t) => t.slug.toLowerCase() === slug.toLowerCase());
}
