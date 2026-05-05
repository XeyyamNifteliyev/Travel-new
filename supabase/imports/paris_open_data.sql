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
