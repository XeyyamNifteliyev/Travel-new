#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const DEFAULT_PRIORITY_CITY_SLUGS = [
  'istanbul',
  'paris',
  'rome',
  'dubai',
  'tbilisi',
  'tokyo',
  'bangkok',
  'london',
  'baku',
  'barcelona',
  'amsterdam',
  'vienna',
  'prague',
  'budapest',
  'singapore',
  'seoul',
  'kuala-lumpur',
  'lisbon',
];

const EXCLUDED_AMENITIES = new Set(['fast_food', 'bar', 'pub', 'nightclub', 'biergarten']);
const QUALITY_CUISINE_BLOCKLIST = new Set(['fast_food']);
const RATE_DELAY = 1500;

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator <= 0) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (!process.env[key]) process.env[key] = value;
  }
}

function readArgValue(args, index) {
  const current = args[index];
  const eqIndex = current.indexOf('=');
  if (eqIndex >= 0) return { value: current.slice(eqIndex + 1), nextIndex: index };
  return { value: args[index + 1], nextIndex: index + 1 };
}

function parseArgs() {
  const argv = process.argv.slice(2);
  const opts = {
    city: null,
    limit: 30,
    cityLimit: null,
    radius: 6000,
    apply: false,
    dryRun: true,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--city' || arg.startsWith('--city=')) {
      const parsed = readArgValue(argv, i);
      opts.city = parsed.value.split(',').map((slug) => slug.trim()).filter(Boolean);
      i = parsed.nextIndex;
    } else if (arg === '--limit' || arg.startsWith('--limit=')) {
      const parsed = readArgValue(argv, i);
      opts.limit = Number.parseInt(parsed.value, 10);
      i = parsed.nextIndex;
    } else if (arg === '--city-limit' || arg.startsWith('--city-limit=')) {
      const parsed = readArgValue(argv, i);
      opts.cityLimit = Number.parseInt(parsed.value, 10);
      i = parsed.nextIndex;
    } else if (arg === '--radius' || arg.startsWith('--radius=')) {
      const parsed = readArgValue(argv, i);
      opts.radius = Number.parseInt(parsed.value, 10);
      i = parsed.nextIndex;
    } else if (arg === '--apply') {
      opts.apply = true;
      opts.dryRun = false;
    } else if (arg === '--dry-run') {
      opts.dryRun = true;
      opts.apply = false;
    } else if (arg === '--help' || arg === '-h') {
      opts.help = true;
    }
  }

  return opts;
}

function printHelp() {
  console.log(`
Usage: node scripts/import-food-places.js [options]

Options:
  --city=<slug[,slug]>  Import specific city/cities
  --limit=<n>           Max restaurants/cafes per city (default: 30)
  --city-limit=<n>      Max auto-selected cities to process
  --radius=<m>          Overpass radius in meters (default: 6000)
  --apply               Write to Supabase (default is dry-run)
  --dry-run             Preview only

Examples:
  npm run import:food-places -- --city=istanbul --dry-run
  npm run import:food-places -- --city=istanbul --apply
  npm run import:food-places -- --limit=10 --apply
`);
}

function createSupabaseClient(requireServiceRole) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = requireServiceRole
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function slugify(value) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

function buildFoodOverpassQuery(city, radius) {
  return `
[out:json][timeout:35];
(
  node["amenity"~"^(restaurant|cafe)$"](around:${radius},${city.lat},${city.lng});
  way["amenity"~"^(restaurant|cafe)$"](around:${radius},${city.lat},${city.lng});
  relation["amenity"~"^(restaurant|cafe)$"](around:${radius},${city.lat},${city.lng});
);
out tags center 120;
`;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'User-Agent': 'TravelAZ/1.0 food-place-import',
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status} ${response.statusText}: ${body.slice(0, 200)}`);
  }
  return response.json();
}

async function fetchFoodElements(city, radius) {
  const body = new URLSearchParams({ data: buildFoodOverpassQuery(city, radius) });
  const data = await fetchJson(OVERPASS_URL, { method: 'POST', body });
  return data.elements || [];
}

function getElementLatLng(element) {
  if (typeof element.lat === 'number' && typeof element.lon === 'number') {
    return { lat: element.lat, lng: element.lon };
  }
  if (element.center && typeof element.center.lat === 'number' && typeof element.center.lon === 'number') {
    return { lat: element.center.lat, lng: element.center.lon };
  }
  return null;
}

function buildAddress(tags) {
  const parts = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:suburb'],
    tags['addr:city'],
  ].filter(Boolean);
  return parts.length ? parts.join(', ') : null;
}

function getOsmUrl(element) {
  const type = element.type === 'node' ? 'node' : element.type === 'way' ? 'way' : 'relation';
  return `https://www.openstreetmap.org/${type}/${element.id}`;
}

function categoryFromAmenity(amenity) {
  if (amenity === 'restaurant') return 'restaurant';
  if (amenity === 'cafe') return 'cafe';
  return null;
}

function isQualityFoodElement(element) {
  const tags = element.tags || {};
  if (!tags.name) return false;
  if (EXCLUDED_AMENITIES.has(tags.amenity)) return false;
  if (tags.cuisine && QUALITY_CUISINE_BLOCKLIST.has(String(tags.cuisine).toLowerCase())) return false;
  return Boolean(categoryFromAmenity(tags.amenity) && getElementLatLng(element));
}

function normalizeFoodPlace(element, city, index) {
  const tags = element.tags || {};
  const coordinates = getElementLatLng(element);
  const category = categoryFromAmenity(tags.amenity);
  const sourcePlaceId = `${element.type}/${element.id}`;
  const name = tags.name;
  const slugBase = slugify(name) || category;
  const rankBase = category === 'restaurant' ? 300 : 500;

  return {
    country_id: city.country_id,
    city_id: city.id,
    slug: `${slugBase}-${slugify(sourcePlaceId)}`.slice(0, 96),
    name,
    name_az: tags['name:az'] || null,
    name_en: tags['name:en'] || null,
    name_ru: tags['name:ru'] || null,
    category,
    subcategory: tags.cuisine || tags.amenity || null,
    lat: coordinates.lat,
    lng: coordinates.lng,
    address: buildAddress(tags),
    website: tags.website || tags['contact:website'] || null,
    phone: tags.phone || tags['contact:phone'] || null,
    email: tags.email || tags['contact:email'] || null,
    opening_hours: tags.opening_hours || null,
    source: 'overpass',
    source_place_id: sourcePlaceId,
    source_url: getOsmUrl(element),
    license: 'ODbL-1.0',
    attribution_text: '(c) OpenStreetMap contributors',
    raw_data: {
      osm_type: element.type,
      osm_id: element.id,
      city_slug: city.slug,
      country_slug: city.countries?.slug || null,
      category,
      cuisine: tags.cuisine || null,
      tags,
    },
    popular_rank: rankBase + index,
    status: 'active',
    last_synced_at: new Date().toISOString(),
  };
}

function qualityScore(place) {
  let score = 0;
  if (place.website) score += 4;
  if (place.phone) score += 2;
  if (place.opening_hours) score += 2;
  if (place.address) score += 2;
  if (place.subcategory) score += 1;
  if (place.category === 'restaurant') score += 1;
  return score;
}

function rankAndDedupePlaces(places, limit) {
  const seen = new Set();
  return [...places]
    .sort((a, b) => qualityScore(b) - qualityScore(a) || a.name.localeCompare(b.name))
    .filter((place) => {
      const key = place.source_place_id || `${place.city_id}:${place.slug}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit)
    .map((place, index) => ({
      ...place,
      popular_rank: (place.category === 'restaurant' ? 300 : 500) + index,
    }));
}

async function getTargetCities(supabase, opts) {
  const select = 'id, country_id, slug, name_az, name_en, lat, lng, population, is_featured, popular_rank, countries(slug, name_en)';
  let query = supabase
    .from('cities')
    .select(select)
    .not('lat', 'is', null)
    .not('lng', 'is', null)
    .order('is_featured', { ascending: false })
    .order('popular_rank', { ascending: true })
    .order('population', { ascending: false })
    .limit(500);

  if (opts.city?.length) {
    query = query.in('slug', opts.city);
  }

  const { data, error } = await query;
  if (error) throw error;

  let cities = data || [];
  if (!opts.city?.length) {
    const priority = new Map(DEFAULT_PRIORITY_CITY_SLUGS.map((slug, index) => [slug, index]));
    cities = cities
      .filter((city) => DEFAULT_PRIORITY_CITY_SLUGS.includes(city.slug) || city.is_featured)
      .sort((a, b) => {
        const pa = priority.has(a.slug) ? priority.get(a.slug) : 999;
        const pb = priority.has(b.slug) ? priority.get(b.slug) : 999;
        return pa - pb || Number(b.is_featured) - Number(a.is_featured) || (a.popular_rank ?? 999) - (b.popular_rank ?? 999);
      });
  }

  return opts.cityLimit ? cities.slice(0, opts.cityLimit) : cities;
}

async function createImportLog(supabase, city, opts) {
  const { data, error } = await supabase
    .from('external_import_logs')
    .insert({
      source: 'overpass',
      entity_type: 'food_places',
      status: 'running',
      metadata: {
        city: city.slug,
        country: city.countries?.slug || null,
        radius: opts.radius,
        limit: opts.limit,
      },
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

async function upsertPlaceBySource(supabase, place) {
  const { data: existing, error: existingError } = await supabase
    .from('places')
    .select('id')
    .eq('source', place.source)
    .eq('source_place_id', place.source_place_id)
    .maybeSingle();
  if (existingError) throw existingError;

  if (existing?.id) {
    const { error } = await supabase
      .from('places')
      .update(place)
      .eq('id', existing.id);
    if (error) throw error;
    return { id: existing.id, inserted: false };
  }

  const { data, error } = await supabase
    .from('places')
    .insert(place)
    .select('id')
    .single();
  if (error) throw error;
  return { id: data.id, inserted: true };
}

async function upsertPlaceSource(supabase, placeId, place) {
  const payload = {
    place_id: placeId,
    source: place.source,
    source_id: place.source_place_id,
    source_url: place.source_url,
    license: place.license,
    attribution_text: place.attribution_text,
    raw_data: place.raw_data,
  };

  const { data: existing, error: existingError } = await supabase
    .from('place_sources')
    .select('id')
    .eq('place_id', placeId)
    .eq('source', place.source)
    .eq('source_id', place.source_place_id)
    .maybeSingle();
  if (existingError) throw existingError;

  if (existing?.id) {
    const { error } = await supabase.from('place_sources').update(payload).eq('id', existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from('place_sources').insert(payload);
  if (error && error.code !== '23505') throw error;
}

async function importCityFood(supabase, city, opts) {
  console.log(`\n[${city.slug}] Fetching food places around ${city.name_en || city.name_az}...`);
  const elements = await fetchFoodElements(city, opts.radius);
  const places = rankAndDedupePlaces(
    elements
      .filter(isQualityFoodElement)
      .map((element, index) => normalizeFoodPlace(element, city, index)),
    opts.limit
  );

  console.log(`  OSM elements: ${elements.length}`);
  console.log(`  Prepared food places: ${places.length}`);

  if (opts.dryRun) {
    for (const place of places.slice(0, 10)) {
      console.log(`  - [${place.category}] ${place.name}${place.subcategory ? ` (${place.subcategory})` : ''}`);
    }
    return { imported: places.length, skipped: 0 };
  }

  const logId = await createImportLog(supabase, city, opts);
  let imported = 0;
  let skipped = 0;

  try {
    for (const place of places) {
      try {
        const result = await upsertPlaceBySource(supabase, place);
        await upsertPlaceSource(supabase, result.id, place);
        imported += 1;
      } catch (error) {
        skipped += 1;
        console.log(`  ! skipped ${place.name}: ${error.message}`);
      }
    }
    await finishImportLog(supabase, logId, 'success', imported, skipped, null);
  } catch (error) {
    await finishImportLog(supabase, logId, 'failed', imported, skipped, error.message);
    throw error;
  }

  return { imported, skipped };
}

async function main() {
  loadEnvFile(path.join(__dirname, '..', '.env.local'));
  const opts = parseArgs();
  if (opts.help) {
    printHelp();
    return;
  }

  const supabase = createSupabaseClient(opts.apply);
  const cities = await getTargetCities(supabase, opts);

  console.log(`\nFood Places Import - ${opts.dryRun ? 'DRY-RUN' : 'APPLY'} mode`);
  console.log(`  Cities: ${cities.map((city) => city.slug).join(', ') || 'none'}`);
  console.log(`  Per-city limit: ${opts.limit}`);
  console.log(`  Radius: ${opts.radius}m\n`);

  let totalImported = 0;
  let totalSkipped = 0;

  for (const city of cities) {
    const result = await importCityFood(supabase, city, opts);
    totalImported += result.imported;
    totalSkipped += result.skipped;
    await sleep(RATE_DELAY);
  }

  console.log('\n=== Summary ===');
  console.log(`  Mode: ${opts.dryRun ? 'DRY-RUN' : 'APPLY'}`);
  console.log(`  Cities processed: ${cities.length}`);
  console.log(`  Imported/updated: ${totalImported}`);
  console.log(`  Skipped: ${totalSkipped}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
