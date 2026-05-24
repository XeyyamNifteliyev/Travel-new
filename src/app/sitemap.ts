import { createClient } from '@/lib/supabase/server';
import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://travelaz.az';
const LOCALES = ['az', 'en', 'ru'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [countries, cities, blogs, news, places, visaRows] = await Promise.all([
    supabase.from('countries').select('slug, updated_at').order('slug'),
    supabase.from('cities').select('slug, updated_at').eq('is_featured', true).limit(100),
    supabase.from('blogs').select('id, updated_at').eq('status', 'published').limit(50),
    supabase.from('news').select('id, updated_at').eq('is_published', true).limit(100),
    supabase.from('places').select('id, updated_at, popular_rank').eq('status', 'active').order('popular_rank', { ascending: true }).limit(2500),
    supabase.from('visa_info').select('updated_at, countries!inner(slug)').order('last_verified_at', { ascending: false, nullsFirst: false }).limit(250),
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

  const newsPages: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    (news.data || []).map((item) => ({
      url: `${BASE_URL}/${locale}/news/${item.id}`,
      lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.55,
    }))
  );

  const placePages: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    (places.data || []).map((place) => ({
      url: `${BASE_URL}/${locale}/places/${place.id}`,
      lastModified: place.updated_at ? new Date(place.updated_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: place.popular_rank && place.popular_rank <= 50 ? 0.65 : 0.45,
    }))
  );

  const visaPages: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    (visaRows.data || [])
      .flatMap((row) => {
        const country = Array.isArray(row.countries) ? row.countries[0] : row.countries;
        return country?.slug
          ? [{
              url: `${BASE_URL}/${locale}/visa/${country.slug}`,
              lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
              changeFrequency: 'monthly' as const,
              priority: 0.62,
            }]
          : [];
      })
  );

  return [...staticPages, ...countryPages, ...cityPages, ...blogPages, ...newsPages, ...placePages, ...visaPages];
}
