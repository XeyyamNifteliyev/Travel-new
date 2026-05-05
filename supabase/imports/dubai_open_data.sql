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
