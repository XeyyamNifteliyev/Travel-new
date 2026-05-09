import { createAdminClient } from '@/lib/supabase/admin';

export type AiFeature = 'visa' | 'planner' | 'cheap_dates';

export const AI_DAILY_LIMITS: Record<AiFeature, number> = {
  visa: 3,
  planner: 3,
  cheap_dates: 5,
};

function getBakuDate(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Baku',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export async function getAiUsage(userId: string, feature: AiFeature) {
  const supabase = createAdminClient();
  const usageDate = getBakuDate();
  const limit = AI_DAILY_LIMITS[feature];

  const { data, error } = await supabase
    .from('ai_daily_usage')
    .select('id, request_count')
    .eq('user_id', userId)
    .eq('usage_date', usageDate)
    .eq('feature', feature)
    .maybeSingle();

  if (error) {
    console.error('AI usage read error:', { feature, error });
  }

  const count = (data?.request_count as number | undefined) ?? 0;
  return {
    usageId: data?.id as string | undefined,
    usageDate,
    count,
    limit,
    remaining: Math.max(limit - count, 0),
  };
}

export async function assertAiLimit(userId: string, feature: AiFeature) {
  const usage = await getAiUsage(userId, feature);
  if (usage.count >= usage.limit) {
    return {
      allowed: false as const,
      ...usage,
    };
  }

  return {
    allowed: true as const,
    ...usage,
  };
}

export async function incrementAiUsage(
  userId: string,
  feature: AiFeature,
  usage: { usageId?: string; usageDate: string; count: number }
) {
  const supabase = createAdminClient();

  if (usage.usageId) {
    const { error } = await supabase
      .from('ai_daily_usage')
      .update({
        request_count: usage.count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', usage.usageId);

    if (error) console.error('AI usage update error:', { feature, error });
    return;
  }

  const { error } = await supabase
    .from('ai_daily_usage')
    .insert({
      user_id: userId,
      usage_date: usage.usageDate,
      feature,
      request_count: 1,
    });

  if (error) console.error('AI usage insert error:', { feature, error });
}
