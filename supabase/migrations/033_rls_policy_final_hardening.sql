-- Final production RLS hardening for system/cache tables.
-- This migration is intentionally idempotent and does not delete data.

ALTER TABLE IF EXISTS visa_qa_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS visa_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS scraper_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS leaderboard_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;

-- visa_qa_cache is a server-managed cache. Public users may read cached answers,
-- but inserts/updates/deletes must only happen through service-role server code.
DROP POLICY IF EXISTS "Visa QA cache is viewable by everyone" ON visa_qa_cache;
DROP POLICY IF EXISTS "Visa QA cache insert" ON visa_qa_cache;
DROP POLICY IF EXISTS "Visa QA cache update" ON visa_qa_cache;
DROP POLICY IF EXISTS "Visa QA cache delete" ON visa_qa_cache;

CREATE POLICY "Visa QA cache is viewable by everyone"
  ON visa_qa_cache FOR SELECT
  USING (true);

-- Scraper writes are server-only. The public app can read visa update history,
-- while scraper logs are visible only to admins.
DROP POLICY IF EXISTS "Visa updates viewable" ON visa_updates;
DROP POLICY IF EXISTS "Scraper can insert updates" ON visa_updates;

CREATE POLICY "Visa updates viewable"
  ON visa_updates FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Scraper logs viewable" ON scraper_logs;
DROP POLICY IF EXISTS "Scraper can insert logs" ON scraper_logs;
DROP POLICY IF EXISTS "Admins can view scraper logs" ON scraper_logs;

CREATE POLICY "Admins can view scraper logs"
  ON scraper_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Leaderboard is public read, system write only.
DROP POLICY IF EXISTS "Leaderboard viewable by everyone" ON leaderboard_stats;
DROP POLICY IF EXISTS "System can manage leaderboard" ON leaderboard_stats;

CREATE POLICY "Leaderboard viewable by everyone"
  ON leaderboard_stats FOR SELECT
  USING (true);

-- Notifications are user-private. Creation should happen from trusted server code.
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);
