import listingsData from '@/data/listings.json';
import outreachData from '@/data/outreach-campaigns.json';
import { REGION_CONFIG } from '@/config/region';
import {
  listApprovedListings,
  getShowDemoListings,
  ApprovedListingRecord,
} from '@/lib/db';

export interface ListingReview {
  author: string;
  text: string;
  dateLabel: string;
}

export interface TradeListing {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  categoryName: string;
  primaryTownSlug: string;
  primaryTownName: string;
  townsServed: string[];
  areaLabel: string;
  addressLine: string;
  postcode: string;
  outwardPostcode: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  websiteUrl: string | null;
  facebookUrl: string;
  hasWebsite: boolean;
  noWebsiteOpportunity: boolean;
  isFeatured: boolean;
  featuredRank: number | null;
  isClaimed: boolean;
  isVerifiedLocal: boolean;
  isSamplePreview?: boolean;
  accreditation: string;
  yearsInBusiness: number;
  responseTimeMinutes: number;
  rating: number;
  reviewCount: number;
  filterIds: string[];
  services: string[];
  priceGuide: string;
  shortSummary: string;
  featuredReview: ListingReview;
  openingHours: string;
}

export interface OutreachCampaignItem {
  id: string;
  businessName: string;
  town: string;
  postcode: string;
  category: string;
  phone: string;
  email: string;
  facebookUrl: string;
  hasWebsite: boolean;
  noWebsiteOpportunity: boolean;
  pitchType: string;
  profileUrl: string;
  claimUrl: string;
  subjectLine: string;
  whatsappOrFbMessage: string;
}

export function getAllListings(): TradeListing[] {
  return (listingsData as TradeListing[]).map((l) => ({
    ...l,
    isSamplePreview: true,
  }));
}

export function getListingBySlug(slug: string): TradeListing | undefined {
  return getAllListings().find((l) => l.slug === slug);
}

export function getListingsByTownAndCategory(
  townSlug: string,
  categorySlug: string
): TradeListing[] {
  const all = getAllListings().filter(
    (l) =>
      l.categorySlug === categorySlug &&
      (l.primaryTownSlug === townSlug || l.townsServed.includes(townSlug))
  );

  return sortListingsForTown(all, townSlug);
}

export function getPrimaryTownListings(
  townSlug: string,
  categorySlug?: string
): TradeListing[] {
  return getAllListings()
    .filter(
      (l) =>
        l.primaryTownSlug === townSlug &&
        (!categorySlug || l.categorySlug === categorySlug)
    )
    .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || b.rating - a.rating);
}

export function getFeaturedSlotStatus(townSlug: string, categorySlug: string) {
  const maxSlots = REGION_CONFIG.monetization.maxFeaturedPerCategoryTown;
  const taken = getAllListings().filter(
    (l) =>
      l.primaryTownSlug === townSlug &&
      l.categorySlug === categorySlug &&
      l.isFeatured
  ).length;
  const remaining = Math.max(0, maxSlots - taken);
  return {
    maxSlots,
    taken,
    remaining,
  };
}

export function getOutreachCampaigns(): OutreachCampaignItem[] {
  return outreachData as OutreachCampaignItem[];
}

function sortListingsForTown(items: TradeListing[], townSlug: string): TradeListing[] {
  return [...items].sort((a, b) => {
    const aReal = a.isSamplePreview ? 0 : 1;
    const bReal = b.isSamplePreview ? 0 : 1;
    if (aReal !== bReal) return bReal - aReal;

    const aPrimaryFeatured = a.primaryTownSlug === townSlug && a.isFeatured ? 1 : 0;
    const bPrimaryFeatured = b.primaryTownSlug === townSlug && b.isFeatured ? 1 : 0;
    if (aPrimaryFeatured !== bPrimaryFeatured) return bPrimaryFeatured - aPrimaryFeatured;

    const aPrimary = a.primaryTownSlug === townSlug ? 1 : 0;
    const bPrimary = b.primaryTownSlug === townSlug ? 1 : 0;
    if (aPrimary !== bPrimary) return bPrimary - aPrimary;

    if (a.isFeatured !== b.isFeatured) return Number(b.isFeatured) - Number(a.isFeatured);
    return b.rating - a.rating;
  });
}

function mapApprovedToTradeListing(record: ApprovedListingRecord): TradeListing {
  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    categorySlug: record.categorySlug,
    categoryName: record.categoryName,
    primaryTownSlug: record.primaryTownSlug,
    primaryTownName: record.primaryTownName,
    townsServed:
      record.townsServed.length > 0 ? record.townsServed : [record.primaryTownSlug],
    areaLabel: record.areaLabel,
    addressLine: `${record.areaLabel}, ${record.primaryTownName}`,
    postcode: record.postcode,
    outwardPostcode: record.outwardPostcode,
    phone: record.phone,
    whatsappNumber: record.whatsappNumber,
    email: REGION_CONFIG.supportEmail,
    websiteUrl: record.websiteUrl,
    facebookUrl: record.facebookUrl,
    hasWebsite: Boolean(record.websiteUrl),
    noWebsiteOpportunity: !record.websiteUrl,
    isFeatured: false,
    featuredRank: null,
    isClaimed: true,
    isVerifiedLocal: true,
    isSamplePreview: false,
    accreditation: record.nominatedBy
      ? `Neighbour Nominated • ${record.nominatedBy}`
      : 'CW Community Verified Local',
    yearsInBusiness: 5,
    responseTimeMinutes: 30,
    rating: 5.0,
    reviewCount: 1,
    filterIds: ['family-local', 'free-quotes'],
    services: [record.categoryName, `${record.primaryTownName} & CW1–CW11 Callouts`],
    priceGuide: record.priceGuide || 'Free local quote • Direct neighbour rate',
    shortSummary: record.shortSummary,
    featuredReview: {
      author: record.nominatedBy || `${record.primaryTownName} Neighbour`,
      text: record.shortSummary,
      dateLabel: 'Community Recommendation',
    },
    openingHours: 'Mon–Sat Local Hours (Direct Enquiry)',
  };
}

export async function getLiveDirectoryState(): Promise<{
  listings: TradeListing[];
  showDemoListings: boolean;
  approvedCount: number;
}> {
  const [approvedRecords, showDemoListings] = await Promise.all([
    listApprovedListings(),
    getShowDemoListings(),
  ]);

  const approved = approvedRecords.map(mapApprovedToTradeListing);
  const demo = showDemoListings ? getAllListings() : [];
  return {
    listings: [...approved, ...demo],
    showDemoListings,
    approvedCount: approved.length,
  };
}

export async function getLiveListings(): Promise<TradeListing[]> {
  const { listings } = await getLiveDirectoryState();
  return listings;
}

export async function getLiveListingBySlug(slug: string): Promise<TradeListing | undefined> {
  const { listings } = await getLiveDirectoryState();
  return listings.find((l) => l.slug === slug);
}

export async function getLiveListingsByTownAndCategory(
  townSlug: string,
  categorySlug: string
): Promise<{
  listings: TradeListing[];
  showDemoListings: boolean;
  approvedCount: number;
}> {
  const state = await getLiveDirectoryState();
  const filtered = state.listings.filter(
    (l) =>
      l.categorySlug === categorySlug &&
      (l.primaryTownSlug === townSlug || l.townsServed.includes(townSlug))
  );
  return {
    listings: sortListingsForTown(filtered, townSlug),
    showDemoListings: state.showDemoListings,
    approvedCount: state.approvedCount,
  };
}

export async function getLivePrimaryTownListings(
  townSlug: string,
  categorySlug?: string
): Promise<{
  listings: TradeListing[];
  showDemoListings: boolean;
  approvedCount: number;
}> {
  const state = await getLiveDirectoryState();
  const filtered = state.listings
    .filter(
      (l) =>
        l.primaryTownSlug === townSlug &&
        (!categorySlug || l.categorySlug === categorySlug)
    )
    .sort((a, b) => {
      const aReal = a.isSamplePreview ? 0 : 1;
      const bReal = b.isSamplePreview ? 0 : 1;
      if (aReal !== bReal) return bReal - aReal;
      return Number(b.isFeatured) - Number(a.isFeatured) || b.rating - a.rating;
    });
  return {
    listings: filtered,
    showDemoListings: state.showDemoListings,
    approvedCount: state.approvedCount,
  };
}

