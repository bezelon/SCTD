import listingsData from '@/data/listings.json';
import outreachData from '@/data/outreach-campaigns.json';
import { REGION_CONFIG } from '@/config/region';

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
  return listingsData as TradeListing[];
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

  // Sort: primary town featured first (by featuredRank), then primary town non-featured, then nearby towns
  return all.sort((a, b) => {
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
