-- TravelAZ open travel data import
-- City: Istanbul
-- Generated: 2026-05-03T19:59:09.900Z
-- Sources: Wikipedia summary (CC BY-SA), OpenStreetMap/Overpass (ODbL)
-- Run this after supabase/migrations/020_open_travel_data.sql has been applied.

begin;

with country_ref as (
  select id from countries where slug = 'turkey' limit 1
), upserted_city as (
  insert into cities (
    country_id, slug, name_az, name_en, name_ru, lat, lng, population,
    short_desc_en, description_en, source, source_url, license, attribution_text, last_synced_at
  )
  select
    country_ref.id, 'istanbul', 'Istanbul', 'Istanbul', 'Стамбул',
    41.0082, 28.9784, 15655924,
    'Istanbul is the largest city in Turkey, constituting the country''s economic, cultural, and historical center. With a population of over 15 million, it is home to 18% of the population of Turkey. Istanbul is among the largest cities in Europe and in the world by population. It is a city on two continents; about two-thirds of its population live in Europe and the rest in Asia. Istanbul straddles the Bosphorus – one of the world''s busiest waterways – in northwestern Turkey, between the Sea of Marmara and the Black Sea. Its area of 5,461 square kilometers (2,109 mi2) is coterminous with Istanbul Province.', 'Istanbul is the largest city in Turkey, constituting the country''s economic, cultural, and historical center. With a population of over 15 million, it is home to 18% of the population of Turkey. Istanbul is among the largest cities in Europe and in the world by population. It is a city on two continents; about two-thirds of its population live in Europe and the rest in Asia. Istanbul straddles the Bosphorus – one of the world''s busiest waterways – in northwestern Turkey, between the Sea of Marmara and the Black Sea. Its area of 5,461 square kilometers (2,109 mi2) is coterminous with Istanbul Province.',
    'wikipedia', 'https://en.wikipedia.org/wiki/Istanbul', 'CC BY-SA', 'Wikipedia contributors, Istanbul', now()
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
    ('ayasofya', 'Ayasofya', 'Aya Sofya', 'Hagia Sophia', 'Собор Святой Софии', 'attraction', 'attraction', 41.0085112, 28.9799976, '1, Ayasofya Meydanı, Fatih, İstanbul', 'https://muze.gen.tr/muze-detay/ayasofya', '+90 212 522 1750', 'contact@muze.gen.tr', 'Mo-Su 09:00-19:30', 'openstreetmap', 'way/109862851', 'https://www.openstreetmap.org/way/109862851', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/109862851","category":"attraction","import_city":"istanbul"}'::jsonb),
    ('galata-kulesi', 'Galata Kulesi', null, 'Galata Tower', 'Галатская башня', 'attraction', 'attraction', 41.0256344, 28.974213, 'Bereketzade Mahallesi, İstanbul', 'https://muze.gen.tr/muze-detay/galatakulesi', '+90 212 293 81 80', null, '09:00-20:30', 'openstreetmap', 'way/23236783', 'https://www.openstreetmap.org/way/23236783', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/23236783","category":"attraction","import_city":"istanbul"}'::jsonb),
    ('haseki-hurrem-hamam', 'Haseki Hürrem Hamamı', null, 'Haseki Hürrem Hammam', 'Хаммам Хасеки Хюррем', 'attraction', 'attraction', 41.0069452, 28.9788591, null, 'http://www.ayasofyahamami.com', null, null, null, 'openstreetmap', 'way/151790453', 'https://www.openstreetmap.org/way/151790453', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/151790453","category":"attraction","import_city":"istanbul"}'::jsonb),
    ('mevlana-bazaar', 'Mevlana Bazaar', null, null, null, 'attraction', 'attraction', 41.0028112, 28.9797131, '38, Kennedy Caddesi, Fatih, İstanbul', 'www.mevlanabazaar.com', '+90 212 458 24 27', 'info@mevlanabazaar.com', 'Mo-Su 08:00-22:00', 'openstreetmap', 'way/414450099', 'https://www.openstreetmap.org/way/414450099', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/414450099","category":"attraction","import_city":"istanbul"}'::jsonb),
    ('sultan-ahmet-turbesi', 'Sultan Ahmet Türbesi', null, 'Tomb of Sultan Ahmed I', 'Гробница Султана Ахмета', 'attraction', 'attraction', 41.0067894, 28.9769854, null, 'https://www.voyageturquie.info/sultan-ahmet-turbesi-istanbul/', null, null, null, 'openstreetmap', 'way/103953125', 'https://www.openstreetmap.org/way/103953125', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/103953125","category":"attraction","import_city":"istanbul"}'::jsonb),
    ('sultanahmet-camii', 'Sultanahmet Camii', null, 'Blue Mosque', 'Голубая мечеть', 'attraction', 'attraction', 41.0054066, 28.9766495, '7, Atmeydanı Caddesi, Fatih, İstanbul', 'https://www.geziyerler.com/sultan-ahmet-camii', '+90 212 518 1319', 'info@sultanahmetcamii.org', 'Mo-Su 08:30-12:15, 14:00-16:45, 17:45-18:30', 'openstreetmap', 'relation/18055570', 'https://www.openstreetmap.org/relation/18055570', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"relation/18055570","category":"attraction","import_city":"istanbul"}'::jsonb),
    ('topkap-saray', 'Topkapı Sarayı', null, 'Topkapı Palace', 'дворец Топкапы', 'attraction', 'attraction', 41.01281, 28.9840154, null, 'https://muze.gen.tr/', null, 'contact@muze.gen.tr', null, 'openstreetmap', 'way/335415778', 'https://www.openstreetmap.org/way/335415778', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"way/335415778","category":"attraction","import_city":"istanbul"}'::jsonb),
    ('yerebatan-sarn-c', 'Yerebatan Sarnıcı', null, 'Basilica Cistern (Exit)', 'Цистерна Базилика', 'attraction', 'attraction', 41.0084795, 28.9783826, '1, Yerebatan Caddesi, Fatih, İstanbul', 'http://yerebatansarnici.com/', '+90 212 522 12 59', 'info@yerebatan.com', 'Mo-Su 09:00-19:00', 'openstreetmap', 'node/11006008339', 'https://www.openstreetmap.org/node/11006008339', 'ODbL', 'OpenStreetMap contributors', '{"source_place_id":"node/11006008339","category":"attraction","import_city":"istanbul"}'::jsonb)
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
select 'overpass', 'city_places', 'success', count(*), 0, '{"city":"istanbul","generated_at":"2026-05-03T19:59:09.900Z"}'::jsonb, now(), now()
from upserted_places;

commit;
