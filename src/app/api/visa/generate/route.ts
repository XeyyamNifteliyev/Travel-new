import { createClient } from '@/lib/supabase/server';
import { getProvider } from '@/lib/ai/provider';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { country_name, locale } = await request.json();

  if (!country_name) {
    return NextResponse.json({ error: 'Ölkə adı tələb olunur' }, { status: 400 });
  }

  const supabase = await createClient();

  const provider = getProvider();
  const prompt = `Sən TravelAZ saytının viza məlumat assistentisən. Azərbaycan vətəndaşlarına kömək edirsən.

"${country_name}" ölkəsi üçün Azərbaycan pasportu ilə səyahət üçün viza məlumatlarını ver.

CAVADI JSON formatında ver, başqa heç nə yazmaq. Bu strukturu sıx şəkildə saxla:
{
  "name_az": "ölkə adı azərbaycanca",
  "name_en": "country name english",
  "name_ru": "название страны",
  "slug": "country-slug-latin",
  "flag_emoji": "🇽🇽",
  "requirement_type": "not_required|on_arrival|e_visa|required",
  "fee_usd": 0,
  "processing_days_min": 0,
  "processing_days_max": 0,
  "validity_days": 0,
  "max_stay_days": 0,
  "is_evisa": false,
  "notes_az": "qısa qeyd azərbaycanca",
  "notes_en": "short note english",
  "notes_ru": "короткая заметка",
  "official_url": "rəsmi sayt",
  "documents": [
    {"name_az": "sənəd adı", "name_en": "doc name", "name_ru": "название", "category": "identity|financial|travel", "required": true}
  ]
}

Yalnız JSON qaytar, heç bir əlavə mətn yazma.`;

  try {
    const response = await provider.generateText(prompt);

    let jsonStr = response.trim();
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) jsonStr = codeBlockMatch[1].trim();

    const data = JSON.parse(jsonStr);

    const { data: country, error: countryError } = await supabase
      .from('countries')
      .insert({
        slug: data.slug,
        name_az: data.name_az,
        name_en: data.name_en,
        name_ru: data.name_ru,
        flag_emoji: data.flag_emoji,
      })
      .select('id')
      .single();

    if (countryError || !country) {
      return NextResponse.json({ error: 'Ölkə yaradıla bilmədi', details: countryError?.message }, { status: 500 });
    }

    await supabase.from('visa_info').insert({
      country_id: country.id,
      requirement_type: data.requirement_type,
      processing_time: data.processing_days_max ? `${data.processing_days_min}-${data.processing_days_max} iş günü` : '-',
      documents: (data.documents || []).map((d: { name_az: string }) => d.name_az),
      notes_az: data.notes_az,
      notes_en: data.notes_en,
      notes_ru: data.notes_ru,
      fee_usd: data.fee_usd,
      processing_days_min: data.processing_days_min,
      processing_days_max: data.processing_days_max,
      validity_days: data.validity_days,
      max_stay_days: data.max_stay_days,
      is_evisa: data.is_evisa,
      official_url: data.official_url,
      last_verified_at: new Date().toISOString(),
      data_confidence: 70,
    });

    if (data.documents && data.documents.length > 0) {
      const docs = data.documents.map((d: { name_az: string; name_en?: string; name_ru?: string; category?: string; required?: boolean }, i: number) => ({
        country_id: country.id,
        visa_type: 'tourist',
        document_name_az: d.name_az,
        document_name_en: d.name_en || d.name_az,
        document_name_ru: d.name_ru || d.name_az,
        is_required: d.required !== false,
        document_category: d.category || 'other',
        sort_order: i + 1,
      }));
      await supabase.from('visa_documents').insert(docs);
    }

    return NextResponse.json({ success: true, slug: data.slug });
  } catch (err) {
    return NextResponse.json({ error: 'AI məlumat yarada bilmədi', details: String(err) }, { status: 500 });
  }
}
