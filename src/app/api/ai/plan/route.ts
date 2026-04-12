import { NextResponse } from 'next/server';
import { generateTravelPlan } from '@/lib/ai/gemini';
import { buildPrompt } from '@/lib/ai/prompts';
import { parseAIResponse } from '@/lib/ai/parser';
import { PlanRequest } from '@/types/ai-planner';

export async function POST(request: Request) {
  try {
    const body: PlanRequest = await request.json();

    if (!body.destination || !body.startDate || !body.endDate) {
      return NextResponse.json(
        { error: 'Destinasiya, başlanğıc və bitiş tarixi mütləqdir' },
        { status: 400 }
      );
    }

    const prompt = buildPrompt(body);
    const rawResponse = await generateTravelPlan(prompt);
    const plan = parseAIResponse(rawResponse);

    const destinationSlug = body.destination.toLowerCase().replace(/\s+/g, '-');

    return NextResponse.json({
      plan,
      platformData: {
        countryPage: `/${body.language}/countries/${destinationSlug}`,
        tours: [],
        flightsLink: `/${body.language}/flights?to=${encodeURIComponent(body.destination)}`,
        hotelsLink: `/${body.language}/hotels?city=${encodeURIComponent(body.destination)}`,
        visaPage: `/${body.language}/visa`,
      },
    });
  } catch (error: any) {
    console.error('AI Plan error:', error);
    return NextResponse.json(
      { error: error.message || 'Plan hazırlanarkən xəta baş verdi' },
      { status: 500 }
    );
  }
}
