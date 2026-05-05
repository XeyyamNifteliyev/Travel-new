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
