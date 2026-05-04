import { TravelPlan } from '@/types/ai-planner';

export function parseAIResponse(raw: string): TravelPlan {
  let jsonStr = raw;

  const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  } else {
    const braceMatch = raw.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      jsonStr = braceMatch[0];
    }
  }

  try {
    const parsed = JSON.parse(jsonStr);
    return mapToTravelPlan(parsed);
  } catch (firstError) {
    console.error('First parse attempt failed:', (firstError as Error).message);
    console.error('Raw response first 500 chars:', raw.substring(0, 500));

    const cleaned = jsonStr
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/[\x00-\x1F\x7F]/g, (ch) => {
        if (ch === '\n' || ch === '\r' || ch === '\t') return ch;
        return '';
      });

    try {
      const parsed = JSON.parse(cleaned);
      return mapToTravelPlan(parsed);
    } catch (secondError) {
      console.error('Second parse attempt also failed:', (secondError as Error).message);
      console.error('Raw response last 500 chars:', raw.substring(raw.length - 500));
      throw new Error('AI cavabı parse oluna bilmədi');
    }
  }
}

function mapToTravelPlan(parsed: Record<string, unknown>): TravelPlan {
  const cost = (parsed.totalEstimatedCost ?? {}) as Record<string, unknown>;
  const breakdown = (cost.breakdown ?? {}) as Record<string, unknown>;
  return {
    summary: (parsed.summary as string) || '',
    totalEstimatedCost: {
      amount: (cost.amount as number) || 0,
      currency: (cost.currency as string) || 'AZN',
      breakdown: {
        flights: (breakdown.flights as number) || 0,
        accommodation: (breakdown.accommodation as number) || 0,
        food: (breakdown.food as number) || 0,
        activities: (breakdown.activities as number) || 0,
        transport: (breakdown.transport as number) || 0,
      },
    },
    days: ((parsed.days ?? []) as Record<string, unknown>[]).map((day) => {
      const meals = (day.meals ?? {}) as Record<string, unknown>;
      return {
        day: (day.day as number) || 1,
        title: (day.title as string) || '',
        activities: ((day.activities ?? []) as Record<string, unknown>[]).map((a) => ({
          time: (a.time as string) || '',
          activity: (a.activity as string) || '',
          location: (a.location as string) || '',
          cost: (a.cost as number) || 0,
          tip: (a.tip as string) || '',
        })),
        meals: {
          breakfast: (meals.breakfast as string) || '',
          lunch: (meals.lunch as string) || '',
          dinner: (meals.dinner as string) || '',
        },
        transport: (day.transport as string) || '',
        estimatedCost: (day.estimatedCost as number) || 0,
      };
    }),
    tips: (parsed.tips as string[]) || [],
    visaInfo: {
      required: ((parsed.visaInfo as Record<string, unknown>)?.required as boolean) || false,
      type: ((parsed.visaInfo as Record<string, unknown>)?.type as string) || '',
      processingTime: ((parsed.visaInfo as Record<string, unknown>)?.processingTime as string) || '',
    },
    bestTimeToVisit: (parsed.bestTimeToVisit as string) || '',
    packingList: (parsed.packingList as string[]) || [],
  };
}
