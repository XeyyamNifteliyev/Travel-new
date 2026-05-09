import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { assertAiLimit, incrementAiUsage, AI_DAILY_LIMITS } from '@/lib/ai/usage';
import { getProvider } from '@/lib/ai/provider';
import { buildCheapDatesPrompt } from '@/lib/ai/prompts';
import { CheapDatesRequest, CheapDatesResponse } from '@/types/ai-planner';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Giriş tələb olunur', limit: AI_DAILY_LIMITS.cheap_dates, remaining: 0, from_cache: false }, { status: 401 });
    }

    const body: CheapDatesRequest = await request.json();

    if (!body.destination || !body.duration || !body.travelers) {
      return NextResponse.json(
        { error: 'Destinasiya, müddət və səyahətçi sayı mütləqdir' },
        { status: 400 }
      );
    }

    const usage = await assertAiLimit(user.id, 'cheap_dates');
    if (!usage.allowed) {
      return NextResponse.json({
        error: 'Gündəlik ucuz tarix AI limitiniz bitib. Sabah yenidən cəhd edin.',
        limit: usage.limit,
        remaining: 0,
        from_cache: false,
      }, { status: 429 });
    }

    const provider = getProvider();
    const prompt = buildCheapDatesPrompt(body);
    const rawResponse = await provider.generateText(prompt);

    let jsonStr = rawResponse;
    const codeBlockMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    } else {
      const braceMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (braceMatch) {
        jsonStr = braceMatch[0];
      }
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonStr) as Record<string, unknown>;
    } catch {
      const cleaned = jsonStr.replace(/,\s*([}\]])/g, '$1');
      parsed = JSON.parse(cleaned) as Record<string, unknown>;
    }

    const result: CheapDatesResponse = {
      destination: (parsed.destination as string) || body.destination,
      options: ((parsed.options ?? []) as Record<string, unknown>[]).map((opt) => ({
        period: (opt.period as string) || '',
        flightPrice: (opt.flightPrice as number) || 0,
        hotelPricePerNight: (opt.hotelPricePerNight as number) || 0,
        totalPrice: (opt.totalPrice as number) || 0,
        reason: (opt.reason as string) || '',
      })),
      tip: (parsed.tip as string) || '',
    };

    await incrementAiUsage(user.id, 'cheap_dates', usage);

    return NextResponse.json({
      ...result,
      limit: usage.limit,
      remaining: Math.max(usage.limit - usage.count - 1, 0),
      from_cache: false,
    });
  } catch (error: unknown) {
    console.error('Cheap Dates error:', error);
    return NextResponse.json(
      { error: 'Ucuz tarixlər tapılarkən xəta baş verdi' },
      { status: 500 }
    );
  }
}
