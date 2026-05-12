import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://travelaz.az';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/auth/', '/chat/', '/ai-planner/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
