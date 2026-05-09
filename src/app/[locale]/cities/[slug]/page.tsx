import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft, ExternalLink, MapPin, Star, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { mapCityToSummary, mapPlaceToSummary } from '@/lib/open-travel-data';
import { WeatherWidget } from '@/components/weather/weather-widget';
import { VisaCheckWidget } from '@/components/visa/visa-check-widget';
import { CategoryTabs } from '@/components/place/category-tabs';
import { getCityCoverPhotoId, getUnsplashUrl } from '@/lib/unsplash';
import type { Metadata } from 'next';
import type { Locale } from '@/i18n/routing';
import type { CityWithCountryRow, PlaceWithRelationsRow } from '@/types/place';

const CITY_DETAIL_SELECT = `
  id, country_id, slug, name_az, name_en, name_ru, region, admin_region, lat, lng, population,
  short_desc_az, short_desc_en, short_desc_ru, description_az, description_en, description_ru,
  cover_photo_id, cover_photo_url, source, source_id, source_url, license, attribution_text,
  is_featured, popular_rank, last_synced_at, created_at, updated_at,
  countries(id, slug, name_az, name_en, name_ru, flag_emoji, cca2)
`;

const PLACE_CARD_SELECT = `
  id, city_id, country_id, slug, name, name_az, name_en, name_ru, category, subcategory,
  lat, lng, address, website, phone, email, opening_hours,
  description_az, description_en, description_ru, cover_photo_id, cover_photo_url,
  source, source_place_id, source_url, license, attribution_text, rating_summary, review_count,
  is_featured, popular_rank, status, raw_data, last_synced_at, created_at, updated_at,
  cities(id, slug, name_az, name_en, name_ru),
  countries(id, slug, name_az, name_en, name_ru, flag_emoji)
`;

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('cities')
    .select('name_az, description_az, description_en')
    .eq('slug', slug)
    .maybeSingle();

  return {
    title: data?.name_az ? `${data.name_az} - TravelAZ` : 'City - TravelAZ',
    description: data?.description_az || data?.description_en || '',
  };
}

export default async function CityDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const currentLocale = locale as Locale;
  const t = await getTranslations({ locale, namespace: 'places' });
  const supabase = await createClient();

  const { data: cityRow } = await supabase
    .from('cities')
    .select(CITY_DETAIL_SELECT)
    .eq('slug', slug)
    .maybeSingle();

  if (!cityRow) notFound();

  const city = mapCityToSummary(cityRow as unknown as CityWithCountryRow, currentLocale);

  const [placeResult, foodPlaceResult] = await Promise.all([
    supabase
      .from('places')
      .select(PLACE_CARD_SELECT)
      .eq('city_id', city.id)
      .eq('status', 'active')
      .order('is_featured', { ascending: false })
      .order('popular_rank', { ascending: true })
      .order('rating_summary', { ascending: false })
      .limit(24),
    supabase
      .from('places')
      .select(PLACE_CARD_SELECT)
      .eq('city_id', city.id)
      .eq('status', 'active')
      .in('category', ['restaurant', 'cafe'])
      .order('is_featured', { ascending: false })
      .order('popular_rank', { ascending: true })
      .order('rating_summary', { ascending: false })
      .limit(24),
  ]);

  const placeRows = placeResult.data;
  const foodPlaceRows = foodPlaceResult.data;

  const uniquePlaceRows = new Map<string, PlaceWithRelationsRow>();
  for (const place of [...((placeRows || []) as unknown as PlaceWithRelationsRow[]), ...((foodPlaceRows || []) as unknown as PlaceWithRelationsRow[])]) {
    uniquePlaceRows.set(place.id, place);
  }

  const places = Array.from(uniquePlaceRows.values()).map((place) => mapPlaceToSummary(place, currentLocale));
  const cityCoverUrl = city.coverPhotoUrl || getUnsplashUrl(getCityCoverPhotoId(city.slug, city.coverPhotoId), { w: 720, h: 420 });

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <Link href={`/${locale}/countries/${city.country?.slug || ''}`} className="inline-flex items-center gap-2 text-txt-sec hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        {city.country?.name || t('back')}
      </Link>

      <section className="rounded-3xl border border-border bg-bg-surface p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary mb-3">
              <MapPin className="w-4 h-4" />
              {city.country?.name || t('city')}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">{city.name}</h1>
            {city.description && (
              <p className="text-txt-sec mt-4 max-w-3xl leading-7">{city.description}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 min-w-64">
            {city.population ? (
              <div className="rounded-2xl border border-border bg-bg p-4">
                <Users className="w-5 h-5 text-primary mb-2" />
                <div className="text-xl font-bold">{city.population.toLocaleString(locale === 'ru' ? 'ru' : locale === 'en' ? 'en' : 'az')}</div>
                <div className="text-xs text-txt-sec">{t('population')}</div>
              </div>
            ) : null}
            <div className="rounded-2xl border border-border bg-bg p-4">
              <Star className="w-5 h-5 text-primary mb-2" />
              <div className="text-xl font-bold">{places.length}</div>
              <div className="text-xs text-txt-sec">{t('places')}</div>
            </div>
          </div>
        </div>
        {city.sourceUrl && (
          <a href={city.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs text-txt-sec hover:text-primary mt-5">
            {t('source')}: {city.source || 'open data'} <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {city.lat && city.lng && (
          <WeatherWidget lat={city.lat} lon={city.lng} />
        )}
        <VisaCheckWidget compact defaultDestination={city.country?.cca2 ?? ''} />
      </div>

      <section>
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold">{t('placesInCity')}</h2>
            <p className="text-sm text-txt-sec mt-1">{t('placesInCitySub')}</p>
          </div>
        </div>

        <CategoryTabs places={places} locale={locale} fallbackImageUrl={cityCoverUrl} />
      </section>
    </main>
  );
}
