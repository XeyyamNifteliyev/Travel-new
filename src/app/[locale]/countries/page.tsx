import { createClient } from '@/lib/supabase/server';
import CountryGrid from './country-grid-client';
import type { ExpandedCountry } from '@/types/country';

interface CountriesPageProps {
  searchParams: Promise<{ page?: string; continent?: string }>;
}

const PAGE_SIZE = 48;
const CONTINENTS = ['europe', 'asia', 'americas', 'africa', 'oceania'] as const;

export default async function CountriesPage({ searchParams }: CountriesPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const continent = params.continent || 'all';
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  // Build query
  let query = supabase
    .from('countries')
    .select('id, name_az, name_en, name_ru, slug, continent, cover_photo_id, cover_photo_alt, short_desc, short_desc_en, short_desc_ru, avg_flight_azn, avg_hotel_azn, visa_required, popular_rank, is_featured, safety_level, best_months, capital, cca2', { count: 'exact' })
    .not('name_az', 'is', null);

  if (CONTINENTS.includes(continent as typeof CONTINENTS[number])) {
    query = query.eq('continent', continent);
  }

  const { data: countries, count, error } = await query
    .order('popular_rank', { ascending: true })
    .range(from, to);

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  if (error) {
    console.error('Countries query error:', error.message);
  }

  return (
    <CountryGrid
      countries={(countries as ExpandedCountry[]) || []}
      currentPage={page}
      totalPages={totalPages}
      totalCount={totalCount}
      activeContinent={continent}
    />
  );
}

export const revalidate = 86400;
