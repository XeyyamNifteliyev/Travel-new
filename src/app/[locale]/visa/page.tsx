import { createClient } from '@/lib/supabase/server';
import { VisaPageClient } from './visa-page-client';
import type { VisaCountryData, VisaInfo } from '@/types/country';

export default async function VisaPage() {
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from('visa_info')
    .select(`
      *,
      countries!inner(id, name_az, name_en, name_ru, slug, flag_emoji)
    `)
    .order('countries(name_az)');

  const countries: VisaCountryData[] = (rows || []).map((row: Record<string, unknown>) => ({
    visa: {
      id: row.id,
      country_id: row.country_id,
      requirement_type: row.requirement_type,
      processing_time: row.processing_time,
      documents: row.documents || [],
      notes_az: row.notes_az,
      notes_en: row.notes_en,
      notes_ru: row.notes_ru,
      fee_usd: row.fee_usd,
      fee_azn: row.fee_azn,
      processing_days_min: row.processing_days_min,
      processing_days_max: row.processing_days_max,
      validity_days: row.validity_days,
      max_stay_days: row.max_stay_days,
      is_evisa: row.is_evisa,
      evisa_url: row.evisa_url,
      official_url: row.official_url,
      appointment_url: row.appointment_url,
      last_verified_at: row.last_verified_at,
      data_confidence: row.data_confidence,
    } as VisaInfo,
    country: row.countries as VisaCountryData['country'],
    documents: [],
  }));

  return <VisaPageClient countries={countries} />;
}
