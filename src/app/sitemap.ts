import type { MetadataRoute } from 'next';
import { REGION_CONFIG } from '@/config/region';
import { CATEGORIES } from '@/config/categories';
import { getAllListings } from '@/lib/listings';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = `https://${REGION_CONFIG.domain}`;
  const now = '2026-11-11';

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

  const proRoutes: MetadataRoute.Sitemap = getAllListings().map((listing) => ({
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
