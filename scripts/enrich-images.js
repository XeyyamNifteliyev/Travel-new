#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const UNSPLASH_API = 'https://api.unsplash.com/search/photos';
const RATE_LIMIT_DELAY = 1200;
let stopDueToRateLimit = false;

const KNOWN_BAD_UNSPLASH_REFS = new Set([
  '1524231757913-4be64b2825c7',
  '1502602915149-bb4f5dc63d43',
  '1499856562261-6a300a60f98b',
  '1516483107680-cf12f4bb3a06',
  'https://images.unsplash.com/photo-1753133661886-7e8a93e2d64e',
]);

const PRIORITY_COUNTRY_SLUGS = [
  'turkey',
  'dubai',
  'france',
  'italy',
  'georgia',
  'japan',
  'thailand',
  'greece',
  'maldives',
  'azerbaijan',
  'bali',
  'spain',
  'germany',
  'netherlands',
  'portugal',
  'united-kingdom',
  'united-states',
  'canada',
  'australia',
  'brazil',
  'india',
  'south-korea',
  'china',
  'singapore',
  'switzerland',
  'norway',
  'iceland',
  'mexico',
  'czech-republic',
  'austria',
  'new-zealand',
  'indonesia',
  'croatia',
  'egypt',
  'malaysia',
  'hungary',
  'belgium',
  'denmark',
  'finland',
  'poland',
  'qatar',
  'saudi-arabia',
  'morocco',
  'russia',
  'iran',
  'ireland',
  'israel',
  'jordan',
  'cyprus',
  'colombia',
];

const NON_CITY_IMAGE_TERMS = [
  'animal',
  'wildlife',
  'donkey',
  'horse',
  'camel',
  'giraffe',
  'elephant',
  'lion',
  'zebra',
  'monkey',
  'bird',
  'cattle',
  'oxen',
  'goat',
  'sheep',
  'mountain',
  'beach',
  'sea',
  'ocean',
  'forest',
  'desert',
  'lake',
  'waterfall',
  'island',
  'valley',
  'snow',
  'surf',
  'rice',
  'field',
  'farm',
  'farmland',
  'landscape',
  'paddy',
  'pasture',
  'rural',
  'terrace',
  'village',
];

const CITY_IMAGE_TERMS = [
  'architecture',
  'building',
  'city',
  'cityscape',
  'downtown',
  'skyline',
  'street',
  'urban',
  'landmark',
  'capital',
  'mosque',
  'cathedral',
  'square',
  'palace',
  'tower',
  'old town',
];

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separator = trimmed.indexOf('=');
    if (separator <= 0) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function readArgValue(args, index) {
  const current = args[index];
  const eqIndex = current.indexOf('=');
  if (eqIndex >= 0) {
    return { value: current.slice(eqIndex + 1), nextIndex: index };
  }
  return { value: args[index + 1], nextIndex: index + 1 };
}

function parseArgs() {
  const argv = process.argv.slice(2);
  const opts = {
    type: 'all',
    limit: 20,
    dryRun: true,
    apply: false,
    repairInvalid: false,
    priorityCountries: false,
    slug: null,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--type' || arg.startsWith('--type=')) {
      const parsed = readArgValue(argv, i);
      if (parsed.value) opts.type = parsed.value;
      i = parsed.nextIndex;
    } else if (arg === '--limit' || arg.startsWith('--limit=')) {
      const parsed = readArgValue(argv, i);
      if (parsed.value) opts.limit = Number.parseInt(parsed.value, 10);
      i = parsed.nextIndex;
    } else if (arg === '--slug' || arg.startsWith('--slug=')) {
      const parsed = readArgValue(argv, i);
      opts.slug = parsed.value.split(',').map((slug) => slug.trim()).filter(Boolean);
      i = parsed.nextIndex;
    } else if (arg === '--priority-countries') {
      opts.priorityCountries = true;
    } else if (arg === '--repair-invalid') {
      opts.repairInvalid = true;
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
Usage: node scripts/enrich-images.js [options]

Options:
  --type <type>          "countries", "cities", or "all" (default: all)
  --limit <n>            Max rows to process per table (default: 20)
  --slug <slugs>         Comma-separated slugs to target
  --priority-countries   Target the curated priority country list
  --repair-invalid       Include rows with invalid/short/bad cover_photo_id
  --apply                Write to Supabase (default is dry-run)
  --dry-run              Preview only
  --help                 Show this help

Examples:
  npm run enrich:images -- --type=countries --priority-countries --limit=20 --apply
  npm run enrich:images -- --type=countries --repair-invalid --limit=20 --apply
  npm run enrich:images -- --type=countries --slug=turkey,france,georgia --apply
`);
}

function createSupabaseClient(requireServiceRole) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = requireServiceRole
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizePhotoRef(photoRef) {
  if (!photoRef) return null;
  if (KNOWN_BAD_UNSPLASH_REFS.has(photoRef)) return null;

  if (photoRef.startsWith('https://upload.wikimedia.org/')) {
    return photoRef.split('?')[0];
  }

  if (photoRef.startsWith('https://images.unsplash.com/photo-')) {
    return photoRef.split('?')[0];
  }

  if (/^\d{8,}-[a-zA-Z0-9_-]+$/.test(photoRef)) {
    return `https://images.unsplash.com/photo-${photoRef}`;
  }

  return null;
}

function isUsablePhotoRef(photoRef) {
  return Boolean(normalizePhotoRef(photoRef));
}

function buildSearchQueries(row, table) {
  if (table === 'countries') {
    const country = row.name_en || row.name_az || row.slug;
    const capital = row.capital;
    const queries = [];

    if (capital) {
      queries.push(`${capital} ${country} city skyline`);
      queries.push(`${capital} ${country} architecture`);
      queries.push(`${capital} ${country} downtown`);
      queries.push(`${capital} ${country} landmark`);
    }
    queries.push(`${country} capital city`);
    queries.push(`${country} capital architecture`);

    return [...new Set(queries)];
  }

  const city = row.name_en || row.name_az || row.slug;
  const country = row.countries?.name_en || '';
  return [
    `${city} ${country} skyline`,
    `${city} ${country} architecture`,
    `${city} ${country} downtown`,
    `${city} ${country} landmark`,
  ].filter(Boolean);
}

function getResultSearchText(result) {
  const tags = Array.isArray(result.tags)
    ? result.tags.map((tag) => tag?.title || tag?.source?.title).filter(Boolean)
    : [];

  return [
    result.alt_description,
    result.description,
    result.slug,
    result.user?.name,
    ...tags,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function includesSearchTerm(text, term) {
  return new RegExp(`\\b${escapeRegExp(term)}\\b`, 'i').test(text);
}

function getRejectedResultReason(result) {
  const text = getResultSearchText(result);
  const rejectedTerm = NON_CITY_IMAGE_TERMS.find((term) => includesSearchTerm(text, term));
  if (rejectedTerm) return `non_city_term:${rejectedTerm}`;
  return null;
}

function scoreCityResult(result, query) {
  const text = getResultSearchText(result);
  return CITY_IMAGE_TERMS.reduce((score, term) => (
    includesSearchTerm(text, term) ? score + 1 : score
  ), 0);
}

function buildPhotoAlt(row, table, picked) {
  if (picked.alt) return picked.alt;

  if (table === 'countries') {
    const country = row.name_en || row.name_az || row.slug;
    const capital = row.capital;
    return capital
      ? `${capital}, ${country} city view`
      : `${country} capital city view`;
  }

  const city = row.name_en || row.name_az || row.slug;
  const country = row.countries?.name_en;
  return country ? `${city}, ${country} city view` : `${city} city view`;
}

async function searchUnsplash(query, accessKey) {
  if (stopDueToRateLimit) return [];

  const params = new URLSearchParams({
    query,
    per_page: '8',
    orientation: 'landscape',
    client_id: accessKey,
  });

  try {
    const res = await fetch(`${UNSPLASH_API}?${params}`, {
      headers: { 'Accept-Version': 'v1' },
    });

    if (!res.ok) {
      if (res.status === 403 || res.status === 429) {
        stopDueToRateLimit = true;
      }
      console.error(`  [unsplash] HTTP ${res.status}: ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error(`  [unsplash] fetch error: ${error.message}`);
    return [];
  }
}

async function pickPhotoForRow(row, table, accessKey, usedPhotoRefs) {
  const queries = buildSearchQueries(row, table);

  for (const query of queries) {
    if (stopDueToRateLimit) return null;

    const results = await searchUnsplash(query, accessKey);

    const rankedResults = [...results].sort((a, b) => scoreCityResult(b, query) - scoreCityResult(a, query));

    for (const result of rankedResults) {
      const rejectedReason = getRejectedResultReason(result);
      if (rejectedReason) {
        console.log(`  [skip] ${rejectedReason}`);
        continue;
      }

      const photoRef = normalizePhotoRef(result.urls?.raw || result.urls?.regular || result.id);
      if (!photoRef || usedPhotoRefs.has(photoRef)) continue;

      return {
        photoRef,
        query,
        alt: result.alt_description || null,
      };
    }

    await sleep(RATE_LIMIT_DELAY);
  }

  return null;
}

function shouldProcessRow(row, opts) {
  if (opts.slug || opts.priorityCountries) return true;
  if (!row.cover_photo_id) return true;
  if (opts.repairInvalid && !isUsablePhotoRef(row.cover_photo_id)) return true;
  return false;
}

async function getExistingPhotoRefs(supabase, table) {
  const { data, error } = await supabase
    .from(table)
    .select('id, slug, cover_photo_id')
    .not('cover_photo_id', 'is', null);

  if (error) throw error;

  const refs = new Map();
  for (const row of data || []) {
    const normalized = normalizePhotoRef(row.cover_photo_id);
    if (!normalized) continue;
    if (!refs.has(normalized)) refs.set(normalized, []);
    refs.get(normalized).push(row.slug);
  }
  return refs;
}

async function getRows(supabase, table, opts) {
  const selectCols = table === 'countries'
    ? 'id, slug, name_az, name_en, capital, cover_photo_id, popular_rank, is_featured'
    : 'id, slug, name_az, name_en, cover_photo_id, popular_rank, is_featured, countries(name_en)';
  const queryLimit = opts.repairInvalid && !opts.slug?.length && !opts.priorityCountries
    ? 500
    : opts.limit;

  let query = supabase
    .from(table)
    .select(selectCols)
    .order('is_featured', { ascending: false })
    .order('popular_rank', { ascending: true })
    .limit(queryLimit);

  if (opts.slug?.length) {
    query = query.in('slug', opts.slug);
  } else if (opts.priorityCountries && table === 'countries') {
    query = query.in('slug', PRIORITY_COUNTRY_SLUGS);
  } else if (!opts.repairInvalid) {
    query = query.is('cover_photo_id', null);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || [])
    .filter((row) => shouldProcessRow(row, opts))
    .slice(0, opts.limit);
}

async function enrichTable(supabase, table, accessKey, opts) {
  console.log(`\n=== Enriching ${table} (limit: ${opts.limit}) ===\n`);

  const rows = await getRows(supabase, table, opts);
  if (rows.length === 0) {
    console.log(`  No ${table} rows to enrich found.`);
    return { enriched: 0, errors: 0, skipped: 0 };
  }

  const existingRefs = await getExistingPhotoRefs(supabase, table);
  const usedRefs = new Set(existingRefs.keys());

  let enriched = 0;
  let errors = 0;
  let skipped = 0;

  console.log(`  Found ${rows.length} ${table} rows to enrich\n`);

  for (const row of rows) {
    if (stopDueToRateLimit) {
      console.log('  Stopping early because Unsplash rate limit was reached.');
      break;
    }

    const currentRef = normalizePhotoRef(row.cover_photo_id);
    if (currentRef) usedRefs.delete(currentRef);

    process.stdout.write(`  [${row.slug}] `);

    const picked = await pickPhotoForRow(row, table, accessKey, usedRefs);
    if (!picked) {
      console.log('no unique country-specific photo found');
      skipped++;
      if (currentRef) usedRefs.add(currentRef);
      continue;
    }

    console.log(`OK ${picked.photoRef} (${picked.query})`);

    if (!opts.dryRun) {
      const { error } = await supabase
        .from(table)
        .update({
          cover_photo_id: picked.photoRef,
          cover_photo_alt: buildPhotoAlt(row, table, picked),
        })
        .eq('id', row.id);

      if (error) {
        console.error(`    DB update failed: ${error.message}`);
        errors++;
      } else {
        enriched++;
        usedRefs.add(picked.photoRef);
      }
    } else {
      console.log(`    dry-run: would set cover_photo_id = "${picked.photoRef}"`);
      enriched++;
      usedRefs.add(picked.photoRef);
    }

    await sleep(RATE_LIMIT_DELAY);
  }

  return { enriched, errors, skipped };
}

async function main() {
  loadEnvFile(path.join(__dirname, '..', '.env.local'));

  const opts = parseArgs();
  if (opts.help) {
    printHelp();
    return;
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    throw new Error('UNSPLASH_ACCESS_KEY is required.');
  }

  const supabase = createSupabaseClient(opts.apply);
  const mode = opts.dryRun ? 'DRY-RUN' : 'APPLY';

  console.log(`\nUnsplash Image Enrichment - ${mode} mode\n`);
  console.log(`  Type: ${opts.type}`);
  console.log(`  Limit: ${opts.limit} per table`);
  console.log(`  Priority countries: ${opts.priorityCountries ? 'yes' : 'no'}`);
  console.log(`  Repair invalid: ${opts.repairInvalid ? 'yes' : 'no'}`);
  console.log(`  Target slugs: ${opts.slug?.join(', ') || 'auto'}`);
  console.log(`  Duplicate-safe: yes\n`);

  let totalEnriched = 0;
  let totalErrors = 0;
  let totalSkipped = 0;

  if (opts.type === 'countries' || opts.type === 'all') {
    const result = await enrichTable(supabase, 'countries', accessKey, opts);
    totalEnriched += result.enriched;
    totalErrors += result.errors;
    totalSkipped += result.skipped;
  }

  if (opts.type === 'cities' || opts.type === 'all') {
    const result = await enrichTable(supabase, 'cities', accessKey, opts);
    totalEnriched += result.enriched;
    totalErrors += result.errors;
    totalSkipped += result.skipped;
  }

  console.log('\n=== Summary ===');
  console.log(`  Mode: ${mode}`);
  console.log(`  Enriched: ${totalEnriched}`);
  console.log(`  Skipped: ${totalSkipped}`);
  console.log(`  Errors: ${totalErrors}\n`);

  if (opts.dryRun && totalEnriched > 0) {
    console.log('Run with --apply to actually update the database.\n');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
