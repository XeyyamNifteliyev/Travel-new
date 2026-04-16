import { createClient } from '@/lib/supabase/server';
import { getProvider } from '@/lib/ai/provider';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { question, country_slug, locale } = await request.json();

  if (!question || !country_slug) {
    return NextResponse.json({ error: 'Sual və ölkə tələb olunur' }, { status: 400 });
  }

  const supabase = await createClient();
  const questionHash = await hashQuestion(question);

  const { data: countryRow } = await supabase
    .from('countries')
    .select('id')
    .eq('slug', country_slug)
    .single();

  if (countryRow) {
    const { data: cached } = await supabase
      .from('visa_qa_cache')
      .select(`answer_az, answer_en, answer_ru, id`)
      .eq('country_id', countryRow.id)
      .eq('question_hash', questionHash)
      .eq('is_valid', true)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (cached) {
      const answer = cached[`answer_${locale}` as 'answer_az' | 'answer_en' | 'answer_ru'] || cached.answer_az;
      if (answer) {
        await supabase
          .from('visa_qa_cache')
          .update({ hit_count: (cached as { hit_count?: number }).hit_count ?? 0 + 1 })
          .eq('id', (cached as { id: string }).id);
        return NextResponse.json({ answer, from_cache: true });
      }
    }
  }

  const { data: visaData } = await supabase
    .from('visa_info')
    .select(`
      *,
      countries!inner(name_az, name_en, slug),
      visa_documents(document_name_az, is_required, document_category)
    `)
    .eq('countries.slug', country_slug)
    .single();

  const context = buildVisaContext(visaData, country_slug);
  const localeInstruction: Record<string, string> = {
    az: 'Azərbaycan dilində cavab ver.',
    en: 'Answer in English.',
    ru: 'Отвечай на русском языке.',
  };

  try {
    const provider = getProvider();
    const answer = await provider.generateText(
      `${context}\n\n${localeInstruction[locale] || localeInstruction.az}\n\nSual: ${question}`
    );

    if (countryRow && answer) {
      const cacheEntry: Record<string, unknown> = {
        country_id: countryRow.id,
        question_hash: questionHash,
        question_text: question,
        hit_count: 0,
        is_valid: true,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
      cacheEntry[`answer_${locale}`] = answer;

      await supabase.from('visa_qa_cache').upsert(cacheEntry, { onConflict: 'country_id,question_hash' });
    }

    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json({ error: 'AI cavab verə bilmədi' }, { status: 500 });
  }
}

async function hashQuestion(question: string): Promise<string> {
  const normalized = question.toLowerCase().trim().replace(/\s+/g, ' ');
  const data = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
}

function buildVisaContext(visaData: Record<string, unknown> | null, slug: string): string {
  if (!visaData) {
    return `Ölkə: ${slug}. Ümumi viza qaydaları haqqında cavab ver. Azərbaycan pasportu kontekstində.`;
  }

  const docs = Array.isArray(visaData.visa_documents)
    ? (visaData.visa_documents as { is_required: boolean; document_name_az: string }[])
        .filter((d) => d.is_required)
        .map((d) => d.document_name_az)
        .join(', ')
    : '';

  const country = visaData.countries as { name_az: string };

  return `SEN: TravelAZ saytının viza assistentisən. Azərbaycan vətəndaşlarına kömək edirsən.

ÖLKƏ: ${country.name_az}
Viza növü: ${visaData.requirement_type}
E-viza: ${visaData.is_evisa ? 'Mövcuddur' : 'Mövcud deyil'}
Viza haqqı: ${visaData.fee_usd ? `$${visaData.fee_usd}` : 'Pulsuz'}
İcmal müddəti: ${visaData.processing_days_min || '?'}-${visaData.processing_days_max || '?'} iş günü
Etibarlılıq: ${visaData.validity_days || '?'} gün
Maks. qalma: ${visaData.max_stay_days || '?'} gün

TƏLƏB OLUNAN SƏNƏDLƏR:
${docs || 'Sənəd tələb olunmur'}

QEYDLƏR:
${(visaData.notes_az as string) || ''}

CAVAB QAYDASI:
- Dəqiq, aydın cavab ver
- Şübhəli məlumatı "Rəsmi mənbədən yoxlayın" deyərək qeyd et
- Rəsmi sayt linkini tövsiyə et (${visaData.official_url || 'yoxdur'})`;
}
