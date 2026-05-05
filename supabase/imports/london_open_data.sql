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
