import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ country: string }> }
) {
  const { country: slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('visa_info')
    .select(`
      *,
      countries!inner(id, name_az, name_en, name_ru, slug, flag_emoji),
      visa_documents(
        id, document_name_az, document_name_en, document_name_ru,
        description_az, description_en, description_ru, is_required, document_category,
        accepted_formats, max_size_mb, notes_az, notes_en, notes_ru, sort_order
      )
    `)
    .eq('countries.slug', slug)
    .order('last_verified_at', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: 'Ölkə tapılmadı' }, { status: 404 });
  }

  return NextResponse.json(data);
}
