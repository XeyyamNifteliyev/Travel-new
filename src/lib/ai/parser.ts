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

    return {
      summary: parsed.summary || '',
      totalEstimatedCost: {
        amount: parsed.totalEstimatedCost?.amount || 0,
        currency: parsed.totalEstimatedCost?.currency || 'AZN',
        breakdown: {
          flights: parsed.totalEstimatedCost?.breakdown?.flights || 0,
          accommodation: parsed.totalEstimatedCost?.breakdown?.accommodation || 0,
          food: parsed.totalEstimatedCost?.breakdown?.food || 0,
          activities: parsed.totalEstimatedCost?.breakdown?.activities || 0,
          transport: parsed.totalEstimatedCost?.breakdown?.transport || 0,
        },
      },
      days: (parsed.days || []).map((day: any) => ({
        day: day.day || 1,
        title: day.title || '',
        activities: (day.activities || []).map((a: any) => ({
          time: a.time || '',
          activity: a.activity || '',
          location: a.location || '',
          cost: a.cost || 0,
          tip: a.tip || '',
        })),
        meals: {
          breakfast: day.meals?.breakfast || '',
          lunch: day.meals?.lunch || '',
          dinner: day.meals?.dinner || '',
        },
        transport: day.transport || '',
        estimatedCost: day.estimatedCost || 0,
      })),
      tips: parsed.tips || [],
      visaInfo: {
        required: parsed.visaInfo?.required || false,
        type: parsed.visaInfo?.type || '',
        processingTime: parsed.visaInfo?.processingTime || '',
      },
      bestTimeToVisit: parsed.bestTimeToVisit || '',
      packingList: parsed.packingList || [],
    };
  } catch {
    throw new Error('AI cavabı parse oluna bilmədi');
  }
}
