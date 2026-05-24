import { createClient } from '@/lib/supabase/server';
import { getProvider } from '@/lib/ai/provider';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminUser } from '@/lib/auth/admin';

export async function POST(request: NextRequest) {
  const { country_name } = await request.json();

  if (!country_name) {
    return NextResponse.json({ error: 'Ölkə adı tələb olunur' }, { status: 400 });
  }

  const safeName = String(country_name).replace(/['"\\`]/g, '').slice(0, 100);
  if (!/^[\p{L}\p{N}\s\-\.]+$/u.test(safeName)) {
    return NextResponse.json({ error: 'Yanlış ölkə adı formatı' }, { status: 400 });
  }

  const blocked = ['armenia', 'ermənistan', 'ermenistan', 'армения', 'armanistan'];
  if (blocked.some(b => safeName.toLowerCase().includes(b))) {
    return NextResponse.json({ error: 'Bu ölkə dəstəklənmir' }, { status: 403 });
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Giriş tələb olunur' }, { status: 401 });

  if (!(await isAdminUser(supabase, user))) {
    return NextResponse.json({ error: 'Admin icazəsi tələb olunur' }, { status: 403 });
  }

  const provider = getProvider();
  const prompt = `Sən TravelAZ saytının viza məlumat assistentisən. Azərbaycan vətəndaşlarına kömək edirsən.

"${safeName}" ölkəsi üçün Azərbaycan pasportu ilə səyahət üçün viza məlumatlarını ver.

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
  "official_url": "ümumi rəsmi mənbə və ya konsulluq saytı. Əmin deyilsənsə boş string qaytar.",
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

    if (!data.slug || !/^[a-z0-9-]{2,80}$/.test(data.slug)) {
      return NextResponse.json({ error: 'AI cavabında etibarsız slug' }, { status: 422 });
    }

    const validRequirementTypes = ['not_required', 'on_arrival', 'e_visa', 'required'];
    if (!data.requirement_type || !validRequirementTypes.includes(data.requirement_type)) {
      return NextResponse.json({ error: 'AI cavabında etibarsız viza növü' }, { status: 422 });
    }

    if (typeof data.fee_usd !== 'number' || data.fee_usd < 0 || data.fee_usd > 10000) {
      data.fee_usd = 0;
    }

    if (typeof data.processing_days_min !== 'number' || data.processing_days_min < 0) {
      data.processing_days_min = 0;
    }
    if (typeof data.processing_days_max !== 'number' || data.processing_days_max < 0) {
      data.processing_days_max = 0;
    }
    if (typeof data.max_stay_days !== 'number' || data.max_stay_days < 0) {
      data.max_stay_days = 0;
    }
    if (typeof data.validity_days !== 'number' || data.validity_days < 0) {
      data.validity_days = 0;
    }

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
      console.error('Visa country create error:', countryError);
      return NextResponse.json({ error: 'Ölkə yaradıla bilmədi' }, { status: 500 });
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
  } catch {
    return NextResponse.json({ error: 'AI məlumat yarada bilmədi' }, { status: 500 });
  }
}
