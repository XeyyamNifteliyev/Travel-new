-- Təmiz başla: visa_info və visa_documents-u təmizlə
DELETE FROM visa_documents;
DELETE FROM visa_info;

-- Countries-i təmizlə və yenidən doldur
DELETE FROM countries;
INSERT INTO countries (slug, name_az, name_ru, name_en, flag_emoji, description, best_time, avg_costs, popular_places)
VALUES
  ('turkey', 'Türkiyə', 'Турция', 'Turkey', '🇹🇷', 'İstanbul, Antalya, Kapadokya', 'Apr-May, Sep-Nov', '{"flight":"150 AZN","hotel":"60 AZN","daily":"80 AZN"}', '{İstanbul,Antalya,Kapadokya}'),
  ('dubai', 'Dubai', 'Дубай', 'Dubai', '🇦🇪', 'Müasir memarlıq, lüks alış-veriş', 'Nov-Mar', '{"flight":"400 AZN","hotel":"150 AZN","daily":"200 AZN"}', '{Burj Khalifa,Dubai Mall,Palm Jumeirah}'),
  ('georgia', 'Gürcüstan', 'Грузия', 'Georgia', '🇬🇪', 'Tiflis, Batumi, dağ kəndləri', 'May-Oct', '{"flight":"100 AZN","hotel":"50 AZN","daily":"60 AZN"}', '{Tiflis,Batumi,Kazbegi}'),
  ('japan', 'Yaponiya', 'Япония', 'Japan', '🇯🇵', 'Tokyo, Kyoto, Fuji dağı', 'Mar-May, Oct-Nov', '{"flight":"1200 AZN","hotel":"120 AZN","daily":"150 AZN"}', '{Tokyo,Kyoto,Osaka}'),
  ('thailand', 'Tailand', 'Таиланд', 'Thailand', '🇹🇭', 'Banqkok, Phuket, tropik çimərliklər', 'Nov-Feb', '{"flight":"900 AZN","hotel":"40 AZN","daily":"50 AZN"}', '{Banqkok,Phuket,Chiang Mai}'),
  ('italy', 'İtaliya', 'Италия', 'Italy', '🇮🇹', 'Roma, Venesiya, Florensiya', 'Apr-Jun, Sep-Oct', '{"flight":"500 AZN","hotel":"100 AZN","daily":"120 AZN"}', '{Roma,Venesiya,Milan}'),
  ('france', 'Fransa', 'Франция', 'France', '🇫🇷', 'Paris, Luvr, Eyfel qülləsi', 'Apr-Jun, Sep-Oct', '{"flight":"550 AZN","hotel":"130 AZN","daily":"140 AZN"}', '{Paris,Nice,Lyon}'),
  ('russia', 'Rusiya', 'Россия', 'Russia', '🇷🇺', 'Moskva, Sankt-Peterburq', 'Jun-Aug', '{"flight":"300 AZN","hotel":"70 AZN","daily":"80 AZN"}', '{Moskva,Sankt-Peterburq}'),
  ('iran', 'İran', 'Иран', 'Iran', '🇮🇷', 'Tehran, İsfahan, Şiraz', 'Mar-May, Sep-Nov', '{"flight":"200 AZN","hotel":"30 AZN","daily":"40 AZN"}', '{Tehran,İsfahan,Şiraz}'),
  ('uk', 'İngiltərə', 'Англия', 'England', '🇬🇧', 'London, Big Ben, Tower Bridge', 'Jun-Aug', '{"flight":"600 AZN","hotel":"150 AZN","daily":"160 AZN"}', '{London,Manchester,Oxford}');

-- Visa info — Türkiyə
INSERT INTO visa_info (country_id, requirement_type, processing_time, documents, notes_az, notes_en, notes_ru, fee_usd, fee_azn, processing_days_min, processing_days_max, validity_days, max_stay_days, is_evisa, official_url, last_verified_at, data_confidence)
SELECT id, 'not_required', '-', '{}', 'Azərbaycan vətəndaşları üçün vizasız (90 gün)', 'Visa-free for Azerbaijani citizens (90 days)', 'Без визы для граждан Азербайджана (90 дней)', 0, 0, 0, 0, 0, 90, false, 'https://baku.be.mfa.gov.tr', NOW(), 100
FROM countries WHERE slug = 'turkey';

-- Gürcüstan
INSERT INTO visa_info (country_id, requirement_type, processing_time, documents, notes_az, notes_en, notes_ru, fee_usd, fee_azn, processing_days_min, processing_days_max, validity_days, max_stay_days, is_evisa, official_url, last_verified_at, data_confidence)
SELECT id, 'not_required', '-', '{}', 'Azərbaycan vətəndaşları üçün vizasız (1 il)', 'Visa-free for Azerbaijani citizens (1 year)', 'Без визы для граждан Азербайджана (1 год)', 0, 0, 0, 0, 0, 365, false, 'https://mfa.gov.ge', NOW(), 100
FROM countries WHERE slug = 'georgia';

-- BƏƏ / Dubai
INSERT INTO visa_info (country_id, requirement_type, processing_time, documents, notes_az, notes_en, notes_ru, fee_usd, fee_azn, processing_days_min, processing_days_max, validity_days, max_stay_days, is_evisa, evisa_url, official_url, last_verified_at, data_confidence)
SELECT id, 'on_arrival', 'Anında', '{"Pasport (6 ay)", "Qayıdış bileti"}', 'Gəlişdə viza — 30 gün. Pasport 6 ay etibarlı olmalıdır.', 'Visa on arrival — 30 days.', 'Виза по прибытии — 30 дней.', 0, 0, 0, 0, 0, 30, false, 'https://icp.gov.ae/en/eservices/visaservice', 'https://www.emirates.com/az/azerbaijani/help/visa-passport-information/', NOW(), 95
FROM countries WHERE slug = 'dubai';

-- Rusiya
INSERT INTO visa_info (country_id, requirement_type, processing_time, documents, notes_az, notes_en, notes_ru, fee_usd, fee_azn, processing_days_min, processing_days_max, validity_days, max_stay_days, is_evisa, official_url, last_verified_at, data_confidence)
SELECT id, 'not_required', '-', '{}', 'Azərbayjan vətəndaşları üçün vizasız (90 gün)', 'Visa-free for Azerbaijani citizens (90 days)', 'Без визы для граждан Азербайджана (90 дней)', 0, 0, 0, 0, 0, 90, false, 'https://baku.mid.ru', NOW(), 100
FROM countries WHERE slug = 'russia';

-- Yaponiya
INSERT INTO visa_info (country_id, requirement_type, processing_time, documents, notes_az, notes_en, notes_ru, fee_usd, fee_azn, processing_days_min, processing_days_max, validity_days, max_stay_days, is_evisa, official_url, last_verified_at, data_confidence)
SELECT id, 'required', '5-7 iş günü', '{"Pasport (6 ay)", "Viza ərizəsi", "Biyometrik foto", "Maliyyə sübutu", "Səyahət planı", "İş yeri arayışı", "Otel rezervasiyası", "Gediş-dönüş bilet"}', 'Əvvəlcədən müraciət lazımdır.', 'Prior application required.', 'Требуется предварительная заявка.', 20, 34, 5, 7, 90, 90, false, 'https://www.az.emb-japan.go.jp', NOW(), 90
FROM countries WHERE slug = 'japan';

-- İtaliya (Schengen)
INSERT INTO visa_info (country_id, requirement_type, processing_time, documents, notes_az, notes_en, notes_ru, fee_usd, fee_azn, processing_days_min, processing_days_max, validity_days, max_stay_days, is_evisa, official_url, appointment_url, last_verified_at, data_confidence)
SELECT id, 'required', '10-15 iş günü', '{"Pasport (6 ay)", "Viza ərizəsi (VFS)", "Biyometrik foto", "Sığorta (30,000 EUR)", "Bank çıxarışı", "İş yeri arayışı", "Otel rezervasiyası", "Bilet", "Niyyət məktubu"}', 'Schengen vizası. VFS Global vasitəsilə.', 'Schengen visa via VFS Global.', 'Шенгенская виза через VFS Global.', 80, 136, 10, 15, 180, 90, false, 'https://ambbaku.esteri.it', 'https://visa.vfsglobal.com/aze/az/ita', NOW(), 85
FROM countries WHERE slug = 'italy';

-- Sənədlər — Yaponiya
INSERT INTO visa_documents (country_id, visa_type, document_name_az, document_name_en, document_name_ru, is_required, document_category, sort_order, notes_az)
SELECT c.id, 'tourist', t.az, t.en, t.ru, true, t.cat, t.ord, t.notes
FROM countries c
CROSS JOIN LATERAL (VALUES
  ('Etibarlı pasport (6 ay+)', 'Valid passport (6+ months)', 'Действующий паспорт (6+ месяцев)', 'identity', 1, NULL::TEXT),
  ('Viza müraciət forması', 'Visa application form', 'Анкета на визу', 'identity', 2, NULL),
  ('Biyometrik foto (4.5x4.5)', 'Biometric photo (4.5x4.5 cm)', 'Биометрическое фото (4.5x4.5 см)', 'identity', 3, 'Son 3 ay'),
  ('Maliyyə sübutu', 'Financial proof', 'Финансовое подтверждение', 'financial', 4, NULL),
  ('Səyahət planı', 'Travel itinerary', 'План поездки', 'travel', 5, NULL),
  ('İş yeri arayışı', 'Employment certificate', 'Справка с работы', 'financial', 6, NULL),
  ('Otel rezervasiyası', 'Hotel reservation', 'Бронирование отеля', 'travel', 7, NULL),
  ('Gediş-dönüş bilet', 'Round-trip ticket', 'Авиабилет туда-обратно', 'travel', 8, NULL)
) AS t(az, en, ru, cat, ord, notes)
WHERE c.slug = 'japan';

-- Sənədlər — İtaliya
INSERT INTO visa_documents (country_id, visa_type, document_name_az, document_name_en, document_name_ru, is_required, document_category, sort_order)
SELECT c.id, 'tourist', t.az, t.en, t.ru, true, t.cat, t.ord
FROM countries c
CROSS JOIN LATERAL (VALUES
  ('Etibarlı pasport (6 ay+)', 'Valid passport (6+ months)', 'Действующий паспорт (6+ месяцев)', 'identity', 1),
  ('Viza ərizəsi (VFS)', 'Visa application form (VFS)', 'Анкета (VFS)', 'identity', 2),
  ('Biyometrik foto (3.5x4.5)', 'Biometric photo (3.5x4.5 cm)', 'Биометрическое фото', 'identity', 3),
  ('Sığorta (min 30,000 EUR)', 'Travel insurance (min 30,000 EUR)', 'Страховка (мин 30,000 EUR)', 'travel', 4),
  ('Bank çıxarışı (3 ay)', 'Bank statement (3 months)', 'Выписка из банка', 'financial', 5),
  ('İş yeri arayışı', 'Employment certificate', 'Справка с работы', 'financial', 6),
  ('Otel rezervasiyası', 'Hotel reservation', 'Бронирование отеля', 'travel', 7),
  ('Gediş-dönüş bilet', 'Round-trip ticket', 'Авиабилет туда-обратно', 'travel', 8),
  ('Niyyət məktubu', 'Cover letter', 'Сопроводительное письмо', 'identity', 9)
) AS t(az, en, ru, cat, ord)
WHERE c.slug = 'italy';
