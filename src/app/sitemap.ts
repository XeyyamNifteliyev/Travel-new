import { createClient } from '@/lib/supabase/server';
import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://travelaz.az';
const LOCALES = ['az', 'en', 'ru'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [countries, cities, blogs] = await Promise.all([
    supabase.from('countries').select('slug, updated_at').order('slug'),
    supabase.from('cities').select('slug, updated_at').eq('is_featured', true).limit(100),
    supabase.from('blogs').select('id, updated_at').eq('status', 'published').limit(50),
  ]);

  const staticPages: MetadataRoute.Sitemap = LOCALES.flatMap((locale) => [
    { url: `${BASE_URL}/${locale}`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${BASE_URL}/${locale}/countries`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${BASE_URL}/${locale}/cities`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${BASE_URL}/${locale}/visa`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${BASE_URL}/${locale}/blog`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.7 },
    { url: `${BASE_URL}/${locale}/tours`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.6 },
    { url: `${BASE_URL}/${locale}/restaurants`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.6 },
  ]);

  const countryPages: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    (countries.data || []).map((c) => ({
      url: `${BASE_URL}/${locale}/countries/${c.slug}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  );

  const cityPages: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    (cities.data || []).map((c) => ({
      url: `${BASE_URL}/${locale}/cities/${c.slug}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  );

  const blogPages: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    (blogs.data || []).map((b) => ({
      url: `${BASE_URL}/${locale}/blog/${b.id}`,
      lastModified: b.updated_at ? new Date(b.updated_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  );

  return [...staticPages, ...countryPages, ...cityPages, ...blogPages];
}
