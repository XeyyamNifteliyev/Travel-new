import { createClient } from '@/lib/supabase/server';
import { mapCityToSummary } from '@/lib/open-travel-data';
import type { CityWithCountryRow } from '@/types/place';
import type { Locale } from '@/i18n/routing';
import CityGrid from './city-grid-client';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function CitiesPage({ params }: PageProps) {
  const { locale } = await params;
  const currentLocale = locale as Locale;
  const supabase = await createClient();

  const { data: cityRows } = await supabase
    .from('cities')
    .select('*, countries(id, slug, name_az, name_en, name_ru, flag_emoji)')
    .order('popular_rank', { ascending: true })
    .order('population', { ascending: false });

  const cities = ((cityRows || []) as CityWithCountryRow[]).map((city) =>
    mapCityToSummary(city, currentLocale)
  );

  return <CityGrid cities={cities} locale={locale} />;
}

export const revalidate = 86400;