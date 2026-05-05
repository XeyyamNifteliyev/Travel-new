-- TravelAZ: Import open travel data for 5 cities
-- Generated: 2026-05-04T23:00:41.558Z
-- Run this in Supabase SQL Editor after migration 020

-- ============================================================
-- CITY: PARIS
-- ============================================================

-- TravelAZ open travel data import
-- City: Paris
-- Generated: 2026-05-04T22:59:52.619Z
-- Sources: Wikipedia summary (CC BY-SA), OpenStreetMap/Overpass (ODbL)
-- Run this after supabase/migrations/020_open_travel_data.sql has been applied.

begin;

with country_ref as (
  select id from countries where slug = 'france' limit 1
), upserted_city as (
  insert into cities (
    country_id, slug, name_az, name_en, name_ru, lat, lng, population,
    short_desc_en, description_en, source, source_url, license, attribution_text, last_synced_at
  )
  select
    country_ref.id, 'paris', 'Paris', 'Paris', 'Париж',
    48.8566, 2.3522, 2102650,
    'Paris is the capital and largest city of France, with an estimated city population of 2.04 million in an area of 105.4 km2 (40.7 sq mi), and a metropolitan population of 13.2 million as of January 2026. Located on the river Seine in the centre of the Île-de-France region, it is the largest metropolitan area and fourth-most populous city in the European Union (EU). Nicknamed the "City of Light", partly because of its role in the Age of Enlightenment, Paris has been one of the world''s major centres of finance, diplomacy, commerce, culture, fashion, and gastronomy since the 17th century', 'Paris is the capital and largest city of France, with an estimated city population of 2.04 million in an area of 105.4 km2 (40.7 sq mi), and a metropolitan population of 13.2 million as of January 2026. Located on the river Seine in the centre of the Île-de-France region, it is the largest metropolitan area and fourth-most populous city in the European Union (EU). Nicknamed the "City of Light", partly because of its role in the Age of Enlightenment, Paris has been one of the world''s major centres of finance, diplomacy, commerce, culture, fashion, and gastronomy since the 17th century',
    'wikipedia', 'https://en.wikipedia.org/wiki/Paris', 'CC BY-SA', 'Wikipedia contributors, Paris', now()
  from country_ref
  on conflict (country_id, slug) do update set
    name_az = excluded.name_az,
    name_en = excluded.name_en,
    name_ru = excluded.name_ru,
    lat = excluded.lat,
    lng = excluded.lng,
    population = excluded.population,
    short_desc_en = excluded.short_desc_en,
    description_en = excluded.description_en,
    source = excluded.source,
    source_url = excluded.source_url,
    license = excluded.license,
    attribution_text = excluded.attribution_text,
    last_synced_at = now()
  returning id, country_id
), place_values as (
  select * from (values
    ('arc-de-triomphe', 'Arc de Triomphe', null, 'Arc de Triomphe', 'Триумфальная арка', 'attraction', 'attraction', 48.8737782, 2.2950354, null, 'https://www.paris-arc-de-triomphe.fr/', null, null, 'Apr 2-Jan 31: Mo-Su 10:00-22:30; Apr 1,Sep 30: Mo-Su 10:00-23:00; Oct 1,Dec 31: Mo-Su 10:00-22:30; Jan 1,May 1,May 8,Jul 14,Nov 11,Dec 25: off', 'openstreetmap', 'way/226413508', 'https://www.openstreetmap.org/way/226413508', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/226413508","category":"attraction","import_city":"paris"}'::jsonb),
    ('assemblee-nationale', 'Assemblée nationale', null, 'National Assembly', 'Ассамбле-Насьональ', 'attraction', 'attraction', 48.8617532, 2.317959, null, 'https://www.assemblee-nationale.fr/', null, null, null, 'openstreetmap', 'way/175448742', 'https://www.openstreetmap.org/way/175448742', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/175448742","category":"attraction","import_city":"paris"}'::jsonb),
    ('basilique-du-sacre-c-ur', 'Basilique du Sacré-Cœur', null, 'Basilica of the Sacred Heart of Paris', 'Базилика Сакре-Кёр', 'attraction', 'attraction', 48.8867961, 2.3430272, null, 'https://www.sacre-coeur-montmartre.com/', null, null, '06:00-22:30', 'openstreetmap', 'way/23762981', 'https://www.openstreetmap.org/way/23762981', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/23762981","category":"attraction","import_city":"paris"}'::jsonb),
    ('bateaux-mouches', 'Bateaux-Mouches', null, null, null, 'attraction', 'attraction', 48.863978, 2.3058261, null, 'https://www.bateaux-mouches.fr/', '+33 1 42 25 96 10', 'info@bateaux-mouches.fr', null, 'openstreetmap', 'way/182821008', 'https://www.openstreetmap.org/way/182821008', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/182821008","category":"attraction","import_city":"paris"}'::jsonb),
    ('brasserie-bofinger', 'Brasserie Bofinger', null, null, null, 'attraction', 'attraction', 48.8539095, 2.3680433, null, 'https://www.bofingerparis.com/', '+33 1 42 72 87 82', null, 'Mo-Sa 12:00-15:00, 18:30-00:00; Su 12:00-15:00, 18:30-23:00', 'openstreetmap', 'node/968153548', 'https://www.openstreetmap.org/node/968153548', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/968153548","category":"attraction","import_city":"paris"}'::jsonb),
    ('canauxrama', 'Canauxrama', null, null, null, 'attraction', 'attraction', 48.8508544, 2.3681264, null, 'https://www.canauxrama.com/', null, null, null, 'openstreetmap', 'node/2448402214', 'https://www.openstreetmap.org/node/2448402214', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/2448402214","category":"attraction","import_city":"paris"}'::jsonb),
    ('carrieres-souterraines-des-capucins', 'Carrières souterraines des Capucins', null, null, null, 'attraction', 'attraction', 48.8371564, 2.3395284, null, 'https://www.seadacc.com/', null, null, null, 'openstreetmap', 'node/2386545714', 'https://www.openstreetmap.org/node/2386545714', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/2386545714","category":"attraction","import_city":"paris"}'::jsonb),
    ('cathedrale-notre-dame-de-paris', 'Cathédrale Notre-Dame de Paris', null, 'Cathedral of Notre Dame', 'Собор Парижской Богоматери', 'attraction', 'attraction', 48.8529371, 2.3498701, '6, Parvis Notre-Dame - Place Jean-Paul II, Paris', 'https://www.notredamedeparis.fr/', '+33 1 42 34 56 10', null, 'Mo,Tu,We,Fr 07:50-19:00; Th 07:50-22:00; Sa,Su 08:15-19:30', 'openstreetmap', 'way/201611261', 'https://www.openstreetmap.org/way/201611261', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/201611261","category":"attraction","import_city":"paris"}'::jsonb),
    ('centre-wallonie-bruxelles', 'Centre Wallonie-Bruxelles', null, null, null, 'attraction', 'attraction', 48.8609964, 2.3511217, null, 'https://www.cwb.fr/', '+33 1 53 01 96 96', 'info@cwb.fr', 'Mo-We,Fr-Sa 11:00-19:00; Th 14:00-21:00; Su,PH off', 'openstreetmap', 'way/55751636', 'https://www.openstreetmap.org/way/55751636', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/55751636","category":"attraction","import_city":"paris"}'::jsonb),
    ('champs-elysees', 'Champs Élysées', null, null, 'Шанзелизе', 'attraction', 'attraction', 48.8707573, 2.3053312, 'Paris', 'https://en.parisinfo.com/transport/73130/Avenue-des-Champs-Elysees', null, null, null, 'openstreetmap', 'node/4533627787', 'https://www.openstreetmap.org/node/4533627787', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/4533627787","category":"attraction","import_city":"paris"}'::jsonb),
    ('cimetiere-du-pere-lachaise', 'Cimetière du Père-Lachaise', null, 'Père Lachaise Cemetery', null, 'attraction', 'attraction', 48.8611438, 2.3941849, '8, Boulevard de Ménilmontant', 'https://www.paris.fr/equipements/cimetiere-du-pere-lachaise-4080', null, null, 'Mo-Fr 08:00-17:30; Sa 08:30-17:30; Su 09:00-17:30', 'openstreetmap', 'way/13859706', 'https://www.openstreetmap.org/way/13859706', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/13859706","category":"attraction","import_city":"paris"}'::jsonb),
    ('college-des-bernardins', 'Collège des Bernardins', null, null, null, 'attraction', 'attraction', 48.8488289, 2.3520343, '20, Rue de Poissy, Paris', 'https://www.collegedesbernardins.fr/', '+33 1 53 10 74 44', 'accueil@collegedesbernardins.fr', 'Mo-sa 10:00-18:00; Su 14:00-18:00', 'openstreetmap', 'way/26584053', 'https://www.openstreetmap.org/way/26584053', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/26584053","category":"attraction","import_city":"paris"}'::jsonb),
    ('ecole-nationale-superieure-des-beaux-arts', 'École nationale supérieure des beaux-arts', null, null, null, 'attraction', 'attraction', 48.8571292, 2.3338015, '14, Rue Bonaparte', 'https://beauxartsparis.fr/fr/', null, null, null, 'openstreetmap', 'way/148485612', 'https://www.openstreetmap.org/way/148485612', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/148485612","category":"attraction","import_city":"paris"}'::jsonb),
    ('eglise-du-dome', 'Église du Dôme', null, 'Dome of Les Invalids', null, 'attraction', 'attraction', 48.8550463, 2.3125387, '2, Place Vauban', 'https://www.musee-armee.fr/votre-visite/les-espaces-du-musee/dome-des-invalides-tombeau-de-napoleon-ier.html', null, null, null, 'openstreetmap', 'way/112452790', 'https://www.openstreetmap.org/way/112452790', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/112452790","category":"attraction","import_city":"paris"}'::jsonb),
    ('eglise-saint-roch', 'Église Saint-Roch', null, null, null, 'attraction', 'attraction', 48.8653817, 2.3326659, null, 'http://www.saintrochparis.cef.fr/', null, null, null, 'openstreetmap', 'way/42722202', 'https://www.openstreetmap.org/way/42722202', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/42722202","category":"attraction","import_city":"paris"}'::jsonb),
    ('fontaine-medicis', 'Fontaine Médicis', null, null, null, 'attraction', 'attraction', 48.8480587, 2.3392944, null, 'https://www.senat.fr/visite/jardin/fontaine_medicis/le_senat_restaure_la_fontaine_medicis.html', null, null, null, 'openstreetmap', 'node/782601793', 'https://www.openstreetmap.org/node/782601793', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/782601793","category":"attraction","import_city":"paris"}'::jsonb),
    ('grande-mosquee-de-paris', 'Grande Mosquée de Paris', null, 'Grand Mosque of Paris', null, 'attraction', 'attraction', 48.8420708, 2.3551205, '2 bis, Place du Puits de l''Ermite, Paris', 'https://www.mosqueedeparis.net/', '+33 1 45 35 97 33', 'rectorat@mosqueedeparis.net', 'Sa-Th 09:00-18:00', 'openstreetmap', 'way/437812893', 'https://www.openstreetmap.org/way/437812893', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/437812893","category":"attraction","import_city":"paris"}'::jsonb),
    ('hotel-de-la-marine', 'Hôtel de la Marine', null, null, null, 'attraction', 'attraction', 48.8669318, 2.323065, 'Place de la Concorde, Paris', 'https://www.hotel-de-la-marine.paris/', null, null, null, 'openstreetmap', 'relation/1060822', 'https://www.openstreetmap.org/relation/1060822', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"relation/1060822","category":"attraction","import_city":"paris"}'::jsonb),
    ('hotel-de-ville', 'Hôtel de Ville', null, 'Hôtel de Ville', 'Отель-де-Виль', 'attraction', 'attraction', 48.8564265, 2.352527, 'Place de l’Hotel de Ville', 'https://www.paris.fr/', '+33 1 42 76 40 40', null, 'Mo-Sa 10:00-19:00', 'openstreetmap', 'relation/284089', 'https://www.openstreetmap.org/relation/284089', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"relation/284089","category":"attraction","import_city":"paris"}'::jsonb),
    ('hotel-des-invalides', 'Hôtel des Invalides', null, null, null, 'attraction', 'attraction', 48.8559525, 2.3125541, '129, Rue de Grenelle, Paris', 'https://www.invalides.org/', '+33 810 11 33 99', null, null, 'openstreetmap', 'relation/1463538', 'https://www.openstreetmap.org/relation/1463538', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"relation/1463538","category":"attraction","import_city":"paris"}'::jsonb)
  ) as v(slug, name, name_az, name_en, name_ru, category, subcategory, lat, lng, address, website, phone, email, opening_hours, source, source_place_id, source_url, license, attribution_text, raw_data)
), upserted_places as (
  insert into places (
    city_id, country_id, slug, name, name_az, name_en, name_ru, category, subcategory, lat, lng,
    address, website, phone, email, opening_hours, source, source_place_id, source_url, license, attribution_text, raw_data, last_synced_at
  )
  select
    upserted_city.id, upserted_city.country_id, v.slug, v.name, v.name_az, v.name_en, v.name_ru, v.category, v.subcategory,
    v.lat, v.lng, v.address, v.website, v.phone, v.email, v.opening_hours, v.source, v.source_place_id,
    v.source_url, v.license, v.attribution_text, v.raw_data, now()
  from place_values v cross join upserted_city
  on conflict (source, source_place_id) where source_place_id is not null do update set
    city_id = excluded.city_id,
    country_id = excluded.country_id,
    slug = excluded.slug,
    name = excluded.name,
    name_az = excluded.name_az,
    name_en = excluded.name_en,
    name_ru = excluded.name_ru,
    category = excluded.category,
    subcategory = excluded.subcategory,
    lat = excluded.lat,
    lng = excluded.lng,
    address = excluded.address,
    website = excluded.website,
    phone = excluded.phone,
    email = excluded.email,
    opening_hours = excluded.opening_hours,
    source_url = excluded.source_url,
    license = excluded.license,
    attribution_text = excluded.attribution_text,
    raw_data = excluded.raw_data,
    last_synced_at = now()
  returning id, source, source_place_id, source_url, license, attribution_text, raw_data
), upserted_sources as (
  insert into place_sources (place_id, source, source_id, source_url, license, attribution_text, raw_data)
  select id, source, source_place_id, source_url, license, attribution_text, raw_data
  from upserted_places
  on conflict (place_id, source, source_id) where source_id is not null do update set
    source_url = excluded.source_url,
    license = excluded.license,
    attribution_text = excluded.attribution_text,
    raw_data = excluded.raw_data
  returning id
)
insert into external_import_logs (source, entity_type, status, imported_count, skipped_count, metadata, started_at, finished_at)
select 'overpass', 'city_places', 'success', count(*), 0, '{"city":"paris","generated_at":"2026-05-04T22:59:52.619Z"}'::jsonb, now(), now()
from upserted_places;

commit;


-- ============================================================
-- CITY: TBILISI
-- ============================================================

-- TravelAZ open travel data import
-- City: Tbilisi
-- Generated: 2026-05-04T22:59:59.254Z
-- Sources: Wikipedia summary (CC BY-SA), OpenStreetMap/Overpass (ODbL)
-- Run this after supabase/migrations/020_open_travel_data.sql has been applied.

begin;

with country_ref as (
  select id from countries where slug = 'georgia' limit 1
), upserted_city as (
  insert into cities (
    country_id, slug, name_az, name_en, name_ru, lat, lng, population,
    short_desc_en, description_en, source, source_url, license, attribution_text, last_synced_at
  )
  select
    country_ref.id, 'tbilisi', 'Tbilisi', 'Tbilisi', 'Тбилиси',
    41.7151, 44.8271, 1201769,
    'Tbilisi is the capital and largest city of Georgia, located on the banks of the Kura River. With more than 1.3 million inhabitants, it contains almost one third of the country''s population. Tbilisi was founded in the 5th century CE by Vakhtang I of Iberia and has since served as the capital of various Georgian kingdoms and republics. Between 1801 and 1917, then part of the Russian Empire, it was the seat of the Caucasus Viceroyalty, governing both the northern and southern sides of the Caucasus.', 'Tbilisi is the capital and largest city of Georgia, located on the banks of the Kura River. With more than 1.3 million inhabitants, it contains almost one third of the country''s population. Tbilisi was founded in the 5th century CE by Vakhtang I of Iberia and has since served as the capital of various Georgian kingdoms and republics. Between 1801 and 1917, then part of the Russian Empire, it was the seat of the Caucasus Viceroyalty, governing both the northern and southern sides of the Caucasus.',
    'wikipedia', 'https://en.wikipedia.org/wiki/Tbilisi', 'CC BY-SA', 'Wikipedia contributors, Tbilisi', now()
  from country_ref
  on conflict (country_id, slug) do update set
    name_az = excluded.name_az,
    name_en = excluded.name_en,
    name_ru = excluded.name_ru,
    lat = excluded.lat,
    lng = excluded.lng,
    population = excluded.population,
    short_desc_en = excluded.short_desc_en,
    description_en = excluded.description_en,
    source = excluded.source,
    source_url = excluded.source_url,
    license = excluded.license,
    attribution_text = excluded.attribution_text,
    last_synced_at = now()
  returning id, country_id
), place_values as (
  select * from (values
    ('air-balloon-tbilisi', 'Air Balloon Tbilisi', null, null, null, 'attraction', 'attraction', 41.692391, 44.8101043, null, 'https://www.airballoontbilisi.ge/', '+995 32 205 21 31', 'info@airballoontbilisi.ge', null, 'openstreetmap', 'node/8026616020', 'https://www.openstreetmap.org/node/8026616020', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/8026616020","category":"attraction","import_city":"tbilisi"}'::jsonb),
    (null, 'გარდენია შევარდნაძე', null, 'Gardenia Shevardnadze', null, 'attraction', 'attraction', 41.7311156, 44.8307165, null, 'https://gardenia.ge/', null, null, '09:00-19:00', 'openstreetmap', 'way/371083612', 'https://www.openstreetmap.org/way/371083612', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/371083612","category":"attraction","import_city":"tbilisi"}'::jsonb),
    (null, 'ეროვნული ბოტანიკური ბაღი', 'Milli Botanika Bağı', 'National Botanical Garden', 'Тбилисский ботанический сад', 'attraction', 'attraction', 41.6850742, 44.8039907, null, 'https://www.nbgg.ge/', '+995 32 272 43 06', 'info@nbgg.ge', 'Mo-Su 09:00-19:30', 'openstreetmap', 'relation/19630635', 'https://www.openstreetmap.org/relation/19630635', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"relation/19630635","category":"attraction","import_city":"tbilisi"}'::jsonb),
    (null, 'საქართველოს პარლამენტი', null, 'Parliament of Georgia', null, 'attraction', 'attraction', 41.6966668, 44.7979358, '8, რუსთაველის გამზირი, თბილისი', 'https://parliament.ge/', null, null, null, 'openstreetmap', 'relation/1020718', 'https://www.openstreetmap.org/relation/1020718', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"relation/1020718","category":"attraction","import_city":"tbilisi"}'::jsonb),
    ('arnold-jung-steam-locomotive', 'Arnold Jung steam locomotive', null, 'Arnold Jung steam locomotive', 'Паровоз Арнольда Юнга', 'attraction', 'attraction', 41.7224429, 44.7871989, null, null, null, null, null, 'openstreetmap', 'node/6635023496', 'https://www.openstreetmap.org/node/6635023496', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/6635023496","category":"attraction","import_city":"tbilisi"}'::jsonb),
    ('bamboo-wood', 'Bamboo wood', null, 'Bamboo wood', 'Бамбуковая роща', 'attraction', 'attraction', 41.6876675, 44.8014687, null, null, null, null, null, 'openstreetmap', 'way/1077526908', 'https://www.openstreetmap.org/way/1077526908', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/1077526908","category":"attraction","import_city":"tbilisi"}'::jsonb),
    ('bamboo-wood', 'Bamboo wood', null, 'Bamboo wood', 'Бамбуковая роща', 'attraction', 'attraction', 41.6876878, 44.8010511, null, null, null, null, null, 'openstreetmap', 'way/1077526909', 'https://www.openstreetmap.org/way/1077526909', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/1077526909","category":"attraction","import_city":"tbilisi"}'::jsonb),
    ('cannons', 'Cannons', null, 'Cannons', null, 'attraction', 'attraction', 41.6863067, 44.8195634, null, null, null, null, null, 'openstreetmap', 'node/13270109302', 'https://www.openstreetmap.org/node/13270109302', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/13270109302","category":"attraction","import_city":"tbilisi"}'::jsonb),
    ('collection-of-caucasian-plants', 'Collection of Caucasian Plants', null, 'Collection of Caucasian Plants', null, 'attraction', 'attraction', 41.6863568, 44.8019073, null, null, null, null, null, 'openstreetmap', 'node/10899320805', 'https://www.openstreetmap.org/node/10899320805', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/10899320805","category":"attraction","import_city":"tbilisi"}'::jsonb),
    ('collection-of-rare-and-endemic-grains-legumes-and-oil-fiber-crops-of-georgia', 'Collection of Rare and Endemic Grains, Legumes and Oil-fiber Crops of Georgia', null, 'Collection of Rare and Endemic Grains, Legumes and Oil-fiber Crops of Georgia', null, 'attraction', 'attraction', 41.6844101, 44.7989969, null, null, null, null, null, 'openstreetmap', 'node/11775408070', 'https://www.openstreetmap.org/node/11775408070', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/11775408070","category":"attraction","import_city":"tbilisi"}'::jsonb),
    ('courtyard-with-3-spiral-staircases', 'Courtyard with 3 spiral staircases', null, 'Courtyard with 3 spiral staircases', null, 'attraction', 'attraction', 41.6894677, 44.8025434, null, null, null, null, null, 'openstreetmap', 'node/12095903549', 'https://www.openstreetmap.org/node/12095903549', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/12095903549","category":"attraction","import_city":"tbilisi"}'::jsonb),
    ('cypress-alley', 'Cypress alley', null, 'Cypress alley', 'Кипарисовая аллея', 'attraction', 'attraction', 41.686628, 44.8054398, null, null, null, null, null, 'openstreetmap', 'way/1077538332', 'https://www.openstreetmap.org/way/1077538332', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/1077538332","category":"attraction","import_city":"tbilisi"}'::jsonb),
    ('giant-sequoia', 'Giant Sequoia', null, 'Giant Sequoia', null, 'attraction', 'attraction', 41.683826, 44.7981254, null, null, null, null, null, 'openstreetmap', 'node/11176073010', 'https://www.openstreetmap.org/node/11176073010', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/11176073010","category":"attraction","import_city":"tbilisi"}'::jsonb),
    ('himalayan-cedar', 'Himalayan Cedar', null, 'Himalayan Cedar', null, 'attraction', 'attraction', 41.6869432, 44.8014143, null, null, null, null, null, 'openstreetmap', 'node/10749528096', 'https://www.openstreetmap.org/node/10749528096', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/10749528096","category":"attraction","import_city":"tbilisi"}'::jsonb),
    ('locomotive-monument', 'Locomotive Monument', null, 'Locomotive Monument', null, 'attraction', 'attraction', 41.6935883, 44.7803835, null, null, null, null, null, 'openstreetmap', 'node/9828265926', 'https://www.openstreetmap.org/node/9828265926', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/9828265926","category":"attraction","import_city":"tbilisi"}'::jsonb),
    ('lower-station-of-mtatsminda-aerial-tramway', 'Lower station of Mtatsminda aerial tramway', null, 'Lower station of Mtatsminda aerial tramway', 'Нижняя станция канатной дороги', 'attraction', 'attraction', 41.702885, 44.7905364, '6, ეკატერინე გაბაშვილის ქუჩა', null, null, null, null, 'openstreetmap', 'way/458999897', 'https://www.openstreetmap.org/way/458999897', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/458999897","category":"attraction","import_city":"tbilisi"}'::jsonb),
    ('milov-house-italian-villa', 'Milov House (Italian Villa)', null, 'Milov House (Italian Villa)', null, 'attraction', 'attraction', 41.6904869, 44.7983275, null, null, null, null, null, 'openstreetmap', 'node/4835177622', 'https://www.openstreetmap.org/node/4835177622', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/4835177622","category":"attraction","import_city":"tbilisi"}'::jsonb),
    ('old-city-wall', 'Old City Wall', null, null, null, 'attraction', 'attraction', 41.695433, 44.8024981, null, null, null, null, null, 'openstreetmap', 'way/184765813', 'https://www.openstreetmap.org/way/184765813', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/184765813","category":"attraction","import_city":"tbilisi"}'::jsonb),
    ('old-funicular-car', 'Old funicular car', null, null, null, 'attraction', 'attraction', 41.6938849, 44.7771668, null, null, null, null, null, 'openstreetmap', 'node/10959566596', 'https://www.openstreetmap.org/node/10959566596', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/10959566596","category":"attraction","import_city":"tbilisi"}'::jsonb),
    ('old-funicular-car', 'Old funicular car', null, null, null, 'attraction', 'attraction', 41.6938715, 44.7775824, null, null, null, null, null, 'openstreetmap', 'node/10959566597', 'https://www.openstreetmap.org/node/10959566597', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/10959566597","category":"attraction","import_city":"tbilisi"}'::jsonb)
  ) as v(slug, name, name_az, name_en, name_ru, category, subcategory, lat, lng, address, website, phone, email, opening_hours, source, source_place_id, source_url, license, attribution_text, raw_data)
), upserted_places as (
  insert into places (
    city_id, country_id, slug, name, name_az, name_en, name_ru, category, subcategory, lat, lng,
    address, website, phone, email, opening_hours, source, source_place_id, source_url, license, attribution_text, raw_data, last_synced_at
  )
  select
    upserted_city.id, upserted_city.country_id, v.slug, v.name, v.name_az, v.name_en, v.name_ru, v.category, v.subcategory,
    v.lat, v.lng, v.address, v.website, v.phone, v.email, v.opening_hours, v.source, v.source_place_id,
    v.source_url, v.license, v.attribution_text, v.raw_data, now()
  from place_values v cross join upserted_city
  on conflict (source, source_place_id) where source_place_id is not null do update set
    city_id = excluded.city_id,
    country_id = excluded.country_id,
    slug = excluded.slug,
    name = excluded.name,
    name_az = excluded.name_az,
    name_en = excluded.name_en,
    name_ru = excluded.name_ru,
    category = excluded.category,
    subcategory = excluded.subcategory,
    lat = excluded.lat,
    lng = excluded.lng,
    address = excluded.address,
    website = excluded.website,
    phone = excluded.phone,
    email = excluded.email,
    opening_hours = excluded.opening_hours,
    source_url = excluded.source_url,
    license = excluded.license,
    attribution_text = excluded.attribution_text,
    raw_data = excluded.raw_data,
    last_synced_at = now()
  returning id, source, source_place_id, source_url, license, attribution_text, raw_data
), upserted_sources as (
  insert into place_sources (place_id, source, source_id, source_url, license, attribution_text, raw_data)
  select id, source, source_place_id, source_url, license, attribution_text, raw_data
  from upserted_places
  on conflict (place_id, source, source_id) where source_id is not null do update set
    source_url = excluded.source_url,
    license = excluded.license,
    attribution_text = excluded.attribution_text,
    raw_data = excluded.raw_data
  returning id
)
insert into external_import_logs (source, entity_type, status, imported_count, skipped_count, metadata, started_at, finished_at)
select 'overpass', 'city_places', 'success', count(*), 0, '{"city":"tbilisi","generated_at":"2026-05-04T22:59:59.254Z"}'::jsonb, now(), now()
from upserted_places;

commit;


-- ============================================================
-- CITY: DUBAI
-- ============================================================

-- TravelAZ open travel data import
-- City: Dubai
-- Generated: 2026-05-04T23:00:02.380Z
-- Sources: Wikipedia summary (CC BY-SA), OpenStreetMap/Overpass (ODbL)
-- Run this after supabase/migrations/020_open_travel_data.sql has been applied.

begin;

with country_ref as (
  select id from countries where slug = 'dubai' limit 1
), upserted_city as (
  insert into cities (
    country_id, slug, name_az, name_en, name_ru, lat, lng, population,
    short_desc_en, description_en, source, source_url, license, attribution_text, last_synced_at
  )
  select
    country_ref.id, 'dubai', 'Dubay', 'Dubai', 'Дубай',
    25.2048, 55.2708, 3604000,
    'Dubai is the most populous city in the United Arab Emirates and the capital of the Emirate of Dubai. It is on a creek on the southeastern coast of the Persian Gulf. As of 2025, its population stands at 4 million, 92% of whom are expatriates. The wider urban area includes Sharjah and has a population of 5 million people as of 2023, while the Dubai–Sharjah–Ajman metropolitan area has a population of 6 million people.', 'Dubai is the most populous city in the United Arab Emirates and the capital of the Emirate of Dubai. It is on a creek on the southeastern coast of the Persian Gulf. As of 2025, its population stands at 4 million, 92% of whom are expatriates. The wider urban area includes Sharjah and has a population of 5 million people as of 2023, while the Dubai–Sharjah–Ajman metropolitan area has a population of 6 million people.',
    'wikipedia', 'https://en.wikipedia.org/wiki/Dubai', 'CC BY-SA', 'Wikipedia contributors, Dubai', now()
  from country_ref
  on conflict (country_id, slug) do update set
    name_az = excluded.name_az,
    name_en = excluded.name_en,
    name_ru = excluded.name_ru,
    lat = excluded.lat,
    lng = excluded.lng,
    population = excluded.population,
    short_desc_en = excluded.short_desc_en,
    description_en = excluded.description_en,
    source = excluded.source,
    source_url = excluded.source_url,
    license = excluded.license,
    attribution_text = excluded.attribution_text,
    last_synced_at = now()
  returning id, country_id
), place_values as (
  select * from (values
    ('aya', 'AYA', null, null, null, 'attraction', 'attraction', 25.2292338, 55.3187115, null, 'http://www.aya-universe.com/', null, null, null, 'openstreetmap', 'node/11584108971', 'https://www.openstreetmap.org/node/11584108971', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/11584108971","category":"attraction","import_city":"dubai"}'::jsonb),
    ('jumeirah-mosque', 'Jumeirah Mosque', null, 'Jumeirah Mosque', null, 'attraction', 'attraction', 25.2339344, 55.2655318, null, 'https://www.jumeirahmosque.ae/', '+971 4 353 6666', null, 'Sa-Th 09:00-16:00', 'openstreetmap', 'way/217936504', 'https://www.openstreetmap.org/way/217936504', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/217936504","category":"attraction","import_city":"dubai"}'::jsonb),
    (null, 'برج خليفة', null, 'Burj Khalifa', 'Бурдж-Халифа', 'attraction', 'attraction', 25.1970352, 55.2742132, '1, شارع الشيخ محمد بن راشد, دبي', 'https://www.burjkhalifa.ae/', null, 'Info@atthetop.ae', null, 'openstreetmap', 'way/446646206', 'https://www.openstreetmap.org/way/446646206', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/446646206","category":"attraction","import_city":"dubai"}'::jsonb),
    (null, 'دبي جاردن جلو', null, 'Dubai Garden Glow', null, 'attraction', 'attraction', 25.2289468, 55.2961672, null, 'https://www.dubaigardenglow.com/', '+971 55 918 8126', null, null, 'openstreetmap', 'way/418520759', 'https://www.openstreetmap.org/way/418520759', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/418520759","category":"attraction","import_city":"dubai"}'::jsonb),
    (null, 'دبي مول', null, 'The Dubai Mall', null, 'attraction', 'attraction', 25.1970073, 55.2785741, 'شارع الدوحة, دبي', 'https://www.thedubaimall.com/', '800 38224 6255', 'enguiry@thedubaimall.com', 'Mo-Su 10:00-2:00', 'openstreetmap', 'relation/18195959', 'https://www.openstreetmap.org/relation/18195959', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"relation/18195959","category":"attraction","import_city":"dubai"}'::jsonb),
    ('al-karama-medical-fitness-service-center', 'Al Karama Medical Fitness Service Center', null, 'Al Karama Medical Fitness Service Center', null, 'attraction', 'attraction', 25.2452625, 55.3095935, null, null, null, null, null, 'openstreetmap', 'node/5526247121', 'https://www.openstreetmap.org/node/5526247121', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/5526247121","category":"attraction","import_city":"dubai"}'::jsonb),
    ('bikanerwal-karama', 'bikanerwal karama', null, 'bikanerwal karama', null, 'attraction', 'attraction', 25.2485902, 55.3022814, null, null, null, null, null, 'openstreetmap', 'node/5971795886', 'https://www.openstreetmap.org/node/5971795886', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/5971795886","category":"attraction","import_city":"dubai"}'::jsonb),
    ('diplodocus', 'Diplodocus', null, null, null, 'attraction', 'attraction', 25.1968879, 55.2794138, null, null, null, null, null, 'openstreetmap', 'node/6001213914', 'https://www.openstreetmap.org/node/6001213914', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/6001213914","category":"attraction","import_city":"dubai"}'::jsonb),
    ('la-mer', 'La Mer', null, 'La Mer', 'Ля Мэр Пляж', 'attraction', 'attraction', 25.2295035, 55.2567134, null, null, null, null, null, 'openstreetmap', 'node/5110737490', 'https://www.openstreetmap.org/node/5110737490', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/5110737490","category":"attraction","import_city":"dubai"}'::jsonb),
    ('mediclinic-al-bahr', 'mediclinic al bahr', null, 'mediclinic al bahr', null, 'attraction', 'attraction', 25.2263747, 55.2597784, null, null, null, null, null, 'openstreetmap', 'node/5520156122', 'https://www.openstreetmap.org/node/5520156122', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/5520156122","category":"attraction","import_city":"dubai"}'::jsonb),
    ('medwin-medical-jumera', 'medwin medical jumera', null, 'medwin medical jumera', null, 'attraction', 'attraction', 25.181135, 55.2243428, null, null, null, null, null, 'openstreetmap', 'node/5414621021', 'https://www.openstreetmap.org/node/5414621021', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/5414621021","category":"attraction","import_city":"dubai"}'::jsonb),
    ('mercore-hotel-mina-road', 'mercore hotel mina road', null, 'mercore hotel mina road', null, 'attraction', 'attraction', 25.2428974, 55.2757674, null, null, null, null, null, 'openstreetmap', 'node/5994830385', 'https://www.openstreetmap.org/node/5994830385', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/5994830385","category":"attraction","import_city":"dubai"}'::jsonb),
    ('new-gold-souq', 'New Gold souq', null, 'New Gold souq', null, 'attraction', 'attraction', 25.25142, 55.2826297, null, null, null, null, null, 'openstreetmap', 'node/4417703990', 'https://www.openstreetmap.org/node/4417703990', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/4417703990","category":"attraction","import_city":"dubai"}'::jsonb),
    ('nikki-beach', 'Nikki Beach', null, null, null, 'attraction', 'attraction', 25.2475089, 55.2555365, null, null, null, null, null, 'openstreetmap', 'way/509577639', 'https://www.openstreetmap.org/way/509577639', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/509577639","category":"attraction","import_city":"dubai"}'::jsonb),
    ('pakistan-association-dubai', 'Pakistan Association Dubai', null, 'Pakistan Association Dubai', null, 'attraction', 'attraction', 25.238552, 55.3151849, '319-11 b', null, null, null, null, 'openstreetmap', 'node/4787925722', 'https://www.openstreetmap.org/node/4787925722', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/4787925722","category":"attraction","import_city":"dubai"}'::jsonb),
    ('the-waterfall', 'The Waterfall', null, 'The Waterfall', null, 'attraction', 'attraction', 25.1952905, 55.2794653, null, null, null, null, null, 'openstreetmap', 'node/838298272', 'https://www.openstreetmap.org/node/838298272', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/838298272","category":"attraction","import_city":"dubai"}'::jsonb),
    ('w-hotel', 'w hotel', null, 'w hotel', null, 'attraction', 'attraction', 25.1828309, 55.2540152, null, null, null, null, null, 'openstreetmap', 'node/5422713922', 'https://www.openstreetmap.org/node/5422713922', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/5422713922","category":"attraction","import_city":"dubai"}'::jsonb),
    (null, 'حي دبي للتصميم', null, 'Dubai Design District', null, 'attraction', 'attraction', 25.1891522, 55.2981417, 'دبي', null, null, null, null, 'openstreetmap', 'node/5456633222', 'https://www.openstreetmap.org/node/5456633222', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/5456633222","category":"attraction","import_city":"dubai"}'::jsonb),
    (null, 'شاطئ جميرا', null, 'Jumeirah Beach', null, 'attraction', 'attraction', 25.1916426, 55.2285459, 'جميرا', null, null, null, null, 'openstreetmap', 'node/5109269022', 'https://www.openstreetmap.org/node/5109269022', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/5109269022","category":"attraction","import_city":"dubai"}'::jsonb),
    (null, 'شاطئ جميرا تزلج بحر', null, null, null, 'attraction', 'attraction', 25.1846531, 55.2245308, null, null, null, null, null, 'openstreetmap', 'node/4714427890', 'https://www.openstreetmap.org/node/4714427890', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/4714427890","category":"attraction","import_city":"dubai"}'::jsonb)
  ) as v(slug, name, name_az, name_en, name_ru, category, subcategory, lat, lng, address, website, phone, email, opening_hours, source, source_place_id, source_url, license, attribution_text, raw_data)
), upserted_places as (
  insert into places (
    city_id, country_id, slug, name, name_az, name_en, name_ru, category, subcategory, lat, lng,
    address, website, phone, email, opening_hours, source, source_place_id, source_url, license, attribution_text, raw_data, last_synced_at
  )
  select
    upserted_city.id, upserted_city.country_id, v.slug, v.name, v.name_az, v.name_en, v.name_ru, v.category, v.subcategory,
    v.lat, v.lng, v.address, v.website, v.phone, v.email, v.opening_hours, v.source, v.source_place_id,
    v.source_url, v.license, v.attribution_text, v.raw_data, now()
  from place_values v cross join upserted_city
  on conflict (source, source_place_id) where source_place_id is not null do update set
    city_id = excluded.city_id,
    country_id = excluded.country_id,
    slug = excluded.slug,
    name = excluded.name,
    name_az = excluded.name_az,
    name_en = excluded.name_en,
    name_ru = excluded.name_ru,
    category = excluded.category,
    subcategory = excluded.subcategory,
    lat = excluded.lat,
    lng = excluded.lng,
    address = excluded.address,
    website = excluded.website,
    phone = excluded.phone,
    email = excluded.email,
    opening_hours = excluded.opening_hours,
    source_url = excluded.source_url,
    license = excluded.license,
    attribution_text = excluded.attribution_text,
    raw_data = excluded.raw_data,
    last_synced_at = now()
  returning id, source, source_place_id, source_url, license, attribution_text, raw_data
), upserted_sources as (
  insert into place_sources (place_id, source, source_id, source_url, license, attribution_text, raw_data)
  select id, source, source_place_id, source_url, license, attribution_text, raw_data
  from upserted_places
  on conflict (place_id, source, source_id) where source_id is not null do update set
    source_url = excluded.source_url,
    license = excluded.license,
    attribution_text = excluded.attribution_text,
    raw_data = excluded.raw_data
  returning id
)
insert into external_import_logs (source, entity_type, status, imported_count, skipped_count, metadata, started_at, finished_at)
select 'overpass', 'city_places', 'success', count(*), 0, '{"city":"dubai","generated_at":"2026-05-04T23:00:02.380Z"}'::jsonb, now(), now()
from upserted_places;

commit;


-- ============================================================
-- CITY: LONDON
-- ============================================================

-- TravelAZ open travel data import
-- City: London
-- Generated: 2026-05-04T23:00:12.467Z
-- Sources: Wikipedia summary (CC BY-SA), OpenStreetMap/Overpass (ODbL)
-- Run this after supabase/migrations/020_open_travel_data.sql has been applied.

begin;

with country_ref as (
  select id from countries where slug = 'uk' limit 1
), upserted_city as (
  insert into cities (
    country_id, slug, name_az, name_en, name_ru, lat, lng, population,
    short_desc_en, description_en, source, source_url, license, attribution_text, last_synced_at
  )
  select
    country_ref.id, 'london', 'London', 'London', 'Лондон',
    51.5072, -0.1276, 8799800,
    'London is the capital and largest city of England and the United Kingdom, with a population of 9.1 million people in 2024. Its wider metropolitan area is the largest in Western Europe, with a population of 15.1 million. London stands on the River Thames in southeast England, at the head of a 50-mile (80 km) tidal estuary down to the North Sea, and has been a major settlement for nearly 2,000 years. Its ancient core and financial centre, the City of London, was founded by the Romans as Londinium and has retained its medieval boundaries. The City of Westminster, to the west of the City of London, has been the site of the national government and parliament for centuries. London grew rapidly in the 19th century, becoming the world''s largest city at the time. Since the 19th century the name "London" has referred to the metropolis around the City of London, historically split among the counties of Middlesex, Essex, Surrey, Kent and Hertfordshire. Since 1965 it has largely comprised the administrative area of Greater London, governed by 33 local authorities and the Greater London Authority.', 'London is the capital and largest city of England and the United Kingdom, with a population of 9.1 million people in 2024. Its wider metropolitan area is the largest in Western Europe, with a population of 15.1 million. London stands on the River Thames in southeast England, at the head of a 50-mile (80 km) tidal estuary down to the North Sea, and has been a major settlement for nearly 2,000 years. Its ancient core and financial centre, the City of London, was founded by the Romans as Londinium and has retained its medieval boundaries. The City of Westminster, to the west of the City of London, has been the site of the national government and parliament for centuries. London grew rapidly in the 19th century, becoming the world''s largest city at the time. Since the 19th century the name "London" has referred to the metropolis around the City of London, historically split among the counties of Middlesex, Essex, Surrey, Kent and Hertfordshire. Since 1965 it has largely comprised the administrative area of Greater London, governed by 33 local authorities and the Greater London Authority.',
    'wikipedia', 'https://en.wikipedia.org/wiki/London', 'CC BY-SA', 'Wikipedia contributors, London', now()
  from country_ref
  on conflict (country_id, slug) do update set
    name_az = excluded.name_az,
    name_en = excluded.name_en,
    name_ru = excluded.name_ru,
    lat = excluded.lat,
    lng = excluded.lng,
    population = excluded.population,
    short_desc_en = excluded.short_desc_en,
    description_en = excluded.description_en,
    source = excluded.source,
    source_url = excluded.source_url,
    license = excluded.license,
    attribution_text = excluded.attribution_text,
    last_synced_at = now()
  returning id, country_id
), place_values as (
  select * from (values
    ('10-downing-street', '10 Downing Street', null, null, null, 'attraction', 'attraction', 51.5034994, -0.1275539, '10, Downing Street, London', 'https://www.gov.uk/government/organisations/prime-ministers-office-10-downing-street', null, null, null, 'openstreetmap', 'relation/1879842', 'https://www.openstreetmap.org/relation/1879842', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"relation/1879842","category":"attraction","import_city":"london"}'::jsonb),
    ('575-wandsworth-road', '575 Wandsworth Road', null, null, null, 'attraction', 'attraction', 51.4697018, -0.1406549, '575, Wandsworth Road, London', 'https://www.nationaltrust.org.uk/575-wandsworth-road#Overview', '+44 344 249 1895', '575wandsworthroad@nationaltrust.org.uk', null, 'openstreetmap', 'node/8280936617', 'https://www.openstreetmap.org/node/8280936617', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/8280936617","category":"attraction","import_city":"london"}'::jsonb),
    ('abbey-road-studios', 'Abbey Road Studios', null, 'Abbey Road Studios', 'Эбби-Роуд (студия)', 'attraction', 'attraction', 51.5319966, -0.1782181, '3, Abbey Road, London', 'https://www.abbeyroad.com', '+44 20 7266 7000', 'info@abbeyroad.com', null, 'openstreetmap', 'way/396544249', 'https://www.openstreetmap.org/way/396544249', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/396544249","category":"attraction","import_city":"london"}'::jsonb),
    ('all-souls-church', 'All Souls Church', null, 'All Souls Church', null, 'attraction', 'attraction', 51.518153, -0.1430256, 'Langham Place, London', 'https://www.allsouls.org/', null, null, null, 'openstreetmap', 'way/27922125', 'https://www.openstreetmap.org/way/27922125', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/27922125","category":"attraction","import_city":"london"}'::jsonb),
    ('baden-powell-house', 'Baden-Powell House', null, null, null, 'attraction', 'attraction', 51.4955099, -0.1796687, '65-67, Queen''s Gate, London', 'https://www.mpw.ac.uk/queens-gate-house/', null, null, null, 'openstreetmap', 'way/392722404', 'https://www.openstreetmap.org/way/392722404', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/392722404","category":"attraction","import_city":"london"}'::jsonb),
    ('bank-of-england', 'Bank of England', null, 'Bank of England', 'Банк Англии', 'attraction', 'attraction', 51.5141144, -0.088557, '8AH, Threadneedle Street, London', 'https://www.bankofengland.co.uk', '+44 20 3461 4444', 'last@bankofengland.co.uk', null, 'openstreetmap', 'relation/553472', 'https://www.openstreetmap.org/relation/553472', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"relation/553472","category":"attraction","import_city":"london"}'::jsonb),
    ('bankside-gallery', 'Bankside Gallery', null, null, null, 'attraction', 'attraction', 51.5081907, -0.1011433, '48, Hopton Street, London', 'https://www.banksidegallery.com/', '+44 20 7928 7521', 'info@banksidegallery.com', 'Mo-Su 11:00-18:00 "during exhibitions"', 'openstreetmap', 'way/77755310', 'https://www.openstreetmap.org/way/77755310', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/77755310","category":"attraction","import_city":"london"}'::jsonb),
    ('banqueting-house', 'Banqueting House', null, 'Banqueting House', null, 'attraction', 'attraction', 51.5045773, -0.1259162, 'London', 'https://www.hrp.org.uk/banqueting-house/#gs.4m8l6l', null, null, 'Tu-Th, Sa-Su 10:00-17:00; Mo 10:00-13:00; Fr 10:00-16:00', 'openstreetmap', 'way/140470549', 'https://www.openstreetmap.org/way/140470549', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/140470549","category":"attraction","import_city":"london"}'::jsonb),
    ('bfi-imax', 'BFI IMAX', null, null, null, 'attraction', 'attraction', 51.504821, -0.1136286, '1, Charlie Chaplin Walk, London', 'http://www.bfi.org.uk/bfi-imax', null, null, null, 'openstreetmap', 'way/123444154', 'https://www.openstreetmap.org/way/123444154', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/123444154","category":"attraction","import_city":"london"}'::jsonb),
    ('bridge-theatre', 'Bridge Theatre', null, null, null, 'attraction', 'attraction', 51.5040964, -0.0773186, '3, Potters Fields Park, London', 'https://bridgetheatre.co.uk/', null, null, null, 'openstreetmap', 'node/5210995811', 'https://www.openstreetmap.org/node/5210995811', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/5210995811","category":"attraction","import_city":"london"}'::jsonb),
    ('british-library', 'British Library', null, 'British Library', null, 'attraction', 'attraction', 51.5300022, -0.1277087, '96, Euston Road, London', 'https://www.bl.uk/', '+44 330 333 1144', null, 'Mo-Th 09:30-20:00; Sa 09:30-17:00; Su 11:00-17:00; Fr 09:30-18:00', 'openstreetmap', 'way/4680891', 'https://www.openstreetmap.org/way/4680891', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/4680891","category":"attraction","import_city":"london"}'::jsonb),
    ('buckingham-palace', 'Buckingham Palace', 'Bukinqem sarayı', 'Buckingham Palace', 'Букингемский дворец', 'attraction', 'attraction', 51.5008342, -0.1426584, 'London', 'https://www.royalcollection.org.uk/visit/the-state-rooms-buckingham-palace', '+44 20 7766 7300', null, 'Mo-Su 10:00-17:30', 'openstreetmap', 'relation/5208404', 'https://www.openstreetmap.org/relation/5208404', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"relation/5208404","category":"attraction","import_city":"london"}'::jsonb),
    ('camden-lock-market', 'Camden Lock Market', null, null, null, 'attraction', 'attraction', 51.5412635, -0.1460861, 'Camden Lock Place, London', 'https://www.camdenmarket.com/', null, null, null, 'openstreetmap', 'way/104240016', 'https://www.openstreetmap.org/way/104240016', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/104240016","category":"attraction","import_city":"london"}'::jsonb),
    ('camden-market', 'Camden Market', null, null, null, 'attraction', 'attraction', 51.5423781, -0.1471949, '56-56, Camden Lock Place, London', 'https://www.camdenmarket.com/', '+44 20 3763 9999', 'info@camdenmarket.com', '10:00-18:00', 'openstreetmap', 'node/3608653828', 'https://www.openstreetmap.org/node/3608653828', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/3608653828","category":"attraction","import_city":"london"}'::jsonb),
    ('carnaby-street', 'Carnaby Street', null, null, null, 'attraction', 'attraction', 51.513122, -0.1387655, null, 'https://en.wikipedia.org/wiki/Carnaby_Street', null, null, null, 'openstreetmap', 'node/5657364621', 'https://www.openstreetmap.org/node/5657364621', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/5657364621","category":"attraction","import_city":"london"}'::jsonb),
    ('chelsea-physic-garden', 'Chelsea Physic Garden', null, 'Chelsea Physic Garden', 'Аптекарский сад Челси', 'attraction', 'attraction', 51.4846484, -0.1621613, '66, Royal Hospital Road, London', 'https://www.chelseaphysicgarden.co.uk/', null, null, 'Mo-Su 09:30-16:00', 'openstreetmap', 'way/10806964', 'https://www.openstreetmap.org/way/10806964', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/10806964","category":"attraction","import_city":"london"}'::jsonb),
    ('clerk-s-well', 'Clerk''s Well', null, null, null, 'attraction', 'attraction', 51.5228042, -0.1066064, null, 'https://www.islington.gov.uk/leisure/heritage/heritage_borough/bor_sites/clerkswell.asp', '+44 20 7527 7988', 'local.history@islington.gov.uk', null, 'openstreetmap', 'way/155343100', 'https://www.openstreetmap.org/way/155343100', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/155343100","category":"attraction","import_city":"london"}'::jsonb),
    ('covent-garden-market', 'Covent Garden Market', null, 'Covent Garden Market', null, 'attraction', 'attraction', 51.5119783, -0.122741, 'London', 'https://www.coventgarden.london/shop/markets/', null, null, null, 'openstreetmap', 'way/633369346', 'https://www.openstreetmap.org/way/633369346', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/633369346","category":"attraction","import_city":"london"}'::jsonb),
    ('crown-jewels', 'Crown Jewels', null, null, null, 'attraction', 'attraction', 51.5085864, -0.0758418, null, 'https://www.hrp.org.uk/tower-of-london/whats-on/the-crown-jewels/', null, null, null, 'openstreetmap', 'node/3453930443', 'https://www.openstreetmap.org/node/3453930443', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/3453930443","category":"attraction","import_city":"london"}'::jsonb),
    ('cyberdog', 'Cyberdog', null, null, null, 'attraction', 'attraction', 51.5422203, -0.1474331, 'The Stables Market, London', 'https://www.cyberdog.net', '+44 20 7482 2842', null, 'Mo-Th 11:00-19:30; Fr 11:00-20:00; Sa, Su 10:00-20:00', 'openstreetmap', 'node/560040794', 'https://www.openstreetmap.org/node/560040794', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/560040794","category":"attraction","import_city":"london"}'::jsonb)
  ) as v(slug, name, name_az, name_en, name_ru, category, subcategory, lat, lng, address, website, phone, email, opening_hours, source, source_place_id, source_url, license, attribution_text, raw_data)
), upserted_places as (
  insert into places (
    city_id, country_id, slug, name, name_az, name_en, name_ru, category, subcategory, lat, lng,
    address, website, phone, email, opening_hours, source, source_place_id, source_url, license, attribution_text, raw_data, last_synced_at
  )
  select
    upserted_city.id, upserted_city.country_id, v.slug, v.name, v.name_az, v.name_en, v.name_ru, v.category, v.subcategory,
    v.lat, v.lng, v.address, v.website, v.phone, v.email, v.opening_hours, v.source, v.source_place_id,
    v.source_url, v.license, v.attribution_text, v.raw_data, now()
  from place_values v cross join upserted_city
  on conflict (source, source_place_id) where source_place_id is not null do update set
    city_id = excluded.city_id,
    country_id = excluded.country_id,
    slug = excluded.slug,
    name = excluded.name,
    name_az = excluded.name_az,
    name_en = excluded.name_en,
    name_ru = excluded.name_ru,
    category = excluded.category,
    subcategory = excluded.subcategory,
    lat = excluded.lat,
    lng = excluded.lng,
    address = excluded.address,
    website = excluded.website,
    phone = excluded.phone,
    email = excluded.email,
    opening_hours = excluded.opening_hours,
    source_url = excluded.source_url,
    license = excluded.license,
    attribution_text = excluded.attribution_text,
    raw_data = excluded.raw_data,
    last_synced_at = now()
  returning id, source, source_place_id, source_url, license, attribution_text, raw_data
), upserted_sources as (
  insert into place_sources (place_id, source, source_id, source_url, license, attribution_text, raw_data)
  select id, source, source_place_id, source_url, license, attribution_text, raw_data
  from upserted_places
  on conflict (place_id, source, source_id) where source_id is not null do update set
    source_url = excluded.source_url,
    license = excluded.license,
    attribution_text = excluded.attribution_text,
    raw_data = excluded.raw_data
  returning id
)
insert into external_import_logs (source, entity_type, status, imported_count, skipped_count, metadata, started_at, finished_at)
select 'overpass', 'city_places', 'success', count(*), 0, '{"city":"london","generated_at":"2026-05-04T23:00:12.467Z"}'::jsonb, now(), now()
from upserted_places;

commit;


-- ============================================================
-- CITY: ROME
-- ============================================================

-- TravelAZ open travel data import
-- City: Rome
-- Generated: 2026-05-04T23:00:11.585Z
-- Sources: Wikipedia summary (CC BY-SA), OpenStreetMap/Overpass (ODbL)
-- Run this after supabase/migrations/020_open_travel_data.sql has been applied.

begin;

with country_ref as (
  select id from countries where slug = 'italy' limit 1
), upserted_city as (
  insert into cities (
    country_id, slug, name_az, name_en, name_ru, lat, lng, population,
    short_desc_en, description_en, source, source_url, license, attribution_text, last_synced_at
  )
  select
    country_ref.id, 'rome', 'Roma', 'Rome', 'Рим',
    41.9028, 12.4964, 2758000,
    'Rome is the capital city and most populated comune (municipality) of Italy. It is also the administrative centre of the Lazio region and of the Metropolitan City of Rome. A special comune named Roma Capitale with a population of 2.7 million in an area of 1,287.36 km2 (497.1 mi2), Rome is the third most populous city in the European Union by population within city limits. The Metropolitan City of Rome Capital, with a population of 4.2 million, is the most populous metropolitan city in Italy. Its metropolitan area is the third-most populous within Italy. Rome is located in the central-western portion of the Italian Peninsula, within Lazio (Latium), along the shores of the Tiber Valley. Vatican City is an independent country inside the city boundaries of Rome, the only existing example of a country within a city. Rome is often referred to as the "City of Seven Hills" due to its geography, and also as the "Eternal City". Rome is generally considered to be one of the cradles of Western civilization and Western Christian culture, and the centre of the Catholic Church.', 'Rome is the capital city and most populated comune (municipality) of Italy. It is also the administrative centre of the Lazio region and of the Metropolitan City of Rome. A special comune named Roma Capitale with a population of 2.7 million in an area of 1,287.36 km2 (497.1 mi2), Rome is the third most populous city in the European Union by population within city limits. The Metropolitan City of Rome Capital, with a population of 4.2 million, is the most populous metropolitan city in Italy. Its metropolitan area is the third-most populous within Italy. Rome is located in the central-western portion of the Italian Peninsula, within Lazio (Latium), along the shores of the Tiber Valley. Vatican City is an independent country inside the city boundaries of Rome, the only existing example of a country within a city. Rome is often referred to as the "City of Seven Hills" due to its geography, and also as the "Eternal City". Rome is generally considered to be one of the cradles of Western civilization and Western Christian culture, and the centre of the Catholic Church.',
    'wikipedia', 'https://en.wikipedia.org/wiki/Rome', 'CC BY-SA', 'Wikipedia contributors, Rome', now()
  from country_ref
  on conflict (country_id, slug) do update set
    name_az = excluded.name_az,
    name_en = excluded.name_en,
    name_ru = excluded.name_ru,
    lat = excluded.lat,
    lng = excluded.lng,
    population = excluded.population,
    short_desc_en = excluded.short_desc_en,
    description_en = excluded.description_en,
    source = excluded.source,
    source_url = excluded.source_url,
    license = excluded.license,
    attribution_text = excluded.attribution_text,
    last_synced_at = now()
  returning id, country_id
), place_values as (
  select * from (values
    ('arco-di-costantino', 'Arco di Costantino', null, 'Arch of Constantine', 'Триумфальная арка Константина', 'attraction', 'attraction', 41.8897623, 12.4906668, null, 'http://archeoroma.beniculturali.it/siti-archeologici/arco-costantino', null, null, null, 'openstreetmap', 'way/23590989', 'https://www.openstreetmap.org/way/23590989', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/23590989","category":"attraction","import_city":"rome"}'::jsonb),
    ('area-sacra-dell-argentina', 'Area sacra dell''Argentina', null, null, null, 'attraction', 'attraction', 41.8953968, 12.4768864, null, 'https://www.sovraintendenzaroma.it/i_luoghi/roma_antica/aree_archeologiche/area_sacra_di_largo_argentina', null, null, null, 'openstreetmap', 'way/125566956', 'https://www.openstreetmap.org/way/125566956', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/125566956","category":"attraction","import_city":"rome"}'::jsonb),
    ('aula-gotica', 'Aula Gotica', null, null, null, 'attraction', 'attraction', 41.8884013, 12.4985606, null, 'https://www.aulagoticasantiquattrocoronati.it/', null, null, null, 'openstreetmap', 'node/12484449287', 'https://www.openstreetmap.org/node/12484449287', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/12484449287","category":"attraction","import_city":"rome"}'::jsonb),
    ('basilica-di-san-clemente-al-laterano', 'Basilica di San Clemente al Laterano', null, 'Basilica of St.Clement', null, 'attraction', 'attraction', 41.8893219, 12.4976195, '95, Via Labicana, Roma', 'https://www.basilicasanclemente.com/', null, null, 'Mo-Sa 09:00-12:00,14:00-17:30; Su 12:00-17:30', 'openstreetmap', 'relation/326080', 'https://www.openstreetmap.org/relation/326080', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"relation/326080","category":"attraction","import_city":"rome"}'::jsonb),
    ('basilica-di-san-giovanni-in-laterano', 'Basilica di San Giovanni in Laterano', null, 'Basilica of Saint John Lateran', 'Базилика Сан Джованни ин Латерано', 'attraction', 'attraction', 41.8857617, 12.5055858, 'Piazza di San Giovanni in Laterano, Roma', 'https://www.basilicasangiovanni.va/', null, null, 'Mo-Su 07:00-18:30', 'openstreetmap', 'relation/36444', 'https://www.openstreetmap.org/relation/36444', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"relation/36444","category":"attraction","import_city":"rome"}'::jsonb),
    ('basilica-di-san-lorenzo-fuori-le-mura', 'Basilica di San Lorenzo fuori le Mura', null, 'Basilica of Saint Lawrence outside the Walls', null, 'attraction', 'attraction', 41.9025521, 12.5209716, '3, Piazzale del Verano, Roma', 'https://www.basilicasanlorenzofuorilemura.it/', '+39 06 491 511', null, '07:00-12:00,16:00-19:00', 'openstreetmap', 'relation/422911', 'https://www.openstreetmap.org/relation/422911', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"relation/422911","category":"attraction","import_city":"rome"}'::jsonb),
    ('basilica-di-san-paolo-fuori-le-mura', 'Basilica di San Paolo fuori le mura', null, 'Basilica of Saint Paul Outside the Walls', 'Сан-Паоло-фуори-ле-Мура', 'attraction', 'attraction', 41.8586828, 12.4768291, '1, Piazzale San Paolo, Roma', 'https://www.basilicasanpaolo.org/', null, 'info@basilicasanpaolo.org', '07:00-18:30', 'openstreetmap', 'way/23370510', 'https://www.openstreetmap.org/way/23370510', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/23370510","category":"attraction","import_city":"rome"}'::jsonb),
    ('basilica-di-san-pietro', 'Basilica di San Pietro', null, 'Saint Peter''s Basilica', 'Собор Святого Петра', 'attraction', 'attraction', 41.9021616, 12.4537132, 'Piazza San Pietro', 'https://www.basilicasanpietro.va/it', '+39 06 69 88 34 62', null, '07:00-19:10', 'openstreetmap', 'way/244159210', 'https://www.openstreetmap.org/way/244159210', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/244159210","category":"attraction","import_city":"rome"}'::jsonb),
    ('basilica-di-san-pietro-in-vincoli', 'Basilica di San Pietro in Vincoli', null, 'Saint Peter in Chains', 'церковь Сан Пьетро ин Винколи', 'attraction', 'attraction', 41.8938552, 12.4931626, '4/a, Piazza di San Pietro in Vincoli, Roma', 'http://www.lateranensi.org/sanpietroinvincoli/', null, null, '08:00-12:30,15:00-18:00; Mar Su[-1]-Oct Su[-1] -1 day 08:00-12:30,15:00-19:00', 'openstreetmap', 'way/201882369', 'https://www.openstreetmap.org/way/201882369', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/201882369","category":"attraction","import_city":"rome"}'::jsonb),
    ('basilica-di-san-sebastiano-fuori-le-mura', 'Basilica di San Sebastiano fuori le mura', null, null, null, 'attraction', 'attraction', 41.8555984, 12.5155635, null, 'https://www.sansebastianofuorilemura.org/', null, null, 'Oct-Mar 08:15-18:00; Apr-Sep 08:15-19:00', 'openstreetmap', 'way/50773061', 'https://www.openstreetmap.org/way/50773061', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/50773061","category":"attraction","import_city":"rome"}'::jsonb),
    ('basilica-di-sant-andrea-della-valle', 'Basilica di Sant''Andrea della Valle', null, null, null, 'attraction', 'attraction', 41.8960034, 12.4743329, 'Corso Vittorio Emanuele Secondo, Roma', 'https://santandrea.teatinos.org/', null, null, 'Mo-Fr 08:30-20:00; Sa 11:45-20:00; Su 08:45-20:00', 'openstreetmap', 'way/25625603', 'https://www.openstreetmap.org/way/25625603', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/25625603","category":"attraction","import_city":"rome"}'::jsonb),
    ('basilica-di-sant-andrea-delle-fratte', 'Basilica di Sant''Andrea delle Fratte', null, null, null, 'attraction', 'attraction', 41.9036404, 12.4838527, null, 'https://www.madonnadelmiracolo.it/', null, null, null, 'openstreetmap', 'way/202339987', 'https://www.openstreetmap.org/way/202339987', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/202339987","category":"attraction","import_city":"rome"}'::jsonb),
    ('basilica-di-santa-cecilia-in-trastevere', 'Basilica di Santa Cecilia in Trastevere', null, null, 'Базилика Санта Чечилия ин Трастевере', 'attraction', 'attraction', 41.8875608, 12.4758567, null, 'https://www.benedettinesantacecilia.it/', null, null, 'Mo-Sa 10:00-12:30, 16:30-18:00; Su,PH 11:30-12:30', 'openstreetmap', 'way/86250354', 'https://www.openstreetmap.org/way/86250354', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/86250354","category":"attraction","import_city":"rome"}'::jsonb),
    ('basilica-di-santa-croce-in-gerusalemme', 'Basilica di Santa Croce in Gerusalemme', null, 'Basilica of the Holy Cross in Jerusalem', 'Церковь Санта-Кроче ин Джерузалемме (Церковь Святого Креста в Иерусалиме)', 'attraction', 'attraction', 41.8882257, 12.5158571, null, 'http://www.santacroceroma.it', null, null, '07:30-19:00', 'openstreetmap', 'way/998191514', 'https://www.openstreetmap.org/way/998191514', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/998191514","category":"attraction","import_city":"rome"}'::jsonb),
    ('basilica-di-santa-maria-degli-angeli-e-dei-martiri', 'Basilica di Santa Maria degli Angeli e dei Martiri', null, null, 'Церковь Санта Мария дельи Анджели', 'attraction', 'attraction', 41.9034429, 12.4973373, null, 'https://www.santamariadegliangeliroma.com/', null, null, 'Mo-Fr 08:00-13:00,16:00-19:00; Sa-Su 10:00-13:00,16:00-19:00', 'openstreetmap', 'way/201482365', 'https://www.openstreetmap.org/way/201482365', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/201482365","category":"attraction","import_city":"rome"}'::jsonb),
    ('basilica-di-santa-maria-in-trastevere', 'Basilica di Santa Maria in Trastevere', null, null, 'базилика Санта Мария ин Трастевере', 'attraction', 'attraction', 41.8894264, 12.4694941, 'Piazza di Santa Maria in Trastevere', 'https://www.santamariaintrastevere.it/', null, null, 'Mo-Su 07:30-20:30', 'openstreetmap', 'way/51368975', 'https://www.openstreetmap.org/way/51368975', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/51368975","category":"attraction","import_city":"rome"}'::jsonb),
    ('basilica-di-santa-maria-maggiore', 'Basilica di Santa Maria Maggiore', null, 'Basilica of Saint Mary Major', 'Церковь Санта Мария Маджоре', 'attraction', 'attraction', 41.8976084, 12.4984576, 'Piazza di Santa Maria Maggiore, Roma', 'https://www.basilicasantamariamaggiore.va', '+39 06 698 86800', 'sagrestiasmm@org.va', 'Mo-Su 07:00-19:00', 'openstreetmap', 'way/131564482', 'https://www.openstreetmap.org/way/131564482', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/131564482","category":"attraction","import_city":"rome"}'::jsonb),
    ('basilica-di-santa-maria-sopra-minerva', 'Basilica di Santa Maria sopra Minerva', null, null, 'Базилика Санта Мария Сопра Минерва', 'attraction', 'attraction', 41.8979917, 12.4783662, null, 'https://www.santamariasopraminerva.it', null, null, 'Mo-Fr 08:00-20:00; Sa,Su,PH 10:30-13:00,14:00-19:30', 'openstreetmap', 'way/25400176', 'https://www.openstreetmap.org/way/25400176', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/25400176","category":"attraction","import_city":"rome"}'::jsonb),
    ('basilica-di-santa-prassede', 'Basilica di Santa Prassede', null, null, 'Церковь Санта-Прасседе', 'attraction', 'attraction', 41.8962403, 12.4986933, null, 'https://santaprassede.wordpress.com', '+39 06 4882456', null, 'Mo-Sa 10:00-12:00,16:00-18:00; Su 10:00-11:00,16:00-18:00', 'openstreetmap', 'way/44448525', 'https://www.openstreetmap.org/way/44448525', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/44448525","category":"attraction","import_city":"rome"}'::jsonb),
    ('basilica-di-santa-pudenziana-al-viminale', 'Basilica di Santa Pudenziana al Viminale', null, 'Basilica of St. Pudentiana', 'Церковь Санта-Пуденциана', 'attraction', 'attraction', 41.8984577, 12.4954286, null, 'https://www.stpudenziana.org/', null, null, 'Mo-Sa 09:00-11:30', 'openstreetmap', 'way/112796242', 'https://www.openstreetmap.org/way/112796242', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/112796242","category":"attraction","import_city":"rome"}'::jsonb)
  ) as v(slug, name, name_az, name_en, name_ru, category, subcategory, lat, lng, address, website, phone, email, opening_hours, source, source_place_id, source_url, license, attribution_text, raw_data)
), upserted_places as (
  insert into places (
    city_id, country_id, slug, name, name_az, name_en, name_ru, category, subcategory, lat, lng,
    address, website, phone, email, opening_hours, source, source_place_id, source_url, license, attribution_text, raw_data, last_synced_at
  )
  select
    upserted_city.id, upserted_city.country_id, v.slug, v.name, v.name_az, v.name_en, v.name_ru, v.category, v.subcategory,
    v.lat, v.lng, v.address, v.website, v.phone, v.email, v.opening_hours, v.source, v.source_place_id,
    v.source_url, v.license, v.attribution_text, v.raw_data, now()
  from place_values v cross join upserted_city
  on conflict (source, source_place_id) where source_place_id is not null do update set
    city_id = excluded.city_id,
    country_id = excluded.country_id,
    slug = excluded.slug,
    name = excluded.name,
    name_az = excluded.name_az,
    name_en = excluded.name_en,
    name_ru = excluded.name_ru,
    category = excluded.category,
    subcategory = excluded.subcategory,
    lat = excluded.lat,
    lng = excluded.lng,
    address = excluded.address,
    website = excluded.website,
    phone = excluded.phone,
    email = excluded.email,
    opening_hours = excluded.opening_hours,
    source_url = excluded.source_url,
    license = excluded.license,
    attribution_text = excluded.attribution_text,
    raw_data = excluded.raw_data,
    last_synced_at = now()
  returning id, source, source_place_id, source_url, license, attribution_text, raw_data
), upserted_sources as (
  insert into place_sources (place_id, source, source_id, source_url, license, attribution_text, raw_data)
  select id, source, source_place_id, source_url, license, attribution_text, raw_data
  from upserted_places
  on conflict (place_id, source, source_id) where source_id is not null do update set
    source_url = excluded.source_url,
    license = excluded.license,
    attribution_text = excluded.attribution_text,
    raw_data = excluded.raw_data
  returning id
)
insert into external_import_logs (source, entity_type, status, imported_count, skipped_count, metadata, started_at, finished_at)
select 'overpass', 'city_places', 'success', count(*), 0, '{"city":"rome","generated_at":"2026-05-04T23:00:11.585Z"}'::jsonb, now(), now()
from upserted_places;

commit;


