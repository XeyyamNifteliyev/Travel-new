const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const WIKIPEDIA_SUMMARY_URL = 'https://en.wikipedia.org/api/rest_v1/page/summary/';

const CITY_PRESETS = {
  istanbul: {
    countrySlug: 'turkey',
    slug: 'istanbul',
    name: 'Istanbul',
    nameAz: 'Istanbul',
    nameEn: 'Istanbul',
    nameRu: 'Стамбул',
    lat: 41.0082,
    lng: 28.9784,
    population: 15655924,
    wikiTitle: 'Istanbul',
  },
  paris: {
    countrySlug: 'france',
    slug: 'paris',
    name: 'Paris',
    nameAz: 'Paris',
    nameEn: 'Paris',
    nameRu: 'Париж',
    lat: 48.8566,
    lng: 2.3522,
    population: 2102650,
    wikiTitle: 'Paris',
  },
  rome: {
    countrySlug: 'italy',
    slug: 'rome',
    name: 'Rome',
    nameAz: 'Roma',
    nameEn: 'Rome',
    nameRu: 'Рим',
    lat: 41.9028,
    lng: 12.4964,
    population: 2758000,
    wikiTitle: 'Rome',
  },
  dubai: {
    countrySlug: 'dubai',
    slug: 'dubai',
    name: 'Dubai',
    nameAz: 'Dubay',
    nameEn: 'Dubai',
    nameRu: 'Дубай',
    lat: 25.2048,
    lng: 55.2708,
    population: 3604000,
    wikiTitle: 'Dubai',
  },
  tbilisi: {
    countrySlug: 'georgia',
    slug: 'tbilisi',
    name: 'Tbilisi',
    nameAz: 'Tbilisi',
    nameEn: 'Tbilisi',
    nameRu: 'Тбилиси',
    lat: 41.7151,
    lng: 44.8271,
    population: 1201769,
    wikiTitle: 'Tbilisi',
  },
  tokyo: {
    countrySlug: 'japan',
    slug: 'tokyo',
    name: 'Tokyo',
    nameAz: 'Tokio',
    nameEn: 'Tokyo',
    nameRu: 'Токио',
    lat: 35.6762,
    lng: 139.6503,
    population: 14094034,
    wikiTitle: 'Tokyo',
  },
  bangkok: {
    countrySlug: 'thailand',
    slug: 'bangkok',
    name: 'Bangkok',
    nameAz: 'Banqkok',
    nameEn: 'Bangkok',
    nameRu: 'Бангкок',
    lat: 13.7563,
    lng: 100.5018,
    population: 10539000,
    wikiTitle: 'Bangkok',
  },
  london: {
    countrySlug: 'uk',
    slug: 'london',
    name: 'London',
    nameAz: 'London',
    nameEn: 'London',
    nameRu: 'Лондон',
    lat: 51.5072,
    lng: -0.1276,
    population: 8799800,
    wikiTitle: 'London',
  },
  tehran: {
    countrySlug: 'iran',
    slug: 'tehran',
    name: 'Tehran',
    nameAz: 'Tehran',
    nameEn: 'Tehran',
    nameRu: 'Тегеран',
    lat: 35.6892,
    lng: 51.389,
    population: 9033000,
    wikiTitle: 'Tehran',
  },
  moscow: {
    countrySlug: 'russia',
    slug: 'moscow',
    name: 'Moscow',
    nameAz: 'Moskva',
    nameEn: 'Moscow',
    nameRu: 'Москва',
    lat: 55.7558,
    lng: 37.6173,
    population: 13010112,
    wikiTitle: 'Moscow',
  },
};

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, '');

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function parseArgs(argv) {
  const args = {
    city: 'istanbul',
    radius: 6000,
    limit: 80,
    apply: false,
    out: null,
    sqlOut: null,
    checkDb: false,
  };

  for (const arg of argv) {
    if (arg === '--apply') args.apply = true;
    else if (arg === '--dry-run') args.apply = false;
    else if (arg === '--check-db') args.checkDb = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else if (arg.startsWith('--city=')) args.city = arg.slice('--city='.length);
    else if (arg.startsWith('--radius=')) args.radius = Number(arg.slice('--radius='.length));
    else if (arg.startsWith('--limit=')) args.limit = Number(arg.slice('--limit='.length));
    else if (arg.startsWith('--out=')) args.out = arg.slice('--out='.length);
    else if (arg.startsWith('--sql-out=')) args.sqlOut = arg.slice('--sql-out='.length);
  }

  return args;
}

function printHelp() {
  console.log(`
Usage:
  npm run import:open-travel-data -- --city=istanbul --dry-run
  npm run import:open-travel-data -- --check-db
  npm run import:open-travel-data -- --city=paris --limit=50 --out=data/imports/paris.json
  npm run import:open-travel-data -- --city=istanbul --sql-out=supabase/imports/istanbul_open_data.sql
  npm run import:open-travel-data -- --city=istanbul --apply

Options:
  --city=<slug>     City preset slug. Default: istanbul
  --radius=<m>      Overpass radius in meters. Default: 6000
  --limit=<n>       Max places to keep. Default: 80
  --out=<path>      Write preview JSON to a file
  --sql-out=<path>  Write an idempotent SQL import file
  --check-db        Check Supabase tables and row counts without writing data
  --apply           Upsert city, places, sources, and import log into Supabase
  --dry-run         Fetch and preview only. This is the default.

Available cities:
  ${Object.keys(CITY_PRESETS).join(', ')}
`);
}

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

function sqlString(value) {
  if (value === null || value === undefined || value === '') return 'null';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : 'null';
}

function sqlJson(value) {
  return `'${JSON.stringify(value || {}).replace(/'/g, "''")}'::jsonb`;
}

function buildOverpassQuery(city, radius) {
  return `
[out:json][timeout:35];
(
  node["tourism"="attraction"](around:${radius},${city.lat},${city.lng});
  way["tourism"="attraction"](around:${radius},${city.lat},${city.lng});
  relation["tourism"="attraction"](around:${radius},${city.lat},${city.lng});
  node["tourism"="museum"](around:${radius},${city.lat},${city.lng});
  way["tourism"="museum"](around:${radius},${city.lat},${city.lng});
  relation["tourism"="museum"](around:${radius},${city.lat},${city.lng});
  node["tourism"="viewpoint"](around:${radius},${city.lat},${city.lng});
  way["tourism"="viewpoint"](around:${radius},${city.lat},${city.lng});
  relation["tourism"="viewpoint"](around:${radius},${city.lat},${city.lng});
  node["tourism"="hotel"](around:${radius},${city.lat},${city.lng});
  way["tourism"="hotel"](around:${radius},${city.lat},${city.lng});
  node["amenity"="restaurant"](around:${radius},${city.lat},${city.lng});
  way["amenity"="restaurant"](around:${radius},${city.lat},${city.lng});
  node["amenity"="cafe"](around:${radius},${city.lat},${city.lng});
  way["amenity"="cafe"](around:${radius},${city.lat},${city.lng});
  node["historic"](around:${radius},${city.lat},${city.lng});
  way["historic"](around:${radius},${city.lat},${city.lng});
  relation["historic"](around:${radius},${city.lat},${city.lng});
  node["leisure"="park"](around:${radius},${city.lat},${city.lng});
  way["leisure"="park"](around:${radius},${city.lat},${city.lng});
);
out center tags;
`;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'User-Agent': 'TravelAZ open data importer (development)',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed ${response.status}: ${url}`);
  }

  return response.json();
}

async function fetchWikipediaSummary(city) {
  const url = `${WIKIPEDIA_SUMMARY_URL}${encodeURIComponent(city.wikiTitle)}`;
  const data = await fetchJson(url);

  return {
    descriptionEn: data.extract || null,
    sourceUrl: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(city.wikiTitle)}`,
    license: 'CC BY-SA',
    attributionText: `Wikipedia contributors, ${city.wikiTitle}`,
  };
}

async function fetchOverpassPlaces(city, radius) {
  const query = buildOverpassQuery(city, radius);
  const body = new URLSearchParams({ data: query });
  const data = await fetchJson(OVERPASS_URL, {
    method: 'POST',
    body,
  });

  return Array.isArray(data.elements) ? data.elements : [];
}

function getElementLatLng(element) {
  if (typeof element.lat === 'number' && typeof element.lon === 'number') {
    return { lat: element.lat, lng: element.lon };
  }

  if (element.center && typeof element.center.lat === 'number' && typeof element.center.lon === 'number') {
    return { lat: element.center.lat, lng: element.center.lon };
  }

  return { lat: null, lng: null };
}

function mapCategory(tags) {
  if (tags.tourism === 'museum') return 'museum';
  if (tags.tourism === 'hotel') return 'hotel';
  if (tags.tourism === 'viewpoint') return 'viewpoint';
  if (tags.tourism === 'attraction') return 'attraction';
  if (tags.amenity === 'restaurant') return 'restaurant';
  if (tags.amenity === 'cafe') return 'cafe';
  if (tags.leisure === 'park') return 'park';
  if (tags.historic) return 'historic';
  return 'other';
}

function buildAddress(tags) {
  return [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:district'],
    tags['addr:city'],
  ].filter(Boolean).join(', ') || null;
}

function normalizePlace(element, city, countryId) {
  const tags = element.tags || {};
  const name = tags.name || tags['name:en'] || tags['name:az'] || tags['name:ru'];
  if (!name) return null;

  const coordinates = getElementLatLng(element);
  const sourcePlaceId = `${element.type}/${element.id}`;
  const category = mapCategory(tags);

  return {
    country_id: countryId,
    slug: slugify(name),
    name,
    name_az: tags['name:az'] || null,
    name_en: tags['name:en'] || null,
    name_ru: tags['name:ru'] || null,
    category,
    subcategory: tags.tourism || tags.amenity || tags.historic || tags.leisure || null,
    lat: coordinates.lat,
    lng: coordinates.lng,
    address: buildAddress(tags),
    website: tags.website || tags['contact:website'] || null,
    phone: tags.phone || tags['contact:phone'] || null,
    email: tags.email || tags['contact:email'] || null,
    opening_hours: tags.opening_hours || null,
    source: 'openstreetmap',
    source_place_id: sourcePlaceId,
    source_url: `https://www.openstreetmap.org/${sourcePlaceId}`,
    license: 'ODbL',
    attribution_text: 'OpenStreetMap contributors',
    raw_data: { osm: element, import_city: city.slug },
    last_synced_at: new Date().toISOString(),
  };
}

function dedupePlaces(places) {
  const seen = new Set();
  const result = [];

  for (const place of places) {
    const key = place.source_place_id || `${place.slug}:${place.lat}:${place.lng}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(place);
  }

  return result;
}

function getCategoryPriority(category) {
  const priorities = {
    attraction: 1,
    museum: 2,
    landmark: 3,
    historic: 4,
    viewpoint: 5,
    park: 6,
    restaurant: 7,
    cafe: 8,
    hotel: 9,
    shopping: 10,
    nightlife: 11,
    transport: 12,
    beach: 13,
    other: 99,
  };

  return priorities[category] || 99;
}

function rankPlaces(places) {
  return [...places].sort((a, b) => {
    const categoryDiff = getCategoryPriority(a.category) - getCategoryPriority(b.category);
    if (categoryDiff !== 0) return categoryDiff;

    const aHasWebsite = a.website ? 0 : 1;
    const bHasWebsite = b.website ? 0 : 1;
    if (aHasWebsite !== bHasWebsite) return aHasWebsite - bHasWebsite;

    return a.name.localeCompare(b.name);
  });
}

function buildImportSql(city, wikiSummary, places) {
  const now = new Date().toISOString();
  const lines = [];

  lines.push('-- TravelAZ open travel data import');
  lines.push(`-- City: ${city.name}`);
  lines.push(`-- Generated: ${now}`);
  lines.push('-- Sources: Wikipedia summary (CC BY-SA), OpenStreetMap/Overpass (ODbL)');
  lines.push('-- Run this after supabase/migrations/020_open_travel_data.sql has been applied.');
  lines.push('');
  lines.push('begin;');
  lines.push('');
  lines.push('with country_ref as (');
  lines.push(`  select id from countries where slug = ${sqlString(city.countrySlug)} limit 1`);
  lines.push('), upserted_city as (');
  lines.push('  insert into cities (');
  lines.push('    country_id, slug, name_az, name_en, name_ru, lat, lng, population,');
  lines.push('    short_desc_en, description_en, source, source_url, license, attribution_text, last_synced_at');
  lines.push('  )');
  lines.push('  select');
  lines.push(`    country_ref.id, ${sqlString(city.slug)}, ${sqlString(city.nameAz)}, ${sqlString(city.nameEn)}, ${sqlString(city.nameRu)},`);
  lines.push(`    ${sqlNumber(city.lat)}, ${sqlNumber(city.lng)}, ${sqlNumber(city.population)},`);
  lines.push(`    ${sqlString(wikiSummary.descriptionEn)}, ${sqlString(wikiSummary.descriptionEn)},`);
  lines.push(`    'wikipedia', ${sqlString(wikiSummary.sourceUrl)}, ${sqlString(wikiSummary.license)}, ${sqlString(wikiSummary.attributionText)}, now()`);
  lines.push('  from country_ref');
  lines.push('  on conflict (country_id, slug) do update set');
  lines.push('    name_az = excluded.name_az,');
  lines.push('    name_en = excluded.name_en,');
  lines.push('    name_ru = excluded.name_ru,');
  lines.push('    lat = excluded.lat,');
  lines.push('    lng = excluded.lng,');
  lines.push('    population = excluded.population,');
  lines.push('    short_desc_en = excluded.short_desc_en,');
  lines.push('    description_en = excluded.description_en,');
  lines.push('    source = excluded.source,');
  lines.push('    source_url = excluded.source_url,');
  lines.push('    license = excluded.license,');
  lines.push('    attribution_text = excluded.attribution_text,');
  lines.push('    last_synced_at = now()');
  lines.push('  returning id, country_id');
  lines.push('), place_values as (');
  lines.push('  select * from (values');
  lines.push(places.map((place, index) => {
    const suffix = index === places.length - 1 ? '' : ',';
    const values = [
      sqlString(place.slug),
      sqlString(place.name),
      sqlString(place.name_az),
      sqlString(place.name_en),
      sqlString(place.name_ru),
      sqlString(place.category),
      sqlString(place.subcategory),
      sqlNumber(place.lat),
      sqlNumber(place.lng),
      sqlString(place.address),
      sqlString(place.website),
      sqlString(place.phone),
      sqlString(place.email),
      sqlString(place.opening_hours),
      sqlString(place.source),
      sqlString(place.source_place_id),
      sqlString(place.source_url),
      sqlString(place.license),
      sqlString(place.attribution_text),
      sqlJson({
        source_place_id: place.source_place_id,
        category: place.category,
        import_city: city.slug,
      }),
    ];

    return `    (${values.join(', ')})${suffix}`;
  }).join('\n'));
  lines.push('  ) as v(slug, name, name_az, name_en, name_ru, category, subcategory, lat, lng, address, website, phone, email, opening_hours, source, source_place_id, source_url, license, attribution_text, raw_data)');
  lines.push('), upserted_places as (');
  lines.push('  insert into places (');
  lines.push('    city_id, country_id, slug, name, name_az, name_en, name_ru, category, subcategory, lat, lng,');
  lines.push('    address, website, phone, email, opening_hours, source, source_place_id, source_url, license, attribution_text, raw_data, last_synced_at');
  lines.push('  )');
  lines.push('  select');
  lines.push('    upserted_city.id, upserted_city.country_id, v.slug, v.name, v.name_az, v.name_en, v.name_ru, v.category, v.subcategory,');
  lines.push('    v.lat, v.lng, v.address, v.website, v.phone, v.email, v.opening_hours, v.source, v.source_place_id,');
  lines.push('    v.source_url, v.license, v.attribution_text, v.raw_data, now()');
  lines.push('  from place_values v cross join upserted_city');
  lines.push('  on conflict (source, source_place_id) where source_place_id is not null do update set');
  lines.push('    city_id = excluded.city_id,');
  lines.push('    country_id = excluded.country_id,');
  lines.push('    slug = excluded.slug,');
  lines.push('    name = excluded.name,');
  lines.push('    name_az = excluded.name_az,');
  lines.push('    name_en = excluded.name_en,');
  lines.push('    name_ru = excluded.name_ru,');
  lines.push('    category = excluded.category,');
  lines.push('    subcategory = excluded.subcategory,');
  lines.push('    lat = excluded.lat,');
  lines.push('    lng = excluded.lng,');
  lines.push('    address = excluded.address,');
  lines.push('    website = excluded.website,');
  lines.push('    phone = excluded.phone,');
  lines.push('    email = excluded.email,');
  lines.push('    opening_hours = excluded.opening_hours,');
  lines.push('    source_url = excluded.source_url,');
  lines.push('    license = excluded.license,');
  lines.push('    attribution_text = excluded.attribution_text,');
  lines.push('    raw_data = excluded.raw_data,');
  lines.push('    last_synced_at = now()');
  lines.push('  returning id, source, source_place_id, source_url, license, attribution_text, raw_data');
  lines.push('), upserted_sources as (');
  lines.push('  insert into place_sources (place_id, source, source_id, source_url, license, attribution_text, raw_data)');
  lines.push('  select id, source, source_place_id, source_url, license, attribution_text, raw_data');
  lines.push('  from upserted_places');
  lines.push('  on conflict (place_id, source, source_id) where source_id is not null do update set');
  lines.push('    source_url = excluded.source_url,');
  lines.push('    license = excluded.license,');
  lines.push('    attribution_text = excluded.attribution_text,');
  lines.push('    raw_data = excluded.raw_data');
  lines.push('  returning id');
  lines.push(')');
  lines.push('insert into external_import_logs (source, entity_type, status, imported_count, skipped_count, metadata, started_at, finished_at)');
  lines.push(`select 'overpass', 'city_places', 'success', count(*), 0, ${sqlJson({ city: city.slug, generated_at: now })}, now(), now()`);
  lines.push('from upserted_places;');
  lines.push('');
  lines.push('commit;');
  lines.push('');

  return lines.join('\n');
}

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for --apply. If you do not have a service role key locally, use --sql-out and run the generated SQL in Supabase SQL Editor.');
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function createPublicSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required for --check-db.');
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function checkDatabase() {
  const supabase = createPublicSupabaseClient();
  const tables = ['cities', 'places', 'place_reviews', 'place_sources', 'external_import_logs'];

  for (const table of tables) {
    const { error, count } = await supabase
      .from(table)
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.log(`${table}: ${error.message}`);
    } else {
      console.log(`${table}: ok count=${count}`);
    }
  }
}

async function createImportLog(supabase, source, entityType, metadata) {
  const { data, error } = await supabase
    .from('external_import_logs')
    .insert({
      source,
      entity_type: entityType,
      status: 'running',
      metadata,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

async function finishImportLog(supabase, id, status, importedCount, skippedCount, errorMessage) {
  const { error } = await supabase
    .from('external_import_logs')
    .update({
      status,
      imported_count: importedCount,
      skipped_count: skippedCount,
      error: errorMessage || null,
      finished_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}

async function applyImport(city, wikiSummary, places, args) {
  const supabase = createSupabaseClient();
  const logId = await createImportLog(supabase, 'overpass', 'city_places', {
    city: city.slug,
    radius: args.radius,
    limit: args.limit,
  });

  try {
    const { data: country, error: countryError } = await supabase
      .from('countries')
      .select('id, slug')
      .eq('slug', city.countrySlug)
      .single();

    if (countryError || !country) {
      throw countryError || new Error(`Country not found: ${city.countrySlug}`);
    }

    const cityPayload = {
      country_id: country.id,
      slug: city.slug,
      name_az: city.nameAz,
      name_en: city.nameEn,
      name_ru: city.nameRu,
      lat: city.lat,
      lng: city.lng,
      population: city.population,
      short_desc_en: wikiSummary.descriptionEn,
      description_en: wikiSummary.descriptionEn,
      source: 'wikipedia',
      source_url: wikiSummary.sourceUrl,
      license: wikiSummary.license,
      attribution_text: wikiSummary.attributionText,
      last_synced_at: new Date().toISOString(),
    };

    const { data: upsertedCity, error: cityError } = await supabase
      .from('cities')
      .upsert(cityPayload, { onConflict: 'country_id,slug' })
      .select('id')
      .single();

    if (cityError) throw cityError;

    const placePayloads = places.map((place) => ({
      ...place,
      country_id: country.id,
      city_id: upsertedCity.id,
    }));

    const { data: upsertedPlaces, error: placesError } = await supabase
      .from('places')
      .upsert(placePayloads, { onConflict: 'source,source_place_id' })
      .select('id, source, source_place_id, source_url, license, attribution_text, raw_data');

    if (placesError) throw placesError;

    const sourcePayloads = (upsertedPlaces || []).map((place) => ({
      place_id: place.id,
      source: place.source,
      source_id: place.source_place_id,
      source_url: place.source_url,
      license: place.license,
      attribution_text: place.attribution_text,
      raw_data: place.raw_data || {},
    }));

    if (sourcePayloads.length > 0) {
      const { error: sourcesError } = await supabase
        .from('place_sources')
        .upsert(sourcePayloads, { onConflict: 'place_id,source,source_id' });

      if (sourcesError) throw sourcesError;
    }

    await finishImportLog(supabase, logId, 'success', upsertedPlaces?.length || 0, 0, null);

    return {
      cityId: upsertedCity.id,
      importedPlaces: upsertedPlaces?.length || 0,
    };
  } catch (error) {
    await finishImportLog(supabase, logId, 'failed', 0, places.length, error.message);
    throw error;
  }
}

async function main() {
  loadEnvFile(path.join(__dirname, '..', '.env.local'));

  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  if (args.checkDb) {
    await checkDatabase();
    return;
  }

  const city = CITY_PRESETS[args.city];
  if (!city) {
    printHelp();
    throw new Error(`Unknown city preset: ${args.city}`);
  }

  console.log(`Fetching open travel data for ${city.name}...`);
  const [wikiSummary, overpassElements] = await Promise.all([
    fetchWikipediaSummary(city),
    fetchOverpassPlaces(city, args.radius),
  ]);

  const normalizedPlaces = rankPlaces(dedupePlaces(
    overpassElements
      .map((element) => normalizePlace(element, city, 'COUNTRY_ID_PLACEHOLDER'))
      .filter(Boolean)
  )).slice(0, args.limit);

  const preview = {
    city: {
      ...city,
      descriptionEn: wikiSummary.descriptionEn,
      sourceUrl: wikiSummary.sourceUrl,
      license: wikiSummary.license,
      attributionText: wikiSummary.attributionText,
    },
    placeCount: normalizedPlaces.length,
    places: normalizedPlaces,
  };

  if (args.out) {
    const outPath = path.resolve(process.cwd(), args.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(preview, null, 2), 'utf8');
    console.log(`Preview written to ${outPath}`);
  }

  if (args.sqlOut) {
    const sqlOutPath = path.resolve(process.cwd(), args.sqlOut);
    fs.mkdirSync(path.dirname(sqlOutPath), { recursive: true });
    fs.writeFileSync(sqlOutPath, buildImportSql(city, wikiSummary, normalizedPlaces), 'utf8');
    console.log(`SQL import written to ${sqlOutPath}`);
  }

  console.log(`Fetched ${overpassElements.length} OSM elements.`);
  console.log(`Prepared ${normalizedPlaces.length} unique places.`);
  console.log(`Mode: ${args.apply ? 'apply to Supabase' : 'dry-run'}`);

  if (!args.apply) {
    console.log('Top places preview:');
    for (const place of normalizedPlaces.slice(0, 10)) {
      console.log(`- [${place.category}] ${place.name}`);
    }
    return;
  }

  const result = await applyImport(city, wikiSummary, normalizedPlaces, args);
  console.log(`Imported city ${result.cityId} with ${result.importedPlaces} places.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
