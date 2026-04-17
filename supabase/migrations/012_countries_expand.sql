-- 012: Countries cədvəlini genişləndir + country_highlights

ALTER TABLE countries
  ADD COLUMN IF NOT EXISTS continent        TEXT,
  ADD COLUMN IF NOT EXISTS capital          TEXT,
  ADD COLUMN IF NOT EXISTS currency         TEXT,
  ADD COLUMN IF NOT EXISTS currency_name    TEXT,
  ADD COLUMN IF NOT EXISTS language         TEXT,
  ADD COLUMN IF NOT EXISTS population       BIGINT,
  ADD COLUMN IF NOT EXISTS timezone         TEXT,
  ADD COLUMN IF NOT EXISTS calling_code     TEXT,
  ADD COLUMN IF NOT EXISTS best_months      TEXT[],
  ADD COLUMN IF NOT EXISTS climate_type     TEXT,
  ADD COLUMN IF NOT EXISTS avg_flight_azn   INTEGER,
  ADD COLUMN IF NOT EXISTS avg_hotel_azn    INTEGER,
  ADD COLUMN IF NOT EXISTS avg_daily_azn    INTEGER,
  ADD COLUMN IF NOT EXISTS cover_photo_id   TEXT,
  ADD COLUMN IF NOT EXISTS cover_photo_alt  TEXT,
  ADD COLUMN IF NOT EXISTS gallery_ids      TEXT[],
  ADD COLUMN IF NOT EXISTS youtube_ids      TEXT[],
  ADD COLUMN IF NOT EXISTS youtube_titles   TEXT[],
  ADD COLUMN IF NOT EXISTS top_places       JSONB,
  ADD COLUMN IF NOT EXISTS short_desc       TEXT,
  ADD COLUMN IF NOT EXISTS short_desc_en    TEXT,
  ADD COLUMN IF NOT EXISTS short_desc_ru    TEXT,
  ADD COLUMN IF NOT EXISTS safety_level     TEXT DEFAULT 'safe',
  ADD COLUMN IF NOT EXISTS visa_required    BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS popular_rank     INTEGER DEFAULT 99,
  ADD COLUMN IF NOT EXISTS is_featured      BOOLEAN DEFAULT false;

CREATE TABLE IF NOT EXISTS country_highlights (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id  UUID REFERENCES countries(id) ON DELETE CASCADE,
  slug        TEXT NOT NULL,
  name        TEXT NOT NULL,
  name_en     TEXT,
  name_ru     TEXT,
  description TEXT,
  photo_id    TEXT,
  lat         DECIMAL(9,6),
  lng         DECIMAL(9,6),
  category    TEXT DEFAULT 'landmark',
  rank        INTEGER DEFAULT 1,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_highlights_country ON country_highlights(country_id);
CREATE INDEX IF NOT EXISTS idx_countries_rank ON countries(popular_rank);
CREATE INDEX IF NOT EXISTS idx_countries_continent ON countries(continent);
CREATE INDEX IF NOT EXISTS idx_countries_featured ON countries(is_featured) WHERE is_featured = true;
