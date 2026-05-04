import { NextResponse } from 'next/server';
import { getProvider } from '@/lib/ai/provider';
import { buildCheapDatesPrompt } from '@/lib/ai/prompts';
import { CheapDatesRequest, CheapDatesResponse } from '@/types/ai-planner';

export async function POST(request: Request) {
  try {
    const body: CheapDatesRequest = await request.json();

    if (!body.destination || !body.duration || !body.travelers) {
      return NextResponse.json(
        { error: 'Destinasiya, müddət və səyahətçi sayı mütləqdir' },
        { status: 400 }
      );
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

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Cheap Dates error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: message || 'Ucuz tarixlər tapılarkən xəta baş verdi' },
      { status: 500 }
    );
  }
}
