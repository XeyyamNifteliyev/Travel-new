CREATE TABLE IF NOT EXISTS ai_daily_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  feature TEXT NOT NULL CHECK (feature IN ('visa', 'planner', 'cheap_dates')),
  request_count INT NOT NULL DEFAULT 0 CHECK (request_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, usage_date, feature)
);

CREATE INDEX IF NOT EXISTS idx_ai_daily_usage_user_date_feature
  ON ai_daily_usage(user_id, usage_date, feature);

ALTER TABLE ai_daily_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own AI usage" ON ai_daily_usage;
CREATE POLICY "Users can view own AI usage"
  ON ai_daily_usage FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Visa QA cache insert" ON visa_qa_cache;
DROP POLICY IF EXISTS "Visa QA cache update" ON visa_qa_cache;

DROP POLICY IF EXISTS "Users can insert own visa AI usage" ON visa_ai_daily_usage;
DROP POLICY IF EXISTS "Users can update own visa AI usage" ON visa_ai_daily_usage;

DROP POLICY IF EXISTS "Scraper can insert updates" ON visa_updates;
DROP POLICY IF EXISTS "Scraper can insert logs" ON scraper_logs;
DROP POLICY IF EXISTS "Scraper logs viewable" ON scraper_logs;

CREATE POLICY "Admins can view scraper logs"
  ON scraper_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "System can manage leaderboard" ON leaderboard_stats;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

DROP POLICY IF EXISTS "Leaderboard viewable by everyone" ON leaderboard_stats;
CREATE POLICY "Leaderboard viewable by everyone"
  ON leaderboard_stats FOR SELECT
  USING (true);
