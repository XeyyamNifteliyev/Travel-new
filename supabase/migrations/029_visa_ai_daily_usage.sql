CREATE TABLE IF NOT EXISTS visa_ai_daily_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  question_count INT NOT NULL DEFAULT 0 CHECK (question_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, usage_date)
);

CREATE INDEX IF NOT EXISTS idx_visa_ai_daily_usage_user_date
  ON visa_ai_daily_usage(user_id, usage_date);

CREATE UNIQUE INDEX IF NOT EXISTS idx_visa_qa_cache_country_question_unique
  ON visa_qa_cache(country_id, question_hash);

ALTER TABLE visa_ai_daily_usage ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own visa AI usage"
    ON visa_ai_daily_usage FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own visa AI usage"
    ON visa_ai_daily_usage FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own visa AI usage"
    ON visa_ai_daily_usage FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
