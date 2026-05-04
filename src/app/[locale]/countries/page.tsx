import { createClient } from '@/lib/supabase/server';
import CountryGrid from './country-grid-client';
import type { ExpandedCountry } from '@/types/country';

export default async function CountriesPage() {
  const supabase = await createClient();

  const { data: countries } = await supabase
    .from('countries')
    .select('id, name_az, name_en, name_ru, slug, continent, cover_photo_id, cover_photo_alt, short_desc, short_desc_en, short_desc_ru, avg_flight_azn, avg_hotel_azn, visa_required, popular_rank, is_featured, safety_level, best_months, capital')
    .not('name_az', 'is', null)
    .order('popular_rank', { ascending: true })
    .limit(60);

  return <CountryGrid countries={(countries as ExpandedCountry[]) || []} />;
}

export const revalidate = 86400;
