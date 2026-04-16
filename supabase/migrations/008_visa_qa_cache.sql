-- AI Viza Cavab Keşi
CREATE TABLE IF NOT EXISTS visa_qa_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID REFERENCES countries(id) ON DELETE CASCADE,
  question_hash TEXT NOT NULL,
  question_text TEXT NOT NULL,
  answer_az TEXT,
  answer_en TEXT,
  answer_ru TEXT,
  hit_count INT DEFAULT 0,
  is_valid BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_visa_qa_cache_hash ON visa_qa_cache(question_hash);
CREATE INDEX idx_visa_qa_cache_expires ON visa_qa_cache(expires_at);

ALTER TABLE visa_qa_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visa QA cache is viewable by everyone" ON visa_qa_cache FOR SELECT USING (true);
DO $$ BEGIN
  CREATE POLICY "Visa QA cache insert" ON visa_qa_cache FOR INSERT WITH CHECK (true);
  CREATE POLICY "Visa QA cache update" ON visa_qa_cache FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
