import { createClient } from '@/lib/supabase/server';
import { VisaPageClient } from './visa-page-client';
import type { VisaCountryData, VisaInfo } from '@/types/country';

export default async function VisaPage() {
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from('visa_info')
    .select(`
      *,
      countries!inner(id, name_az, name_en, name_ru, slug, flag_emoji, cca2)
    `)
    .order('countries(name_az)');

  const dedupedRows = Array.from(
    new Map(
      (rows || []).map((row: Record<string, unknown>) => {
        const country = row.countries as { id?: string } | null;
        return [country?.id || row.country_id, row];
      })
    ).values()
  );

  const countryIds = dedupedRows
    .map((row: Record<string, unknown>) => row.country_id)
    .filter((id): id is string => typeof id === 'string');

  const { data: documentRows } = countryIds.length
    ? await supabase
        .from('visa_documents')
        .select(`
          id, country_id, visa_type, document_name_az, document_name_en, document_name_ru,
          description_az, description_en, description_ru, is_required, document_category,
          accepted_formats, max_size_mb, notes_az, notes_en, notes_ru, sort_order
        `)
        .in('country_id', countryIds)
        .order('sort_order')
    : { data: [] };

  const documentsByCountry = new Map<string, VisaCountryData['documents']>();
  for (const doc of documentRows || []) {
    const countryId = (doc as { country_id?: string }).country_id;
    if (!countryId) continue;
    const docs = documentsByCountry.get(countryId) || [];
    docs.push(doc as VisaCountryData['documents'][number]);
    documentsByCountry.set(countryId, docs);
  }

  const countries: VisaCountryData[] = dedupedRows.map((row: Record<string, unknown>) => ({
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
      official_visa_url: row.official_visa_url,
      official_visa_url_verified_at: row.official_visa_url_verified_at,
      official_url: row.official_url,
      appointment_url: row.appointment_url,
      last_verified_at: row.last_verified_at,
      data_confidence: row.data_confidence,
    } as VisaInfo,
    country: row.countries as VisaCountryData['country'],
    documents: documentsByCountry.get(row.country_id as string) || [],
  }));

  return <VisaPageClient countries={countries} />;
}
