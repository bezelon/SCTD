import type { MetadataRoute } from 'next';
import { REGION_CONFIG, getSiteBaseUrl } from '@/config/region';
import { CATEGORIES } from '@/config/categories';
import { getLiveListings } from '@/lib/listings';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteBaseUrl();
  const now = new Date().toISOString().slice(0, 10);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/for-businesses`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  const townRoutes: MetadataRoute.Sitemap = REGION_CONFIG.towns.map((town) => ({
    url: `${baseUrl}/${town.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  const townCategoryRoutes: MetadataRoute.Sitemap = [];
  for (const town of REGION_CONFIG.towns) {
    for (const cat of CATEGORIES) {
      townCategoryRoutes.push({
        url: `${baseUrl}/${town.slug}/${cat.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.85,
      });
    }
  }

  const liveListings = await getLiveListings();
  const proRoutes: MetadataRoute.Sitemap = liveListings.map((listing) => ({
    url: `${baseUrl}/pro/${listing.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...townRoutes,
    ...townCategoryRoutes,
    ...proRoutes,
  ];
}
