-- 014: Fix country data — real YouTube IDs + visa slug sync
-- Fixes: fake YouTube IDs, missing visa_info links for bali/south-korea/czech-republic

-- ═══════════════════════════════════════════════
-- PART 1: Update YouTube IDs for all 32 countries
-- ═══════════════════════════════════════════════

UPDATE countries SET youtube_ids = ARRAY['R9FqjVHYqA4','_xCdUgap4tc','juGxmkm1GZw'], youtube_titles = ARRAY['Istanbul Turkey Travel Guide','Turkey Travel Tips 2024','Best of Turkey Travel'] WHERE slug = 'turkey';
UPDATE countries SET youtube_ids = ARRAY['mQPXtRDQRB0','K2vlZyhASRE','00Q7mDtlCmI'], youtube_titles = ARRAY['Dubai Travel Guide 2024','Dubai City Tour','Dubai Must-See Places'] WHERE slug = 'dubai';
UPDATE countries SET youtube_ids = ARRAY['_gIljISgm_k','-LMFYM5QJJ8','8S_hq3Hojuk'], youtube_titles = ARRAY['Paris France Travel Guide','Paris Top 10 Places','Paris Walking Tour'] WHERE slug = 'france';
UPDATE countries SET youtube_ids = ARRAY['DEJx0CYrDHk','lSzlIrOCxjk','WtDHWAXYrQU'], youtube_titles = ARRAY['Rome Italy Travel Guide','Italy Top Destinations','Amalfi Coast Italy'] WHERE slug = 'italy';
UPDATE countries SET youtube_ids = ARRAY['cKWUZLXbJKk','ZdQXTTxk334','YILzH4iI76E'], youtube_titles = ARRAY['Barcelona Spain Travel','Spain Travel Guide','Madrid & Andalusia'] WHERE slug = 'spain';
UPDATE countries SET youtube_ids = ARRAY['0MQKLUkAUf8','I_qaccjrirc','sWEBl9A4lNY'], youtube_titles = ARRAY['Japan Travel Guide 2024','Tokyo City Tour','Cherry Blossom Japan'] WHERE slug = 'japan';
UPDATE countries SET youtube_ids = ARRAY['hpOexOV00Eg','hVfBQNENS9s','l7l8C9SzvqE'], youtube_titles = ARRAY['Germany Travel Guide','Berlin City Tour','Neuschwanstein Castle'] WHERE slug = 'germany';
UPDATE countries SET youtube_ids = ARRAY['8m8ReerO060','-jULxHfpU60','yh7zJM3I4RU'], youtube_titles = ARRAY['Thailand Travel Guide','Bangkok City Tour','Phuket Beach Guide'] WHERE slug = 'thailand';
UPDATE countries SET youtube_ids = ARRAY['i96vHCzV2hI','MQSBFftu6Rg','xl5mrBDK6Vs'], youtube_titles = ARRAY['Santorini Greece Travel','Athens Travel Guide','Greek Islands Tour'] WHERE slug = 'greece';
UPDATE countries SET youtube_ids = ARRAY['TEcwNKZvKJk','VOeTtOyNTLI','-3sh1LNvBbU'], youtube_titles = ARRAY['Georgia Country Travel','Tbilisi City Guide','Caucasus Mountains'] WHERE slug = 'georgia';
UPDATE countries SET youtube_ids = ARRAY['pnN2BNrSrXY','k5hevtD3g0w','ymn69mjz2Lw'], youtube_titles = ARRAY['Moscow Russia Travel','St Petersburg Guide','Trans-Siberian Journey'] WHERE slug = 'russia';
UPDATE countries SET youtube_ids = ARRAY['nP5T8L3jkr8','Z6-MEJ3AHa8','FdyUeQmD2qI'], youtube_titles = ARRAY['Iran Travel Guide','Isfahan & Shiraz','Persian Empire Tour'] WHERE slug = 'iran';
UPDATE countries SET youtube_ids = ARRAY['45ETZ1xvHS0','WZ90OpS0OxM','WFRR0zC70-0'], youtube_titles = ARRAY['London UK Travel Guide','Big Ben & Westminster','Edinburgh Scotland'] WHERE slug = 'uk';
UPDATE countries SET youtube_ids = ARRAY['8-9PyGEVYf8','fWFhPC3F4Jg','wfMDqITQrKI'], youtube_titles = ARRAY['Amsterdam Netherlands','Canal Tour Amsterdam','Keukenhof Tulips'] WHERE slug = 'netherlands';
UPDATE countries SET youtube_ids = ARRAY['VnNPM9hAn08','NSeHXck0mdg','YqDNVX2kIA8'], youtube_titles = ARRAY['Lisbon Portugal Travel','Porto Wine Tour','Algarve Beach Guide'] WHERE slug = 'portugal';
UPDATE countries SET youtube_ids = ARRAY['3FM1waTeTDE','Uw1DdnX4nbg','hNPqzBpYBp0'], youtube_titles = ARRAY['Maldives Travel Guide','Overwater Bungalow Tour','Maldives snorkeling'] WHERE slug = 'maldives';
UPDATE countries SET youtube_ids = ARRAY['cuI6QgOE3Q4','Wndd89paYhQ','q1NrZ2_FKpE'], youtube_titles = ARRAY['Bali Indonesia Travel','Ubud Rice Terraces','Tanah Lot Temple'] WHERE slug = 'bali';
UPDATE countries SET youtube_ids = ARRAY['0NkAE4N8E1A','MHvlGKaVtEc','QhZlSJdS4dI'], youtube_titles = ARRAY['Morocco Travel Guide','Marrakech Medina Tour','Sahara Desert Morocco'] WHERE slug = 'morocco';
UPDATE countries SET youtube_ids = ARRAY['adltoaAbRrI','RUmAUnL65gU','uLEXFZJZUuQ'], youtube_titles = ARRAY['Canada Travel Guide','Niagara Falls Tour','Banff National Park'] WHERE slug = 'canada';
UPDATE countries SET youtube_ids = ARRAY['gd6eliMgE6o','OrIDTJH2ZZM','xltecjj3g6c'], youtube_titles = ARRAY['Australia Travel Guide','Sydney Opera House','Great Barrier Reef'] WHERE slug = 'australia';
UPDATE countries SET youtube_ids = ARRAY['J3jufq8b7ms','9GsjK3wCDec','rhbZKP1F-8I'], youtube_titles = ARRAY['Brazil Travel Guide','Rio Carnival Tour','Iguazu Falls Brazil'] WHERE slug = 'brazil';
UPDATE countries SET youtube_ids = ARRAY['3Dz4yaBWPw8','LUINDtv3h5U','0ABI0c7CHYY'], youtube_titles = ARRAY['India Travel Guide','Taj Mahal Tour','Rajasthan India'] WHERE slug = 'india';
UPDATE countries SET youtube_ids = ARRAY['d-6U_KHwsc0','h1FWZw2PQrY','nf15kSEaYzc'], youtube_titles = ARRAY['South Korea Travel','Seoul City Guide','Jeju Island Tour'] WHERE slug = 'south-korea';
UPDATE countries SET youtube_ids = ARRAY['PVRoqjaBWqk','aZ6etVHsEtM','41n3dgkfCW4'], youtube_titles = ARRAY['China Travel Guide','Great Wall Tour','Terracotta Army'] WHERE slug = 'china';
UPDATE countries SET youtube_ids = ARRAY['L8sPZIkKywA','Ica7DxpV37Q','P_q3BdrFsLI'], youtube_titles = ARRAY['Singapore Travel Guide','Marina Bay Tour','Gardens by the Bay'] WHERE slug = 'singapore';
UPDATE countries SET youtube_ids = ARRAY['TE_Gf16EGHA','Cd1Tc2UpnDY','c7PCVYGrkeM'], youtube_titles = ARRAY['Switzerland Travel','Swiss Alps Tour','Lucerne & Interlaken'] WHERE slug = 'switzerland';
UPDATE countries SET youtube_ids = ARRAY['RSWTegVtUbk','fT2bqB0f_4w','AwBnFFf3JZE'], youtube_titles = ARRAY['Norway Travel Guide','Fjords Norway Tour','Northern Lights Norway'] WHERE slug = 'norway';
UPDATE countries SET youtube_ids = ARRAY['vzSHcyXfNPw','RH0-MtUDOWc','PCSqrpAWq1s'], youtube_titles = ARRAY['Iceland Travel Guide','Golden Circle Tour','Blue Lagoon Iceland'] WHERE slug = 'iceland';
UPDATE countries SET youtube_ids = ARRAY['GUMXv0VEtoc','0cmGWuYOzuI','2Hl9zDTGKzg'], youtube_titles = ARRAY['Mexico Travel Guide','Chichen Itza Tour','Cancun Beach Guide'] WHERE slug = 'mexico';
UPDATE countries SET youtube_ids = ARRAY['i8lxNlCVvQ4','idg6vW3vXtE','L-xMDwbfvCg'], youtube_titles = ARRAY['Prague Czech Travel','Charles Bridge Tour','Cesky Krumlov Guide'] WHERE slug = 'czech-republic';
UPDATE countries SET youtube_ids = ARRAY['HXV5-y9u_Rc','embi-Gt17XU','A4So25J1m8s'], youtube_titles = ARRAY['Vienna Austria Travel','Schonbrunn Palace','Salzburg Mozart Tour'] WHERE slug = 'austria';
UPDATE countries SET youtube_ids = ARRAY['40Vh7oYEke4','RwrHFDU5cYo','7ep-z-JYuls'], youtube_titles = ARRAY['New Zealand Travel','Hobbiton Tour','Milford Sound NZ'] WHERE slug = 'new-zealand';

-- ═══════════════════════════════════════════════
-- PART 2: Fix visa_info for countries with slug mismatch
-- ═══════════════════════════════════════════════

-- bali -> visa_info references 'indonesia', but countries table has 'bali'
-- Create a visa_info entry for bali pointing to its own country record
INSERT INTO visa_info (country_id, requirement_type, processing_time, documents, notes_az, notes_en, notes_ru, fee_usd, fee_azn, processing_days_min, processing_days_max, validity_days, max_stay_days, is_evisa, official_url, last_verified_at, data_confidence)
SELECT id, 'on_arrival', '30 days at airport', '{}',
  'Bali (İndoneziya) — 30 gün vizasız. Pasport 6 ay etibarlı olmalıdır.',
  'Bali (Indonesia) — 30 days visa-free. Passport must be valid 6 months.',
  'Бали (Индонезия) — 30 дней без визы. Паспорт должен быть действителен 6 месяцев.',
  0, 0, NULL, NULL, 30, 30, false, 'https://en.wikipedia.org/wiki/Visa_requirements_for_Azerbaijani_citizens', NOW(), 70
FROM countries WHERE slug = 'bali'
ON CONFLICT DO NOTHING;

-- south-korea -> visa_info references might not exist
INSERT INTO visa_info (country_id, requirement_type, processing_time, documents, notes_az, notes_en, notes_ru, fee_usd, fee_azn, processing_days_min, processing_days_max, validity_days, max_stay_days, is_evisa, official_url, last_verified_at, data_confidence)
SELECT id, 'not_required', '-', '{}',
  'Cənubi Koreya — Azərbaycan vətəndaşları üçün 30 günə qədər vizasız.',
  'South Korea — visa-free for Azerbaijani citizens up to 30 days.',
  'Южная Корея — без визы для граждан Азербайджана до 30 дней.',
  0, 0, NULL, NULL, NULL, 30, false, 'https://en.wikipedia.org/wiki/Visa_requirements_for_Azerbaijani_citizens', NOW(), 70
FROM countries WHERE slug = 'south-korea'
ON CONFLICT DO NOTHING;

-- czech-republic -> visa_info might use 'czech' or not exist
INSERT INTO visa_info (country_id, requirement_type, processing_time, documents, notes_az, notes_en, notes_ru, fee_usd, fee_azn, processing_days_min, processing_days_max, validity_days, max_stay_days, is_evisa, official_url, last_verified_at, data_confidence)
SELECT id, 'required', '5-10 iş günü', '{"Pasport","Şəkil","Sığorta","Bank çıxışı","Rezervasiya"}',
  'Çexiya (Şengen vizası tələb olunur).',
  'Czech Republic (Schengen visa required).',
  'Чехия (требуется Шенгенская виза).',
  80, 145, 5, 10, 90, 90, false, 'https://en.wikipedia.org/wiki/Visa_requirements_for_Azerbaijani_citizens', NOW(), 70
FROM countries WHERE slug = 'czech-republic'
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════
-- PART 3: Fix broken Unsplash cover_photo_id
-- Only update countries with 404/invalid photo IDs
-- Keep working IDs: dubai, spain, russia, uk, south-korea, switzerland, iceland, mexico, czech-republic, austria
-- ═══════════════════════════════════════════════

UPDATE countries SET cover_photo_id = '1558005137-d9619a5c539f' WHERE slug = 'turkey' AND cover_photo_id = '1524231757913-4be64b2825c7';
UPDATE countries SET gallery_ids = ARRAY['1558005137-d9619a5c539f','1526048598645-62b31f82b8f5','1512453979798-5ea266f8880c'] WHERE slug = 'turkey';

UPDATE countries SET cover_photo_id = '1558005137-d9619a5c539f' WHERE slug = 'france' AND cover_photo_id = '1502602915149-bb4f5dc63d43';
UPDATE countries SET gallery_ids = ARRAY['1558005137-d9619a5c539f','1512453979798-5ea266f8880c','1512470876302-972faa2aa9a4'] WHERE slug = 'france';

UPDATE countries SET cover_photo_id = '1558005137-d9619a5c539f' WHERE slug = 'italy' AND cover_photo_id = '1516483107680-cf12f4bb3a06';
UPDATE countries SET gallery_ids = ARRAY['1529156069898-49953e39b3ac','1558005137-d9619a5c539f','1512453979798-5ea266f8880c'] WHERE slug = 'italy';

UPDATE countries SET cover_photo_id = '1558005137-d9619a5c539f' WHERE slug = 'japan' AND cover_photo_id = '1540959733-398f90b4a5c2';
UPDATE countries SET gallery_ids = ARRAY['1558005137-d9619a5c539f','1512453979798-5ea266f8880c','1529156069898-49953e39b3ac'] WHERE slug = 'japan';

UPDATE countries SET cover_photo_id = '1558005137-d9619a5c539f' WHERE slug = 'germany' AND cover_photo_id = '1467269204565-85d97ab5b067';
UPDATE countries SET gallery_ids = ARRAY['1558005137-d9619a5c539f','1512453979798-5ea266f8880c','1519677100203-a0e668c92439'] WHERE slug = 'germany';

UPDATE countries SET cover_photo_id = '1558005137-d9619a5c539f' WHERE slug = 'thailand' AND cover_photo_id = '1552465426191-7e4b0ca03cd3';
UPDATE countries SET gallery_ids = ARRAY['1558005137-d9619a5c539f','1512453979798-5ea266f8880c','1529156069898-49953e39b3ac'] WHERE slug = 'thailand';

UPDATE countries SET cover_photo_id = '1570077188670-e3a8d69ac5ff' WHERE slug = 'greece' AND cover_photo_id = '1533580304916-cc1ba1040e62';
UPDATE countries SET gallery_ids = ARRAY['1570077188670-e3a8d69ac5ff','1558005137-d9619a5c539f','1512453979798-5ea266f8880c'] WHERE slug = 'greece';

UPDATE countries SET cover_photo_id = '1558005137-d9619a5c539f' WHERE slug = 'georgia' AND cover_photo_id = '1558618042-1df3218d9671';
UPDATE countries SET gallery_ids = ARRAY['1558005137-d9619a5c539f','1512453979798-5ea266f8880c','1529156069898-49953e39b3ac'] WHERE slug = 'georgia';

UPDATE countries SET cover_photo_id = '1558005137-d9619a5c539f' WHERE slug = 'iran' AND cover_photo_id = '1564502951597-647c46e78e76';
UPDATE countries SET gallery_ids = ARRAY['1558005137-d9619a5c539f','1512453979798-5ea266f8880c','1529156069898-49953e39b3ac'] WHERE slug = 'iran';

UPDATE countries SET cover_photo_id = '1512470876302-972faa2aa9a4' WHERE slug = 'netherlands' AND cover_photo_id = '1534430248-9c8e31e38789';
UPDATE countries SET gallery_ids = ARRAY['1512470876302-972faa2aa9a4','1519677100203-a0e668c92439','1558005137-d9619a5c539f'] WHERE slug = 'netherlands';

UPDATE countries SET cover_photo_id = '1558005137-d9619a5c539f' WHERE slug = 'portugal' AND cover_photo_id = '1555881772637-7aedc0a7a35b';
UPDATE countries SET gallery_ids = ARRAY['1558005137-d9619a5c539f','1512453979798-5ea266f8880c','1512470876302-972faa2aa9a4'] WHERE slug = 'portugal';

UPDATE countries SET cover_photo_id = '1573843981267-be1999ff37cd' WHERE slug = 'maldives' AND cover_photo_id = '1514897022948-7f27b39a8b28';
UPDATE countries SET gallery_ids = ARRAY['1573843981267-be1999ff37cd','1544551763-46a013bb70d5','1578922746465-3a80a228f223'] WHERE slug = 'maldives';

UPDATE countries SET cover_photo_id = '1558005137-d9619a5c539f' WHERE slug = 'bali' AND cover_photo_id = '1537996804304-a03bb73ecca7';
UPDATE countries SET gallery_ids = ARRAY['1558005137-d9619a5c539f','1512453979798-5ea266f8880c','1529156069898-49953e39b3ac'] WHERE slug = 'bali';

UPDATE countries SET cover_photo_id = '1558005137-d9619a5c539f' WHERE slug = 'morocco' AND cover_photo_id = '1539020059694-1ef0e71b1e8e';
UPDATE countries SET gallery_ids = ARRAY['1558005137-d9619a5c539f','1512453979798-5ea266f8880c','1529156069898-49953e39b3ac'] WHERE slug = 'morocco';

UPDATE countries SET cover_photo_id = '1558005137-d9619a5c539f' WHERE slug = 'canada' AND cover_photo_id = '1503614937-fc98e9d4b898';
UPDATE countries SET gallery_ids = ARRAY['1558005137-d9619a5c539f','1512453979798-5ea266f8880c','1529156069898-49953e39b3ac'] WHERE slug = 'canada';

UPDATE countries SET cover_photo_id = '1558005137-d9619a5c539f' WHERE slug = 'australia' AND cover_photo_id = '1506973022534-a89f7d29fc4b';
UPDATE countries SET gallery_ids = ARRAY['1558005137-d9619a5c539f','1512453979798-5ea266f8880c','1529156069898-49953e39b3ac'] WHERE slug = 'australia';

UPDATE countries SET cover_photo_id = '1558005137-d9619a5c539f' WHERE slug = 'brazil' AND cover_photo_id = '1483133391-6d1d8f72a7ef';
UPDATE countries SET gallery_ids = ARRAY['1558005137-d9619a5c539f','1512453979798-5ea266f8880c','1529156069898-49953e39b3ac'] WHERE slug = 'brazil';

UPDATE countries SET cover_photo_id = '1548013146-72479768bada' WHERE slug = 'india' AND cover_photo_id = '1524230900021-e8e69c7b8327';
UPDATE countries SET gallery_ids = ARRAY['1548013146-72479768bada','1558005137-d9619a5c539f','1529156069898-49953e39b3ac'] WHERE slug = 'india';

UPDATE countries SET cover_photo_id = '1558005137-d9619a5c539f' WHERE slug = 'china' AND cover_photo_id = '1508804185872-d7badc2832b8';
UPDATE countries SET gallery_ids = ARRAY['1529156069898-49953e39b3ac','1558005137-d9619a5c539f','1512453979798-5ea266f8880c'] WHERE slug = 'china';

UPDATE countries SET cover_photo_id = '1558005137-d9619a5c539f' WHERE slug = 'singapore' AND cover_photo_id = '1538485880098-cf0b28c2d3cb';
UPDATE countries SET gallery_ids = ARRAY['1558005137-d9619a5c539f','1512453979798-5ea266f8880c','1519677100203-a0e668c92439'] WHERE slug = 'singapore';

UPDATE countries SET cover_photo_id = '1558005137-d9619a5c539f' WHERE slug = 'norway' AND cover_photo_id = '1520769669658-f07657f5a5f1e';
UPDATE countries SET gallery_ids = ARRAY['1558005137-d9619a5c539f','1530122037265-a5f1f91d3b99','1474623809196-26c1d33457cc'] WHERE slug = 'norway';

UPDATE countries SET cover_photo_id = '1474623809196-26c1d33457cc' WHERE slug = 'new-zealand' AND cover_photo_id = '1469854523086-cc02d5ab4582';
UPDATE countries SET gallery_ids = ARRAY['1474623809196-26c1d33457cc','1558005137-d9619a5c539f','1512453979798-5ea266f8880c'] WHERE slug = 'new-zealand';

-- ═══════════════════════════════════════════════
-- PART 4: Also fix country_highlights photo IDs
-- Update all highlight photo_ids that reference broken Unsplash IDs
-- ═══════════════════════════════════════════════

UPDATE country_highlights SET photo_id = '1558005137-d9619a5c539f' WHERE photo_id IN (
  '1524231757913-4be64b2825c7',
  '1502602915149-bb4f5dc63d43',
  '1499856562261-6a300a60f98b',
  '1431274172761-fdc4ab25fd7e',
  '1516483107680-cf12f4bb3a06',
  '1523906834-14422bf244af',
  '1534445952-b7b83a7df4e3',
  '1551913902-b38fc67d8b4e',
  '1541432901042-2b3b1d4b7e9e',
  '1467269204565-85d97ab5b067',
  '1554072577-87e8b6e86b4e',
  '1552465426191-7e4b0ca03cd3',
  '1528459809937-25f1635be507',
  '1533580304916-cc1ba1040e62',
  '1558618042-1df3218d9671',
  '1520769669658-f07657f5a5f1e',
  '1564502951597-647c46e78e76',
  '1508006285622-3a25b0f2a5e7',
  '1534430248-9c8e31e38789',
  '1576085448-c1c3dafeed0a',
  '1555881772637-7aedc0a7a35b',
  '1537213447-bdeb5c5a3fb5',
  '1514897022948-7f27b39a8b28',
  '1540202156-6ef68fb48b74',
  '1553786319-c8a7c83e0a64',
  '1537996804304-a03bb73ecca7',
  '1518544810-a2b9a4d4d9f4',
  '1554073357-98e1d64da40f',
  '1539020059694-1ef0e71b1e8e',
  '1548071847-3f45f3d3ca4b',
  '1553777208-c6f1aa4a6b6a',
  '1503614937-fc98e9d4b898',
  '1441155877620-a9d3e9b8e5c2',
  '1506973022534-a89f7d29fc4b',
  '1494658536872-86bc06a5f6b7',
  '1483133391-6d1d8f72a7ef',
  '1534447954-ab88eb9c7d21',
  '1464820702-bc69ad3ef4c6',
  '1524230900021-e8e69c7b8327',
  '1538168916-8cd2b5f5f6da',
  '1531058495-abb7cbfe-9f67',
  '1508804185872-d7badc2832b8',
  '1524985318-beeb0da93395',
  '1538485880098-cf0b28c2d3cb',
  '1562646740-2a931f01826e',
  '1553777208-c6f1aa4a6b6a',
  '1507003236-96dfba2a2b8e',
  '1516750593-d1ea7aec0df3',
  '1504829857797-ddff29c27927',
  '1476672962716-2efa5667a3e8',
  '1518638150340-f706e86654de',
  '1529777985-17ac5a8c-c9a0',
  '1469854523086-cc02d5ab4582',
  '1541849546-216549ae216d',
  '1516550893923-42d28e5677af',
  '1560012065-6db42c82f55a',
  '1533106958-ba7f6e1e76ac',
  '1493976040564-d403f7696e15'
);

-- ═══════════════════════════════════════════════
-- PART 5: Remove Armenia
-- ═══════════════════════════════════════════════

DELETE FROM visa_documents WHERE country_id = (SELECT id FROM countries WHERE slug = 'armenia');
DELETE FROM visa_qa_cache WHERE country_id = (SELECT id FROM countries WHERE slug = 'armenia');
DELETE FROM visa_info WHERE country_id = (SELECT id FROM countries WHERE slug = 'armenia');
DELETE FROM country_highlights WHERE country_id = (SELECT id FROM countries WHERE slug = 'armenia');
DELETE FROM countries WHERE slug = 'armenia';
