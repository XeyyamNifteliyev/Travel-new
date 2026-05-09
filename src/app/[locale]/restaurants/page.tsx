import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { mapPlaceToSummary } from '@/lib/open-travel-data';
import { RestaurantGridClient } from './restaurant-grid-client';
import type { Locale } from '@/i18n/routing';
import type { PlaceWithRelationsRow, PlaceCategory } from '@/types/place';

export const revalidate = 86400;

const RESTAURANT_SELECT = `
  id, city_id, country_id, slug, name, name_az, name_en, name_ru, category, subcategory,
  lat, lng, address, website, phone, email, opening_hours,
  description_az, description_en, description_ru, cover_photo_id, cover_photo_url,
  source, source_place_id, source_url, license, attribution_text, rating_summary, review_count,
  is_featured, popular_rank, status, raw_data, last_synced_at, created_at, updated_at,
  cities(id, slug, name_az, name_en, name_ru),
  countries(id, slug, name_az, name_en, name_ru, flag_emoji, continent)
`;

export default async function RestaurantsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ country?: string }> }) {
  const { locale } = await params;
  const { country: countrySlug } = await searchParams;
  const currentLocale = locale as Locale;
  const t = await getTranslations({ locale, namespace: 'restaurants' });
  const supabase = await createClient();

  let query = supabase
    .from('places')
    .select(RESTAURANT_SELECT)
    .in('category', ['restaurant', 'cafe'] as PlaceCategory[])
    .eq('status', 'active');

  if (countrySlug) {
    const { data: countryData } = await supabase
      .from('countries')
      .select('id')
      .eq('slug', countrySlug)
      .single();
    if (countryData) {
      query = query.eq('country_id', countryData.id);
    }
  }

  const { data: placeRows } = await query
    .order('is_featured', { ascending: false })
    .order('popular_rank', { ascending: true })
    .order('rating_summary', { ascending: false })
    .limit(1000);

  const restaurants = ((placeRows || []) as unknown as PlaceWithRelationsRow[])
    .map((place) => mapPlaceToSummary(place, currentLocale))
    .filter((r) => !!r.coverPhotoUrl);

  const europeanCountryIds = new Set<string>();
  placeRows?.forEach((p: any) => {
    if (p.countries?.continent === 'europe') europeanCountryIds.add(p.countries.id);
  });

  const cities = Array.from(
    restaurants.reduce((acc, place) => {
      if (!place.city) return acc;
      const existing = acc.get(place.city.id);
      const placeRow = placeRows?.find((p: any) => p.id === place.id);
      const isEuropean = placeRow ? europeanCountryIds.has((placeRow as any).country_id) : false;
      acc.set(place.city.id, {
        id: place.city.id,
        slug: place.city.slug,
        name: place.city.name,
        count: (existing?.count || 0) + 1,
        isEuropean: existing?.isEuropean || isEuropean,
      });
      return acc;
    }, new Map<string, { id: string; slug: string; name: string; count: number; isEuropean: boolean }>())
  )
    .map(([, city]) => city)
    .sort((a, b) => {
      if (a.isEuropean !== b.isEuropean) return a.isEuropean ? -1 : 1;
      return b.count - a.count || a.name.localeCompare(b.name, locale);
    });

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <section className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">{t('title')}</h1>
        <p className="text-txt-sec mt-2">{t('subtitle')}</p>
      </section>
      <RestaurantGridClient restaurants={restaurants} cities={cities} locale={locale} countrySlug={countrySlug || null} />
    </main>
  );
}
