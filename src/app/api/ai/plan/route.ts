import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { assertAiLimit, incrementAiUsage, AI_DAILY_LIMITS } from '@/lib/ai/usage';
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

    const usage = await assertAiLimit(user.id, 'planner');
    if (!usage.allowed) {
      return NextResponse.json({
        error: 'Gündəlik AI plan limitiniz bitib. Sabah yenidən cəhd edin.',
        limit: usage.limit,
        remaining: 0,
        from_cache: false,
      }, { status: 429 });
    }

    const provider = getProvider();
    const prompt = buildPrompt(body);
    const rawResponse = await provider.generateText(prompt);
    const plan = parseAIResponse(rawResponse);
    await incrementAiUsage(user.id, 'planner', usage);

    const destinationSlug = body.destination.toLowerCase().replace(/\s+/g, '-');

    return NextResponse.json({
      plan,
      limit: usage.limit,
      remaining: Math.max(usage.limit - usage.count - 1, 0),
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
    console.error('AI Plan error:', error);
    return NextResponse.json(
      { error: 'Plan hazırlanarkən xəta baş verdi' },
      { status: 500 }
    );
  }
}
