import { createClient } from '@/lib/supabase/server';
import { mapCityToSummary } from '@/lib/open-travel-data';
import type { CityWithCountryRow } from '@/types/place';
import type { Locale } from '@/i18n/routing';
import CityGrid from './city-grid-client';

const CITY_LIST_SELECT = `
  id, country_id, slug, name_az, name_en, name_ru, region, admin_region, lat, lng, population,
  short_desc_az, short_desc_en, short_desc_ru, description_az, description_en, description_ru,
  cover_photo_id, cover_photo_url, source, source_id, source_url, license, attribution_text,
  is_featured, popular_rank, last_synced_at, created_at, updated_at,
  countries(id, slug, name_az, name_en, name_ru, flag_emoji)
`;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function CitiesPage({ params }: PageProps) {
  const { locale } = await params;
  const currentLocale = locale as Locale;
  const supabase = await createClient();

  const { data: cityRows } = await supabase
    .from('cities')
    .select(CITY_LIST_SELECT)
    .order('popular_rank', { ascending: true })
    .order('population', { ascending: false });

  const cities = ((cityRows || []) as unknown as CityWithCountryRow[]).map((city) =>
    mapCityToSummary(city, currentLocale)
  );

  return <CityGrid cities={cities} locale={locale} />;
}

export const revalidate = 86400;
