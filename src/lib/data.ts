import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

export const getCountries = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .from('countries')
    .select('id, slug, name_az, name_en, name_ru, flag_emoji, continent, cca2, is_featured, popular_rank, short_desc, short_desc_en, short_desc_ru, cover_photo_id, capital, avg_flight_azn, avg_hotel_azn, avg_daily_azn')
    .order('name_az', { ascending: true });
  return data || [];
});

export const getCountryBySlug = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from('countries')
    .select('id, slug, name_az, name_en, name_ru, flag_emoji, continent, cca2, capital, short_desc, cover_photo_id')
    .eq('slug', slug)
    .maybeSingle();
  return data;
});

export const getFeaturedCities = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .from('cities')
    .select('id, slug, name_az, name_en, name_ru, country_id, cover_photo_id, cover_photo_url, is_featured, popular_rank, lat, lng, countries(id, slug, name_az, name_en, name_ru, flag_emoji, cca2)')
    .eq('is_featured', true)
    .order('popular_rank', { ascending: true })
    .limit(12);
  return data || [];
});