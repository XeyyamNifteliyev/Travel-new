import { createClient } from '@/lib/supabase/server';
import { getProvider } from '@/lib/ai/provider';
import { NextRequest, NextResponse } from 'next/server';

const DAILY_AI_LIMIT = 3;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const { question, country_slug, locale } = (body || {}) as Record<string, unknown>;

  if (typeof question !== 'string' || typeof country_slug !== 'string' || !question.trim() || !country_slug.trim()) {
    return NextResponse.json({ error: 'Sual və ölkə tələb olunur' }, { status: 400 });
  }
  if (question.length > 700) {
    return NextResponse.json({ error: 'Sual çox uzundur' }, { status: 400 });
  }

  const safeLocale = locale === 'en' || locale === 'ru' ? locale : 'az';
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Giriş tələb olunur', limit: DAILY_AI_LIMIT, remaining: 0 }, { status: 401 });
  }

  const questionHash = await hashQuestion(question);

  const { data: countryRow } = await supabase
    .from('countries')
    .select('id')
    .eq('slug', country_slug)
    .maybeSingle();

  if (countryRow) {
    const { data: cached } = await supabase
      .from('visa_qa_cache')
      .select('answer_az, answer_en, answer_ru, id, hit_count')
      .eq('country_id', countryRow.id)
      .eq('question_hash', questionHash)
      .eq('is_valid', true)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (cached) {
      const answer = cached[`answer_${safeLocale}` as 'answer_az' | 'answer_en' | 'answer_ru'] || cached.answer_az;
      if (answer) {
        await supabase
          .from('visa_qa_cache')
          .update({ hit_count: ((cached as { hit_count?: number }).hit_count ?? 0) + 1 })
          .eq('id', (cached as { id: string }).id);
        const remaining = await getRemainingQuestions(supabase, user.id);
        return NextResponse.json({ answer, from_cache: true, limit: DAILY_AI_LIMIT, remaining });
      }
    }
  }

  const usageDate = getBakuDate();
  const { data: usageRow } = await supabase
    .from('visa_ai_daily_usage')
    .select('id, question_count')
    .eq('user_id', user.id)
    .eq('usage_date', usageDate)
    .maybeSingle();
  const currentCount = (usageRow?.question_count as number | undefined) ?? 0;

  if (currentCount >= DAILY_AI_LIMIT) {
    return NextResponse.json({
      error: 'Gündəlik AI sual limitiniz bitib. Sabah yenidən cəhd edin.',
      limit: DAILY_AI_LIMIT,
      remaining: 0,
    }, { status: 429 });
  }

  const { data: visaData } = await supabase
    .from('visa_info')
    .select(`
      id, country_id, requirement_type, fee_usd, processing_days_min, processing_days_max,
      validity_days, max_stay_days, is_evisa, evisa_url, official_visa_url, official_url, notes_az, notes_en, notes_ru,
      countries!inner(name_az, name_en, name_ru, slug),
      visa_documents(document_name_az, document_name_en, document_name_ru, is_required, document_category)
    `)
    .eq('countries.slug', country_slug)
    .maybeSingle();

  const context = buildVisaContext(visaData as Record<string, unknown> | null, country_slug, safeLocale);
  const localeInstruction: Record<string, string> = {
    az: 'Azərbaycan dilində cavab ver.',
    en: 'Answer in English.',
    ru: 'Отвечай на русском языке.',
  };

  try {
    const provider = getProvider();
    const answer = await provider.generateText(
      `${context}\n\n${localeInstruction[safeLocale]}\n\nSual: ${question.trim()}`
    );

    if (countryRow && answer) {
      const cacheEntry: Record<string, unknown> = {
        country_id: countryRow.id,
        question_hash: questionHash,
        question_text: question.trim(),
        hit_count: 0,
        is_valid: true,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
      cacheEntry[`answer_${safeLocale}`] = answer;

      await supabase.from('visa_qa_cache').upsert(cacheEntry, { onConflict: 'country_id,question_hash' });
    }

    await incrementDailyUsage(supabase, user.id, usageDate, usageRow?.id as string | undefined, currentCount);
    return NextResponse.json({
      answer,
      from_cache: false,
      limit: DAILY_AI_LIMIT,
      remaining: Math.max(DAILY_AI_LIMIT - currentCount - 1, 0),
    });
  } catch (error) {
    console.error('Visa AI answer error:', error);
    return NextResponse.json({
      error: 'AI cavab verə bilmədi',
      limit: DAILY_AI_LIMIT,
      remaining: Math.max(DAILY_AI_LIMIT - currentCount, 0),
    }, { status: 500 });
  }
}

async function hashQuestion(question: string): Promise<string> {
  const normalized = question.toLowerCase().trim().replace(/\s+/g, ' ');
  const data = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
}

function getBakuDate(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Baku',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

async function getRemainingQuestions(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<number> {
  const { data } = await supabase
    .from('visa_ai_daily_usage')
    .select('question_count')
    .eq('user_id', userId)
    .eq('usage_date', getBakuDate())
    .maybeSingle();
  const count = (data?.question_count as number | undefined) ?? 0;
  return Math.max(DAILY_AI_LIMIT - count, 0);
}

async function incrementDailyUsage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  usageDate: string,
  usageId: string | undefined,
  currentCount: number
) {
  if (usageId) {
    await supabase
      .from('visa_ai_daily_usage')
      .update({ question_count: currentCount + 1, updated_at: new Date().toISOString() })
      .eq('id', usageId);
    return;
  }

  await supabase
    .from('visa_ai_daily_usage')
    .insert({ user_id: userId, usage_date: usageDate, question_count: 1 });
}

function pickLocalized(row: Record<string, unknown>, field: string, locale: string): string {
  return (
    (row[`${field}_${locale}`] as string | undefined) ||
    (row[`${field}_az`] as string | undefined) ||
    (row[`${field}_en`] as string | undefined) ||
    ''
  );
}

function buildVisaContext(visaData: Record<string, unknown> | null, slug: string, locale: string): string {
  if (!visaData) {
    return `Ölkə: ${slug}. Ümumi viza qaydaları haqqında cavab ver. Azərbaycan pasportu kontekstində.`;
  }

  const docs = Array.isArray(visaData.visa_documents)
    ? (visaData.visa_documents as Record<string, unknown>[])
        .filter((d) => d.is_required)
        .map((d) => pickLocalized(d, 'document_name', locale))
        .filter(Boolean)
        .join(', ')
    : '';

  const country = visaData.countries as Record<string, unknown>;
  const countryName = pickLocalized(country, 'name', locale) || pickLocalized(country, 'name', 'az');
  const notes = pickLocalized(visaData, 'notes', locale);
  const officialVisaUrl =
    (visaData.official_visa_url as string | undefined) ||
    (visaData.evisa_url as string | undefined) ||
    (visaData.official_url as string | undefined);

  return `SEN: TravelAZ saytının viza assistentisən. Azərbaycan vətəndaşlarına kömək edirsən.

ÖLKƏ: ${countryName}
Viza növü: ${visaData.requirement_type}
E-viza: ${visaData.is_evisa ? 'Mövcuddur' : 'Mövcud deyil'}
Viza haqqı: ${visaData.fee_usd ? `$${visaData.fee_usd}` : 'Pulsuz'}
Emal müddəti: ${visaData.processing_days_min || '?'}-${visaData.processing_days_max || '?'} iş günü
Etibarlılıq: ${visaData.validity_days || '?'} gün
Maks. qalma: ${visaData.max_stay_days || '?'} gün

TƏLƏB OLUNAN SƏNƏDLƏR:
${docs || 'Sənəd tələb olunmur'}

QEYDLƏR:
${notes}

CAVAB QAYDASI:
- Dəqiq, aydın cavab ver
- Şübhəli məlumatı "Rəsmi mənbədən yoxlayın" deyərək qeyd et
- Rəsmi viza səhifəsini tövsiyə et (${officialVisaUrl || 'yoxdur'})`;
}
