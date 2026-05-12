import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { assertAndIncrementAiLimit, AI_DAILY_LIMITS } from '@/lib/ai/usage';
import { getProvider } from '@/lib/ai/provider';
import { buildPrompt } from '@/lib/ai/prompts';
import { parseAIResponse } from '@/lib/ai/parser';
import { PlanRequest } from '@/types/ai-planner';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Giriş tələb olunur', limit: AI_DAILY_LIMITS.planner, remaining: 0, from_cache: false }, { status: 401 });
    }

    const body: PlanRequest = await request.json();

    if (!body.destination || !body.startDate || !body.endDate) {
      return NextResponse.json(
        { error: 'Destinasiya, başlanğıc və bitiş tarixi mütləqdir' },
        { status: 400 }
      );
    }

    const usageCheck = await assertAndIncrementAiLimit(user.id, 'planner');
    if (!usageCheck.allowed) {
      return NextResponse.json({
        error: 'Gündəlik AI plan limitiniz bitib. Sabah yenidən cəhd edin.',
        limit: usageCheck.limit,
        remaining: 0,
        from_cache: false,
      }, { status: 429 });
    }

    const provider = getProvider();
    const prompt = buildPrompt(body);
    const rawResponse = await provider.generateText(prompt);
    const plan = parseAIResponse(rawResponse);

    const destinationSlug = body.destination.toLowerCase().replace(/\s+/g, '-');

    return NextResponse.json({
      plan,
      limit: usageCheck.limit,
      remaining: usageCheck.remaining,
      from_cache: false,
      platformData: {
        countryPage: `/${body.language}/countries/${destinationSlug}`,
        tours: [],
        flightsLink: `/${body.language}/flights?to=${encodeURIComponent(body.destination)}`,
        hotelsLink: `/${body.language}/hotels?city=${encodeURIComponent(body.destination)}`,
        visaPage: `/${body.language}/visa`,
      },
    });
  } catch (error: unknown) {
    console.error('AI Plan error', { msg: error instanceof Error ? error.message : 'unknown' });
    return NextResponse.json(
      { error: 'Plan hazırlanarkən xəta baş verdi' },
      { status: 500 }
    );
  }
}
