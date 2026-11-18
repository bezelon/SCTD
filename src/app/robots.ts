import type { MetadataRoute } from 'next';
import { getSiteBaseUrl } from '@/config/region';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/'],
    },
    sitemap: `${getSiteBaseUrl()}/sitemap.xml`,
  };
}
