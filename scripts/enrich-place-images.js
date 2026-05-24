#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const WIKIDATA_SPARQL = 'https://query.wikidata.org/sparql';
const WIKIDATA_API = 'https://www.wikidata.org/w/api.php';
const COMMONS_THUMB = 'https://en.wikipedia.org/wiki/Special:FilePath';
const WIKIPEDIA_API = (lang) => `https://${lang}.wikipedia.org/w/api.php`;
const UNSPLASH_API = 'https://api.unsplash.com/search/photos';
const PEXELS_API = 'https://api.pexels.com/v1/search';
const RATE_DELAY = 1300;
const REQUEST_TIMEOUT = 12000;

const OSM_PROPERTIES = {
  node: 'P10689',
  way: 'P11693',
  relation: 'P11693',
};

const DEFAULT_CATEGORIES = [
  'attraction',
  'museum',
  'landmark',
  'viewpoint',
  'historic',
  'park',
  'beach',
  'restaurant',
  'cafe',
  'hotel',
  'shopping',
  'nightlife',
  'transport',
  'other',
];

const BLOCKED_VISUAL_TERMS = [
  'animal',
  'wildlife',
  'zoo',
  'flamingo',
  'panda',
  'jaguar',
  'otter',
  'cassowary',
  'beach',
  'coast',
  'ocean',
  'sea',
  'mountain',
  'forest',
  'desert',
  'lake',
  'river',
  'waterfall',
  'farm',
  'field',
  'rice',
  'rural',
  'landscape',
];

const GENERIC_PLACE_TERMS = new Set([
  'home',
  'building',
  'gate',
  'side gate',
  'local bazaar',
  'bazaar',
  'pavillion',
  'pavilion',
  'throne hall',
]);

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

loadEnvFile(path.join(__dirname, '..', '.env.local'));

function readArgValue(args, index) {
  const current = args[index];
  const eqIndex = current.indexOf('=');
  if (eqIndex >= 0) return { value: current.slice(eqIndex + 1), nextIndex: index };
  return { value: args[index + 1], nextIndex: index + 1 };
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    limit: 20,
    dryRun: true,
    city: null,
    slug: null,
    categories: DEFAULT_CATEGORIES,
    overwrite: false,
    source: 'all',
    offset: 0,
    offsetProvided: false,
    stateFile: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--limit' || arg.startsWith('--limit=')) {
      const parsed = readArgValue(args, i);
      opts.limit = Number.parseInt(parsed.value, 10);
      i = parsed.nextIndex;
    } else if (arg === '--city' || arg.startsWith('--city=')) {
      const parsed = readArgValue(args, i);
      opts.city = parsed.value;
      i = parsed.nextIndex;
    } else if (arg === '--slug' || arg.startsWith('--slug=')) {
      const parsed = readArgValue(args, i);
      opts.slug = parsed.value.split(',').map((value) => value.trim()).filter(Boolean);
      i = parsed.nextIndex;
    } else if (arg === '--category' || arg.startsWith('--category=')) {
      const parsed = readArgValue(args, i);
      opts.categories = parsed.value.split(',').map((value) => value.trim()).filter(Boolean);
      i = parsed.nextIndex;
    } else if (arg === '--source' || arg.startsWith('--source=')) {
      const parsed = readArgValue(args, i);
      opts.source = parsed.value;
      i = parsed.nextIndex;
    } else if (arg === '--offset' || arg.startsWith('--offset=')) {
      const parsed = readArgValue(args, i);
      opts.offset = Number.parseInt(parsed.value, 10);
      opts.offsetProvided = true;
      i = parsed.nextIndex;
    } else if (arg === '--state-file' || arg.startsWith('--state-file=')) {
      const parsed = readArgValue(args, i);
      opts.stateFile = parsed.value;
      i = parsed.nextIndex;
    } else if (arg === '--overwrite') {
      opts.overwrite = true;
    } else if (arg === '--apply') {
      opts.dryRun = false;
    } else if (arg === '--dry-run') {
      opts.dryRun = true;
    }
  }

  return opts;
}

function loadState(filePath) {
  if (!filePath) return null;
  try {
    if (!fs.existsSync(filePath)) return {};
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveState(filePath, data) {
  if (!filePath) return;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function stateKey(opts) {
  const cityPart = opts.city || 'any';
  const categories = (opts.categories || []).slice().sort().join(',');
  const overwritePart = opts.overwrite ? 'overwrite' : 'missing-only';
  const slugPart = Array.isArray(opts.slug) && opts.slug.length ? `slug:${opts.slug.slice().sort().join(',')}` : 'slug:any';
  return `${opts.source}|${cityPart}|${categories}|${overwritePart}|${slugPart}`;
}

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function commonsThumbnailUrl(filename, width = 1000) {
  return `${COMMONS_THUMB}/${encodeURIComponent(filename)}?width=${width}`;
}

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[ıİ]/g, 'i')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u')
    .replace(/[şŞ]/g, 's')
    .replace(/[öÖ]/g, 'o')
    .replace(/[çÇ]/g, 'c')
    .replace(/[əƏ]/g, 'e')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function escapeSparql(str) {
  return String(str || '').replace(/"/g, '\\"').replace(/\\/g, '\\\\');
}

function rawTags(rawData) {
  const tags = rawData?.tags;
  if (tags && typeof tags === 'object' && !Array.isArray(tags)) return tags;
  const osmTags = rawData?.osm?.tags;
  return osmTags && typeof osmTags === 'object' && !Array.isArray(osmTags) ? osmTags : {};
}

function parseWikipediaTag(value) {
  if (!value || !String(value).includes(':')) return null;
  const [lang, ...titleParts] = String(value).split(':');
  const title = titleParts.join(':');
  if (!lang || !title) return null;
  return { lang, title };
}

function parseOsmSourceId(value) {
  const parts = String(value || '').split('/');
  if (parts.length !== 2) return null;
  return { osmType: parts[0], osmId: parts[1] };
}

async function fetchJson(url, headers = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'TravelAZ/1.0 place-image-enrichment (open data)',
        ...headers,
      },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchWikidataImageFilename(qid) {
  if (!qid) return null;
  const params = new URLSearchParams({
    action: 'wbgetentities',
    ids: qid,
    props: 'claims',
    format: 'json',
    origin: '*',
  });
  const data = await fetchJson(`${WIKIDATA_API}?${params}`);
  const claim = data?.entities?.[qid]?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
  return claim || null;
}

async function fetchWikipediaPageImage(lang, title) {
  if (!lang || !title) return null;
  const params = new URLSearchParams({
    action: 'query',
    titles: title,
    prop: 'pageimages',
    piprop: 'original',
    redirects: '1',
    format: 'json',
    origin: '*',
  });
  const data = await fetchJson(`${WIKIPEDIA_API(lang)}?${params}`);
  const pages = Object.values(data?.query?.pages || {});
  return pages[0]?.original?.source || null;
}

async function searchWikipediaPageImage(placeName, cityName) {
  const languages = ['en', 'tr', 'az', 'ru'];
  const searches = [
    `${placeName} ${cityName || ''}`.trim(),
    placeName,
  ].filter(Boolean);

  for (const lang of languages) {
    for (const search of searches) {
      const params = new URLSearchParams({
        action: 'query',
        generator: 'search',
        gsrsearch: search,
        gsrlimit: '5',
        prop: 'pageimages',
        piprop: 'original',
        redirects: '1',
        format: 'json',
        origin: '*',
      });
      const data = await fetchJson(`${WIKIPEDIA_API(lang)}?${params}`);
      const pages = Object.values(data?.query?.pages || {});
      const match = pages.find((page) => hasStrongTextMatch(placeName, page.title));
      if (match?.original?.source) return { url: match.original.source, detail: `${lang}:${match.title}` };
      await sleep(250);
    }
  }

  return null;
}

async function fetchWikidataByOsmId(osmType, osmId) {
  const property = OSM_PROPERTIES[osmType];
  if (!property || !osmId) return null;

  const sparql = `
    SELECT ?image WHERE {
      ?item wdt:${property} "${escapeSparql(osmId)}" .
      OPTIONAL { ?item wdt:P18 ?image . }
    }
    LIMIT 1
  `;
  const url = `${WIKIDATA_SPARQL}?query=${encodeURIComponent(sparql)}&format=json`;
  const data = await fetchJson(url);
  const imageUri = data?.results?.bindings?.[0]?.image?.value;
  return imageUri ? decodeURIComponent(imageUri.split('/').pop()) : null;
}

async function searchWikidataImage(placeName, cityName) {
  const searches = [
    `${placeName} ${cityName || ''}`.trim(),
    placeName,
  ].filter(Boolean);
  const languages = ['en', 'tr', 'az', 'ru'];

  for (const search of searches) {
    for (const language of languages) {
      const params = new URLSearchParams({
        action: 'wbsearchentities',
        search,
        language,
        format: 'json',
        origin: '*',
        limit: '5',
      });
      const data = await fetchJson(`${WIKIDATA_API}?${params}`);
      const candidates = data?.search || [];
      for (const candidate of candidates) {
        const looksRelated = hasStrongTextMatch(placeName, candidate.label);
        if (!looksRelated) continue;
        const filename = await fetchWikidataImageFilename(candidate.id);
        if (filename) return filename;
        await sleep(250);
      }
    }
  }

  return null;
}

function unsplashQuery(place) {
  const cityName = place.cities?.name_en || place.cities?.name_az || '';
  const base = `${place.name} ${cityName}`.trim();
  if (['restaurant', 'cafe', 'hotel'].includes(place.category)) return base;
  return `${base} landmark architecture`;
}

function pexelsQuery(place) {
  const cityName = place.cities?.name_en || place.cities?.name_az || '';
  const base = `${place.name} ${cityName}`.trim();
  if (['restaurant', 'cafe', 'hotel'].includes(place.category)) return `${base} ${place.category}`;
  return `${base} travel landmark`;
}

function isAnimalAttraction(place) {
  const tags = rawTags(place.raw_data);
  return normalize(tags.attraction) === 'animal' || normalize(tags.tourism) === 'zoo';
}

function containsBlockedVisualTerms(text) {
  const haystack = normalize(text);
  return BLOCKED_VISUAL_TERMS.some((term) => haystack.includes(term));
}

function hasStrongTextMatch(targetText, candidateText) {
  const target = normalize(targetText);
  const candidate = normalize(candidateText);
  if (!target || !candidate) return false;
  if (candidate.includes(target)) return true;

  const targetTokens = target.split(' ').filter((token) => token.length >= 4);
  if (targetTokens.length === 0) return false;
  const matchCount = targetTokens.filter((token) => candidate.includes(token)).length;
  return matchCount / targetTokens.length >= 0.6;
}

function hasReliablePlaceIdentity(placeName) {
  const normalized = normalize(placeName);
  if (!normalized) return false;
  if (GENERIC_PLACE_TERMS.has(normalized)) return false;

  const tokens = normalized.split(' ').filter(Boolean);
  const significantTokens = tokens.filter((token) => token.length >= 4);
  if (significantTokens.length === 0) return false;
  if (tokens.length === 1 && significantTokens[0].length < 6) return false;

  return true;
}

function shouldSkipPlaceForImageSearch(place) {
  if (isAnimalAttraction(place)) return true;
  if (!hasReliablePlaceIdentity(place.name)) return true;

  const tags = rawTags(place.raw_data);
  const naturalTag = normalize(tags.natural);
  if (['tree', 'wood', 'forest', 'beach', 'water'].includes(naturalTag)) return true;

  return false;
}

function selectProcessablePlaces(places, limit) {
  return (places || []).filter((place) => !shouldSkipPlaceForImageSearch(place)).slice(0, limit);
}

function buildPlaceMatchSignals(place, haystack) {
  const placeName = normalize(place.name);
  const placeTokens = placeName.split(' ').filter((token) => token.length >= 4);
  const cityName = normalize(place.cities?.name_en || place.cities?.name_az || '');
  const category = normalize(place.category);
  const tokenMatches = placeTokens.filter((token) => haystack.includes(token)).length;
  const enoughPlaceMatch = placeTokens.length > 0 && tokenMatches / placeTokens.length >= 0.5;
  const hasExactPhrase = placeName.length >= 4 && haystack.includes(placeName);
  const hasCityContext = cityName && haystack.includes(cityName);
  const hasCategoryContext = category && haystack.includes(category);

  return {
    enoughPlaceMatch,
    hasExactPhrase,
    hasCityContext,
    hasCategoryContext,
  };
}

function selectUnsplashPhoto(place, results) {
  if (isAnimalAttraction(place)) return null;

  return results.find((photo) => {
    const haystack = normalize([
      photo.alt_description,
      photo.description,
      photo.user?.name,
      ...(photo.tags || []).map((tag) => tag.title),
    ].filter(Boolean).join(' '));
    if (!haystack || containsBlockedVisualTerms(haystack)) return false;
    const { enoughPlaceMatch, hasExactPhrase, hasCityContext, hasCategoryContext } = buildPlaceMatchSignals(place, haystack);
    return enoughPlaceMatch || (hasExactPhrase && hasCityContext) || (hasExactPhrase && hasCategoryContext);
  }) || null;
}

function selectPexelsPhoto(place, photos) {
  if (isAnimalAttraction(place)) return null;

  return photos.find((photo) => {
    const haystack = normalize([
      photo.alt,
      photo.photographer,
      photo.url,
    ].filter(Boolean).join(' '));
    if (!haystack || containsBlockedVisualTerms(haystack)) return false;
    const { enoughPlaceMatch, hasExactPhrase, hasCityContext, hasCategoryContext } = buildPlaceMatchSignals(place, haystack);
    return enoughPlaceMatch || (hasExactPhrase && hasCityContext) || (hasExactPhrase && hasCategoryContext);
  }) || null;
}

async function fetchUnsplashImage(place) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return null;
  const params = new URLSearchParams({
    query: unsplashQuery(place),
    per_page: '8',
    orientation: 'landscape',
    content_filter: 'high',
  });
  const data = await fetchJson(`${UNSPLASH_API}?${params}`, {
    Authorization: `Client-ID ${accessKey}`,
  });
  const results = data?.results || [];
  const best = selectUnsplashPhoto(place, results);
  return best?.urls?.raw ? `${best.urls.raw.split('?')[0]}?auto=format&fit=crop&w=1000&q=82` : null;
}

async function fetchPexelsImage(place) {
  const accessKey = process.env.PEXELS_API_KEY;
  if (!accessKey) return null;
  const params = new URLSearchParams({
    query: pexelsQuery(place),
    per_page: '8',
    orientation: 'landscape',
  });
  const data = await fetchJson(`${PEXELS_API}?${params}`, {
    Authorization: accessKey,
  });
  const photos = data?.photos || [];
  const best = selectPexelsPhoto(place, photos);

  if (!best?.src) return null;
  return best.src.large2x || best.src.large || best.src.landscape || best.src.original || null;
}

async function findImageForPlace(place) {
  const tags = rawTags(place.raw_data);
  const hasReliableIdentity = hasReliablePlaceIdentity(place.name);

  if (shouldSkipPlaceForImageSearch(place)) return null;

  if (tags.wikidata && ['all', 'wikimedia', 'auto'].includes(place.sourceMode)) {
    const filename = await fetchWikidataImageFilename(tags.wikidata);
    if (filename) return { url: commonsThumbnailUrl(filename), provider: 'wikidata', detail: tags.wikidata };
  }

  const wiki = parseWikipediaTag(tags.wikipedia);
  if (wiki && ['all', 'wikimedia', 'auto'].includes(place.sourceMode)) {
    const url = await fetchWikipediaPageImage(wiki.lang, wiki.title);
    if (url) return { url, provider: 'wikipedia', detail: tags.wikipedia };
  }

  const osm = parseOsmSourceId(place.source_place_id);
  if (osm && ['all', 'wikimedia', 'auto'].includes(place.sourceMode)) {
    const filename = await fetchWikidataByOsmId(osm.osmType, osm.osmId);
    if (filename) return { url: commonsThumbnailUrl(filename), provider: 'wikidata-osm', detail: place.source_place_id };
  }

  if (hasReliableIdentity && ['all', 'wikimedia', 'auto'].includes(place.sourceMode)) {
    const filename = await searchWikidataImage(place.name, place.cities?.name_en || place.cities?.name_az);
    if (filename) return { url: commonsThumbnailUrl(filename), provider: 'wikidata-search', detail: filename };
  }

  if (hasReliableIdentity && ['all', 'wikimedia', 'auto'].includes(place.sourceMode)) {
    const pageImage = await searchWikipediaPageImage(place.name, place.cities?.name_en || place.cities?.name_az);
    if (pageImage?.url) return { url: pageImage.url, provider: 'wikipedia-search', detail: pageImage.detail };
  }

  if (hasReliableIdentity && ['all', 'unsplash', 'auto'].includes(place.sourceMode)) {
    const url = await fetchUnsplashImage(place);
    if (url) return { url, provider: 'unsplash', detail: unsplashQuery(place) };
  }

  if (hasReliableIdentity && ['all', 'pexels', 'auto'].includes(place.sourceMode)) {
    const url = await fetchPexelsImage(place);
    if (url) return { url, provider: 'pexels', detail: pexelsQuery(place) };
  }

  return null;
}

async function getCityId(supabase, slug) {
  if (!slug) return null;
  const { data, error } = await supabase.from('cities').select('id, slug').eq('slug', slug).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`City not found: ${slug}`);
  return data.id;
}

async function main() {
  const opts = parseArgs();
  const supabase = createSupabaseClient();
  const cityId = await getCityId(supabase, opts.city);

  const resolvedStateFile = opts.stateFile ? path.resolve(process.cwd(), opts.stateFile) : null;
  const state = loadState(resolvedStateFile);
  const key = stateKey(opts);
  if (!opts.offsetProvided && resolvedStateFile && state && typeof state[key]?.nextOffset === 'number') {
    opts.offset = state[key].nextOffset;
  }

  console.log(`\nPlace Image Enrichment - ${opts.dryRun ? 'DRY-RUN' : 'APPLY'}`);
  console.log(`  Limit: ${opts.limit}`);
  console.log(`  City: ${opts.city || 'any'}`);
  console.log(`  Categories: ${opts.categories.join(',')}`);
  console.log(`  Overwrite: ${opts.overwrite ? 'yes' : 'no'}`);
  console.log(`  Source: ${opts.source}\n`);
  console.log(`  Offset: ${opts.offset}\n`);
  if (resolvedStateFile) {
    console.log(`  State file: ${resolvedStateFile}`);
    if (state && typeof state[key]?.nextOffset === 'number') console.log(`  State nextOffset: ${state[key].nextOffset}`);
    console.log('');
  }

  const fetchWindow = Math.max(opts.limit * 4, opts.limit);

  let query = supabase
    .from('places')
    .select('id, slug, name, category, source_place_id, cover_photo_url, cover_photo_id, raw_data, cities(slug,name_az,name_en,name_ru), countries(slug,name_az,name_en)')
    .eq('status', 'active')
    .in('category', opts.categories)
    .order('popular_rank', { ascending: true })
    .range(opts.offset, opts.offset + fetchWindow - 1);

  if (cityId) query = query.eq('city_id', cityId);
  if (opts.slug) query = query.in('slug', opts.slug);
  if (!opts.overwrite) query = query.is('cover_photo_url', null).is('cover_photo_id', null);

  const { data: places, error } = await query;
  if (error) throw error;
  const processablePlaces = selectProcessablePlaces(places, opts.limit);

  if (!processablePlaces || processablePlaces.length === 0) {
    console.log('No matching places found.');
    return;
  }

  const { data: existingRows } = await supabase
    .from('places')
    .select('id, cover_photo_url')
    .not('cover_photo_url', 'is', null);
  const usedUrls = new Set((existingRows || []).map((row) => row.cover_photo_url).filter(Boolean));

  let enriched = 0;
  let skipped = 0;
  let duplicates = 0;

  for (const place of processablePlaces.map((item) => ({ ...item, sourceMode: opts.source }))) {
    console.log(`  [${place.name}] ${place.cities?.slug || ''}...`);

    let result = null;
    try {
      result = await findImageForPlace(place);
    } catch (error) {
      console.log(`    error: ${error.message}`);
    }

    if (!result?.url) {
      console.log('    no place-specific image found');
      skipped += 1;
      await sleep(RATE_DELAY);
      continue;
    }

    if (usedUrls.has(result.url) && result.url !== place.cover_photo_url) {
      console.log(`    duplicate skipped: ${result.provider}`);
      duplicates += 1;
      await sleep(RATE_DELAY);
      continue;
    }

    console.log(`    found via ${result.provider}: ${result.detail}`);
    if (!opts.dryRun) {
      const { error: updateError } = await supabase
        .from('places')
        .update({
          cover_photo_url: result.url,
          cover_photo_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', place.id);
      if (updateError) throw updateError;
      usedUrls.add(result.url);
    }

    enriched += 1;
    await sleep(RATE_DELAY);
  }

  console.log('\n=== Summary ===');
  console.log(`  Mode: ${opts.dryRun ? 'DRY-RUN' : 'APPLY'}`);
  console.log(`  Processed: ${processablePlaces.length}`);
  console.log(`  Enriched: ${enriched}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Duplicate skipped: ${duplicates}`);

  if (resolvedStateFile) {
    const nextOffset = opts.offset + fetchWindow;
    const updatedState = state && typeof state === 'object' ? state : {};
    updatedState[key] = {
      nextOffset,
      updatedAt: new Date().toISOString(),
      lastRun: {
        mode: opts.dryRun ? 'dry-run' : 'apply',
        processed: processablePlaces.length,
        enriched,
        skipped,
        duplicateSkipped: duplicates,
        offset: opts.offset,
        fetchWindow,
      },
    };
    saveState(resolvedStateFile, updatedState);
    console.log(`\nState updated: nextOffset=${nextOffset}`);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  buildPlaceMatchSignals,
  containsBlockedVisualTerms,
  hasStrongTextMatch,
  isAnimalAttraction,
  rawTags,
  hasReliablePlaceIdentity,
  selectProcessablePlaces,
  shouldSkipPlaceForImageSearch,
  selectPexelsPhoto,
  selectUnsplashPhoto,
};
