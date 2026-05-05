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
