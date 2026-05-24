import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import CountryDetailClient from './country-detail-client';
import { mapCityToSummary, mapPlaceToSummary } from '@/lib/open-travel-data';
import { countryJsonLd } from '@/lib/jsonld';
import type { Metadata } from 'next';
import type { Locale } from '@/i18n/routing';
import type { CitySummary, CityWithCountryRow, PlaceSummary, PlaceWithRelationsRow } from '@/types/place';
import type { CountryHighlight, ExpandedCountry } from '@/types/country';

const COUNTRY_DETAIL_FIELDS = [
  'id',
  'slug',
  'name_az',
  'name_en',
  'name_ru',
  'flag_emoji',
  'continent',
  'capital',
  'currency',
  'currency_name',
  'language',
  'population',
  'timezone',
  'calling_code',
  'best_months',
  'climate_type',
  'avg_flight_azn',
  'avg_hotel_azn',
  'avg_daily_azn',
  'cover_photo_id',
  'cover_photo_alt',
  'gallery_ids',
  'youtube_ids',
  'youtube_titles',
  'top_places',
  'short_desc',
  'short_desc_en',
  'short_desc_ru',
  'safety_level',
  'visa_required',
  'popular_rank',
  'is_featured',
  'cca2',
].join(', ');

const CITY_WITH_COUNTRY_FIELDS = [
  'id',
  'country_id',
  'slug',
  'name_az',
  'name_en',
  'name_ru',
  'region',
  'admin_region',
  'lat',
  'lng',
  'population',
  'short_desc_az',
  'short_desc_en',
  'short_desc_ru',
  'description_az',
  'description_en',
  'description_ru',
  'cover_photo_id',
  'cover_photo_url',
  'source',
  'source_id',
  'source_url',
  'license',
  'attribution_text',
  'is_featured',
  'popular_rank',
  'last_synced_at',
  'created_at',
  'updated_at',
  'countries(id, slug, name_az, name_en, name_ru, flag_emoji, cca2)',
].join(', ');

const PLACE_WITH_RELATIONS_FIELDS = [
  'id',
  'city_id',
  'country_id',
  'slug',
  'name',
  'name_az',
  'name_en',
  'name_ru',
  'category',
  'subcategory',
  'lat',
  'lng',
  'address',
  'website',
  'phone',
  'email',
  'opening_hours',
  'description_az',
  'description_en',
  'description_ru',
  'cover_photo_id',
  'cover_photo_url',
  'source',
  'source_place_id',
  'source_url',
  'license',
  'attribution_text',
  'rating_summary',
  'review_count',
  'is_featured',
  'popular_rank',
  'status',
  'raw_data',
  'last_synced_at',
  'created_at',
  'updated_at',
  'cities(id, slug, name_az, name_en, name_ru)',
  'countries(id, slug, name_az, name_en, name_ru, flag_emoji, cca2)',
].join(', ');

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://travelaz.az';

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
  const { slug, locale } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('countries')
    .select('name_az, name_en, name_ru, short_desc, short_desc_en, short_desc_ru')
    .eq('slug', slug)
    .single();

  const nameField = locale === 'en' ? 'name_en' : locale === 'ru' ? 'name_ru' : 'name_az';
  const countryName = data?.[nameField] || data?.name_az;
  const descField = locale === 'en' ? 'short_desc_en' : locale === 'ru' ? 'short_desc_ru' : 'short_desc';

  return {
    title: countryName ? `${countryName} - TravelAZ` : 'Country - TravelAZ',
    description: data?.[descField] || '',
    alternates: {
      canonical: `${BASE_URL}/${locale}/countries/${slug}`,
      languages: { az: `${BASE_URL}/az/countries/${slug}`, en: `${BASE_URL}/en/countries/${slug}`, ru: `${BASE_URL}/ru/countries/${slug}` },
    },
    openGraph: {
      title: countryName ? `${countryName} - TravelAZ` : 'Country - TravelAZ',
      description: data?.[descField] || '',
      locale: locale === 'az' ? 'az_AZ' : locale === 'ru' ? 'ru_RU' : 'en_US',
      type: 'website',
    },
  };
}

export default async function CountryDetailPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const currentLocale = locale as Locale;
  const supabase = await createClient();

  const { data: countryRow } = await supabase
    .from('countries')
    .select(COUNTRY_DETAIL_FIELDS)
    .eq('slug', slug)
    .single();

  if (!countryRow) notFound();
  const country = countryRow as unknown as ExpandedCountry;

  const [
    { data: highlights },
    { data: blogs },
    { data: visaCheck },
    { data: cityRows, error: cityError },
    { data: placeRows, error: placeError },
    { data: foodPlaceRows, error: foodPlaceError },
  ] = await Promise.all([
    supabase
      .from('country_highlights')
      .select('id, country_id, slug, name, name_en, name_ru, description, photo_id, lat, lng, category, rank')
      .eq('country_id', country.id)
      .order('rank'),
    supabase
      .from('blogs')
      .select('id, title, cover_image, created_at, views, profiles(display_name)')
      .eq('status', 'published')
      .ilike('content', `%${country.name_az}%`)
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('visa_info')
      .select('id')
      .eq('country_id', country.id)
      .maybeSingle(),
    supabase
      .from('cities')
      .select(CITY_WITH_COUNTRY_FIELDS)
      .eq('country_id', country.id)
      .order('is_featured', { ascending: false })
      .order('popular_rank', { ascending: true })
      .limit(6),
    supabase
      .from('places')
      .select(PLACE_WITH_RELATIONS_FIELDS)
      .eq('country_id', country.id)
      .not('category', 'in', '("restaurant","cafe")')
      .eq('status', 'active')
      .not('cover_photo_url', 'is', null)
      .order('is_featured', { ascending: false })
      .order('popular_rank', { ascending: true })
      .order('rating_summary', { ascending: false })
      .limit(8),
    supabase
      .from('places')
      .select(PLACE_WITH_RELATIONS_FIELDS)
      .eq('country_id', country.id)
      .in('category', ['restaurant', 'cafe'])
      .eq('status', 'active')
      .not('cover_photo_url', 'is', null)
      .order('is_featured', { ascending: false })
      .order('popular_rank', { ascending: true })
      .order('rating_summary', { ascending: false })
      .limit(8),
  ]);

  const cities: CitySummary[] = !cityError && cityRows
    ? (cityRows as unknown as CityWithCountryRow[]).map((city) => mapCityToSummary(city, currentLocale))
    : [];
  const places: PlaceSummary[] = !placeError && placeRows
    ? (placeRows as unknown as PlaceWithRelationsRow[]).map((place) => mapPlaceToSummary(place, currentLocale))
    : [];
  const foodPlaces: PlaceSummary[] = !foodPlaceError && foodPlaceRows
    ? (foodPlaceRows as unknown as PlaceWithRelationsRow[]).map((place) => mapPlaceToSummary(place, currentLocale))
    : [];
  const primaryCityWithCoordinates = cities.find((city) => city.lat && city.lng);
  const countryWithCoordinates: ExpandedCountry = {
    ...country,
    lat: primaryCityWithCoordinates?.lat,
    lng: primaryCityWithCoordinates?.lng,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(countryJsonLd({ name: country.name_az, nameEn: country.name_en, slug, capital: country.capital, description: country.short_desc, cca2: country.cca2, locale })).replace(/</g, '\\u003c') }}
      />
      <CountryDetailClient
        country={countryWithCoordinates}
        highlights={(highlights as CountryHighlight[]) || []}
        blogs={(blogs as unknown as { id: string; title: string; cover_image?: string; created_at: string; views: number; profiles?: { display_name: string } | null }[]) || []}
        cities={cities}
        places={places}
        foodPlaces={foodPlaces}
        locale={locale}
        hasVisaInfo={!!visaCheck}
      />
    </>
  );
}

export const revalidate = 86400;

export async function generateStaticParams() {
  const supabase = createAdminClient();
  const { data } = await supabase.from('countries').select('slug').limit(189);
  const locales = ['az', 'en', 'ru'];
  return (data || []).flatMap((c) =>
    locales.map((locale) => ({ locale, slug: c.slug }))
  );
}
