import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { assertAndIncrementAiLimit, getAiUsage, AI_DAILY_LIMITS } from '@/lib/ai/usage';
import { getProvider } from '@/lib/ai/provider';
import { NextRequest, NextResponse } from 'next/server';

const DAILY_AI_LIMIT = AI_DAILY_LIMITS.visa;

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
  const adminSupabase = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Giriş tələb olunur', limit: DAILY_AI_LIMIT, remaining: 0, from_cache: false }, { status: 401 });
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
        await adminSupabase
          .from('visa_qa_cache')
          .update({ hit_count: ((cached as { hit_count?: number }).hit_count ?? 0) + 1 })
          .eq('id', (cached as { id: string }).id);
        const remaining = (await getAiUsage(user.id, 'visa')).remaining;
        return NextResponse.json({ answer, from_cache: true, limit: DAILY_AI_LIMIT, remaining });
      }
    }
  }

  const usageCheck = await assertAndIncrementAiLimit(user.id, 'visa');
  if (!usageCheck.allowed) {
    return NextResponse.json({
      error: 'Gündəlik AI sual limitiniz bitib. Sabah yenidən cəhd edin.',
      limit: usageCheck.limit,
      remaining: 0,
      from_cache: false,
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

      await adminSupabase.from('visa_qa_cache').upsert(cacheEntry, { onConflict: 'country_id,question_hash' });
    }

    return NextResponse.json({
      answer,
      from_cache: false,
      limit: usageCheck.limit,
      remaining: usageCheck.remaining,
    });
  } catch (error) {
    console.error('Visa AI answer error', { msg: error instanceof Error ? error.message : 'unknown' });
    return NextResponse.json({
      error: 'AI cavab verə bilmədi',
      limit: usageCheck.limit,
      remaining: usageCheck.remaining,
      from_cache: false,
    }, { status: 500 });
  }
}

async function hashQuestion(question: string): Promise<string> {
  const normalized = question.toLowerCase().trim().replace(/\s+/g, ' ');
  const data = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
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
