export interface TownConfig {
  slug: string;
  name: string;
  county: string;
  postcodes: string[];
  population: string;
  nearbyVillages: string[];
  tagline: string;
  seoDescription: string;
  imageUrl: string;
  imageAlt: string;
  imageCaption: string;
  imageCredit?: string;
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
  heroImage: string;
  heroImageAlt: string;
  heroImageCaption: string;
  heroImageCredit: string;
  primaryPhonePrefix: string;
  postcodePrefix: string;
  supportEmail: string;
  monetization: {
    enableFeaturedListings: boolean;
    enableLeadGenQuotes: boolean;
    maxFeaturedPerCategoryTown: number;
    averageTradeJobValueGbp: number;
  };
  towns: TownConfig[];
  pricingTiers: PricingTier[];
}

export const REGION_CONFIG: RegionConfig = {
  brandName: 'South Cheshire Locals',
  brandShortName: 'CW Locals',
  domain: 'southcheshiretrades.co.uk',
  regionName: 'South Cheshire',
  countyName: 'Cheshire East',
  heroTitle: 'Keep Your Pounds in CW1–CW11. Back Our Own Local Trades.',
  heroSubtitle:
    'No Google algorithms, no AI guesswork, and no faceless national call centres taking a cut. Just neighbours across Crewe, Nantwich & Sandbach sharing the honest independent tradespeople we trust with our own front doors.',
  heroImage: '/images/towns/south-cheshire-hero.jpg',
  heroImageAlt: 'Shropshire Union Canal and historic brick wharf at Audlem, South Cheshire',
  heroImageCaption: 'Shropshire Union Canal & Wharf, South Cheshire (CW)',
  heroImageCredit: 'Jo Turner (CC BY-SA 2.0)',
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
      tagline: 'Independent local trades living and working across CW1, CW2 & nearby villages',
      seoDescription:
        'Find neighbour-vouched tradespeople in Crewe (CW1 & CW2), Wistaston, Shavington, Haslington and Leighton. Direct 01270 & mobile numbers with zero corporate middlemen.',
      imageUrl: '/images/towns/crewe.jpg',
      imageAlt: 'Queen’s Park pavilion and gardens in Crewe, CW1/CW2',
      imageCaption: 'Queen’s Park, Crewe (CW1 / CW2)',
      imageCredit: 'FREON101 (CC BY-SA 3.0)',
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
      tagline: 'Trusted family trades & heritage home specialists across Nantwich & CW5 villages',
      seoDescription:
        'Browse neighbour-recommended home trades across Nantwich (CW5), Willaston, Stapeley, Audlem and Wrenbury. Direct contact with local families, never national lead brokers.',
      imageUrl: '/images/towns/nantwich.jpg',
      imageAlt: 'Historic black-and-white Tudor timber building on Welsh Row looking toward St Mary’s Church in Nantwich, CW5',
      imageCaption: 'Welsh Row & St Mary’s, Nantwich (CW5)',
      imageCredit: 'Jonathanawhite (Public Domain)',
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
      tagline: 'Dependable CW11 locals serving Sandbach, Elworth, Wheelock & surrounding lanes',
      seoDescription:
        'Connect directly with neighbour-backed tradespeople in Sandbach (CW11), Elworth, Wheelock and Winterley. Real local qualifications, fair upfront pricing and zero middleman fees.',
      imageUrl: '/images/towns/sandbach.jpg',
      imageAlt: 'Sandbach Cobbles, historic half-timbered inns and Anglo-Saxon Crosses in Market Square, CW11',
      imageCaption: 'The Cobbles & Market Square, Sandbach (CW11)',
      imageCredit: 'fotodiscs4u (CC BY-SA 2.0)',
      coordinates: { lat: 53.1456, lng: -2.3627 },
      localLandmarks: ['Sandbach Cobbles', 'Elworth', 'Wheelock Rail Trail', 'J17 M6 Corridor'],
    },
  ],
  pricingTiers: [
    {
      id: 'basic',
      name: 'Community Neighbour Listing',
      priceMonthlyGbp: 0,
      badgeText: 'Always Free for CW Locals',
      description: 'Essential neighbourhood presence for independent trades living and working in Crewe, Nantwich or Sandbach.',
      features: [
        'Free listing in your town & CW postcode area',
        'Direct phone & WhatsApp link — 0% commission ever',
        'Neighbour vouch counter & local recommendations',
        'Service filter tags (No Call-Out Fee, Gas Safe, Free Quotes)',
      ],
      ctaText: 'Claim Free Local Listing',
      stripePaymentUrl: '/for-businesses?plan=basic#claim-form',
    },
    {
      id: 'featured',
      name: 'Local Community Supporter',
      priceMonthlyGbp: 29,
      badgeText: 'Helps Keep the Directory Free • Max 3 Per Town',
      scarcityNote: 'Capped at 3 supporters per trade in each town so local residents always see real independent firms first',
      description: 'Support our community-run South Cheshire directory while keeping your local trade pinned at the top of your town.',
      features: [
        'Featured at the top of your CW town & trade page',
        '"Local Community Supporter" badge on your cards',
        'Direct 1-Click Call & WhatsApp Quote buttons',
        'All service filter badges unlocked (24/7, Free Quote, No Call-Out Fee)',
        'Link back to your website or Facebook business page',
        'No lock-in contract — cancel whenever you wish',
      ],
      ctaText: 'Become a Local Supporter (£29/mo)',
      stripePaymentUrl: '/for-businesses?plan=featured#claim-form',
      popular: true,
    },
    {
      id: 'shopfront',
      name: 'Full Local Page + Direct Enquiries',
      priceMonthlyGbp: 59,
      badgeText: 'Ideal If You Only Use Facebook',
      scarcityNote: 'Includes instant SMS/Email alerts when local CW homeowners ask for quotes',
      description: 'A dedicated local webpage for your trade across Crewe, Nantwich & Sandbach without needing to build or maintain a website.',
      features: [
        'Supporter placement across all 3 CW towns (Crewe, Nantwich & Sandbach)',
        'Priority local homeowner quote enquiries routed straight to you',
        'Complete profile page with services, pricing guide & accreditations',
        'Easy-to-share link for your van & local Facebook replies',
        'We write and polish your local profile copy for you',
      ],
      ctaText: 'Set Up Full Local Page (£59/mo)',
      stripePaymentUrl: '/for-businesses?plan=shopfront#claim-form',
    },
  ],
};

export function getTownBySlug(slug: string): TownConfig | undefined {
  return REGION_CONFIG.towns.find((t) => t.slug.toLowerCase() === slug.toLowerCase());
}

export function getSiteBaseUrl(): string {
  const raw = String(process.env.NEXT_PUBLIC_SITE_URL || '').trim();
  if (raw) {
    const withProtocol = raw.startsWith('http://') || raw.startsWith('https://') ? raw : `https://${raw}`;
    return withProtocol.replace(/\/+$/, '');
  }
  return `https://${REGION_CONFIG.domain}`;
}

