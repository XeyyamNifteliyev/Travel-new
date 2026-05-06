-- TravelAZ: Add missing countries for city presets
-- Hungary, Malaysia, Egypt, USA, Azerbaijan, Croatia

INSERT INTO countries (slug, name_az, name_ru, name_en, flag_emoji, description, best_time, avg_costs, popular_places)
VALUES
  ('hungary', 'Macarıstan', 'Венгрия', 'Hungary', '🇭🇺', 'Budapeşt, Dunay çayı, termal vannalar', 'Apr-Jun, Sep-Oct', '{"flight":"250 AZN","hotel":"50 AZN","daily":"60 AZN"}', '{Budapeşt,Balaton,Göllər}'),
  ('malaysia', 'Malayziya', 'Малайзия', 'Malaysia', '🇲🇾', 'Kuala-Lumpur, tropik meşələr, çimərliklər', 'Dec-Feb', '{"flight":"800 AZN","hotel":"40 AZN","daily":"50 AZN"}', '{Kuala-Lumpur,Langkawi,Penang}'),
  ('egypt', 'Misir', 'Египет', 'Egypt', '🇪🇬', 'Qahirə, piramidalar, Qırmızı dəniz', 'Oct-Apr', '{"flight":"350 AZN","hotel":"40 AZN","daily":"50 AZN"}', '{Qahirə,Lüksor,Hurğada}'),
  ('usa', 'ABŞ', 'США', 'United States', '🇺🇸', 'Nyu-York, Qrand Kanyon, Hollivud', 'May-Oct', '{"flight":"700 AZN","hotel":"150 AZN","daily":"180 AZN"}', '{Nyu-York,Los-Anceles,Mayami}'),
  ('azerbaijan', 'Azərbaycan', 'Азербайджан', 'Azerbaijan', '🇦🇿', 'Bakı, Şəki, Quba', 'Apr-Jun, Sep-Oct', '{"flight":"0 AZN","hotel":"50 AZN","daily":"60 AZN"}', '{Bakı,Şəki,Quba}'),
  ('croatia', 'Xorvatiya', 'Хорватия', 'Croatia', '🇭🇷', 'Dubrovnik, Split, Adriatik sahilləri', 'May-Sep', '{"flight":"400 AZN","hotel":"70 AZN","daily":"80 AZN"}', '{Dubrovnik,Split,Zadar}')
ON CONFLICT (slug) DO NOTHING;

-- Add cca2 codes for new countries
UPDATE countries SET cca2 = 'HU' WHERE slug = 'hungary' AND cca2 IS NULL;
UPDATE countries SET cca2 = 'MY' WHERE slug = 'malaysia' AND cca2 IS NULL;
UPDATE countries SET cca2 = 'EG' WHERE slug = 'egypt' AND cca2 IS NULL;
UPDATE countries SET cca2 = 'US' WHERE slug = 'usa' AND cca2 IS NULL;
UPDATE countries SET cca2 = 'AZ' WHERE slug = 'azerbaijan' AND cca2 IS NULL;
UPDATE countries SET cca2 = 'HR' WHERE slug = 'croatia' AND cca2 IS NULL;