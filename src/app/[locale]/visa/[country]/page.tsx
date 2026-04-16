import { createClient } from '@/lib/supabase/server';
import VisaDetailClient from '@/components/visa/visa-detail-client';
import VisaNotFoundClient from '@/components/visa/visa-not-found-client';

export default async function VisaDetailPage({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}) {
  const { country: slug, locale } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from('visa_info')
    .select(`
      *,
      countries!inner(id, name_az, name_en, name_ru, slug, flag_emoji)
    `)
    .eq('countries.slug', slug)
    .single();

  if (!data) {
    return <VisaNotFoundClient slug={slug} locale={locale} />;
  }

  const countryId = (data.countries as { id: string }).id;

  const { data: docs } = await supabase
    .from('visa_documents')
    .select('id, visa_type, document_name_az, document_name_en, document_name_ru, description_az, is_required, document_category, accepted_formats, max_size_mb, notes_az, sort_order')
    .eq('country_id', countryId)
    .order('sort_order');

  return (
    <VisaDetailClient
      country={data.countries as {
        id: string;
        name_az: string;
        name_en: string;
        name_ru: string;
        slug: string;
        flag_emoji: string;
      }}
      visa={data as Record<string, unknown>}
      documents={(docs || []).map((d: Record<string, unknown>) => ({
        id: d.id as string,
        country_id: countryId,
        visa_type: (d.visa_type as string) || 'tourist',
        document_name_az: d.document_name_az as string,
        document_name_en: d.document_name_en as string | undefined,
        document_name_ru: d.document_name_ru as string | undefined,
        description_az: d.description_az as string | undefined,
        is_required: d.is_required as boolean,
        document_category: d.document_category as string,
        accepted_formats: d.accepted_formats as string[] | undefined,
        max_size_mb: d.max_size_mb as number | undefined,
        notes_az: d.notes_az as string | undefined,
        sort_order: d.sort_order as number,
      }))}
      locale={locale}
    />
  );
}
