import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { mapPlaceToSummary } from '@/lib/open-travel-data';
import { RestaurantGridClient } from './restaurant-grid-client';
import { Coffee, MapPin, UtensilsCrossed } from 'lucide-react';
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
    .limit(200);

  const typedPlaceRows = (placeRows || []) as unknown as PlaceWithRelationsRow[];

  const restaurants = typedPlaceRows
    .map((place) => mapPlaceToSummary(place, currentLocale))
    .filter((r) => !!r.coverPhotoUrl);

  const europeanCountryIds = new Set<string>();
  typedPlaceRows.forEach((p) => {
    if (p.countries?.continent === 'europe') europeanCountryIds.add(p.countries.id);
  });

  const cities = Array.from(
    restaurants.reduce((acc, place) => {
      if (!place.city) return acc;
      const existing = acc.get(place.city.id);
      const placeRow = typedPlaceRows.find((p) => p.id === place.id);
      const isEuropean = placeRow ? europeanCountryIds.has(placeRow.country_id) : false;
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
    <main className="max-w-7xl mx-auto px-4 py-10">
      <section className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-stone-950 via-slate-900 to-emerald-950 p-6 text-white md:p-9">
        <div className="absolute -right-14 -top-20 h-56 w-56 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 h-60 w-60 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-200">
              <UtensilsCrossed className="h-3.5 w-3.5" />
              {t('eyebrow')}
            </div>
            <h1 className="max-w-3xl text-4xl font-black tracking-tight md:text-5xl">{t('title')}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">{t('subtitle')}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:min-w-[360px]">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <UtensilsCrossed className="mb-3 h-5 w-5 text-emerald-300" />
              <p className="text-2xl font-black">{restaurants.length}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/65">{t('placesLabel')}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <MapPin className="mb-3 h-5 w-5 text-sky-300" />
              <p className="text-2xl font-black">{cities.length}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/65">{t('citiesLabel')}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <Coffee className="mb-3 h-5 w-5 text-amber-300" />
              <p className="text-2xl font-black">OSM</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/65">{t('sourceLabel')}</p>
            </div>
          </div>
        </div>
      </section>
      <RestaurantGridClient restaurants={restaurants} cities={cities} locale={locale} countrySlug={countrySlug || null} />
    </main>
  );
}
