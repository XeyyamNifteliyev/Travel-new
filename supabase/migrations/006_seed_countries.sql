-- Seed countries table (10 ölkə)
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
  ('uk', 'İngiltərə', 'Англия', 'England', '🇬🇧', 'London, Big Ben, Tower Bridge', 'Jun-Aug', '{"flight":"600 AZN","hotel":"150 AZN","daily":"160 AZN"}', '{London,Manchester,Oxford}')
ON CONFLICT (slug) DO NOTHING;
