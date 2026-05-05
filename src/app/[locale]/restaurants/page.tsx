import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { mapPlaceToSummary } from '@/lib/open-travel-data';
import { RestaurantGridClient } from './restaurant-grid-client';
import type { Locale } from '@/i18n/routing';
import type { PlaceWithRelationsRow, PlaceCategory } from '@/types/place';

export const revalidate = 86400;

export default async function RestaurantsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const currentLocale = locale as Locale;
  const t = await getTranslations({ locale, namespace: 'restaurants' });
  const supabase = await createClient();

  const { data: placeRows } = await supabase
    .from('places')
    .select('*, cities(id, slug, name_az, name_en, name_ru), countries(id, slug, name_az, name_en, name_ru, flag_emoji)')
    .in('category', ['restaurant', 'cafe'] as PlaceCategory[])
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('rating_summary', { ascending: false })
    .limit(100);

  const restaurants = ((placeRows || []) as PlaceWithRelationsRow[]).map((place) =>
    mapPlaceToSummary(place, currentLocale)
  );

  const { data: cityRows } = await supabase
    .from('cities')
    .select('id, slug, name_az, name_en, name_ru')
    .order('popular_rank', { ascending: true })
    .limit(20);

  const cities = (cityRows || []).map((city) => ({
    id: city.id,
    slug: city.slug,
    name: currentLocale === 'en' ? city.name_en || city.name_az
      : currentLocale === 'ru' ? city.name_ru || city.name_az
      : city.name_az,
  }));

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <section className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">{t('title')}</h1>
        <p className="text-txt-sec mt-2">{t('subtitle')}</p>
      </section>
      <RestaurantGridClient restaurants={restaurants} cities={cities} locale={locale} />
    </main>
  );
}