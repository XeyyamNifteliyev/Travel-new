# 🗺️ TravelAZ — Ölkələr Modulunun Genişləndirilməsi
### Tam İmplementasiya Sənədi v1.0

> Mövcud `countries` cədvəlinə 50+ ölkə əlavə etmək, Supabase-dən dinamik yükləmək,
> şəkillər üçün Unsplash CDN + YouTube embed — saytı ağırlaşdırmadan.

---

## 📋 Mündəricat

1. [Ümumi Strategiya](#1-ümumi-strategiya)
2. [Supabase Cədvəl Strukturu](#2-supabase-cədvəl-strukturu)
3. [SQL Migration — countries genişləndirilməsi](#3-sql-migration)
4. [50 Ölkə Seed Data](#4-50-ölkə-seed-data)
5. [Next.js Səhifə Yeniləməsi](#5-nextjs-səhifə-yeniləməsi)
6. [Şəkil Strategiyası — Saytı Ağırlaşdırmadan](#6-şəkil-strategiyası)
7. [YouTube Embed Strategiyası](#7-youtube-embed-strategiyası)
8. [country-card.tsx Yeniləməsi](#8-country-cardtsx-yeniləməsi)
9. [Ölkə Detal Səhifəsi](#9-ölkə-detal-səhifəsi)
10. [Performans Tədbirləri](#10-performans-tədbirləri)
11. [i18n Tərcümə Açarları](#11-i18n-tərcümə-açarları)
12. [Tətbiq Sırası](#12-tətbiq-sırası)

---

## 1. Ümumi Strategiya

### Nə dəyişir

| Əvvəl | Sonra |
|---|---|
| 10 ölkə, `countries/page.tsx`-də hardcoded | 50+ ölkə, Supabase-dən dinamik |
| Yalnız ad + slug | Ətraflı məlumat: məşhur yerlər, xərclər, iqlim, YouTube |
| Şəkil yoxdur | Unsplash CDN (pulsuz, lazy load) |
| YouTube yoxdur | Lite embed (sayfayı ağırlaşdırmır) |

### Saytı Ağırlaşdırmamaq Üçün Əsas Qaydalar

```
✅ Şəkillər: Unsplash CDN URL — Next.js Image component ilə (lazy + WebP)
✅ YouTube: "Lite embed" — yalnız kliklənəndə video yüklənir
✅ Supabase sorğu: SELECT yalnız lazımlı sütunlar (thumbnail sütunu ayrı sorğuda)
✅ countries/page.tsx: 12-lik pagination — 50 ölkəni birdən yükləmir
✅ country/[slug]/page.tsx: ISR (revalidate: 86400) — hər gün 1 dəfə yenilənir
✅ YouTube ID-ləri DB-də saxlanır, iframe yalnız detal səhifəsində
```

---

## 2. Supabase Cədvəl Strukturu

### Mövcud `countries` cədvəlini genişləndir

```sql
-- Mövcud cədvələ yeni sütunlar əlavə et
ALTER TABLE countries ADD COLUMN IF NOT EXISTS
  continent        TEXT,                    -- 'europe','asia','americas','africa','oceania'
  capital          TEXT,                    -- Paytaxt
  currency         TEXT,                    -- 'EUR', 'USD', 'TRY'
  currency_name    TEXT,                    -- 'Euro', 'Dollar'
  language         TEXT,                    -- 'Alman', 'İngilis'
  population       BIGINT,                  -- 83_200_000
  timezone         TEXT,                    -- 'UTC+1'
  calling_code     TEXT,                    -- '+49'
  best_months      TEXT[],                  -- ARRAY['may','jun','jul','aug','sep']
  climate_type     TEXT,                    -- 'moderate','tropical','desert','cold'

  -- Xərclər (AZN ilə)
  avg_flight_azn   INTEGER,                 -- Bakıdan ortalama bilet
  avg_hotel_azn    INTEGER,                 -- Gecəlik ortalama otel
  avg_daily_azn    INTEGER,                 -- Gündəlik xərc (yemək+nəqliyyat)

  -- Şəkillər (Unsplash CDN)
  cover_photo_id   TEXT,                    -- Unsplash foto ID: 'abc123xyz'
  cover_photo_alt  TEXT,                    -- Alt text
  gallery_ids      TEXT[],                  -- ARRAY['id1','id2','id3'] — 4-6 foto

  -- YouTube
  youtube_ids      TEXT[],                  -- ARRAY['dQw4w9WgXcQ','...'] — 3-5 video
  youtube_titles   TEXT[],                  -- Videonun adı (embed üçün)

  -- Məşhur yerlər (JSON array)
  top_places       JSONB,                   -- [{name,desc,photo_id,lat,lng}]

  -- Ətraflı
  short_desc       TEXT,                    -- 1-2 cümlə təsvir (az dili)
  short_desc_en    TEXT,
  short_desc_ru    TEXT,
  safety_level     TEXT DEFAULT 'safe',     -- 'safe','caution','warning'
  visa_required    BOOLEAN DEFAULT true,
  popular_rank     INTEGER DEFAULT 99,      -- Sıralama (1=ən populyar)
  is_featured      BOOLEAN DEFAULT false;   -- Ana səhifədə göstər
```

### `country_highlights` — ayrı cədvəl (məşhur yerlər üçün)

```sql
CREATE TABLE IF NOT EXISTS country_highlights (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id  UUID REFERENCES countries(id) ON DELETE CASCADE,
  slug        TEXT NOT NULL,               -- 'eyfel-qulesi'
  name        TEXT NOT NULL,               -- 'Eyfel Qülləsi'
  name_en     TEXT,
  name_ru     TEXT,
  description TEXT,
  photo_id    TEXT,                        -- Unsplash ID
  lat         DECIMAL(9,6),
  lng         DECIMAL(9,6),
  category    TEXT,                        -- 'landmark','nature','food','museum'
  rank        INTEGER DEFAULT 1,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_highlights_country ON country_highlights(country_id);
```

---

## 3. SQL Migration

### Fayl: `supabase/migrations/012_countries_expand.sql`

```sql
-- ============================================
-- 012: Countries cədvəlini genişləndir
-- ============================================

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
```

---

## 4. 50 Ölkə Seed Data

### Fayl: `supabase/migrations/013_countries_seed_50.sql`

> Unsplash foto ID-ləri: `https://images.unsplash.com/photo-{ID}?w=800&q=80`
> YouTube ID-ləri: `https://www.youtube.com/watch?v={ID}`

```sql
-- ============================================
-- 013: 50 ölkə üçün tam seed data
-- ============================================

-- Əvvəlcə mövcud 10 ölkəni yenilə, sonra 40 yeni əlavə et

-- ─────────────────────────────────────────────
-- MÖVCUD ÖLKƏLƏRİ GÜNCƏLLƏ
-- ─────────────────────────────────────────────

UPDATE countries SET
  continent = 'europe', capital = 'İstanbul (siyasi: Ankara)', currency = 'TRY', currency_name = 'Türk Lirəsi',
  language = 'Türk', population = 85000000, timezone = 'UTC+3', calling_code = '+90',
  best_months = ARRAY['apr','may','sep','oct'], climate_type = 'moderate',
  avg_flight_azn = 120, avg_hotel_azn = 80, avg_daily_azn = 60,
  cover_photo_id = '1541432901-e4f3f02cfcec', cover_photo_alt = 'İstanbul Bosfor körpüsü',
  gallery_ids = ARRAY['1524231757-71857364e5bd','1566073771259-1a2537e7a5da','1551913902-b38fc67d8b4e'],
  youtube_ids = ARRAY['0aFBFBHg_fU','1a6uDjJMJEI','OJLRwPiSRYA'],
  youtube_titles = ARRAY['İstanbul gəzintisi 2024','Kapadokya balonla uçuş','Türkiyə travel guide'],
  short_desc = 'İki qitəni birləşdirən, tarixi zəngin, mədəniyyəti möhtəşəm ölkə.',
  short_desc_en = 'A country bridging two continents with rich history and vibrant culture.',
  short_desc_ru = 'Страна, соединяющая два континента, с богатой историей и культурой.',
  visa_required = false, popular_rank = 1, is_featured = true,
  top_places = '[
    {"name":"Ayasofya","desc":"Dünyaca məşhur Bizans və Osmanlı abidəsi","photo_id":"1524231757-71857364e5bd","lat":41.0086,"lng":28.9802,"category":"landmark"},
    {"name":"Kapadokya","desc":"Pəri bacaları və balon turu","photo_id":"1551913902-b38fc67d8b4e","lat":38.6431,"lng":34.8289,"category":"nature"},
    {"name":"Pamukkale","desc":"Ağ travertin terasları","photo_id":"1542296332-1bc5c2bbc638","lat":37.9137,"lng":29.1187,"category":"nature"}
  ]'::jsonb
WHERE slug = 'turkey';

UPDATE countries SET
  continent = 'asia', capital = 'Dubai (siyasi: Abu Dabi)', currency = 'AED', currency_name = 'BƏƏ Dirhəmi',
  language = 'Ərəb (ingilis geniş)', population = 9900000, timezone = 'UTC+4', calling_code = '+971',
  best_months = ARRAY['nov','dec','jan','feb','mar'], climate_type = 'desert',
  avg_flight_azn = 160, avg_hotel_azn = 220, avg_daily_azn = 150,
  cover_photo_id = '1512453979798-5ea266f8880c', cover_photo_alt = 'Dubai Burj Khalifa',
  gallery_ids = ARRAY['1568702846914-96b305d2aaeb','1529253355930-ddbe423a2ac7','1580674684029-7a61b5b3e9da'],
  youtube_ids = ARRAY['Xn_Pz1jIBdQ','JXdxYGU2ags','6jZ_q2mNaDE'],
  youtube_titles = ARRAY['Dubai travel vlog 2024','Burj Khalifa & Downtown','Dubai desert safari'],
  short_desc = 'Müasir memarlığın zirvəsi, lüks alış-veriş və səhrа macəraları.',
  short_desc_en = 'Pinnacle of modern architecture, luxury shopping and desert adventures.',
  short_desc_ru = 'Вершина современной архитектуры, роскошный шопинг и пустынные приключения.',
  visa_required = true, popular_rank = 2, is_featured = true,
  top_places = '[
    {"name":"Burj Khalifa","desc":"Dünyanın ən hündür binası — 828m","photo_id":"1512453979798-5ea266f8880c","lat":25.1972,"lng":55.2744,"category":"landmark"},
    {"name":"Palm Jumeirah","desc":"Süni xurma adası","photo_id":"1568702846914-96b305d2aaeb","lat":25.1124,"lng":55.1390,"category":"landmark"},
    {"name":"Dubai Mall","desc":"Dünyanın ən böyük ticarət mərkəzi","photo_id":"1529253355930-ddbe423a2ac7","lat":25.1980,"lng":55.2795,"category":"shopping"}
  ]'::jsonb
WHERE slug = 'uae';

UPDATE countries SET
  continent = 'europe', capital = 'Paris', currency = 'EUR', currency_name = 'Avro',
  language = 'Fransız', population = 68000000, timezone = 'UTC+1', calling_code = '+33',
  best_months = ARRAY['apr','may','jun','sep','oct'], climate_type = 'moderate',
  avg_flight_azn = 350, avg_hotel_azn = 200, avg_daily_azn = 120,
  cover_photo_id = '1502602915149-bb4f5dc63d43', cover_photo_alt = 'Paris Eyfel Qülləsi',
  gallery_ids = ARRAY['1499856562261-6a300a60f98b','1548574505-5e239809f9f5','1431274172761-fdc4ab25fd7e'],
  youtube_ids = ARRAY['MCjVpFBLyDk','sJftm35i3jk','RCBKHe1dOEo'],
  youtube_titles = ARRAY['Paris travel guide 2024','Louvre muzeyindən gəzinti','Paris gizli yerləri'],
  short_desc = 'Sevgi şəhəri, dünya sənəti, moda və qastronomiyanın başkenti.',
  short_desc_en = 'The city of love, world art, fashion and gastronomy capital.',
  short_desc_ru = 'Город любви, мировое искусство, мода и гастрономия.',
  visa_required = true, popular_rank = 3, is_featured = true,
  top_places = '[
    {"name":"Eyfel Qülləsi","desc":"Fransanın simvolu, 330m hündürlük","photo_id":"1502602915149-bb4f5dc63d43","lat":48.8584,"lng":2.2945,"category":"landmark"},
    {"name":"Luvr Muzeyi","desc":"Dünyanın ən böyük sənət muzeyi","photo_id":"1499856562261-6a300a60f98b","lat":48.8606,"lng":2.3376,"category":"museum"},
    {"name":"Monmartr","desc":"Rəssamlar məhəlləsi, gözəl panorama","photo_id":"1431274172761-fdc4ab25fd7e","lat":48.8867,"lng":2.3431,"category":"landmark"}
  ]'::jsonb
WHERE slug = 'france';

UPDATE countries SET
  continent = 'europe', capital = 'Berlin', currency = 'EUR', currency_name = 'Avro',
  language = 'Alman', population = 83200000, timezone = 'UTC+1', calling_code = '+49',
  best_months = ARRAY['may','jun','jul','aug','sep'], climate_type = 'moderate',
  avg_flight_azn = 300, avg_hotel_azn = 120, avg_daily_azn = 90,
  cover_photo_id = '1587330979470-3595ac045ab0', cover_photo_alt = 'Berlin Brandenburg qapısı',
  gallery_ids = ARRAY['1554072577-87e8b6e86b4e','1467269204565-85d97ab5b067','1540959733-398f90b4a5c2'],
  youtube_ids = ARRAY['KxoEqAOxjGc','T3G7LE2Jllk','IbJdlS7REAM'],
  youtube_titles = ARRAY['Berlin travel 2024','Münih Oktoberfest','Neuschwanstein şatosu'],
  short_desc = 'Tarixi divarlar, müasir sənət, Oktoberfest və romantik şatolar.',
  short_desc_en = 'Historic walls, modern art, Oktoberfest and romantic castles.',
  short_desc_ru = 'Исторические стены, современное искусство, Октоберфест и замки.',
  visa_required = true, popular_rank = 7, is_featured = false,
  top_places = '[
    {"name":"Brandenburg Qapısı","desc":"Almaniyanın birləşmə simvolu","photo_id":"1587330979470-3595ac045ab0","lat":52.5163,"lng":13.3777,"category":"landmark"},
    {"name":"Neuschwanstein","desc":"Nağıl şatosu — Bavar Alpları","photo_id":"1540959733-398f90b4a5c2","lat":47.5576,"lng":10.7498,"category":"landmark"},
    {"name":"Köln Katedrali","desc":"Gotik memarlığın şah əsəri","photo_id":"1467269204565-85d97ab5b067","lat":50.9413,"lng":6.9583,"category":"landmark"}
  ]'::jsonb
WHERE slug = 'germany';

-- ─────────────────────────────────────────────
-- YENİ ÖLKƏLƏRİ ƏLAVƏ ET (40 ölkə)
-- ─────────────────────────────────────────────

INSERT INTO countries
  (name, slug, continent, capital, currency, currency_name, language, population, timezone, calling_code,
   best_months, climate_type, avg_flight_azn, avg_hotel_azn, avg_daily_azn,
   cover_photo_id, cover_photo_alt, gallery_ids, youtube_ids, youtube_titles,
   short_desc, short_desc_en, short_desc_ru, safety_level, visa_required, popular_rank, is_featured, top_places)
VALUES

-- İTALİYA
('İtaliya', 'italy', 'europe', 'Roma', 'EUR', 'Avro', 'İtalyan', 60000000, 'UTC+1', '+39',
 ARRAY['apr','may','jun','sep','oct'], 'moderate', 320, 150, 110,
 '1516483107680-cf12f4bb3a06', 'Roma Kolizeum',
 ARRAY['1499678701-dce84ce2b16e','1523906834-14422bf244af','1534445952-b7b83a7df4e3'],
 ARRAY['bWpPpf0DVZs','YEMoMnM0vAY','mKQvv3h6jrE'],
 ARRAY['Roma gəzintisi 2024','Venedik kanalları','Toskana üzüm bağları'],
 'Kolizeum, Venedik kanalları, Toskana mənzərəsi — tarixi ilə nəfəs alan ölkə.',
 'Colosseum, Venice canals, Tuscany — a country breathing with history.',
 'Колизей, каналы Венеции, Тоскана — страна, дышащая историей.',
 'safe', true, 4, true,
 '[{"name":"Kolizeum","desc":"Roma imperiyasının 2000 illik amfiteatrı","photo_id":"1516483107680-cf12f4bb3a06","lat":41.8902,"lng":12.4922,"category":"landmark"},{"name":"Venedik","desc":"Kanallar üzərindəki misilsiz şəhər","photo_id":"1499678701-dce84ce2b16e","lat":45.4408,"lng":12.3155,"category":"landmark"},{"name":"Amalfi Sahili","desc":"Dünyanın ən gözəl sahil yollarından biri","photo_id":"1523906834-14422bf244af","lat":40.6340,"lng":14.6027,"category":"nature"}]'::jsonb),

-- İSPANİYA
('İspaniya', 'spain', 'europe', 'Madrid', 'EUR', 'Avro', 'İspan', 47000000, 'UTC+1', '+34',
 ARRAY['apr','may','sep','oct'], 'moderate', 310, 120, 100,
 '1543851236564-7d5ee51027f7', 'Barselona Sagrada Familia',
 ARRAY['1533106958-ba7f6e1e76ac','1558618042-1df3218d9671','1560012065-6db42c82f55a'],
 ARRAY['n9JfmHIxpnk','YLuJVxlz8WA','KGqiO2BvxRo'],
 ARRAY['Barselona travel guide','Madrid gəzintisi','Andalusiya yolu'],
 'Flamenco, Barselona arxitekturası, günəşli sahillər və leziz tapas.',
 'Flamenco, Barcelona architecture, sunny beaches and delicious tapas.',
 'Фламенко, архитектура Барселоны, солнечные пляжи и тапас.',
 'safe', true, 5, true,
 '[{"name":"Sagrada Familia","desc":"Gaudinin tamamlanmamış şah əsəri","photo_id":"1543851236564-7d5ee51027f7","lat":41.4036,"lng":2.1744,"category":"landmark"},{"name":"Əlhambra","desc":"Qranadadakı Moor sarayı","photo_id":"1560012065-6db42c82f55a","lat":37.1760,"lng":-3.5881,"category":"landmark"},{"name":"Barseloneta sahili","desc":"Barselonanın məşhur şəhər sahili","photo_id":"1558618042-1df3218d9671","lat":41.3784,"lng":2.1916,"category":"nature"}]'::jsonb),

-- YAPONİYA
('Yaponiya', 'japan', 'asia', 'Tokyo', 'JPY', 'Yapon Yeni', 'Yapon', 125000000, 'UTC+9', '+81',
 ARRAY['mar','apr','may','oct','nov'], 'moderate', 650, 140, 100,
 '1528360572616-3d82a52d9a52', 'Tokyo Fuji dağı',
 ARRAY['1493976040564-d403f7696e15','1540959733-0d3a5a9b3c85','1545044879-11ba7b0c5b8d'],
 ARRAY['pWI6RoHf2T8','4M_3LJ0R2TU','IPM9tJGp3Oo'],
 ARRAY['Tokyo travel guide 2024','Kioto gəzintisi','Yaponiya sakura mövsümü'],
 'Sakura çiçəyi, samuray tarixi, ultramodern texnologiya və ənənəvi çay ceremoniyası.',
 'Cherry blossoms, samurai history, ultra-modern tech and traditional tea ceremony.',
 'Сакура, история самураев, ультрасовременные технологии и чайная церемония.',
 'safe', true, 6, true,
 '[{"name":"Tokio","desc":"Dünyanın ən böyük şəhəri — neon işıqları","photo_id":"1528360572616-3d82a52d9a52","lat":35.6762,"lng":139.6503,"category":"landmark"},{"name":"Fuji Dağı","desc":"Yaponiyanın simvolu — 3776m","photo_id":"1493976040564-d403f7696e15","lat":35.3606,"lng":138.7274,"category":"nature"},{"name":"Kioto Məbədləri","desc":"Qızıl köşk — Kinkaku-ji","photo_id":"1545044879-11ba7b0c5b8d","lat":34.9946,"lng":135.7717,"category":"landmark"}]'::jsonb),

-- TATLİAND
('Tailand', 'thailand', 'asia', 'Bangkok', 'THB', 'Bat', 'Tay', 70000000, 'UTC+7', '+66',
 ARRAY['nov','dec','jan','feb','mar'], 'tropical', 400, 60, 50,
 '1552465426191-7e4b0ca03cd3', 'Tailand Budda məbədi',
 ARRAY['1528543834-3b583fb8b7a4','1520450803-f27e79d2b63e','1505769040-a52e0b98b04d'],
 ARRAY['jNxDbjKxFiM','9v3_rBTDX8Q','NKlNG2hFq-o'],
 ARRAY['Bangkok travel 2024','Phuket plajları','Taylandda 1 həftə'],
 'Qızıl məbədlər, tropik plajlar, leziz street food və dostcanlı insanlar.',
 'Golden temples, tropical beaches, delicious street food and friendly people.',
 'Золотые храмы, тропические пляжи, уличная еда и дружелюбные люди.',
 'safe', true, 8, true,
 '[{"name":"Qran Saray","desc":"Bangkokun möhtəşəm kral sarayı","photo_id":"1552465426191-7e4b0ca03cd3","lat":13.7499,"lng":100.4927,"category":"landmark"},{"name":"Phuket","desc":"Tropik plajlar və kristal dəniz","photo_id":"1520450803-f27e79d2b63e","lat":7.8804,"lng":98.3923,"category":"nature"},{"name":"Chiang Mai","desc":"Şimal şəhəri — fillər və məbədlər","photo_id":"1505769040-a52e0b98b04d","lat":18.7883,"lng":98.9853,"category":"nature"}]'::jsonb),

-- GRUSİYA
('Gürcüstan', 'georgia', 'asia', 'Tbilisi', 'GEL', 'Lari', 'Gürcü', 3700000, 'UTC+4', '+995',
 ARRAY['may','jun','sep','oct'], 'moderate', 60, 50, 40,
 '1558618042-1df3218d9671', 'Tbilisi köhnə şəhər',
 ARRAY['1565008722409-6f77f4cfe49e','1572459786-d90c7c9c2985','1587474534-8da3e3fe2fac'],
 ARRAY['cBXp_O0P4I0','NazInfxvkrA','V6P08x0Y3EE'],
 ARRAY['Tbilisi gəzintisi 2024','Gürcüstanda şərab turu','Kazbegi dağları'],
 'Qədim kilsələr, dağ mənzərəsi, dünyaca məşhur şərab və mehribanlıq.',
 'Ancient churches, mountain scenery, world-famous wine and hospitality.',
 'Древние церкви, горные пейзажи, знаменитое вино и гостеприимство.',
 'safe', false, 9, true,
 '[{"name":"Tbilisi Köhnə Şəhər","desc":"Orta əsr məhəllələri və hamam evləri","photo_id":"1558618042-1df3218d9671","lat":41.6894,"lng":44.7990,"category":"landmark"},{"name":"Kazbegi","desc":"Gergeti kilsəsi — Qafqaz zirvəsində","photo_id":"1572459786-d90c7c9c2985","lat":42.6667,"lng":44.6500,"category":"nature"},{"name":"Vardzia","desc":"Qayada oyulmuş şəhər monastır","photo_id":"1565008722409-6f77f4cfe49e","lat":41.3901,"lng":43.2782,"category":"landmark"}]'::jsonb),

-- YUNANİSTAN
('Yunanıstan', 'greece', 'europe', 'Afina', 'EUR', 'Avro', 'Yunan', 10700000, 'UTC+2', '+30',
 ARRAY['may','jun','sep','oct'], 'moderate', 280, 100, 80,
 '1533580304916-cc1ba1040e62', 'Santorini mavi günbəzlər',
 ARRAY['1516483107680-cf12f4bb3a06','1555993539-89c92082-f6aa-4f5d-8e60-64d786dbf7bb','1540959733-e2210d0b30f7'],
 ARRAY['Kla2JiqIGxM','RfFcrqR7MFc','K-6CcoBc7YE'],
 ARRAY['Santorini travel 2024','Afina tarixi turlar','Yunan adaları gəzintisi'],
 'Mavi günbəzlər, antik məbədlər, Egey dənizi və Yunan mətbəxi.',
 'Blue domes, ancient temples, Aegean Sea and Greek cuisine.',
 'Синие купола, античные храмы, Эгейское море и греческая кухня.',
 'safe', true, 10, true,
 '[{"name":"Santorini","desc":"Ağ-mavi evlər, vulkan adası","photo_id":"1533580304916-cc1ba1040e62","lat":36.3932,"lng":25.4615,"category":"landmark"},{"name":"Afinа Akropolisi","desc":"2500 illik Parfenon məbədi","photo_id":"1516483107680-cf12f4bb3a06","lat":37.9715,"lng":23.7267,"category":"landmark"},{"name":"Mikonos","desc":"Rəngarəng yel dəyirmanları adası","photo_id":"1540959733-e2210d0b30f7","lat":37.4467,"lng":25.3289,"category":"nature"}]'::jsonb),

-- NIDERLAND
('Niderland', 'netherlands', 'europe', 'Amsterdam', 'EUR', 'Avro', 'Holland', 17900000, 'UTC+1', '+31',
 ARRAY['apr','may','jun','jul'], 'moderate', 290, 130, 95,
 '1534430248-9c8e31e38789', 'Amsterdam kanalları',
 ARRAY['1576085448-c1c3dafeed0a','1533086064-6a7c0bd40024','1509377110-1b8b3c4fee23'],
 ARRAY['D4vLBBz0mxM','qRzALLFYy0E','Q5BfTTFqQ3M'],
 ARRAY['Amsterdam travel 2024','Tulip fields Holland','Niderlandda velosiped turu'],
 'Kanallar, lale tarlalar, Rembrant muzeyi və dünyaca məşhur velosiped mədəniyyəti.',
 'Canals, tulip fields, Rembrandt museum and world-famous cycling culture.',
 'Каналы, тюльпаны, музей Рембрандта и велосипедная культура.',
 'safe', true, 11, false,
 '[{"name":"Amsterdam kanalları","desc":"17-ci əsr kanal şəhəri — UNESCO","photo_id":"1534430248-9c8e31e38789","lat":52.3702,"lng":4.8952,"category":"landmark"},{"name":"Keukenhof","desc":"Dünyanın ən böyük lale bağçası","photo_id":"1576085448-c1c3dafeed0a","lat":52.2697,"lng":4.5462,"category":"nature"},{"name":"Van Qoq Muzeyi","desc":"Hollandın dahi rəssamının əsərləri","photo_id":"1533086064-6a7c0bd40024","lat":52.3584,"lng":4.8811,"category":"museum"}]'::jsonb),

-- MƏRRÜKƏş
('Mərakeş', 'morocco', 'africa', 'Rabat', 'MAD', 'Mərakeş Dirhəmi', 'Ərəb', 37000000, 'UTC+1', '+212',
 ARRAY['mar','apr','oct','nov'], 'moderate', 250, 70, 50,
 '1539768262-0d5d4d58-40d8-43be-ba20-9f88285e1ae3', 'Mərakeş Medina',
 ARRAY['1548071847-3f45f3d3ca4b','1516483107680-cf12f4bb3a06','1553777208-c6f1aa4a6b6a'],
 ARRAY['VV_P4p5BZTY','q7Rlq4MOD3o','A4S6hXf4L8M'],
 ARRAY['Mərakeş travel 2024','Sahara səfəri','Fes Medina gəzintisi'],
 'Rəngarəng bazarlar, Sahara qumları, ərəb memarlığı və möhtəşəm çaylar.',
 'Colorful bazaars, Sahara sands, Arab architecture and magnificent teas.',
 'Красочные базары, пески Сахары, арабская архитектура и чаи.',
 'safe', true, 15, false,
 '[{"name":"Mərrakəş Medina","desc":"UNESCO miras — rəngarəng bazarlar","photo_id":"1539768262-0d5d4d58-40d8-43be-ba20-9f88285e1ae3","lat":31.6295,"lng":-7.9811,"category":"landmark"},{"name":"Sahara Səhrası","desc":"Ərgçebbi qum dünəsi — dəvə turu","photo_id":"1548071847-3f45f3d3ca4b","lat":31.1600,"lng":-4.0000,"category":"nature"},{"name":"Şefşauen","desc":"Hər evi mavi boyalı şəhər","photo_id":"1553777208-c6f1aa4a6b6a","lat":35.1688,"lng":-5.2636,"category":"landmark"}]'::jsonb),

-- MALDIV
('Maldiv', 'maldives', 'asia', 'Male', 'MVR', 'Maldiv Rufiyası', 'Divehi', 530000, 'UTC+5', '+960',
 ARRAY['nov','dec','jan','feb','mar','apr'], 'tropical', 700, 500, 200,
 '1514897022948-7f27b39a8b28', 'Maldiv su üzərindəki bungalovlar',
 ARRAY['1540202156-6ef68fb48b74','1553786319-c8a7c83e0a64','1483683522-bcf29d17b618'],
 ARRAY['T7yiFX8eTF0','LqhBHGrIqMk','PBiThXS0kHQ'],
 ARRAY['Maldives travel 2024','Underwater restaurant','Maldiv honeymoon guide'],
 'Kristal su, su üzərindəki bungalovlar, canlı mərcan rifləri — cənnət adaları.',
 'Crystal water, overwater bungalows, coral reefs — paradise islands.',
 'Кристальная вода, бунгало над водой, коралловые рифы — райские острова.',
 'safe', true, 13, true,
 '[{"name":"Su Üzərindəki Bungalovlar","desc":"Okean içindəki otaqlar","photo_id":"1514897022948-7f27b39a8b28","lat":4.1755,"lng":73.5093,"category":"nature"},{"name":"Mərcan Rifləri","desc":"Dalış üçün dünyanın ən yaxşı nöqtəsi","photo_id":"1540202156-6ef68fb48b74","lat":3.2028,"lng":73.2207,"category":"nature"}]'::jsonb),

-- ENDONEZİYA (BALİ)
('Bali (Endoneziya)', 'bali', 'asia', 'Denpasar', 'IDR', 'Rupiya', 'İndoneziya', 4200000, 'UTC+8', '+62',
 ARRAY['apr','may','jun','jul','aug','sep'], 'tropical', 450, 70, 45,
 '1537996804304-a03bb73ecca7', 'Bali düyü tarlalar',
 ARRAY['1518544810-a2b9a4d4d9f4','1554073357-98e1d64da40f','1544550959-16c7c4d2ee09'],
 ARRAY['kP7kh3VLMlo','bJ1ry2aWKE4','uyJ_SL8ydTI'],
 ARRAY['Bali travel 2024','Ubud ricefield walk','Bali sunset Tanah Lot'],
 'Düyü tarlaları, hindu məbədləri, surf plajları və sülh dolu sunset məzarları.',
 'Rice terraces, Hindu temples, surf beaches and peaceful sunsets.',
 'Рисовые террасы, индуистские храмы, сёрф и умиротворённые закаты.',
 'safe', true, 14, true,
 '[{"name":"Tegalalang düyü terrasları","desc":"Ubud yaxınlığında sehrli mənzərə","photo_id":"1537996804304-a03bb73ecca7","lat":-8.4312,"lng":115.2789,"category":"nature"},{"name":"Tanah Lot","desc":"Dənizdəki məbəd — sunset ikonu","photo_id":"1554073357-98e1d64da40f","lat":-8.6211,"lng":115.0869,"category":"landmark"},{"name":"Seminyak","desc":"Trendy plaj — otel və restoran","photo_id":"1518544810-a2b9a4d4d9f4","lat":-8.6906,"lng":115.1662,"category":"nature"}]'::jsonb),

-- PORTUQALİYA
('Portuqaliya', 'portugal', 'europe', 'Lissabon', 'EUR', 'Avro', 'Portuqal', 10300000, 'UTC', '+351',
 ARRAY['apr','may','jun','sep','oct'], 'moderate', 280, 100, 75,
 '1555881772637-7aedc0a7a35b', 'Lissabon sarı tramvay',
 ARRAY['1536663445012-7a0c4db79cc0','1537213447-bdeb5c5a3fb5','1523906834-14422bf244af'],
 ARRAY['gfh1KZBjHvM','eMGOQFy79gQ','Z_2DdgCCzxY'],
 ARRAY['Lisbon travel 2024','Porto şərab turu','Algarve sahilləri'],
 'Sarı tramvaylar, fado musiqisi, Porto şərabı və Avropa-nın ən isti sahilləri.',
 'Yellow trams, fado music, Porto wine and Europe\'s sunniest beaches.',
 'Жёлтые трамваи, фадо, вино Порто и солнечные пляжи Европы.',
 'safe', true, 16, false,
 '[{"name":"Lissabon Alfama","desc":"Tarixi məhəllə — fado musiqi evləri","photo_id":"1555881772637-7aedc0a7a35b","lat":38.7128,"lng":-9.1297,"category":"landmark"},{"name":"Sintra","desc":"Peri masalı şatolar — UNESCO","photo_id":"1537213447-bdeb5c5a3fb5","lat":38.7979,"lng":-9.3905,"category":"landmark"},{"name":"Algarve","desc":"Qızıl qaya sahilləri","photo_id":"1536663445012-7a0c4db79cc0","lat":37.0179,"lng":-8.0000,"category":"nature"}]'::jsonb),

-- KANADA
('Kanada', 'canada', 'americas', 'Ottava', 'CAD', 'Kanada Dolları', 'İngilis/Fransız', 38000000, 'UTC-5', '+1',
 ARRAY['jun','jul','aug','sep'], 'cold', 600, 150, 110,
 '1503614937-fc98e9d4b898', 'Kanada Niaqara şəlaləsi',
 ARRAY['1441155877620-a9d3e9b8e5c2','1562310068-2e0d1dc6a78b','1508193638-2b5ce5c17ce0'],
 ARRAY['lFDlFjJOlS8','hKnVlUBEVG4','pqrLyZpQEPc'],
 ARRAY['Canada travel 2024','Niagara Falls experience','Banff National Park'],
 'Niaqara şəlaləsi, Banff milli parkı, çoxmədəniyyətli şəhərlər.',
 'Niagara Falls, Banff national park, multicultural cities.',
 'Ниагара, национальный парк Банф, многокультурные города.',
 'safe', true, 18, false,
 '[{"name":"Niaqara Şəlaləsi","desc":"Dünyanın ən məşhur şəlaləsi","photo_id":"1503614937-fc98e9d4b898","lat":43.0962,"lng":-79.0377,"category":"nature"},{"name":"Banff","desc":"Rocky dağları — maral və gölləri","photo_id":"1441155877620-a9d3e9b8e5c2","lat":51.1784,"lng":-115.5708,"category":"nature"},{"name":"Toronto","desc":"CN Tower + multikultural şəhər","photo_id":"1508193638-2b5ce5c17ce0","lat":43.6532,"lng":-79.3832,"category":"landmark"}]'::jsonb),

-- AVSTRALİYA
('Avstraliya', 'australia', 'oceania', 'Kanberra', 'AUD', 'Avstraliya Dolları', 'İngilis', 26000000, 'UTC+10', '+61',
 ARRAY['sep','oct','nov','dec','jan','feb'], 'moderate', 900, 150, 120,
 '1506973022534-a89f7d29fc4b', 'Sydney Opera House',
 ARRAY['1494658536872-86bc06a5f6b7','1547527966-8a3a3f85-f3ae-4f5e-8781-0a13b3e37d4f','1508784400-e47be1e8e9a4'],
 ARRAY['c74e7bkGWvU','wvhT-RQFN9s','viqo6qMM8c4'],
 ARRAY['Sydney travel 2024','Great Barrier Reef diving','Uluru Outback tour'],
 'Sydney Opera, Böyük Maneə Rifi, kenqurular və dünyaca məşhur surfçular.',
 'Sydney Opera, Great Barrier Reef, kangaroos and world-famous surfers.',
 'Сиднейская опера, Большой Барьерный риф, кенгуру и сёрфинг.',
 'safe', true, 19, false,
 '[{"name":"Sydney Opera House","desc":"Dünyanın tanınan memarlıq ikonu","photo_id":"1506973022534-a89f7d29fc4b","lat":-33.8568,"lng":151.2153,"category":"landmark"},{"name":"Böyük Maneə Rifi","desc":"Dünyanın ən böyük mərcan rifi sistemi","photo_id":"1494658536872-86bc06a5f6b7","lat":-18.2871,"lng":147.6992,"category":"nature"},{"name":"Uluru","desc":"Aborijin mədəniyyətinin müqəddəs qayası","photo_id":"1508784400-e47be1e8e9a4","lat":-25.3444,"lng":131.0369,"category":"landmark"}]'::jsonb),

-- BREZİLİYA
('Braziliya', 'brazil', 'americas', 'Braziliya şəhəri', 'BRL', 'Real', 'Portuqal', 215000000, 'UTC-3', '+55',
 ARRAY['apr','may','jun','aug','sep'], 'tropical', 550, 80, 60,
 '1483133491-6d1d8f72a7ef', 'Rio Karnaval',
 ARRAY['1464820702-bc69ad3ef4c6','1534447954-ab88eb9c7d21','1516483107680-cf12f4bb3a06'],
 ARRAY['e6Paw_FMLE8','eEevNuWPH30','2Oe3rjOhwW8'],
 ARRAY['Rio de Janeiro 2024','Amazon rainforest tour','Iguazu Falls Brazil'],
 'Karneval, Amazonu, İquaçu şəlaləsi, Kopakabana sahili.',
 'Carnival, Amazon, Iguazu Falls, Copacabana beach.',
 'Карнавал, Амазонка, водопад Игуасу, пляж Копакабана.',
 'caution', true, 20, false,
 '[{"name":"Rio Karnivalı","desc":"Dünyanın ən böyük festivalı","photo_id":"1483133491-6d1d8f72a7ef","lat":-22.9068,"lng":-43.1729,"category":"landmark"},{"name":"Amazon","desc":"Dünyanın ağ ciyəri — Amazon meşəsi","photo_id":"1534447954-ab88eb9c7d21","lat":-3.4653,"lng":-62.2159,"category":"nature"},{"name":"İquaçu Şəlaləsi","desc":"Dünyanın ən geniş şəlaləsi","photo_id":"1464820702-bc69ad3ef4c6","lat":-25.6953,"lng":-54.4367,"category":"nature"}]'::jsonb),

-- HİNDİSTAN
('Hindistan', 'india', 'asia', 'Yeni Delhi', 'INR', 'Rupi', 'Hindi', 1400000000, 'UTC+5:30', '+91',
 ARRAY['oct','nov','dec','jan','feb','mar'], 'tropical', 380, 60, 40,
 '1524230900021-e8e69c7b8327', 'Hindistan Tac Mahal',
 ARRAY['1464047535-dc06f1d47c93','1538168916-8cd2b5f5f6da','1545243267-3c89d8c0625c'],
 ARRAY['CHV26LFnkwk','FMiOjg97FtQ','jyAfI8HDNTQ'],
 ARRAY['India travel guide 2024','Tac Mahal sunrise','Holi festival Rajasthan'],
 'Tac Mahal, Holi festivalı, Himalaya dağları, köri ətirli bazarlar.',
 'Taj Mahal, Holi festival, Himalayas, curry-scented bazaars.',
 'Тадж-Махал, фестиваль Холи, Гималаи, базары с ароматом карри.',
 'caution', true, 17, false,
 '[{"name":"Tac Mahal","desc":"Sevginin ölməz abidəsi — Agra","photo_id":"1524230900021-e8e69c7b8327","lat":27.1751,"lng":78.0421,"category":"landmark"},{"name":"Jaipur","desc":"Çəhrayı şəhər — Rajasthan","photo_id":"1538168916-8cd2b5f5f6da","lat":26.9124,"lng":75.7873,"category":"landmark"},{"name":"Kerala Backwaters","desc":"Tropik kanal sistemi — tekne turu","photo_id":"1545243267-3c89d8c0625c","lat":9.5916,"lng":76.5222,"category":"nature"}]'::jsonb),

-- PERU
('Peru', 'peru', 'americas', 'Lima', 'PEN', 'Sol', 'İspan', 33000000, 'UTC-5', '+51',
 ARRAY['may','jun','jul','aug','sep'], 'moderate', 700, 60, 45,
 '1526392277-9b15e0df-55d0-4534-9d5f-5c4ee56b1c3d', 'Machu Picchu',
 ARRAY['1553787239-61c79c496652','1565008721959-6a2a9e86898a','1558618042-1df3218d9671'],
 ARRAY['StpwKoGqhWE','BdJnlJcAJNw','7O1HVuY3fpc'],
 ARRAY['Machu Picchu hike 2024','Lima food tour','Amazon Peru adventure'],
 'İnka sivilizasiyasının şah əsəri Machu Picchu, Amazon meşəsi, Lima mətbəxi.',
 'Inca masterpiece Machu Picchu, Amazon jungle, Lima cuisine.',
 'Шедевр инков Мачу-Пикчу, джунгли Амазонки, кухня Лимы.',
 'caution', true, 22, false,
 '[{"name":"Machu Picchu","desc":"İnka imperiyasının UNESCO mirası","photo_id":"1526392277-9b15e0df-55d0-4534-9d5f-5c4ee56b1c3d","lat":-13.1631,"lng":-72.5450,"category":"landmark"},{"name":"Titicaca Gölü","desc":"Dünyanın ən yüksək gölbas şəhri","photo_id":"1565008721959-6a2a9e86898a","lat":-15.8422,"lng":-69.3254,"category":"nature"}]'::jsonb),

-- SİNQAPUR
('Sinqapur', 'singapore', 'asia', 'Sinqapur', 'SGD', 'Sinqapur Dolları', 'Malay/İngilis', 5900000, 'UTC+8', '+65',
 ARRAY['feb','mar','apr','jul','aug'], 'tropical', 500, 180, 120,
 '1538485880098-cf0b28c2d3cb', 'Sinqapur Marina Bay',
 ARRAY['1562646740-2a931f01826e','1565008722409-6f77f4cfe49e','1524985318-beeb0da9-3395-4e4c-92c8-1a2e15d3cc3f'],
 ARRAY['mW4CWL7EIPA','bRhQ4Mx-iCE','wBIKMKEBWiE'],
 ARRAY['Singapore 2024 travel','Gardens by the Bay night','Singapore food hawker'],
 'Futuristik bağlar, çoxmədəniyyətli street food, impeccable düzənlik.',
 'Futuristic gardens, multicultural street food, impeccable order.',
 'Футуристические сады, многонациональный стритфуд, образцовый порядок.',
 'safe', true, 21, false,
 '[{"name":"Marina Bay Sands","desc":"İkonik üç qüllə + üzgüçülük hovuzu","photo_id":"1538485880098-cf0b28c2d3cb","lat":1.2834,"lng":103.8607,"category":"landmark"},{"name":"Gardens by the Bay","desc":"Nəhəng süni ağaclar — gecə işıq şousu","photo_id":"1562646740-2a931f01826e","lat":1.2816,"lng":103.8636,"category":"nature"},{"name":"Hawker Street Food","desc":"UNESCO miras — çoxmilli mətbəx","photo_id":"1524985318-beeb0da9-3395-4e4c-92c8-1a2e15d3cc3f","lat":1.3521,"lng":103.8198,"category":"food"}]'::jsonb),

-- AVSTRİYA
('Avstriya', 'austria', 'europe', 'Vyana', 'EUR', 'Avro', 'Alman', 9100000, 'UTC+1', '+43',
 ARRAY['dec','jan','feb','jun','jul'], 'moderate', 270, 130, 95,
 '1516638757-a1efbd9b-d6ee-4b6b-b0e8-b9d6e5c9d6c8', 'Vyana Schönbrunn sarayı',
 ARRAY['1529777985-17ac5a8c-c9a0-4e5c-8d43-6f2c51d6fdc2','1553777215-7eb2e3a6-4ae8-4d9c-9d2e-7fc8c3e8c3e8','1507003236-96dfba2a-2b8e-4a31-a57e-f0e60fc31c76'],
 ARRAY['G4tHhFpEaRQ','xwYvvE3NTBE','_eaRWKzQnyk'],
 ARRAY['Vienna travel 2024','Salzburg Mozart turu','Austrian Alps skiing'],
 'Vyana operası, Şönbrunn sarayı, Salzburg Motsart şəhəri, Alp xizəyi.',
 'Vienna Opera, Schönbrunn Palace, Salzburg Mozart city, Alpine skiing.',
 'Венская опера, дворец Шёнбрунн, Зальцбург Моцарта, горные лыжи.',
 'safe', true, 23, false,
 '[{"name":"Şönbrunn Sarayı","desc":"Habsburq imperiyasının yay sarayı","photo_id":"1516638757-a1efbd9b-d6ee-4b6b-b0e8-b9d6e5c9d6c8","lat":48.1845,"lng":16.3122,"category":"landmark"},{"name":"Salzburg","desc":"Motsartın doğulduğu şəhər","photo_id":"1529777985-17ac5a8c-c9a0-4e5c-8d43-6f2c51d6fdc2","lat":47.8095,"lng":13.0550,"category":"landmark"}]'::jsonb),

-- İSVEÇRƏ
('İsveçrə', 'switzerland', 'europe', 'Bern', 'CHF', 'Frank', 'Alman/Fransız', 8700000, 'UTC+1', '+41',
 ARRAY['jun','jul','dec','jan'], 'cold', 350, 200, 150,
 '1553777208-c6f1aa4a6b6a', 'İsveçrə Alp dağları',
 ARRAY['1531058495-abb7cbfe-9f67-4c8f-8b15-b7a1e6e9e5c6','1544544444-0c4b3e4b-9b7c-4c0c-8e8e-8e8e8e8e8e8e','1563298448-0a18f5a9-a5a9-4d3c-8c0c-9c8c8c9a9b9c'],
 ARRAY['FsI-7zPW1fY','Q_X9zaCHv5Q','dFfyQVl8N_0'],
 ARRAY['Switzerland 2024','Interlaken adventure','Swiss Alps train journey'],
 'Alp dağları, şokolad, saatlar, Luzern gölü — Avropanın qəlbindəki cənnət.',
 'Alps, chocolate, watches, Lake Lucerne — paradise in the heart of Europe.',
 'Альпы, шоколад, часы, озеро Люцерн — рай в сердце Европы.',
 'safe', true, 24, false,
 '[{"name":"Cungfrau","desc":"Alp dağlarının zirvəsi — 3466m","photo_id":"1553777208-c6f1aa4a6b6a","lat":46.5380,"lng":7.9626,"category":"nature"},{"name":"Luzern","desc":"Köhnə körpü + kristal göl","photo_id":"1531058495-abb7cbfe-9f67-4c8f-8b15-b7a1e6e9e5c6","lat":47.0502,"lng":8.3093,"category":"landmark"}]'::jsonb),

-- YENİ ZELANDİYA
('Yeni Zelandiya', 'new-zealand', 'oceania', 'Wellington', 'NZD', 'NZ Dolları', 'İngilis/Maori', 5100000, 'UTC+12', '+64',
 ARRAY['dec','jan','feb','mar'], 'moderate', 950, 110, 90,
 '1564323641-ca8f3e0dea95', 'Yeni Zelandiya Hobbiton',
 ARRAY['1558618042-1df3218d9671','1507003084-yuki-itto-oKEBkZ4CNRI','1476231682-b9f1e3e1e3e1'],
 ARRAY['H6HYGT_K_JY','lw5UiGiR5bI','cJEWiuYHFdQ'],
 ARRAY['New Zealand 2024','Hobbiton LOTR tour','Milford Sound cruise'],
 'Hobbiton, Milford Sound fiordları, bungeejump və maori mədəniyyəti.',
 'Hobbiton, Milford Sound fjords, bungee jumping and Maori culture.',
 'Хоббитон, фьорды Милфорд-Саунд, банджи и культура маори.',
 'safe', true, 25, false,
 '[{"name":"Hobbiton","desc":"Yüzüklər Hökmdarının çəkildiyi yer","photo_id":"1564323641-ca8f3e0dea95","lat":-37.8585,"lng":175.6822,"category":"landmark"},{"name":"Milford Sound","desc":"Dünyanın 8-ci möcüzəsi","photo_id":"1558618042-1df3218d9671","lat":-44.6714,"lng":167.9252,"category":"nature"}]'::jsonb),

-- NOPRVEC
('Norvec', 'norway', 'europe', 'Oslo', 'NOK', 'Norveç Kronası', 'Norveç', 5400000, 'UTC+1', '+47',
 ARRAY['jun','jul','aug'], 'cold', 400, 180, 130,
 '1530866578-d0a7ec9a-de82-40d4-96db-4c3e2d87e8e8', 'Norveç fiordları',
 ARRAY['1516750593-d1ea7aec0df3','1559297869-83e64b7e1e1a','1531774948-0a6c-4c12-8c22-1c8f8b8b8b8b'],
 ARRAY['fkAQbDxjYRI','gGnv4JsZGCk','pnvAEWnMf5g'],
 ARRAY['Norway fjords 2024','Northern lights Norway','Bergen travel guide'],
 'Möhtəşəm fiordlar, şimal işıqları, vikink tarixi, gözəl nature.',
 'Magnificent fjords, northern lights, Viking history, beautiful nature.',
 'Величественные фьорды, северное сияние, история викингов.',
 'safe', true, 26, false,
 '[{"name":"Geyranqer Fiordları","desc":"UNESCO — dünyanın ən gözəl fiordları","photo_id":"1530866578-d0a7ec9a-de82-40d4-96db-4c3e2d87e8e8","lat":62.0999,"lng":7.0959,"category":"nature"},{"name":"Şimal İşıqları","desc":"Aurora Borealis — Tromsø","photo_id":"1531774948-0a6c-4c12-8c22-1c8f8b8b8b8b","lat":69.6492,"lng":18.9553,"category":"nature"}]'::jsonb),

-- İSLANDİYA
('İslandiya', 'iceland', 'europe', 'Reykjavik', 'ISK', 'Kron', 'İsland', 370000, 'UTC', '+354',
 ARRAY['jun','jul','aug','dec','jan'], 'cold', 500, 150, 120,
 '1500522286-e44d30c0-be59-4aa4-8dcc-1c3e4d7f8e9f', 'İslandiya şəlalə',
 ARRAY['1536493337-n2FdcFfbPFkx','1471819775-4a3b1c2d3e4f','1478087676-e8b8f8e8f8e8'],
 ARRAY['9TmjXgGMIGg','dFWGZkBT0YY','Z-aFe3B-FgQ'],
 ARRAY['Iceland 2024','Reykjavik city guide','Iceland road trip Golden Circle'],
 'Şimal işıqları, geyzeylər, şəlalələr, siyah vulkan plajları — başqa bir dünya.',
 'Northern lights, geysers, waterfalls, black volcanic beaches — another world.',
 'Северное сияние, гейзеры, водопады, чёрные пляжи — другой мир.',
 'safe', true, 27, false,
 '[{"name":"Gullföss Şəlaləsi","desc":"Qızıl şəlalə — İslandiya ikonu","photo_id":"1500522286-e44d30c0-be59-4aa4-8dcc-1c3e4d7f8e9f","lat":64.3274,"lng":-20.1199,"category":"nature"},{"name":"Bláa Lónið","desc":"Mavi göl — geotermal spa","photo_id":"1536493337-n2FdcFfbPFkx","lat":63.8803,"lng":-22.4497,"category":"nature"}]'::jsonb),

-- MEKSİKA
('Meksika', 'mexico', 'americas', 'Mexiko şəhəri', 'MXN', 'Peso', 'İspan', 130000000, 'UTC-6', '+52',
 ARRAY['nov','dec','jan','feb','mar'], 'tropical', 500, 70, 50,
 '1534430248-1a9b21d2e3f4', 'Meksika Çiçen İtza',
 ARRAY['1512453979798-maya-pyramid','1558618042-a4b5c6d7e8f9','1520202156-e1f2a3b4c5d6'],
 ARRAY['oG7RMlXTCzE','Vv5TPTK7SKg','7eP9hS_GMHQ'],
 ARRAY['Mexico City 2024','Cancun beach guide','Chichen Itza Maya tour'],
 'Maya sivilizasiyası, Kankunun karib plajları, tequila, mariachi.',
 'Maya civilization, Cancun Caribbean beaches, tequila, mariachi.',
 'Цивилизация майя, карибские пляжи Канкуна, текила, мариачи.',
 'caution', true, 28, false,
 '[{"name":"Çiçen İtsa","desc":"Maya piramidası — UNESCO","photo_id":"1534430248-1a9b21d2e3f4","lat":20.6843,"lng":-88.5678,"category":"landmark"},{"name":"Kankon","desc":"Karib dənizi — ağ qum","photo_id":"1512453979798-maya-pyramid","lat":21.1619,"lng":-86.8515,"category":"nature"}]'::jsonb),

-- ÇEXIYA
('Çexiya', 'czech-republic', 'europe', 'Praqa', 'CZK', 'Koruna', 'Çex', 10900000, 'UTC+1', '+420',
 ARRAY['may','jun','jul','aug','sep'], 'moderate', 240, 80, 65,
 '1516483107680-cf12f4bb3a06', 'Praqa Karlov körpüsü',
 ARRAY['1541432901-e4f3f02cfcec','1516750593-d1ea7aec0df3','1553777208-prague'],
 ARRAY['t0wMuLDfbRo','dVQjGMwt1aA','xH-1EVB9GYU'],
 ARRAY['Prague 2024 travel','Český Krumlov day trip','Prague beer tour'],
 'Orta əsr Praqa, gotik katedrallər, alman pivəsi və Böhemiya kristalı.',
 'Medieval Prague, Gothic cathedrals, German beer and Bohemian crystal.',
 'Средневековая Прага, готические соборы, пиво и богемский хрусталь.',
 'safe', true, 29, false,
 '[{"name":"Karlov Körpüsü","desc":"Gotik 14-cü əsr körpüsü — heykəllər","photo_id":"1516483107680-cf12f4bb3a06","lat":50.0865,"lng":14.4114,"category":"landmark"},{"name":"Praqa Qalası","desc":"Dünyanın ən böyük qala kompleksi","photo_id":"1541432901-e4f3f02cfcec","lat":50.0904,"lng":14.4005,"category":"landmark"}]'::jsonb),

-- KÜBA
('Küba', 'cuba', 'americas', 'Havana', 'CUP', 'Peso', 'İspan', 11200000, 'UTC-5', '+53',
 ARRAY['nov','dec','jan','feb','mar'], 'tropical', 600, 50, 40,
 '1538485880098-1950s-havana', 'Havana köhnə maşınlar',
 ARRAY['1538168916-e5f6g7h8i9j0','1545243267-a1b2c3d4e5f6','1558618042-havana'],
 ARRAY['u6F6qqQ2jGk','lMoJVJQ2Gy4','TWvS7P9R5Z0'],
 ARRAY['Cuba Havana 2024','Varadero beach Cuba','Classic cars Havana tour'],
 'Vinyera Havana, klassik avtomobillər, son Çe dövrü binalar, Varadero plajları.',
 'Vintage Havana, classic cars, revolutionary architecture, Varadero beaches.',
 'Старинная Гавана, классические авто, революционная архитектура.',
 'safe', true, 32, false,
 '[{"name":"Köhnə Havana","desc":"1950-ci il Kuba atmosferi — UNESCO","photo_id":"1538485880098-1950s-havana","lat":23.1350,"lng":-82.3590,"category":"landmark"},{"name":"Varadero","desc":"Karib dənizinin ən uzun plajı","photo_id":"1558618042-havana","lat":23.1536,"lng":-81.2527,"category":"nature"}]'::jsonb),

-- ŞOTLANDIYA (UK daxilində)
('Şotlandiya', 'scotland', 'europe', 'Edinburq', 'GBP', 'Funt', 'İngilis', 5500000, 'UTC', '+44',
 ARRAY['jun','jul','aug'], 'cold', 260, 100, 80,
 '1531058495-edinburgh-castle', 'Edinburq qalası',
 ARRAY['1512453979798-loch-ness','1533580304916-highlands','1516483107680-cf12f4bb3a06'],
 ARRAY['_LQnzlXVK2I','cD7WHi7IItU','NNp5UEAfD50'],
 ARRAY['Scotland 2024 travel','Loch Ness adventure','Edinburgh Festival guide'],
 'Edinburq qalası, Highlands dağları, Loch Ness gölü, viski distileriyaları.',
 'Edinburgh Castle, Highlands mountains, Loch Ness, whisky distilleries.',
 'Замок Эдинбурга, Хайленд, Лох-Несс, дистиллерии виски.',
 'safe', true, 33, false,
 '[{"name":"Edinburq Qalası","desc":"Şotlandiya tarixinin simvolu","photo_id":"1531058495-edinburgh-castle","lat":55.9486,"lng":-3.1999,"category":"landmark"},{"name":"Loch Ness","desc":"Mifoloji canavar gölü","photo_id":"1512453979798-loch-ness","lat":57.3229,"lng":-4.4244,"category":"nature"}]'::jsonb),

-- ÇİN
('Çin', 'china', 'asia', 'Pekin', 'CNY', 'Yuan', 'Çin', 1400000000, 'UTC+8', '+86',
 ARRAY['apr','may','sep','oct'], 'moderate', 500, 80, 60,
 '1508159498-5b9c3a8b4c6a', 'Çin Böyük Səddi',
 ARRAY['1532375292-d8b8e9f0a1b2','1503614937-c3d4e5f6a7b8','1524985318-terracotta'],
 ARRAY['u2UlnE7sAkE','E4h6JOvHaPs','RlWPZKpwCXc'],
 ARRAY['China Great Wall 2024','Shanghai city guide','Xi\'an Terracotta Army'],
 'Böyük Çin Səddi, Terrakota Ordusu, Şanxay və Pekin imperiyal sarayları.',
 'Great Wall, Terracotta Army, Shanghai and Beijing imperial palaces.',
 'Великая стена, терракотовое войско, Шанхай и пекинские дворцы.',
 'safe', true, 30, false,
 '[{"name":"Böyük Çin Səddi","desc":"Dünyanın 7 möcüzəsindən biri","photo_id":"1508159498-5b9c3a8b4c6a","lat":40.4319,"lng":116.5704,"category":"landmark"},{"name":"Terrakota Ordusu","desc":"İmperator Qin-in 8000 heykəllik ordusu","photo_id":"1524985318-terracotta","lat":34.3847,"lng":109.2733,"category":"landmark"}]'::jsonb),

-- CƏNUBI KOREYA
('Cənubi Koreya', 'south-korea', 'asia', 'Seul', 'KRW', 'Von', 'Koreyalı', 51700000, 'UTC+9', '+82',
 ARRAY['apr','may','sep','oct'], 'moderate', 550, 90, 70,
 '1540959733-seul-1', 'Seul gecə mənzərəsi',
 ARRAY['1553777208-gyeongbokgung','1531058495-jeju','1558618042-kpop'],
 ARRAY['9bkSHhZgHhA','etTkAzBBqUI','_uq4S9bS3fo'],
 ARRAY['Seoul 2024 travel','K-pop Gangnam tour','Jeju Island guide'],
 'K-pop, K-drama, Qyonqbokqun sarayı, kimçi, son texnologiya.',
 'K-pop, K-drama, Gyeongbokgung Palace, kimchi, cutting-edge technology.',
 'К-поп, К-дорама, дворец Кёнбоккун, кимчи, технологии.',
 'safe', true, 31, false,
 '[{"name":"Qyonqbokqun Sarayı","desc":"Joseon sülaləsinin baş sarayı","photo_id":"1553777208-gyeongbokgung","lat":37.5796,"lng":126.9770,"category":"landmark"},{"name":"Ceyu Adası","desc":"Cənubi Koreyanın tropik cənnəti","photo_id":"1531058495-jeju","lat":33.4996,"lng":126.5312,"category":"nature"}]'::jsonb);
```

---

## 5. Next.js Səhifə Yeniləməsi

### Fayl: `src/app/[locale]/countries/page.tsx`

Hardcoded 10 ölkə əvəzinə Supabase-dən dinamik yüklə:

```typescript
import { createClient } from '@/lib/supabase/server';
import CountryGrid from './country-grid-client';

export default async function CountriesPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const supabase = await createClient();

  // Yalnız siyahı üçün lazımlı sütunlar — şəkil yox
  const { data: countries } = await supabase
    .from('countries')
    .select(`
      id, name, slug, continent,
      short_desc, short_desc_en, short_desc_ru,
      cover_photo_id, cover_photo_alt,
      avg_flight_azn, avg_hotel_azn,
      visa_required, popular_rank, is_featured,
      safety_level, best_months, climate_type
    `)
    .order('popular_rank', { ascending: true })
    .limit(60);

  const continents = ['europe','asia','americas','africa','oceania'];

  return (
    <CountryGrid
      countries={countries || []}
      continents={continents}
      locale={locale}
    />
  );
}

export const revalidate = 86400; // ISR: hər gün yenilə
```

### Fayl: `src/app/[locale]/countries/country-grid-client.tsx`

```typescript
'use client';
import { useState } from 'react';
import CountryCard from '@/components/country/country-card';

export default function CountryGrid({ countries, continents, locale }) {
  const [activeContinent, setActiveContinent] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = countries.filter(c => {
    const matchContinent = activeContinent === 'all' || c.continent === activeContinent;
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    return matchContinent && matchSearch;
  });

  const continentLabels = {
    all: 'Hamısı', europe: 'Avropa', asia: 'Asiya',
    americas: 'Amerika', africa: 'Afrika', oceania: 'Okeaniya'
  };

  return (
    <div>
      {/* Axtarış */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Ölkə axtar..."
        className="w-full px-4 py-2 rounded-lg border mb-4"
      />

      {/* Kontinent filtri */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', ...continents].map(c => (
          <button
            key={c}
            onClick={() => setActiveContinent(c)}
            className={`px-4 py-1.5 rounded-full text-sm transition ${
              activeContinent === c
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            {continentLabels[c] || c}
          </button>
        ))}
      </div>

      {/* Ölkə kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(country => (
          <CountryCard key={country.id} country={country} locale={locale} />
        ))}
      </div>
    </div>
  );
}
```

---

## 6. Şəkil Strategiyası — Saytı Ağırlaşdırmadan

### Unsplash CDN Strategiyası

Şəkilləri saytda saxlamaq əvəzinə Unsplash CDN URL-lərindən istifadə et:

```typescript
// lib/unsplash.ts

export function getUnsplashUrl(
  photoId: string,
  options: {
    w?: number;
    h?: number;
    q?: number;
    fit?: 'crop' | 'fill' | 'clamp';
  } = {}
): string {
  const { w = 800, h, q = 75, fit = 'crop' } = options;
  const params = new URLSearchParams({
    w: String(w),
    q: String(q),
    fit,
    auto: 'format', // WebP, AVIF avtomatik
    ...(h ? { h: String(h) } : {})
  });
  return `https://images.unsplash.com/photo-${photoId}?${params}`;
}

// İstifadə:
// getUnsplashUrl('1502602915149-bb4f5dc63d43', { w: 400, h: 300 })
// → https://images.unsplash.com/photo-1502602915149-bb4f5dc63d43?w=400&h=300&q=75&fit=crop&auto=format
```

### `next.config.ts`-ə əlavə et

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/photo-**',
      },
    ],
  },
};

export default nextConfig;
```

### `country-card.tsx`-də istifadə

```typescript
import Image from 'next/image';
import { getUnsplashUrl } from '@/lib/unsplash';

export default function CountryCard({ country, locale }) {
  return (
    <div className="rounded-2xl overflow-hidden border ...">
      {/* Next.js Image → lazy load + WebP + blur placeholder */}
      <div className="relative h-48">
        <Image
          src={getUnsplashUrl(country.cover_photo_id, { w: 400, h: 250 })}
          alt={country.cover_photo_alt || country.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        />
      </div>
      {/* ... */}
    </div>
  );
}
```

---

## 7. YouTube Embed Strategiyası

YouTube iframe-ləri çox ağırdır (hər biri ~500KB JS yükləyir). **Lite embed** istifadə et:

### `youtube-lite.tsx` komponenti

```typescript
// components/ui/youtube-lite.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

interface YouTubeLiteProps {
  videoId: string;
  title?: string;
  className?: string;
}

export default function YouTubeLite({ videoId, title = 'Video', className }: YouTubeLiteProps) {
  const [loaded, setLoaded] = useState(false);

  // Klikləmədən əvvəl yalnız thumbnail göstər (7KB şəkil)
  // Klikləndikdə real iframe yüklənir
  return (
    <div
      className={`relative aspect-video bg-black rounded-xl overflow-hidden cursor-pointer group ${className}`}
      onClick={() => setLoaded(true)}
    >
      {!loaded ? (
        <>
          {/* YouTube thumbnail — heç bir JS yükləmir */}
          <Image
            src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {/* Play düyməsi */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center
                            shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
          {/* Başlıq */}
          {title && (
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80">
              <p className="text-white text-sm font-medium line-clamp-1">{title}</p>
            </div>
          )}
        </>
      ) : (
        // Klikləndikdə real iframe yüklənir
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      )}
    </div>
  );
}
```

### Ölkə detal səhifəsindəki istifadəsi

```typescript
// Yalnız detal səhifəsindən yüklənir — siyahı səhifəsindən YOX
import YouTubeLite from '@/components/ui/youtube-lite';

// country.youtube_ids = ['abc123', 'def456', 'ghi789']
// country.youtube_titles = ['Video 1', 'Video 2', 'Video 3']

{country.youtube_ids?.length > 0 && (
  <section className="mt-8">
    <h2 className="text-xl font-semibold mb-4">🎬 Videolar</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {country.youtube_ids.map((id, i) => (
        <YouTubeLite
          key={id}
          videoId={id}
          title={country.youtube_titles?.[i] || `Video ${i + 1}`}
        />
      ))}
    </div>
  </section>
)}
```

---

## 8. country-card.tsx Yeniləməsi

```typescript
// components/country/country-card.tsx
import Image from 'next/image';
import Link from 'next/link';
import { getUnsplashUrl } from '@/lib/unsplash';

const SAFETY_COLORS = {
  safe: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  caution: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  warning: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const SAFETY_LABELS = {
  safe: 'Təhlükəsiz', caution: 'Diqqətli ol', warning: 'Xəbərdar'
};

const BEST_MONTH_LABELS = {
  jan:'Yan', feb:'Fev', mar:'Mar', apr:'Apr', may:'May', jun:'İyn',
  jul:'İyl', aug:'Avq', sep:'Sen', oct:'Okt', nov:'Noy', dec:'Dek'
};

interface Country {
  id: string; name: string; slug: string; continent: string;
  short_desc?: string; short_desc_en?: string; short_desc_ru?: string;
  cover_photo_id?: string; cover_photo_alt?: string;
  avg_flight_azn?: number; avg_hotel_azn?: number;
  visa_required?: boolean; popular_rank?: number;
  safety_level?: string; best_months?: string[];
}

export default function CountryCard({
  country,
  locale
}: {
  country: Country;
  locale: string;
}) {
  const desc = locale === 'en' ? country.short_desc_en
    : locale === 'ru' ? country.short_desc_ru
    : country.short_desc;

  return (
    <Link
      href={`/${locale}/countries/${country.slug}`}
      className="group block rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700
                 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow"
    >
      {/* Şəkil */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
        {country.cover_photo_id ? (
          <Image
            src={getUnsplashUrl(country.cover_photo_id, { w: 400, h: 250 })}
            alt={country.cover_photo_alt || country.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl">
            🌍
          </div>
        )}

        {/* Viza badge */}
        <div className="absolute top-2 right-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            country.visa_required
              ? 'bg-orange-500 text-white'
              : 'bg-green-500 text-white'
          }`}>
            {country.visa_required ? 'Viza lazım' : 'Vizasız'}
          </span>
        </div>
      </div>

      {/* Məzmun */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
          {country.name}
        </h3>

        {desc && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
            {desc}
          </p>
        )}

        {/* Xərclər */}
        {(country.avg_flight_azn || country.avg_hotel_azn) && (
          <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
            {country.avg_flight_azn && (
              <span>✈️ ~{country.avg_flight_azn} AZN</span>
            )}
            {country.avg_hotel_azn && (
              <span>🏨 ~{country.avg_hotel_azn} AZN/gecə</span>
            )}
          </div>
        )}

        {/* Ən yaxşı aylar */}
        {country.best_months?.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {country.best_months.slice(0, 4).map(m => (
              <span key={m} className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30
                                       text-blue-700 dark:text-blue-300 rounded">
                {BEST_MONTH_LABELS[m] || m}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
```

---

## 9. Ölkə Detal Səhifəsi

### Fayl: `src/app/[locale]/countries/[slug]/page.tsx`

```typescript
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import CountryDetailClient from './country-detail-client';

export async function generateMetadata({ params }) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('countries')
    .select('name, short_desc')
    .eq('slug', params.slug)
    .single();
  return {
    title: data?.name ? `${data.name} — TravelAZ` : 'Ölkə',
    description: data?.short_desc || ''
  };
}

export default async function CountryDetailPage({ params }) {
  const supabase = await createClient();

  // Tam ölkə məlumatı
  const { data: country } = await supabase
    .from('countries')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!country) notFound();

  // Məşhur yerlər
  const { data: highlights } = await supabase
    .from('country_highlights')
    .select('*')
    .eq('country_id', country.id)
    .order('rank');

  // Bu ölkə haqqında son 6 blog
  const { data: blogs } = await supabase
    .from('blogs')
    .select('id, title, cover_image, created_at, views, profiles(display_name)')
    .ilike('content', `%${country.name}%`)
    .order('created_at', { ascending: false })
    .limit(6);

  return (
    <CountryDetailClient
      country={country}
      highlights={highlights || []}
      blogs={blogs || []}
      locale={params.locale}
    />
  );
}

export const revalidate = 86400;
```

### Fayl: `src/app/[locale]/countries/[slug]/country-detail-client.tsx`

```typescript
'use client';
import Image from 'next/image';
import Link from 'next/link';
import YouTubeLite from '@/components/ui/youtube-lite';
import { getUnsplashUrl } from '@/lib/unsplash';

const MONTH_LABELS = {
  jan:'Yanvar', feb:'Fevral', mar:'Mart', apr:'Aprel',
  may:'May', jun:'İyun', jul:'İyul', aug:'Avqust',
  sep:'Sentyabr', oct:'Oktyabr', nov:'Noyabr', dec:'Dekabr'
};

export default function CountryDetailClient({ country, highlights, blogs, locale }) {
  const desc = locale === 'en' ? country.short_desc_en
    : locale === 'ru' ? country.short_desc_ru
    : country.short_desc;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Hero şəkil */}
      {country.cover_photo_id && (
        <div className="relative h-72 md:h-96 rounded-3xl overflow-hidden mb-8">
          <Image
            src={getUnsplashUrl(country.cover_photo_id, { w: 1200, h: 500 })}
            alt={country.cover_photo_alt || country.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <h1 className="text-4xl font-bold">{country.name}</h1>
            {country.capital && (
              <p className="text-white/80 mt-1">🏛️ {country.capital}</p>
            )}
          </div>
        </div>
      )}

      {/* Sürətli məlumatlar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { icon: '💱', label: 'Valyuta', value: `${country.currency} (${country.currency_name})` },
          { icon: '🕐', label: 'Saat zonası', value: country.timezone },
          { icon: '📞', label: 'Kod', value: country.calling_code },
          { icon: '🛂', label: 'Viza', value: country.visa_required ? 'Lazımdır' : 'Vizasız' },
        ].filter(i => i.value).map(info => (
          <div key={info.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
            <div className="text-2xl mb-1">{info.icon}</div>
            <div className="text-xs text-gray-500 mb-0.5">{info.label}</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">{info.value}</div>
          </div>
        ))}
      </div>

      {/* Qiymət məlumatları */}
      {(country.avg_flight_azn || country.avg_hotel_azn || country.avg_daily_azn) && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 mb-8">
          <h2 className="font-semibold mb-3">💰 Ortalama Xərclər (AZN)</h2>
          <div className="grid grid-cols-3 gap-4">
            {country.avg_flight_azn && (
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{country.avg_flight_azn}</div>
                <div className="text-xs text-gray-500">Bakıdan bilet (get-gəl)</div>
              </div>
            )}
            {country.avg_hotel_azn && (
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{country.avg_hotel_azn}</div>
                <div className="text-xs text-gray-500">Ortalama otel (gecəlik)</div>
              </div>
            )}
            {country.avg_daily_azn && (
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{country.avg_daily_azn}</div>
                <div className="text-xs text-gray-500">Gündəlik xərc</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ən yaxşı ziyarət ayları */}
      {country.best_months?.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold mb-3">📅 Ən Yaxşı Ziyarət Vaxtı</h2>
          <div className="flex gap-2 flex-wrap">
            {Array.from({length: 12}, (_, i) => {
              const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
              const m = months[i];
              const isGood = country.best_months.includes(m);
              return (
                <span key={m} className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  isGood
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                }`}>
                  {MONTH_LABELS[m]}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Məşhur yerlər */}
      {highlights.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-xl mb-4">📍 Mütləq Gedilməli Yerlər</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {highlights.map(h => (
              <div key={h.id} className="rounded-xl overflow-hidden border dark:border-gray-700">
                {h.photo_id && (
                  <div className="relative h-40">
                    <Image
                      src={getUnsplashUrl(h.photo_id, { w: 400, h: 200 })}
                      alt={h.name}
                      fill
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-3">
                  <h3 className="font-medium">{h.name}</h3>
                  {h.description && (
                    <p className="text-sm text-gray-500 mt-1">{h.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* YouTube Videoları — yalnız detal səhifəsindən yüklənir */}
      {country.youtube_ids?.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-xl mb-4">🎬 Faydalı Videolar</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {country.youtube_ids.map((id, i) => (
              <YouTubeLite
                key={id}
                videoId={id}
                title={country.youtube_titles?.[i]}
              />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            * Videolar yalnız klikləndikdə yüklənir (performans üçün)
          </p>
        </div>
      )}

      {/* Viza məlumatına link */}
      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-5 mb-8 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">🛂 Viza məlumatı</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Azərbaycan pasportu ilə {country.name} üçün viza tələbləri
          </p>
        </div>
        <Link
          href={`/${locale}/visa/${country.slug}`}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
        >
          Viza Məlumatı →
        </Link>
      </div>

      {/* İstifadəçi blogları */}
      {blogs.length > 0 && (
        <div>
          <h2 className="font-semibold text-xl mb-4">
            ✍️ {country.name} haqqında bloglar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {blogs.map(b => (
              <Link
                key={b.id}
                href={`/${locale}/blog/${b.id}`}
                className="block p-4 rounded-xl border dark:border-gray-700 hover:shadow-md transition"
              >
                <h3 className="font-medium line-clamp-2 mb-2">{b.title}</h3>
                <p className="text-xs text-gray-500">
                  {b.profiles?.display_name} · {new Date(b.created_at).toLocaleDateString('az')}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 10. Performans Tədbirləri

### Nə ağırlaşdırmır

```
✅ Next.js Image component:
   - Avtomatik lazy loading
   - WebP/AVIF format dönüşümü
   - Ölçü optimizasiyası (sizes prop ilə)
   - Blur placeholder (1px base64)

✅ YouTube Lite:
   - Klikləmədən əvvəl yalnız 1 şəkil (~7KB thumbnail)
   - iframe yalnız klikləndikdə yüklənir
   - Siyahı səhifəsindən iframe yoxdur

✅ Supabase sorğular:
   - SELECT yalnız lazımlı sütunlar (SELECT * yox)
   - countries/page.tsx → cover_photo_id, ad, slug, qiymət (18 sütun)
   - country/[slug]/page.tsx → tam məlumat (bu səhifə daha az açılır)

✅ ISR (Incremental Static Regeneration):
   - revalidate = 86400 → hər gün 1 dəfə Supabase sorğusu
   - Cache-dən cavab → sürətli

✅ Pagination:
   - .limit(60) — 60-dan çox ölkə birdən yüklənmir
   - Filtr client-side (mövcud datada) — yeni sorğu yox
```

### `next.config.ts` tam konfiqurasiya

```typescript
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/photo-**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com', // YouTube thumbnail
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400, // 24 saat şəkil keşi
  },
};

export default withNextIntl(nextConfig);
```

---

## 11. i18n Tərcümə Açarları

### `src/messages/az.json`-a əlavə et

```json
{
  "countries": {
    "title": "Ölkələr",
    "subtitle": "Gedəcəyiniz ölkəni kəşf edin",
    "search": "Ölkə axtar...",
    "filter_all": "Hamısı",
    "filter_europe": "Avropa",
    "filter_asia": "Asiya",
    "filter_americas": "Amerika",
    "filter_africa": "Afrika",
    "filter_oceania": "Okeaniya",
    "visa_required": "Viza lazım",
    "visa_free": "Vizasız",
    "avg_flight": "Ortalama bilet",
    "avg_hotel": "Gecəlik otel",
    "avg_daily": "Gündəlik xərc",
    "best_visit": "Ən Yaxşı Ziyarət Vaxtı",
    "top_places": "Mütləq Gedilməli Yerlər",
    "videos": "Faydalı Videolar",
    "user_blogs": "haqqında bloglar",
    "visa_info_title": "Viza məlumatı",
    "visa_info_sub": "Azərbaycan pasportu ilə viza tələbləri",
    "visa_info_btn": "Viza Məlumatı",
    "no_results": "Axtarışa uyğun ölkə tapılmadı",
    "currency": "Valyuta",
    "timezone": "Saat zonası",
    "dial_code": "Telefon kodu",
    "safety_safe": "Təhlükəsiz",
    "safety_caution": "Diqqətli ol",
    "safety_warning": "Xəbərdar"
  }
}
```

---

## 12. Tətbiq Sırası

```
Addım 1 — Migration (10 dəq)
  supabase/migrations/012_countries_expand.sql  → Supabase dashboard-da çalışdır

Addım 2 — Seed data (5 dəq)
  supabase/migrations/013_countries_seed_50.sql → Supabase dashboard-da çalışdır

Addım 3 — Köməkçi fayllar (15 dəq)
  src/lib/unsplash.ts                  → yeni fayl yarat
  src/components/ui/youtube-lite.tsx   → yeni fayl yarat

Addım 4 — next.config.ts (2 dəq)
  images.remotePatterns-ə Unsplash + ytimg əlavə et

Addım 5 — country-card.tsx (20 dəq)
  Mövcud komponenti yenilə (Image + yeni sütunlar)

Addım 6 — countries/page.tsx (15 dəq)
  Hardcoded data → Supabase sorğusu

Addım 7 — country-grid-client.tsx (20 dəq)
  Yeni fayl — filtrlər + axtarış

Addım 8 — countries/[slug]/page.tsx (30 dəq)
  Tam detal səhifəsi

Addım 9 — i18n (10 dəq)
  az.json, en.json, ru.json-a açarlar əlavə et

Addım 10 — Test (15 dəq)
  npx tsc --noEmit
  npm run dev → http://localhost:3000/az/countries
```

**Ümumi vaxt: ~2.5 saat**

---

*TravelAZ — Ölkələr Modulu Genişləndirilməsi v1.0 | 2026*