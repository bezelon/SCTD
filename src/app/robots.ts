import type { MetadataRoute } from 'next';
import { REGION_CONFIG } from '@/config/region';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/'],
    },
    sitemap: `https://${REGION_CONFIG.domain}/sitemap.xml`,
  };
}
