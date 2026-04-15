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

    let parsed: any;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      const cleaned = jsonStr.replace(/,\s*([}\]])/g, '$1');
      parsed = JSON.parse(cleaned);
    }

    const result: CheapDatesResponse = {
      destination: parsed.destination || body.destination,
      options: (parsed.options || []).map((opt: any) => ({
        period: opt.period || '',
        flightPrice: opt.flightPrice || 0,
        hotelPricePerNight: opt.hotelPricePerNight || 0,
        totalPrice: opt.totalPrice || 0,
        reason: opt.reason || '',
      })),
      tip: parsed.tip || '',
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Cheap Dates error:', error);
    return NextResponse.json(
      { error: error.message || 'Ucuz tarixlər tapılarkən xəta baş verdi' },
      { status: 500 }
    );
  }
}
