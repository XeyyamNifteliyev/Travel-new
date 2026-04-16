-- Visa scraper sistem

-- Dəyişiklik tarixi
CREATE TABLE IF NOT EXISTS visa_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID REFERENCES countries(id) ON DELETE CASCADE,
  field_changed TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  change_summary_az TEXT,
  change_severity TEXT DEFAULT 'info',
  source_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scraper jurnalı
CREATE TABLE IF NOT EXISTS scraper_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID REFERENCES countries(id) ON DELETE SET NULL,
  source_url TEXT,
  status TEXT,
  changes_detected JSONB,
  error_message TEXT,
  duration_ms INT,
  ran_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE visa_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraper_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visa updates viewable" ON visa_updates FOR SELECT USING (true);
CREATE POLICY "Scraper logs viewable" ON scraper_logs FOR SELECT USING (true);
CREATE POLICY "Scraper can insert updates" ON visa_updates FOR INSERT WITH CHECK (true);
CREATE POLICY "Scraper can insert logs" ON scraper_logs FOR INSERT WITH CHECK (true);
