import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import CountryDetailClient from './country-detail-client';
import { mapCityToSummary, mapPlaceToSummary } from '@/lib/open-travel-data';
import type { Metadata } from 'next';
import type { Locale } from '@/i18n/routing';
import type { CitySummary, CityWithCountryRow, PlaceSummary, PlaceWithRelationsRow } from '@/types/place';
import type { CountryHighlight } from '@/types/country';

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('countries')
    .select('name_az, short_desc')
    .eq('slug', slug)
    .single();

  return {
    title: data?.name_az ? `${data.name_az} — TravelAZ` : 'Ölkə',
    description: data?.short_desc || '',
  };
}

export default async function CountryDetailPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const currentLocale = locale as Locale;
  const supabase = await createClient();

  const { data: country } = await supabase
    .from('countries')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!country) notFound();

  const { data: highlights } = await supabase
    .from('country_highlights')
    .select('*')
    .eq('country_id', country.id)
    .order('rank');

  const { data: blogs } = await supabase
    .from('blogs')
    .select('id, title, cover_image, created_at, views, profiles(display_name)')
    .ilike('content', `%${country.name_az}%`)
    .order('created_at', { ascending: false })
    .limit(6);

  const { data: visaCheck } = await supabase
    .from('visa_info')
    .select('id')
    .eq('country_id', country.id)
    .maybeSingle();

  let cities: CitySummary[] = [];
  const { data: cityRows, error: cityError } = await supabase
    .from('cities')
    .select('*, countries(id, slug, name_az, name_en, name_ru, flag_emoji)')
    .eq('country_id', country.id)
    .order('is_featured', { ascending: false })
    .order('popular_rank', { ascending: true })
    .limit(6);

  if (!cityError && cityRows) {
    cities = (cityRows as CityWithCountryRow[]).map((city) => mapCityToSummary(city, currentLocale));
  }

  let places: PlaceSummary[] = [];
  const { data: placeRows, error: placeError } = await supabase
    .from('places')
    .select('*, cities(id, slug, name_az, name_en, name_ru), countries(id, slug, name_az, name_en, name_ru, flag_emoji)')
    .eq('country_id', country.id)
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('popular_rank', { ascending: true })
    .order('rating_summary', { ascending: false })
    .limit(8);

  if (!placeError && placeRows) {
    places = (placeRows as PlaceWithRelationsRow[]).map((place) => mapPlaceToSummary(place, currentLocale));
  }

  return (
    <CountryDetailClient
      country={country}
      highlights={(highlights as CountryHighlight[]) || []}
      blogs={(blogs as unknown as { id: string; title: string; cover_image?: string; created_at: string; views: number; profiles?: { display_name: string } | null }[]) || []}
      cities={cities}
      places={places}
      locale={locale}
      hasVisaInfo={!!visaCheck}
    />
  );
}

export const revalidate = 86400;
