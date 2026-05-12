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

export async function assertAndIncrementAiLimit(userId: string, feature: AiFeature) {
  const supabase = createAdminClient();
  const limit = AI_DAILY_LIMITS[feature];
  const usageDate = getBakuDate();

  const { data, error } = await supabase.rpc('increment_ai_usage', {
    p_user_id: userId,
    p_feature: feature,
    p_usage_date: usageDate,
    p_limit: limit,
  });

  if (error) {
    console.error('AI usage atomic error:', { feature, code: error.code });
    return { allowed: false as const, limit, remaining: 0, count: limit };
  }

  const row = Array.isArray(data) ? data[0] : data;
  const allowed = Boolean(row?.allowed);
  const count = Number(row?.current_count ?? 0);

  return {
    allowed,
    limit,
    remaining: allowed ? Math.max(limit - count, 0) : 0,
    count,
  };
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
    console.error('AI usage read error:', { feature, code: error.code });
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
