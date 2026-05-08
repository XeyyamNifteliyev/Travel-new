#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const WIKI_API = {
  az: 'https://az.wikipedia.org/w/api.php',
  en: 'https://en.wikipedia.org/w/api.php',
  ru: 'https://ru.wikipedia.org/w/api.php',
};

const WIKI_SUMMARY = {
  az: 'https://az.wikipedia.org/api/rest_v1/page/summary/',
  en: 'https://en.wikipedia.org/api/rest_v1/page/summary/',
  ru: 'https://ru.wikipedia.org/api/rest_v1/page/summary/',
};

const RATE_DELAY = 450;
const REQUEST_TIMEOUT = 10000;

const CATEGORY_LABELS = {
  az: {
    attraction: 'görməli yer',
    museum: 'muzey',
    landmark: 'landmark',
    restaurant: 'restoran',
    cafe: 'kafe',
    hotel: 'hotel',
    viewpoint: 'panorama nöqtəsi',
    historic: 'tarixi məkan',
    park: 'park',
    beach: 'çimərlik',
    shopping: 'alış-veriş məkanı',
    nightlife: 'gecə həyatı məkanı',
    transport: 'nəqliyyat nöqtəsi',
    other: 'səyahət məkanı',
  },
  en: {
    attraction: 'attraction',
    museum: 'museum',
    landmark: 'landmark',
    restaurant: 'restaurant',
    cafe: 'cafe',
    hotel: 'hotel',
    viewpoint: 'viewpoint',
    historic: 'historic place',
    park: 'park',
    beach: 'beach',
    shopping: 'shopping spot',
    nightlife: 'nightlife venue',
    transport: 'transport point',
    other: 'travel place',
  },
  ru: {
    attraction: 'достопримечательность',
    museum: 'музей',
    landmark: 'ориентир',
    restaurant: 'ресторан',
    cafe: 'кафе',
    hotel: 'отель',
    viewpoint: 'смотровая площадка',
    historic: 'историческое место',
    park: 'парк',
    beach: 'пляж',
    shopping: 'место для покупок',
    nightlife: 'место ночной жизни',
    transport: 'транспортная точка',
    other: 'туристическое место',
  },
};

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
  const opts = {
    limit: 50,
    city: null,
    apply: false,
    dryRun: true,
    overwrite: false,
    strategy: 'all',
    report: path.join('data', 'place-description-manual-review.json'),
    quiet: false,
  };
  const args = process.argv.slice(2);
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
    } else if (arg === '--strategy' || arg.startsWith('--strategy=')) {
      const parsed = readArgValue(args, i);
      opts.strategy = parsed.value;
      i = parsed.nextIndex;
    } else if (arg === '--report' || arg.startsWith('--report=')) {
      const parsed = readArgValue(args, i);
      opts.report = parsed.value;
      i = parsed.nextIndex;
    } else if (arg === '--apply') {
      opts.apply = true;
      opts.dryRun = false;
    } else if (arg === '--dry-run') {
      opts.apply = false;
      opts.dryRun = true;
    } else if (arg === '--overwrite') {
      opts.overwrite = true;
    } else if (arg === '--quiet') {
      opts.quiet = true;
    }
  }
  return opts;
}

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'TravelAZ/1.0 place-description-enrichment' },
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function compactSummary(text) {
  if (!text) return null;
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length < 80) return null;
  if (/may refer to|can refer to|usually refers to|disambiguation/i.test(cleaned)) return null;
  const sentences = cleaned.match(/[^.!?]+[.!?]+/g);
  const summary = sentences ? sentences.slice(0, 2).join(' ').trim() : cleaned;
  return summary.length > 520 ? `${summary.slice(0, 517).trim()}...` : summary;
}

function getRawTags(place) {
  const tags = place.raw_data?.tags;
  return tags && typeof tags === 'object' && !Array.isArray(tags) ? tags : {};
}

function wikipediaTagForLocale(tags, locale) {
  const value = tags.wikipedia;
  if (!value || typeof value !== 'string') return null;
  const [lang, ...titleParts] = value.split(':');
  const title = titleParts.join(':');
  if (lang === locale && title) return title;
  return null;
}

async function fetchSummary(locale, title) {
  if (!title) return null;
  const data = await fetchJson(`${WIKI_SUMMARY[locale]}${encodeURIComponent(title)}`);
  await sleep(RATE_DELAY);
  if (!data || data.type === 'disambiguation') return null;
  const extract = compactSummary(data.extract);
  if (!extract) return null;
  return {
    title: data.title || title,
    extract,
    sourceUrl: data.content_urls?.desktop?.page || `https://${locale}.wikipedia.org/wiki/${encodeURIComponent(title.replaceAll(' ', '_'))}`,
  };
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

function isLikelyMatch(placeName, resultTitle) {
  const name = normalize(placeName);
  const title = normalize(resultTitle);
  if (!name || !title) return false;
  if (title.includes(name) || name.includes(title)) return true;
  const tokens = name.split(' ').filter((token) => token.length > 2);
  if (!tokens.length) return false;
  return tokens.filter((token) => title.includes(token)).length / tokens.length >= 0.6;
}

async function searchTitle(locale, place) {
  const cityName = place.cities?.name_en || place.cities?.name_az || '';
  const query = `${place.name} ${cityName}`.trim();
  const params = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: query,
    srlimit: '5',
    format: 'json',
    origin: '*',
  });
  const data = await fetchJson(`${WIKI_API[locale]}?${params.toString()}`);
  await sleep(RATE_DELAY);
  const results = data?.query?.search || [];
  const match = results.find((result) => isLikelyMatch(place.name, result.title));
  return match?.title || null;
}

async function findLocaleSummary(locale, place) {
  const tags = getRawTags(place);
  const taggedTitle = wikipediaTagForLocale(tags, locale);
  const direct = await fetchSummary(locale, taggedTitle);
  if (direct) return { ...direct, strategy: 'wikipedia_tag' };
  const searchedTitle = await searchTitle(locale, place);
  const searched = await fetchSummary(locale, searchedTitle);
  if (searched) return { ...searched, strategy: 'wikipedia_search' };
  return null;
}

function cleanValue(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function cityName(place, locale) {
  if (locale === 'en') return cleanValue(place.cities?.name_en) || cleanValue(place.cities?.name_az);
  if (locale === 'ru') return cleanValue(place.cities?.name_ru) || cleanValue(place.cities?.name_en) || cleanValue(place.cities?.name_az);
  return cleanValue(place.cities?.name_az) || cleanValue(place.cities?.name_en);
}

function countryName(place, locale) {
  if (locale === 'en') return cleanValue(place.countries?.name_en) || cleanValue(place.countries?.name_az);
  if (locale === 'ru') return cleanValue(place.countries?.name_ru) || cleanValue(place.countries?.name_en) || cleanValue(place.countries?.name_az);
  return cleanValue(place.countries?.name_az) || cleanValue(place.countries?.name_en);
}

function categoryLabel(category, locale) {
  return CATEGORY_LABELS[locale]?.[category] || CATEGORY_LABELS[locale]?.other || category;
}

function readableList(values, locale) {
  const list = values.filter(Boolean);
  if (locale === 'en') return list.join(', ');
  if (locale === 'ru') return list.join(', ');
  return list.join(', ');
}

function collectFacts(place, locale) {
  const tags = getRawTags(place);
  const facts = {
    name: cleanValue(place.name),
    city: cityName(place, locale),
    country: countryName(place, locale),
    category: categoryLabel(place.category, locale),
    address: cleanValue(place.address) || cleanValue(tags['addr:full']) || cleanValue(tags['addr:street']),
    cuisine: cleanValue(tags.cuisine)?.replaceAll(';', ', '),
    tourism: cleanValue(tags.tourism),
    historic: cleanValue(tags.historic),
    amenity: cleanValue(tags.amenity),
    openingHours: cleanValue(place.opening_hours),
    website: cleanValue(place.website),
    phone: cleanValue(place.phone),
    lat: typeof place.lat === 'number' ? place.lat.toFixed(4) : null,
    lng: typeof place.lng === 'number' ? place.lng.toFixed(4) : null,
    source: cleanValue(place.source) || 'openstreetmap',
    sourceUrl: cleanValue(place.source_url),
  };
  facts.hasEnoughSource = Boolean(facts.name && facts.city && facts.category && (facts.address || facts.lat || facts.source || facts.website));
  return facts;
}

function buildFactualDescription(place, locale) {
  const f = collectFacts(place, locale);
  if (!f.hasEnoughSource) return null;
  const isFood = ['restaurant', 'cafe'].includes(place.category);
  const isHotel = place.category === 'hotel';
  const isAttraction = ['attraction', 'museum', 'landmark', 'historic', 'viewpoint', 'park', 'beach'].includes(place.category);

  if (locale === 'en') {
    const intro = `${f.name} is a ${f.category} in ${f.city}${f.country ? `, ${f.country}` : ''}.`;
    const contextParts = [];
    if (f.address) contextParts.push(`address: ${f.address}`);
    if (f.cuisine && isFood) contextParts.push(`cuisine: ${f.cuisine}`);
    if (f.tourism && isAttraction) contextParts.push(`OSM tourism tag: ${f.tourism}`);
    if (f.historic) contextParts.push(`historic tag: ${f.historic}`);
    const context = contextParts.length
      ? `For trip planning, the key available details are ${readableList(contextParts, locale)}.`
      : `For trip planning, the page keeps the place category, city, source and coordinates together in one view.`;
    const practical = `Use this page to check the official website, opening hours, address and map coordinates when those details are available.`;
    const seo = isFood
      ? `${f.name} can be included in a ${f.city} food itinerary when you are comparing restaurants and cafes by area, cuisine and practical details.`
      : isHotel
        ? `${f.name} can be reviewed as part of a ${f.city} stay plan with location, contact and source details kept close to the listing.`
        : `${f.name} can be added to a ${f.city} sightseeing route together with nearby attractions, restaurants and cafes.`;
    return [intro, context, practical, seo].join('\n\n');
  }

  if (locale === 'ru') {
    const intro = `${f.name} — ${f.category} в городе ${f.city}${f.country ? `, ${f.country}` : ''}.`;
    const contextParts = [];
    if (f.address) contextParts.push(`адрес: ${f.address}`);
    if (f.cuisine && isFood) contextParts.push(`кухня: ${f.cuisine}`);
    if (f.tourism && isAttraction) contextParts.push(`OSM tourism: ${f.tourism}`);
    if (f.historic) contextParts.push(`historic: ${f.historic}`);
    const context = contextParts.length
      ? `Для планирования поездки здесь собраны основные доступные данные: ${readableList(contextParts, locale)}.`
      : `Для планирования поездки страница объединяет категорию места, город, источник и координаты в одном блоке.`;
    const practical = `На странице можно проверить официальный сайт, часы работы, адрес и координаты, если эти данные есть в открытых источниках.`;
    const seo = isFood
      ? `${f.name} можно добавить в гастрономический маршрут по ${f.city}, сравнивая рестораны и кафе по району, кухне и практической информации.`
      : isHotel
        ? `${f.name} можно рассматривать при планировании проживания в ${f.city}, ориентируясь на локацию, контакты и источник данных.`
        : `${f.name} можно добавить в маршрут по ${f.city} вместе с ближайшими достопримечательностями, ресторанами и кафе.`;
    return [intro, context, practical, seo].join('\n\n');
  }

  const intro = `${f.name} ${f.city}${f.country ? `, ${f.country}` : ''} şəhərində yerləşən ${f.category} məkanıdır.`;
  const contextParts = [];
  if (f.address) contextParts.push(`ünvan: ${f.address}`);
  if (f.cuisine && isFood) contextParts.push(`mətbəx: ${f.cuisine}`);
  if (f.tourism && isAttraction) contextParts.push(`OSM tourism tipi: ${f.tourism}`);
  if (f.historic) contextParts.push(`tarixi tag: ${f.historic}`);
  const context = contextParts.length
    ? `Səyahət planı üçün əsas açıq mənbə detalları bunlardır: ${readableList(contextParts, locale)}.`
    : `Səyahət planı üçün bu səhifədə məkanın kateqoriyası, şəhəri, koordinatları və mənbə məlumatı bir yerdə göstərilir.`;
  const practical = `Rəsmi sayt, iş saatları, ünvan və xəritə koordinatları mövcud olduqca bu səhifədə yenilənir.`;
  const seo = isFood
    ? `${f.name} ${f.city} restoran və kafe marşrutu qurarkən rayon, mətbəx və praktik məlumatlara görə müqayisə edilə bilər.`
    : isHotel
      ? `${f.name} ${f.city} qalma planı hazırlayarkən lokasiya, əlaqə və mənbə detalları ilə birlikdə qiymətləndirilə bilər.`
      : `${f.name} ${f.city} gəzinti marşrutuna yaxın görməli yerlər, restoranlar və kafelərlə birlikdə əlavə edilə bilər.`;
  return [intro, context, practical, seo].join('\n\n');
}

async function getTargetPlaces(supabase, opts) {
  let query = supabase
    .from('places')
    .select('id, name, category, subcategory, lat, lng, address, website, phone, opening_hours, description_az, description_en, description_ru, source, source_url, license, attribution_text, raw_data, cities(slug, name_az, name_en, name_ru), countries(slug, name_az, name_en, name_ru)')
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('popular_rank', { ascending: true })
    .limit(opts.limit);

  if (!opts.overwrite) {
    query = query.or('description_az.is.null,description_en.is.null,description_ru.is.null');
  }

  if (opts.city) {
    const { data: city, error } = await supabase.from('cities').select('id').eq('slug', opts.city).maybeSingle();
    if (error) throw error;
    if (!city) throw new Error(`City not found: ${opts.city}`);
    query = query.eq('city_id', city.id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function enrichPlace(place, opts) {
  const summaries = { az: null, en: null, ru: null };
  if (opts.strategy === 'all' || opts.strategy === 'wikipedia') {
    const results = await Promise.all([
      place.description_az && !opts.overwrite ? null : findLocaleSummary('az', place),
      place.description_en && !opts.overwrite ? null : findLocaleSummary('en', place),
      place.description_ru && !opts.overwrite ? null : findLocaleSummary('ru', place),
    ]);
    summaries.az = results[0];
    summaries.en = results[1];
    summaries.ru = results[2];
  }

  const updates = {};
  if (summaries.az?.extract) updates.description_az = summaries.az.extract;
  if (summaries.en?.extract) updates.description_en = summaries.en.extract;
  if (summaries.ru?.extract) updates.description_ru = summaries.ru.extract;

  if (opts.strategy === 'all' || opts.strategy === 'factual') {
    if ((!place.description_az || opts.overwrite) && !updates.description_az) {
      const text = buildFactualDescription(place, 'az');
      if (text) updates.description_az = text;
    }
    if ((!place.description_en || opts.overwrite) && !updates.description_en) {
      const text = buildFactualDescription(place, 'en');
      if (text) updates.description_en = text;
    }
    if ((!place.description_ru || opts.overwrite) && !updates.description_ru) {
      const text = buildFactualDescription(place, 'ru');
      if (text) updates.description_ru = text;
    }
  }

  const source = summaries.az || summaries.en || summaries.ru;
  if (Object.keys(updates).some((key) => key.startsWith('description_'))) {
    if (source?.sourceUrl && !place.source_url) updates.source_url = source.sourceUrl;
    if (source && !place.license) updates.license = 'CC BY-SA';
    if (source && !place.attribution_text) updates.attribution_text = `Wikipedia contributors, ${source.title}`;
    updates.last_synced_at = new Date().toISOString();
  }

  return { updates, summaries };
}

async function updatePlaceWithRetry(supabase, placeId, updates, attempts = 3) {
  let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const { error } = await supabase.from('places').update(updates).eq('id', placeId);
    if (!error) return;
    lastError = error;
    await sleep(500 * attempt);
  }
  throw lastError;
}

async function main() {
  loadEnvFile(path.join(__dirname, '..', '.env.local'));
  const opts = parseArgs();
  const supabase = createSupabaseClient();
  const places = await getTargetPlaces(supabase, opts);

  console.log(`Place description enrichment - ${opts.dryRun ? 'DRY-RUN' : 'APPLY'}`);
  console.log(`  Places: ${places.length}`);
  console.log(`  City: ${opts.city || 'any'}`);
  console.log(`  Strategy: ${opts.strategy}`);

  const manualReview = [];
  let updated = 0;
  let skipped = 0;
  for (const place of places) {
    const result = await enrichPlace(place, opts);
    const fields = Object.keys(result.updates).filter((key) => key.startsWith('description_'));
    if (!fields.length) {
      skipped += 1;
      manualReview.push({
        id: place.id,
        name: place.name,
        city: place.cities?.slug,
        category: place.category,
        reason: 'No confident Wikipedia summary and not enough factual open-data fields',
      });
      if (!opts.quiet) console.log(`- ${place.name}: manual review`);
      continue;
    }
    updated += 1;
    if (!opts.quiet) console.log(`+ ${place.name}: ${fields.join(', ')}`);
    if (!opts.dryRun) {
      await updatePlaceWithRetry(supabase, place.id, result.updates);
    }
  }

  fs.mkdirSync(path.dirname(opts.report), { recursive: true });
  fs.writeFileSync(opts.report, JSON.stringify({
    generatedAt: new Date().toISOString(),
    city: opts.city,
    strategy: opts.strategy,
    mode: opts.dryRun ? 'dry-run' : 'apply',
    updated,
    skipped,
    manualReview,
  }, null, 2));

  console.log(`\nSummary: updated=${updated}, skipped=${skipped}, mode=${opts.dryRun ? 'dry-run' : 'apply'}`);
  console.log(`Manual review report: ${opts.report}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
