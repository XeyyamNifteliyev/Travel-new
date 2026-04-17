-- 013: 32 ölkə seed data (hissə-hissə)
-- Mövcud ölkələri UPDATE, yeniləri INSERT

-- ═══════════════════════════════════════
-- HİSSƏ 1: Türkiyə, BƏƏ, Fransa, İtaliya
-- ═══════════════════════════════════════

INSERT INTO countries (
  slug, name_az, name_en, name_ru, flag_emoji,
  continent, capital, currency, currency_name, language, population, timezone, calling_code,
  best_months, climate_type, avg_flight_azn, avg_hotel_azn, avg_daily_azn,
  cover_photo_id, cover_photo_alt, gallery_ids, youtube_ids, youtube_titles,
  short_desc, short_desc_en, short_desc_ru,
  safety_level, visa_required, popular_rank, is_featured, top_places
) VALUES

-- TÜRKİYƏ
('turkey', 'Türkiyə', 'Turkey', 'Турция', '🇹🇷',
 'europe', 'İstanbul', 'TRY', 'Türk Lirəsi', 'Türk', 85000000, 'UTC+3', '+90',
 ARRAY['apr','may','sep','oct'], 'moderate', 120, 80, 60,
 '1524231757913-4be64b2825c7', 'İstanbul Bosfor',
 ARRAY['1524231757913-4be64b2825c7','1551913902-b38fc67d8b4e','1541432901042-2b3b1d4b7e9e'],
 ARRAY['0aFBFBHg_fU','1a6uDjJMJEI','OJLRwPiSRYA'],
 ARRAY['İstanbul gəzintisi 2024','Kapadokya balonla uçuş','Türkiyə travel guide'],
 'İki qitəni birləşdirən, tarixi zəngin, mədəniyyəti möhtəşəm ölkə.',
 'A country bridging two continents with rich history and vibrant culture.',
 'Страна, соединяющая два континента, с богатой историей и культурой.',
 'safe', false, 1, true,
 '[{"name":"Ayasofya","desc":"Dünyaca məşhur Bizans və Osmanlı abidəsi","photo_id":"1524231757913-4be64b2825c7","lat":41.0086,"lng":28.9802,"category":"landmark"},{"name":"Kapadokya","desc":"Pəri bacaları və balon turu","photo_id":"1551913902-b38fc67d8b4e","lat":38.6431,"lng":34.8289,"category":"nature"},{"name":"Pamukkale","desc":"Ağ travertin terasları","photo_id":"1541432901042-2b3b1d4b7e9e","lat":37.9137,"lng":29.1187,"category":"nature"}]'::jsonb
),

-- BƏƏ (DUBAI)
('dubai', 'BƏƏ', 'UAE', 'ОАЭ', '🇦🇪',
 'asia', 'Abu Dabi', 'AED', 'BƏƏ Dirhəmi', 'Ərəb', 9900000, 'UTC+4', '+971',
 ARRAY['nov','dec','jan','feb','mar'], 'desert', 160, 220, 150,
 '1512453979798-5ea266f8880c', 'Dubai Burj Khalifa',
 ARRAY['1512453979798-5ea266f8880c','1568702846914-96b305d2aaeb','1580674684029-7a61b5b3e9da'],
 ARRAY['Xn_Pz1jIBdQ','JXdxYGU2ags','6jZ_q2mNaDE'],
 ARRAY['Dubai travel vlog 2024','Burj Khalifa & Downtown','Dubai desert safari'],
 'Müasir memarlığın zirvəsi, lüks alış-veriş və səhra macəraları.',
 'Pinnacle of modern architecture, luxury shopping and desert adventures.',
 'Вершина современной архитектуры, роскошный шопинг и пустынные приключения.',
 'safe', true, 2, true,
 '[{"name":"Burj Khalifa","desc":"Dünyanın ən hündür binası — 828m","photo_id":"1512453979798-5ea266f8880c","lat":25.1972,"lng":55.2744,"category":"landmark"},{"name":"Palm Jumeirah","desc":"Süni xurma adası","photo_id":"1568702846914-96b305d2aaeb","lat":25.1124,"lng":55.1390,"category":"landmark"},{"name":"Dubai Mall","desc":"Dünyanın ən böyük ticarət mərkəzi","photo_id":"1580674684029-7a61b5b3e9da","lat":25.1980,"lng":55.2795,"category":"shopping"}]'::jsonb
),

-- FRANSA
('france', 'Fransa', 'France', 'Франция', '🇫🇷',
 'europe', 'Paris', 'EUR', 'Avro', 'Fransız', 68000000, 'UTC+1', '+33',
 ARRAY['apr','may','jun','sep','oct'], 'moderate', 350, 200, 120,
 '1502602915149-bb4f5dc63d43', 'Paris Eyfel Qülləsi',
 ARRAY['1502602915149-bb4f5dc63d43','1499856562261-6a300a60f98b','1431274172761-fdc4ab25fd7e'],
 ARRAY['MCjVpFBLyDk','sJftm35i3jk','RCBKHe1dOEo'],
 ARRAY['Paris travel guide 2024','Louvre muzeyindən gəzinti','Paris gizli yerləri'],
 'Sevgi şəhəri, dünya sənəti, moda və qastronomiyanın paytaxtı.',
 'The city of love, world art, fashion and gastronomy capital.',
 'Город любви, мировое искусство, мода и гастрономия.',
 'safe', true, 3, true,
 '[{"name":"Eyfel Qülləsi","desc":"Fransanın simvolu, 330m hündürlük","photo_id":"1502602915149-bb4f5dc63d43","lat":48.8584,"lng":2.2945,"category":"landmark"},{"name":"Luvr Muzeyi","desc":"Dünyanın ən böyük sənət muzeyi","photo_id":"1499856562261-6a300a60f98b","lat":48.8606,"lng":2.3376,"category":"museum"},{"name":"Monmartr","desc":"Rəssamlar məhəlləsi, gözəl panorama","photo_id":"1431274172761-fdc4ab25fd7e","lat":48.8867,"lng":2.3431,"category":"landmark"}]'::jsonb
),

-- İTALİYA
('italy', 'İtaliya', 'Italy', 'Италия', '🇮🇹',
 'europe', 'Roma', 'EUR', 'Avro', 'İtalyan', 60000000, 'UTC+1', '+39',
 ARRAY['apr','may','jun','sep','oct'], 'moderate', 320, 150, 110,
 '1516483107680-cf12f4bb3a06', 'Roma Kolizeum',
 ARRAY['1516483107680-cf12f4bb3a06','1523906834-14422bf244af','1534445952-b7b83a7df4e3'],
 ARRAY['bWpPpf0DVZs','YEMoMnM0vAY','mKQvv3h6jrE'],
 ARRAY['Roma gəzintisi 2024','Venedik kanalları','Toskana üzüm bağları'],
 'Kolizeum, Venedik kanalları, Toskana mənzərəsi — tarixi ilə nəfəs alan ölkə.',
 'Colosseum, Venice canals, Tuscany — a country breathing with history.',
 'Колизей, каналы Венеции, Тоскана — страна, дышащая историей.',
 'safe', true, 4, true,
 '[{"name":"Kolizeum","desc":"Roma imperiyasının 2000 illik amfiteatrı","photo_id":"1516483107680-cf12f4bb3a06","lat":41.8902,"lng":12.4922,"category":"landmark"},{"name":"Venedik","desc":"Kanallar üzərindəki misilsiz şəhər","photo_id":"1523906834-14422bf244af","lat":45.4408,"lng":12.3155,"category":"landmark"},{"name":"Amalfi Sahili","desc":"Dünyanın ən gözəl sahil yollarından biri","photo_id":"1534445952-b7b83a7df4e3","lat":40.6340,"lng":14.6027,"category":"nature"}]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name_az = EXCLUDED.name_az, name_en = EXCLUDED.name_en, name_ru = EXCLUDED.name_ru,
  flag_emoji = EXCLUDED.flag_emoji,
  continent = EXCLUDED.continent, capital = EXCLUDED.capital,
  currency = EXCLUDED.currency, currency_name = EXCLUDED.currency_name,
  language = EXCLUDED.language, population = EXCLUDED.population,
  timezone = EXCLUDED.timezone, calling_code = EXCLUDED.calling_code,
  best_months = EXCLUDED.best_months, climate_type = EXCLUDED.climate_type,
  avg_flight_azn = EXCLUDED.avg_flight_azn, avg_hotel_azn = EXCLUDED.avg_hotel_azn,
  avg_daily_azn = EXCLUDED.avg_daily_azn,
  cover_photo_id = EXCLUDED.cover_photo_id, cover_photo_alt = EXCLUDED.cover_photo_alt,
  gallery_ids = EXCLUDED.gallery_ids, youtube_ids = EXCLUDED.youtube_ids,
  youtube_titles = EXCLUDED.youtube_titles,
  short_desc = EXCLUDED.short_desc, short_desc_en = EXCLUDED.short_desc_en,
  short_desc_ru = EXCLUDED.short_desc_ru,
  safety_level = EXCLUDED.safety_level, visa_required = EXCLUDED.visa_required,
  popular_rank = EXCLUDED.popular_rank, is_featured = EXCLUDED.is_featured,
  top_places = EXCLUDED.top_places;

-- ═══════════════════════════════════════
-- HİSSƏ 3: Gürcüstan, Rusiya, İran, İngiltərə
-- ═══════════════════════════════════════

INSERT INTO countries (
  slug, name_az, name_en, name_ru, flag_emoji,
  continent, capital, currency, currency_name, language, population, timezone, calling_code,
  best_months, climate_type, avg_flight_azn, avg_hotel_azn, avg_daily_azn,
  cover_photo_id, cover_photo_alt, gallery_ids, youtube_ids, youtube_titles,
  short_desc, short_desc_en, short_desc_ru,
  safety_level, visa_required, popular_rank, is_featured, top_places
) VALUES
('georgia', 'Gürcüstan', 'Georgia', 'Грузия', '🇬🇪',
 'asia', 'Tbilisi', 'GEL', 'Lari', 'Gürcü', 3700000, 'UTC+4', '+995',
 ARRAY['may','jun','sep','oct'], 'moderate', 60, 50, 40,
 '1558618042-1df3218d9671', 'Tbilisi köhnə şəhər',
 ARRAY['1558618042-1df3218d9671','1565008722409-6f77f4cfe49e','1587474534-8da3e3fe2fac'],
 ARRAY['cBXp_O0P4I0','NazInfxvkrA','V6P08x0Y3EE'],
 ARRAY['Tbilisi gəzintisi 2024','Gürcüstanda şərab turu','Kazbegi dağları'],
 'Qədim kilsələr, dağ mənzərəsi, dünyaca məşhur şərab və mehribanlıq.',
 'Ancient churches, mountain scenery, world-famous wine and hospitality.',
 'Древние церкви, горные пейзажи, знаменитое вино и гостеприимство.',
 'safe', false, 9, true,
 '[{"name":"Tbilisi Köhnə Şəhər","desc":"Orta əsr məhəllələri","photo_id":"1558618042-1df3218d9671","lat":41.6894,"lng":44.7990,"category":"landmark"},{"name":"Kazbegi","desc":"Gergeti kilsəsi — Qafqaz zirvəsində","photo_id":"1587474534-8da3e3fe2fac","lat":42.6667,"lng":44.6500,"category":"nature"}]'::jsonb
),
('russia', 'Rusiya', 'Russia', 'Россия', '🇷🇺',
 'europe', 'Moskva', 'RUB', 'Rubl', 'Rus', 144000000, 'UTC+3', '+7',
 ARRAY['jun','jul','aug'], 'cold', 200, 80, 60,
 '1513635269975-59663e0ac1ad', 'Moskva Qırmızı Meydan',
 ARRAY['1513635269975-59663e0ac1ad','1520106212299-9c7d0a3e3b24','1559131161-37e2e6a7d2b6'],
 ARRAY['GvVc0DJ__Qs','q8VDgyPOJ7g','Mgpxx9YVTvA'],
 ARRAY['Moscow travel 2024','Sankt-Peterburq gəzintisi','Trans-Sibir dəmir yolu'],
 'Qırmızı meydan, Kreml, Sankt-Peterburq sarayları — nəhəng ölkə.',
 'Red Square, Kremlin, St. Petersburg palaces — a vast country.',
 'Красная площадь, Кремль, дворцы Санкт-Петербурга — огромная страна.',
 'caution', false, 12, false,
 '[{"name":"Qırmızı Meydan","desc":"Moskvanın ürəyi","photo_id":"1513635269975-59663e0ac1ad","lat":55.7539,"lng":37.6208,"category":"landmark"},{"name":"Ermitaj","desc":"Dünyanın ən böyük sənət kolleksiyası","photo_id":"1520106212299-9c7d0a3e3b24","lat":59.9398,"lng":30.3146,"category":"museum"}]'::jsonb
),
('iran', 'İran', 'Iran', 'Иран', '🇮🇷',
 'asia', 'Tehran', 'IRR', 'Rial', 'Fars', 87000000, 'UTC+3:30', '+98',
 ARRAY['mar','apr','may','sep','oct','nov'], 'desert', 150, 30, 40,
 '1564502951597-647c46e78e76', 'İsfahan Məscid',
 ARRAY['1564502951597-647c46e78e76','1580674684029-7a61b5b3e9da','1539020059694-1ef0e71b1e8e'],
 ARRAY['V3y6AxdUvY8','Sy2xHWxO3gE','liRvJzJcGzc'],
 ARRAY['İsfahan travel 2024','İranın gizli gözəllikləri','Tehran city guide'],
 'İsfahanın mavi məscidləri, qədim fars mədəniyyəti və mehriban insanlar.',
 'Blue mosques of Isfahan, ancient Persian culture and welcoming people.',
 'Голубые мечети Исфахана, древняя персидская культура и гостеприимство.',
 'caution', false, 11, false,
 '[{"name":"İsfahan Məscidi","desc":"İslam memarlığının incisi","photo_id":"1564502951597-647c46e78e76","lat":32.6572,"lng":51.6776,"category":"landmark"},{"name":"Persepolis","desc":"Qədim Fars imperiyası","photo_id":"1539020059694-1ef0e71b1e8e","lat":29.9352,"lng":52.8914,"category":"landmark"}]'::jsonb
),
('uk', 'İngiltərə', 'United Kingdom', 'Великобритания', '🇬🇧',
 'europe', 'London', 'GBP', 'Funt Sterlinq', 'İngilis', 67000000, 'UTC+0', '+44',
 ARRAY['jun','jul','aug'], 'moderate', 350, 180, 130,
 '1513635269975-59663e0ac1ad', 'London Big Ben',
 ARRAY['1513635269975-59663e0ac1ad','1508006285622-3a25b0f2a5e7','1529651736084-3a0d1f7d24e8'],
 ARRAY['_8pMsGOGzmM','45q_4PEvRoc','Xx5RmJkhjrY'],
 ARRAY['London travel 2024','Edinburgh Scotland guide','UK road trip'],
 'London, Big Ben, Tower Bridge — tarixi və müasirliyin birləşməsi.',
 'London, Big Ben, Tower Bridge — where history meets modernity.',
 'Лондон, Биг-Бен, Тауэрский мост — история встречает современность.',
 'safe', true, 15, false,
 '[{"name":"Big Ben","desc":"Londonun ikonik saat qülləsi","photo_id":"1513635269975-59663e0ac1ad","lat":51.5007,"lng":-0.1246,"category":"landmark"},{"name":"Tower Bridge","desc":"Londonun simvolik körpüsü","photo_id":"1508006285622-3a25b0f2a5e7","lat":51.5055,"lng":-0.0754,"category":"landmark"}]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name_az = EXCLUDED.name_az, name_en = EXCLUDED.name_en, name_ru = EXCLUDED.name_ru,
  flag_emoji = EXCLUDED.flag_emoji,
  continent = EXCLUDED.continent, capital = EXCLUDED.capital,
  currency = EXCLUDED.currency, currency_name = EXCLUDED.currency_name,
  language = EXCLUDED.language, population = EXCLUDED.population,
  timezone = EXCLUDED.timezone, calling_code = EXCLUDED.calling_code,
  best_months = EXCLUDED.best_months, climate_type = EXCLUDED.climate_type,
  avg_flight_azn = EXCLUDED.avg_flight_azn, avg_hotel_azn = EXCLUDED.avg_hotel_azn,
  avg_daily_azn = EXCLUDED.avg_daily_azn,
  cover_photo_id = EXCLUDED.cover_photo_id, cover_photo_alt = EXCLUDED.cover_photo_alt,
  gallery_ids = EXCLUDED.gallery_ids, youtube_ids = EXCLUDED.youtube_ids,
  youtube_titles = EXCLUDED.youtube_titles,
  short_desc = EXCLUDED.short_desc, short_desc_en = EXCLUDED.short_desc_en,
  short_desc_ru = EXCLUDED.short_desc_ru,
  safety_level = EXCLUDED.safety_level, visa_required = EXCLUDED.visa_required,
  popular_rank = EXCLUDED.popular_rank, is_featured = EXCLUDED.is_featured,
  top_places = EXCLUDED.top_places;

-- HİSSƏ 4-8: Qalan 20 ölkə (ON CONFLICT DO NOTHING)
INSERT INTO countries (slug, name_az, name_en, name_ru, flag_emoji, continent, capital, currency, currency_name, language, population, timezone, calling_code, best_months, climate_type, avg_flight_azn, avg_hotel_azn, avg_daily_azn, cover_photo_id, cover_photo_alt, gallery_ids, youtube_ids, youtube_titles, short_desc, short_desc_en, short_desc_ru, safety_level, visa_required, popular_rank, is_featured, top_places) VALUES
('spain','İspaniya','Spain','Испания','🇪🇸','europe','Madrid','EUR','Avro','İspan',47000000,'UTC+1','+34',ARRAY['apr','may','sep','oct'],'moderate',310,120,100,'1583422409516-2895a77efded','Barselona',ARRAY['1583422409516-2895a77efded','1533106958-ba7f6e1e76ac','1560012065-6db42c82f55a'],ARRAY['n9JfmHIxpnk','YLuJVxlz8WA','KGqiO2BvxRo'],ARRAY['Barselona 2024','Madrid gəzintisi','Andalusiya'],'Flamenco, Barselona, günəşli sahillər və tapas.','Flamenco, Barcelona, sunny beaches and tapas.','Фламенко, Барселона, солнечные пляжи и тапас.','safe',true,5,true,'[{"name":"Sagrada Familia","desc":"Gaudinin şah əsəri","photo_id":"1583422409516-2895a77efded","lat":41.40,"lng":2.17,"category":"landmark"},{"name":"Əlhambra","desc":"Moor sarayı","photo_id":"1560012065-6db42c82f55a","lat":37.18,"lng":-3.59,"category":"landmark"}]'::jsonb),
('japan','Yaponiya','Japan','Япония','🇯🇵','asia','Tokyo','JPY','Yapon Yeni','Yapon',125000000,'UTC+9','+81',ARRAY['mar','apr','may','oct','nov'],'moderate',650,140,100,'1540959733-398f90b4a5c2','Tokyo',ARRAY['1540959733-398f90b4a5c2','1493976040564-d403f7696e15','1545044879-11ba7b0c5b8d'],ARRAY['pWI6RoHf2T8','4M_3LJ0R2TU','IPM9tJGp3Oo'],ARRAY['Tokyo 2024','Kioto gəzintisi','Sakura mövsümü'],'Sakura, samuray tarixi, ultramodern texnologiya.','Cherry blossoms, samurai history, ultra-modern tech.','Сакура, история самураев, ультрасовременные технологии.','safe',true,6,true,'[{"name":"Tokio","desc":"Neon işıqları şəhəri","photo_id":"1540959733-398f90b4a5c2","lat":35.68,"lng":139.65,"category":"landmark"},{"name":"Fuji","desc":"3776m simvol","photo_id":"1493976040564-d403f7696e15","lat":35.36,"lng":138.73,"category":"nature"}]'::jsonb),
('germany','Almaniya','Germany','Германия','🇩🇪','europe','Berlin','EUR','Avro','Alman',83200000,'UTC+1','+49',ARRAY['may','jun','jul','aug','sep'],'moderate',300,120,90,'1467269204565-85d97ab5b067','Berlin',ARRAY['1467269204565-85d97ab5b067','1554072577-87e8b6e86b4e','1540959733-398f90b4a5c2'],ARRAY['KxoEqAOxjGc','T3G7LE2Jllk','IbJdlS7REAM'],ARRAY['Berlin 2024','Oktoberfest','Neuschwanstein'],'Oktoberfest, nağıl şatoları, müasir sənət.','Oktoberfest, romantic castles, modern art.','Октоберфест, романтичные замки, современное искусство.','safe',true,7,false,'[{"name":"Brandenburg Qapısı","desc":"Birləşmə simvolu","photo_id":"1467269204565-85d97ab5b067","lat":52.52,"lng":13.38,"category":"landmark"},{"name":"Neuschwanstein","desc":"Nağıl şatosu","photo_id":"1540959733-398f90b4a5c2","lat":47.56,"lng":10.75,"category":"landmark"}]'::jsonb),
('thailand','Tailand','Thailand','Таиланд','🇹🇭','asia','Bangkok','THB','Bat','Tay',70000000,'UTC+7','+66',ARRAY['nov','dec','jan','feb','mar'],'tropical',400,60,50,'1552465426191-7e4b0ca03cd3','Tailand məbəd',ARRAY['1552465426191-7e4b0ca03cd3','1528459809937-25f1635be507','1505769040-a52e0b98b04d'],ARRAY['jNxDbjKxFiM','9v3_rBTDX8Q','NKlNG2hFq-o'],ARRAY['Bangkok 2024','Phuket plajları','Tayland 1 həftə'],'Qızıl məbədlər, tropik plajlar, street food.','Golden temples, tropical beaches, street food.','Золотые храмы, тропические пляжи, уличная еда.','safe',true,8,true,'[{"name":"Qran Saray","desc":"Kral sarayı","photo_id":"1552465426191-7e4b0ca03cd3","lat":13.75,"lng":100.49,"category":"landmark"},{"name":"Phuket","desc":"Kristal dəniz","photo_id":"1528459809937-25f1635be507","lat":7.88,"lng":98.39,"category":"nature"}]'::jsonb),
('greece','Yunanıstan','Greece','Греция','🇬🇷','europe','Afina','EUR','Avro','Yunan',10700000,'UTC+2','+30',ARRAY['may','jun','sep','oct'],'moderate',280,100,80,'1533580304916-cc1ba1040e62','Santorini',ARRAY['1533580304916-cc1ba1040e62','1516483107680-cf12f4bb3a06','1555993539-89c92082-f6aa'],ARRAY['Kla2JiqIGxM','RfFcrqR7MFc','K-6CcoBc7YE'],ARRAY['Santorini 2024','Afina turlar','Yunan adaları'],'Mavi günbəzlər, antik məbədlər, Egey dənizi.','Blue domes, ancient temples, Aegean Sea.','Синие купола, античные храмы, Эгейское море.','safe',true,10,true,'[{"name":"Santorini","desc":"Ağ-mavi evlər","photo_id":"1533580304916-cc1ba1040e62","lat":36.39,"lng":25.46,"category":"landmark"},{"name":"Akropol","desc":"Parfenon","photo_id":"1516483107680-cf12f4bb3a06","lat":37.97,"lng":23.73,"category":"landmark"}]'::jsonb),
('netherlands','Niderland','Netherlands','Нидерланды','🇳🇱','europe','Amsterdam','EUR','Avro','Holland',17900000,'UTC+1','+31',ARRAY['apr','may','jun','jul'],'moderate',290,130,95,'1534430248-9c8e31e38789','Amsterdam',ARRAY['1534430248-9c8e31e38789','1576085448-c1c3dafeed0a','1533086064-6a7c0bd40024'],ARRAY['D4vLBBz0mxM','qRzALLFYy0E','Q5BfTTFqQ3M'],ARRAY['Amsterdam 2024','Lale tarlaları','Velosiped turu'],'Kanallar, lale tarlaları, Rembrant.','Canals, tulip fields, Rembrandt.','Каналы, тюльпаны, Рембрандт.','safe',true,13,false,'[{"name":"Amsterdam kanalları","desc":"17-ci əsr kanal şəhəri","photo_id":"1534430248-9c8e31e38789","lat":52.37,"lng":4.90,"category":"landmark"},{"name":"Keukenhof","desc":"Lale bağçası","photo_id":"1576085448-c1c3dafeed0a","lat":52.27,"lng":4.55,"category":"nature"}]'::jsonb),
('portugal','Portuqaliya','Portugal','Португалия','🇵🇹','europe','Lissabon','EUR','Avro','Portuqal',10300000,'UTC+0','+351',ARRAY['apr','may','jun','sep','oct'],'moderate',280,100,75,'1555881772637-7aedc0a7a35b','Lissabon tramvay',ARRAY['1555881772637-7aedc0a7a35b','1537213447-bdeb5c5a3fb5','1536663445012-7a0c4db79cc0'],ARRAY['gfh1KZBjHvM','eMGOQFy79gQ','Z_2DdgCCzxY'],ARRAY['Lisbon 2024','Porto şərab','Algarve'],'Sarı tramvaylar, fado, Porto şərabı.','Yellow trams, fado, Porto wine.','Жёлтые трамваи, фадо, вино Порто.','safe',true,16,false,'[{"name":"Alfama","desc":"Tarixi məhəllə","photo_id":"1555881772637-7aedc0a7a35b","lat":38.71,"lng":-9.13,"category":"landmark"},{"name":"Sintra","desc":"Nağıl şatoları","photo_id":"1537213447-bdeb5c5a3fb5","lat":38.80,"lng":-9.39,"category":"landmark"}]'::jsonb),
('maldives','Maldiv','Maldives','Мальдивы','🇲🇻','asia','Male','MVR','Rufiya','Divehi',530000,'UTC+5','+960',ARRAY['nov','dec','jan','feb','mar','apr'],'tropical',700,500,200,'1514897022948-7f27b39a8b28','Maldiv bungalovlar',ARRAY['1514897022948-7f27b39a8b28','1540202156-6ef68fb48b74','1553786319-c8a7c83e0a64'],ARRAY['T7yiFX8eTF0','LqhBHGrIqMk','PBiThXS0kHQ'],ARRAY['Maldives 2024','Underwater restaurant','Honeymoon'],'Kristal su, bungalovlar, rifləri — cənnət.','Crystal water, bungalows, coral reefs.','Кристальная вода, бунгало, коралловые рифы.','safe',true,14,true,'[{"name":"Su Bungalovları","desc":"Okean içində","photo_id":"1514897022948-7f27b39a8b28","lat":4.18,"lng":73.51,"category":"nature"}]'::jsonb),
('bali','Bali (İndoneziya)','Bali (Indonesia)','Бали (Индонезия)','🇮🇩','asia','Denpasar','IDR','Rupiya','İndoneziya',4200000,'UTC+8','+62',ARRAY['apr','may','jun','jul','aug','sep'],'tropical',450,70,45,'1537996804304-a03bb73ecca7','Bali düyü tarlaları',ARRAY['1537996804304-a03bb73ecca7','1518544810-a2b9a4d4d9f4','1554073357-98e1d64da40f'],ARRAY['kP7kh3VLMlo','bJ1ry2aWKE4','uyJ_SL8ydTI'],ARRAY['Bali 2024','Ubud ricefield','Tanah Lot'],'Düyü tarlaları, hindu məbədləri, surf.','Rice terraces, Hindu temples, surf.','Рисовые террасы, храмы, сёрф.','safe',true,17,true,'[{"name":"Tegalalang","desc":"Sehrli mənzərə","photo_id":"1537996804304-a03bb73ecca7","lat":-8.43,"lng":115.28,"category":"nature"},{"name":"Tanah Lot","desc":"Dənizdəki məbəd","photo_id":"1554073357-98e1d64da40f","lat":-8.62,"lng":115.09,"category":"landmark"}]'::jsonb),
('morocco','Mərakeş','Morocco','Марокко','🇲🇦','africa','Rabat','MAD','Dirhəm','Ərəb',37000000,'UTC+1','+212',ARRAY['mar','apr','oct','nov'],'moderate',250,70,50,'1539020059694-1ef0e71b1e8e','Mərakeş',ARRAY['1539020059694-1ef0e71b1e8e','1548071847-3f45f3d3ca4b','1553777208-c6f1aa4a6b6a'],ARRAY['VV_P4p5BZTY','q7Rlq4MOD3o','A4S6hXf4L8M'],ARRAY['Mərakeş 2024','Sahara','Fes Medina'],'Rəngarəng bazarlar, Sahara, ərəb memarlığı.','Colorful bazaars, Sahara, Arab architecture.','Красочные базары, Сахара, арабская архитектура.','safe',true,20,false,'[{"name":"Medina","desc":"Rəngarəng bazarlar","photo_id":"1539020059694-1ef0e71b1e8e","lat":31.63,"lng":-7.98,"category":"landmark"},{"name":"Şefşauen","desc":"Mavi şəhər","photo_id":"1553777208-c6f1aa4a6b6a","lat":35.17,"lng":-5.26,"category":"landmark"}]'::jsonb),
('canada','Kanada','Canada','Канада','🇨🇦','americas','Ottava','CAD','Kanada Dolları','İngilis/Fransız',38000000,'UTC-5','+1',ARRAY['jun','jul','aug','sep'],'cold',600,150,110,'1503614937-fc98e9d4b898','Niagra',ARRAY['1503614937-fc98e9d4b898','1441155877620-a9d3e9b8e5c2','1508193638-2b5ce5c17ce0'],ARRAY['lFDlFjJOlS8','hKnVlUBEVG4','pqrLyZpQEPc'],ARRAY['Canada 2024','Niagara Falls','Banff Park'],'Niagra, Banff, çoxmədəniyyətli şəhərlər.','Niagara Falls, Banff, multicultural cities.','Ниагара, Банф, многокультурные города.','safe',true,18,false,'[{"name":"Niagra","desc":"Ən məşhur şəlalə","photo_id":"1503614937-fc98e9d4b898","lat":43.10,"lng":-79.04,"category":"nature"},{"name":"Banff","desc":"Rocky dağları","photo_id":"1441155877620-a9d3e9b8e5c2","lat":51.18,"lng":-115.57,"category":"nature"}]'::jsonb),
('australia','Avstraliya','Australia','Австралия','🇦🇺','oceania','Kanberra','AUD','Avstraliya Dolları','İngilis',26000000,'UTC+10','+61',ARRAY['sep','oct','nov','dec','jan','feb'],'moderate',900,150,120,'1506973022534-a89f7d29fc4b','Sydney Opera',ARRAY['1506973022534-a89f7d29fc4b','1494658536872-86bc06a5f6b7','1508784400-e47be1e8e9a4'],ARRAY['c74e7bkGWvU','wvhT-RQFN9s','viqo6qMM8c4'],ARRAY['Sydney 2024','Great Barrier Reef','Uluru'],'Sydney Opera, Böyük Maneə Rifi, kenqurular.','Sydney Opera, Great Barrier Reef, kangaroos.','Сиднейская опера, Барьерный риф, кенгуру.','safe',true,19,false,'[{"name":"Sydney Opera","desc":"Memarlıq ikonu","photo_id":"1506973022534-a89f7d29fc4b","lat":-33.86,"lng":151.22,"category":"landmark"},{"name":"Böyük Maneə Rifi","desc":"Ən böyük mərcan rifi","photo_id":"1494658536872-86bc06a5f6b7","lat":-18.29,"lng":147.70,"category":"nature"}]'::jsonb),
('brazil','Braziliya','Brazil','Бразилия','🇧🇷','americas','Braziliya şəhəri','BRL','Real','Portuqal',215000000,'UTC-3','+55',ARRAY['apr','may','jun','aug','sep'],'tropical',550,80,60,'1483133391-6d1d8f72a7ef','Rio',ARRAY['1483133391-6d1d8f72a7ef','1534447954-ab88eb9c7d21','1464820702-bc69ad3ef4c6'],ARRAY['e6Paw_FMLE8','eEevNuWPH30','2Oe3rjOhwW8'],ARRAY['Rio 2024','Amazon tour','Iguazu Falls'],'Karneval, Amazon, İquaçu şəlaləsi.','Carnival, Amazon, Iguazu Falls.','Карнавал, Амазонка, водопад Игуасу.','caution',true,22,false,'[{"name":"Rio Karnavalı","desc":"Ən böyük festival","photo_id":"1483133391-6d1d8f72a7ef","lat":-22.91,"lng":-43.17,"category":"landmark"},{"name":"İquaçu","desc":"Ən geniş şəlalə","photo_id":"1464820702-bc69ad3ef4c6","lat":-25.70,"lng":-54.44,"category":"nature"}]'::jsonb),
('india','Hindistan','India','Индия','🇮🇳','asia','Yeni Delhi','INR','Rupi','Hindi',1400000000,'UTC+5:30','+91',ARRAY['oct','nov','dec','jan','feb','mar'],'tropical',380,60,40,'1524230900021-e8e69c7b8327','Tac Mahal',ARRAY['1524230900021-e8e69c7b8327','1538168916-8cd2b5f5f6da','1545243267-3c89d8c0625c'],ARRAY['CHV26LFnkwk','FMiOjg97FtQ','jyAfI8HDNTQ'],ARRAY['India 2024','Tac Mahal','Holi festival'],'Tac Mahal, Holi, Himalaya.','Taj Mahal, Holi, Himalayas.','Тадж-Махал, Холи, Гималаи.','caution',true,21,false,'[{"name":"Tac Mahal","desc":"Sevginin abidəsi","photo_id":"1524230900021-e8e69c7b8327","lat":27.18,"lng":78.04,"category":"landmark"},{"name":"Jaipur","desc":"Çəhrayı şəhər","photo_id":"1538168916-8cd2b5f5f6da","lat":26.91,"lng":75.79,"category":"landmark"}]'::jsonb),
('south-korea','Cənubi Koreya','South Korea','Южная Корея','🇰🇷','asia','Seul','KRW','Von','Koreyalı',51700000,'UTC+9','+82',ARRAY['apr','may','sep','oct'],'moderate',550,90,70,'1517154421773-0529f29ea451','Seul',ARRAY['1517154421773-0529f29ea451','1558618042-1df3218d9671','1531058495-abb7cbfe-9f67'],ARRAY['9bkSHhZgHhA','etTkAzBBqUI','_uq4S9bS3fo'],ARRAY['Seoul 2024','K-pop tour','Jeju Island'],'K-pop, K-drama, kimçi, son texnologiya.','K-pop, K-drama, kimchi, cutting-edge tech.','К-поп, кимчи, технологии.','safe',true,23,false,'[{"name":"Qyonqbokqun","desc":"Joseon sarayı","photo_id":"1558618042-1df3218d9671","lat":37.58,"lng":126.98,"category":"landmark"},{"name":"Ceyu","desc":"Tropik cənnət","photo_id":"1531058495-abb7cbfe-9f67","lat":33.50,"lng":126.53,"category":"nature"}]'::jsonb),
('china','Çin','China','Китай','🇨🇳','asia','Pekin','CNY','Yuan','Çin',1400000000,'UTC+8','+86',ARRAY['apr','may','sep','oct'],'moderate',500,80,60,'1508804185872-d7badc2832b8','Böyük Sədd',ARRAY['1508804185872-d7badc2832b8','1503614937-fc98e9d4b898','1524985318-beeb0da93395'],ARRAY['u2UlnE7sAkE','E4h6JOvHaPs','RlWPZKpwCXc'],ARRAY['China 2024','Shanghai','Terracotta Army'],'Böyük Sədd, Terrakota, Şanxay.','Great Wall, Terracotta Army, Shanghai.','Великая стена, терракотовое войско, Шанхай.','safe',true,24,false,'[{"name":"Böyük Sədd","desc":"7 möcüzədən biri","photo_id":"1508804185872-d7badc2832b8","lat":40.43,"lng":116.57,"category":"landmark"},{"name":"Terrakota","desc":"8000 heykəllik ordu","photo_id":"1524985318-beeb0da93395","lat":34.38,"lng":109.27,"category":"landmark"}]'::jsonb),
('singapore','Sinqapur','Singapore','Сингапур','🇸🇬','asia','Sinqapur','SGD','Sinqapur Dolları','Malay/İngilis',5900000,'UTC+8','+65',ARRAY['feb','mar','apr','jul','aug'],'tropical',500,180,120,'1538485880098-cf0b28c2d3cb','Marina Bay',ARRAY['1538485880098-cf0b28c2d3cb','1562646740-2a931f01826e','1524985318-beeb0da93395'],ARRAY['mW4CWL7EIPA','bRhQ4Mx-iCE','wBIKMKEBWiE'],ARRAY['Singapore 2024','Gardens by the Bay','Food hawker'],'Futuristik bağlar, street food, nizam.','Futuristic gardens, street food, order.','Футуристические сады, стритфуд, порядок.','safe',true,25,false,'[{"name":"Marina Bay","desc":"İkonik üç qüllə","photo_id":"1538485880098-cf0b28c2d3cb","lat":1.28,"lng":103.86,"category":"landmark"},{"name":"Gardens by the Bay","desc":"Süni ağaclar","photo_id":"1562646740-2a931f01826e","lat":1.28,"lng":103.86,"category":"nature"}]'::jsonb),
('switzerland','İsveçrə','Switzerland','Швейцария','🇨🇭','europe','Bern','CHF','Frank','Alman/Fransız',8700000,'UTC+1','+41',ARRAY['jun','jul','dec','jan'],'cold',350,200,150,'1530122037265-a5f1f91d3b99','Alp dağları',ARRAY['1530122037265-a5f1f91d3b99','1553777208-c6f1aa4a6b6a','1507003236-96dfba2a2b8e'],ARRAY['FsI-7zPW1fY','Q_X9zaCHv5Q','dFfyQVl8N_0'],ARRAY['Switzerland 2024','Interlaken','Swiss Alps'],'Alp dağları, şokolad, saatlar, Luzern.','Alps, chocolate, watches, Lake Lucerne.','Альпы, шоколад, часы, озеро Люцерн.','safe',true,26,false,'[{"name":"Cungfrau","desc":"Alp zirvəsi 3466m","photo_id":"1530122037265-a5f1f91d3b99","lat":46.54,"lng":7.96,"category":"nature"},{"name":"Luzern","desc":"Köhnə körpü","photo_id":"1553777208-c6f1aa4a6b6a","lat":47.05,"lng":8.31,"category":"landmark"}]'::jsonb),
('norway','Norveç','Norway','Норвегия','🇳🇴','europe','Oslo','NOK','Krona','Norveç',5400000,'UTC+1','+47',ARRAY['jun','jul','aug'],'cold',400,180,130,'1520769669658-f07657f5a5f1e','Fiordlar',ARRAY['1520769669658-f07657f5a5f1e','1516750593-d1ea7aec0df3','1506973022534-a89f7d29fc4b'],ARRAY['fkAQbDxjYRI','gGnv4JsZGCk','pnvAEWnMf5g'],ARRAY['Norway 2024','Northern lights','Bergen'],'Fiordlar, şimal işıqları, viking tarixi.','Fjords, northern lights, Viking history.','Фьорды, северное сияние, история викингов.','safe',true,27,false,'[{"name":"Geyranqer","desc":"Ən gözəl fiordlar","photo_id":"1520769669658-f07657f5a5f1e","lat":62.10,"lng":7.10,"category":"nature"},{"name":"Şimal İşıqları","desc":"Aurora Borealis","photo_id":"1516750593-d1ea7aec0df3","lat":69.65,"lng":18.96,"category":"nature"}]'::jsonb),
('iceland','İslandiya','Iceland','Исландия','🇮🇸','europe','Reykjavik','ISK','Kron','İsland',370000,'UTC+0','+354',ARRAY['jun','jul','aug','dec','jan'],'cold',500,150,120,'1504829857797-ddff29c27927','İslandiya şəlalə',ARRAY['1504829857797-ddff29c27927','1476672962716-2efa5667a3e8','1506973022534-a89f7d29fc4b'],ARRAY['9TmjXgGMIGg','dFWGZkBT0YY','Z-aFe3B-FgQ'],ARRAY['Iceland 2024','Reykjavik','Golden Circle'],'Şimal işıqları, geyzerlər, qara plajlar.','Northern lights, geysers, black beaches.','Северное сияние, гейзеры, чёрные пляжи.','safe',true,28,false,'[{"name":"Gullföss","desc":"Qızıl şəlalə","photo_id":"1504829857797-ddff29c27927","lat":64.33,"lng":-20.12,"category":"nature"},{"name":"Mavi Göl","desc":"Geotermal spa","photo_id":"1476672962716-2efa5667a3e8","lat":63.88,"lng":-22.45,"category":"nature"}]'::jsonb),
('mexico','Meksika','Mexico','Мексика','🇲🇽','americas','Mexiko','MXN','Peso','İspan',130000000,'UTC-6','+52',ARRAY['nov','dec','jan','feb','mar'],'tropical',500,70,50,'1518638150340-f706e86654de','Çiçen İtsa',ARRAY['1518638150340-f706e86654de','1508006285622-3a25b0f2a5e7','1513635269975-59663e0ac1ad'],ARRAY['oG7RMlXTCzE','Vv5TPTK7SKg','7eP9hS_GMHQ'],ARRAY['Mexico 2024','Cancun','Chichen Itza'],'Maya sivilizasiyası, Kankun, tequila.','Maya civilization, Cancun, tequila.','Цивилизация майя, Канкун, текила.','caution',true,29,false,'[{"name":"Çiçen İtsa","desc":"Maya piramidası","photo_id":"1518638150340-f706e86654de","lat":20.68,"lng":-88.57,"category":"landmark"},{"name":"Kankon","desc":"Karib plajları","photo_id":"1508006285622-3a25b0f2a5e7","lat":21.16,"lng":-86.85,"category":"nature"}]'::jsonb),
('czech-republic','Çexiya','Czech Republic','Чехия','🇨🇿','europe','Praqa','CZK','Koruna','Çex',10900000,'UTC+1','+420',ARRAY['may','jun','jul','aug','sep'],'moderate',240,80,65,'1541849546-216549ae216d','Praqa',ARRAY['1541849546-216549ae216d','1516483107680-cf12f4bb3a06','1506973022534-a89f7d29fc4b'],ARRAY['t0wMuLDfbRo','dVQjGMwt1aA','xH-1EVB9GYU'],ARRAY['Prague 2024','Český Krumlov','Praqa pivə'],'Orta əsr Praqa, gotik katedrallar, pivə.','Medieval Prague, Gothic cathedrals, beer.','Средневековая Прага, готика, пиво.','safe',true,30,false,'[{"name":"Karlov Körpüsü","desc":"Gotik körpü","photo_id":"1541849546-216549ae216d","lat":50.09,"lng":14.41,"category":"landmark"},{"name":"Praqa Qalası","desc":"Ən böyük qala","photo_id":"1516483107680-cf12f4bb3a06","lat":50.09,"lng":14.40,"category":"landmark"}]'::jsonb),
('austria','Avstriya','Austria','Австрия','🇦🇹','europe','Vyana','EUR','Avro','Alman',9100000,'UTC+1','+43',ARRAY['dec','jan','feb','jun','jul'],'moderate',270,130,95,'1516550893923-42d28e5677af','Vyana saray',ARRAY['1516550893923-42d28e5677af','1529777985-17ac5a8c-c9a0','1506973022534-a89f7d29fc4b'],ARRAY['G4tHhFpEaRQ','xwYvvE3NTBE','_eaRWKzQnyk'],ARRAY['Vienna 2024','Salzburg Mozart','Alps skiing'],'Vyana operası, Şönbrunn, Salzburg.','Vienna Opera, Schönbrunn, Salzburg.','Венская опера, Шёнбрунн, Зальцбург.','safe',true,31,false,'[{"name":"Şönbrunn","desc":"Habsburq sarayı","photo_id":"1516550893923-42d28e5677af","lat":48.18,"lng":16.31,"category":"landmark"},{"name":"Salzburg","desc":"Motsart şəhəri","photo_id":"1529777985-17ac5a8c-c9a0","lat":47.81,"lng":13.06,"category":"landmark"}]'::jsonb),
('new-zealand','Yeni Zelandiya','New Zealand','Новая Зеландия','🇳🇿','oceania','Wellington','NZD','NZ Dolları','İngilis/Maori',5100000,'UTC+12','+64',ARRAY['dec','jan','feb','mar'],'moderate',950,110,90,'1469854523086-cc02d5ab4582','Hobbiton',ARRAY['1469854523086-cc02d5ab4582','1506973022534-a89f7d29fc4b','1558618042-1df3218d9671'],ARRAY['H6HYGT_K_JY','lw5UiGiR5bI','cJEWiuYHFdQ'],ARRAY['New Zealand 2024','Hobbiton tour','Milford Sound'],'Hobbiton, fiordlar, bungee, maori.','Hobbiton, fjords, bungee, Maori culture.','Хоббитон, фьорды, банджи, культура маори.','safe',true,32,false,'[{"name":"Hobbiton","desc":"LOTR çəkiliş yeri","photo_id":"1469854523086-cc02d5ab4582","lat":-37.86,"lng":175.68,"category":"landmark"},{"name":"Milford Sound","desc":"8-ci möcüzə","photo_id":"1558618042-1df3218d9671","lat":-44.67,"lng":167.93,"category":"nature"}]'::jsonb)
ON CONFLICT (slug) DO NOTHING;
