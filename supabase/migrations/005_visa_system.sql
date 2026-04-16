-- =============================================
-- TravelAZ Visa System — Phase 1 Migration
-- =============================================

-- 1. visa_info cədvəlinə yeni sütunlar əlavə et
ALTER TABLE visa_info ADD COLUMN IF NOT EXISTS fee_usd DECIMAL(10,2);
ALTER TABLE visa_info ADD COLUMN IF NOT EXISTS fee_azn DECIMAL(10,2);
ALTER TABLE visa_info ADD COLUMN IF NOT EXISTS processing_days_min INT;
ALTER TABLE visa_info ADD COLUMN IF NOT EXISTS processing_days_max INT;
ALTER TABLE visa_info ADD COLUMN IF NOT EXISTS validity_days INT;
ALTER TABLE visa_info ADD COLUMN IF NOT EXISTS max_stay_days INT;
ALTER TABLE visa_info ADD COLUMN IF NOT EXISTS is_evisa BOOLEAN DEFAULT false;
ALTER TABLE visa_info ADD COLUMN IF NOT EXISTS evisa_url TEXT;
ALTER TABLE visa_info ADD COLUMN IF NOT EXISTS official_url TEXT;
ALTER TABLE visa_info ADD COLUMN IF NOT EXISTS appointment_url TEXT;
ALTER TABLE visa_info ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE visa_info ADD COLUMN IF NOT EXISTS data_confidence INT DEFAULT 100;

-- 2. visa_documents cədvəli
CREATE TABLE IF NOT EXISTS visa_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID REFERENCES countries(id) ON DELETE CASCADE,
  visa_type TEXT DEFAULT 'tourist',
  document_name_az TEXT NOT NULL,
  document_name_en TEXT,
  document_name_ru TEXT,
  description_az TEXT,
  is_required BOOLEAN DEFAULT true,
  document_category TEXT,
  accepted_formats TEXT[],
  max_size_mb INT DEFAULT 5,
  notes_az TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE visa_documents ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Visa documents are viewable by everyone" ON visa_documents FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Seed data — Türkiyə (vizasız, 90 gün)
INSERT INTO visa_info (country_id, requirement_type, processing_time, documents, notes_az, notes_en, notes_ru, fee_usd, fee_azn, processing_days_min, processing_days_max, validity_days, max_stay_days, is_evisa, official_url, last_verified_at, data_confidence)
SELECT id, 'not_required', '-', '{}', 'Azərbaycan vətəndaşları üçün vizasız (90 gün)', 'Visa-free for Azerbaijani citizens (90 days)', 'Без визы для граждан Азербайджана (90 дней)', 0, 0, 0, 0, 0, 90, false, 'https://baku.be.mfa.gov.tr', NOW(), 100
FROM countries WHERE slug = 'turkey' ON CONFLICT DO NOTHING;

-- Gürcüstan (vizasız, 1 il)
INSERT INTO visa_info (country_id, requirement_type, processing_time, documents, notes_az, notes_en, notes_ru, fee_usd, fee_azn, processing_days_min, processing_days_max, validity_days, max_stay_days, is_evisa, official_url, last_verified_at, data_confidence)
SELECT id, 'not_required', '-', '{}', 'Azərbaycan vətəndaşları üçün vizasız (1 il)', 'Visa-free for Azerbaijani citizens (1 year)', 'Без визы для граждан Азербайджана (1 год)', 0, 0, 0, 0, 0, 365, false, 'https://mfa.gov.ge', NOW(), 100
FROM countries WHERE slug = 'georgia' ON CONFLICT DO NOTHING;

-- BƏƏ / Dubai (gəlişdə viza, 30 gün)
INSERT INTO visa_info (country_id, requirement_type, processing_time, documents, notes_az, notes_en, notes_ru, fee_usd, fee_azn, processing_days_min, processing_days_max, validity_days, max_stay_days, is_evisa, evisa_url, official_url, last_verified_at, data_confidence)
SELECT id, 'on_arrival', 'Anında', '{"Pasport (6 ay)", "Qayıdış bileti"}', 'Gəlişdə viza — 30 gün. Pasport 6 ay etibarlı olmalıdır.', 'Visa on arrival — 30 days. Passport must be valid for 6 months.', 'Виза по прибытии — 30 дней. Паспорт должен быть действителен 6 месяцев.', 0, 0, 0, 0, 0, 30, false, 'https://icp.gov.ae/en/eservices/visaservice', 'https://www.emirates.com/az/azerbaijani/help/visa-passport-information/', NOW(), 95
FROM countries WHERE slug = 'dubai' ON CONFLICT DO NOTHING;

-- Rusiya (vizasız, 90 gün)
INSERT INTO visa_info (country_id, requirement_type, processing_time, documents, notes_az, notes_en, notes_ru, fee_usd, fee_azn, processing_days_min, processing_days_max, validity_days, max_stay_days, is_evisa, official_url, last_verified_at, data_confidence)
SELECT id, 'not_required', '-', '{}', 'Azərbaycan vətəndaşları üçün vizasız (90 gün)', 'Visa-free for Azerbaijani citizens (90 days)', 'Без визы для граждан Азербайджана (90 дней)', 0, 0, 0, 0, 0, 90, false, 'https://baku.mid.ru', NOW(), 100
FROM countries WHERE slug = 'russia' ON CONFLICT DO NOTHING;

-- Yaponiya (viza lazımdır)
INSERT INTO visa_info (country_id, requirement_type, processing_time, documents, notes_az, notes_en, notes_ru, fee_usd, fee_azn, processing_days_min, processing_days_max, validity_days, max_stay_days, is_evisa, official_url, last_verified_at, data_confidence)
SELECT id, 'required', '5-7 iş günü', '{"Pasport (6 ay)", "Viza ərizəsi", "Biyometrik foto (4.5x4.5)", "Maliyyə sübutu", "Səyahət planı", "İş yeri arayışı", "Otel rezervasiyası", "Gediş-dönüş bilet"}', 'Əvvəlcədən müraciət lazımdır. Yaponiya səfirliyinə gedilir.', 'Prior application required. Visit Embassy of Japan.', 'Требуется предварительная заявка. Посетите посольство Японии.', 20, 34, 5, 7, 90, 90, false, 'https://www.az.emb-japan.go.jp', NOW(), 90
FROM countries WHERE slug = 'japan' ON CONFLICT DO NOTHING;

-- Almaniya / Schengen (italy slug istifadə olunur, çünki countries cədvəlində italy var)
-- Almaniya üçün əgər countries cədvəlində almaniya/germany slug yoxdursa, italy istifadə olunur
INSERT INTO visa_info (country_id, requirement_type, processing_time, documents, notes_az, notes_en, notes_ru, fee_usd, fee_azn, processing_days_min, processing_days_max, validity_days, max_stay_days, is_evisa, official_url, appointment_url, last_verified_at, data_confidence)
SELECT id, 'required', '10-15 iş günü', '{"Pasport (6 ay)", "Viza ərizəsi (VFS)", "Biyometrik foto (3.5x4.5)", "Səyahət sığortası (30,000 EUR)", "Bank çıxarışı (son 3 ay)", "İş yeri arayışı", "Otel rezervasiyası", "Gediş-dönüş bilet", "Niyyət məktubu"}', 'Schengen vizası. VFS Global vasitəsilə müraciət. Barmaq izi tələb olunur.', 'Schengen visa via VFS Global. Biometrics required.', 'Шенгенская виза через VFS Global. Требуется биометрия.', 80, 136, 10, 15, 180, 90, false, 'https://baku.diplo.de/az-az/visum', 'https://visa.vfsglobal.com/aze/az/deu', NOW(), 90
FROM countries WHERE slug = 'italy' ON CONFLICT DO NOTHING;

-- İtaliya (Schengen)
INSERT INTO visa_info (country_id, requirement_type, processing_time, documents, notes_az, notes_en, notes_ru, fee_usd, fee_azn, processing_days_min, processing_days_max, validity_days, max_stay_days, is_evisa, official_url, appointment_url, last_verified_at, data_confidence)
SELECT id, 'required', '10-15 iş günü', '{"Pasport (6 ay)", "Viza ərizəsi (VFS)", "Biyometrik foto (3.5x4.5)", "Səyahət sığortası (30,000 EUR)", "Bank çıxarışı (son 3 ay)", "İş yeri arayışı", "Otel rezervasiyası", "Gediş-dönüş bilet"}', 'Schengen vizası. VFS Global vasitəsilə müraciət.', 'Schengen visa via VFS Global.', 'Шенгенская виза через VFS Global.', 80, 136, 10, 15, 180, 90, false, 'https://ambbaku.esteri.it', 'https://visa.vfsglobal.com/aze/az/ita', NOW(), 85
FROM countries WHERE slug = 'italy' ON CONFLICT DO NOTHING;

-- 4. Sənəd siyahıları — Yaponiya üçün
INSERT INTO visa_documents (country_id, visa_type, document_name_az, document_name_en, document_name_ru, is_required, document_category, sort_order, notes_az)
SELECT c.id, 'tourist', t.az, t.en, t.ru, true, t.cat, t.ord, t.notes
FROM countries c
CROSS JOIN LATERAL (VALUES
  ('Etibarlı pasport (6 aydan çox)', 'Valid passport (6+ months)', 'Действующий паспорт (6+ месяцев)', 'identity', 1, NULL::TEXT),
  ('Viza müraciət forması', 'Visa application form', 'Анкета на визу', 'identity', 2, NULL),
  ('Biyometrik foto (4.5x4.5 sm)', 'Biometric photo (4.5x4.5 cm)', 'Биометрическое фото (4.5x4.5 см)', 'identity', 3, 'Son 3 ay ərzində çəkilib'),
  ('Maliyyə sübutu (bank çıxarışı)', 'Financial proof (bank statement)', 'Финансовое подтверждение (выписка)', 'financial', 4, NULL),
  ('Səyahət planı / marşrut', 'Travel itinerary', 'План поездки / маршрут', 'travel', 5, NULL),
  ('İş yeri arayışı', 'Employment certificate', 'Справка с работы', 'financial', 6, NULL),
  ('Otel rezervasiyası', 'Hotel reservation', 'Бронирование отеля', 'travel', 7, NULL),
  ('Gediş-dönüş aviabilet', 'Round-trip flight ticket', 'Авиабилет туда-обратно', 'travel', 8, NULL)
) AS t(az, en, ru, cat, ord, notes)
WHERE c.slug = 'japan';

-- Sənəd siyahıları — İtaliya (Schengen) üçün
INSERT INTO visa_documents (country_id, visa_type, document_name_az, document_name_en, document_name_ru, is_required, document_category, sort_order)
SELECT c.id, 'tourist', t.az, t.en, t.ru, true, t.cat, t.ord
FROM countries c
CROSS JOIN LATERAL (VALUES
  ('Etibarlı pasport (6 aydan çox)', 'Valid passport (6+ months)', 'Действующий паспорт (6+ месяцев)', 'identity', 1),
  ('Viza müraciət forması (VFS)', 'Visa application form (VFS)', 'Анкета на визу (VFS)', 'identity', 2),
  ('Biyometrik foto (3.5x4.5 sm)', 'Biometric photo (3.5x4.5 cm)', 'Биометрическое фото (3.5x4.5 см)', 'identity', 3),
  ('Səyahət sığortası (min 30,000 EUR)', 'Travel insurance (min 30,000 EUR)', 'Страховка (мин 30,000 EUR)', 'travel', 4),
  ('Bank çıxarışı (son 3 ay)', 'Bank statement (last 3 months)', 'Выписка из банка (3 месяца)', 'financial', 5),
  ('İş yeri arayışı / Tələbə arayışı', 'Employment/student certificate', 'Справка с работы / учебы', 'financial', 6),
  ('Otel rezervasiyası', 'Hotel reservation', 'Бронирование отеля', 'travel', 7),
  ('Gediş-dönüş aviabilet', 'Round-trip flight ticket', 'Авиабилет туда-обратно', 'travel', 8),
  ('Niyyət məktubu', 'Cover letter', 'Сопроводительное письмо', 'identity', 9)
) AS t(az, en, ru, cat, ord)
WHERE c.slug = 'italy';
