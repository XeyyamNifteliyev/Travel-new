#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const REST_COUNTRIES_URL = 'https://restcountries.com/v3.1/all?fields=name,cca2,capital,currencies,languages,translations,continents,population,timezones,idd';
const WIKIPEDIA_SUMMARY = {
  az: 'https://az.wikipedia.org/api/rest_v1/page/summary/',
  en: 'https://en.wikipedia.org/api/rest_v1/page/summary/',
  ru: 'https://ru.wikipedia.org/api/rest_v1/page/summary/',
};
const REQUEST_DELAY = 350;

const SLUG_TO_CCA2 = {
  bali: 'ID',
  dubai: 'AE',
  uk: 'GB',
  usa: 'US',
  'united-kingdom': 'GB',
  'united-states': 'US',
  'c-te-d-ivoire': 'CI',
  'republic-of-the-congo': 'CG',
  'north-korea': 'KP',
  'south-korea': 'KR',
  'czech-republic': 'CZ',
};

const MONTHS = {
  europe: ['apr', 'may', 'jun', 'sep'],
  asia: ['mar', 'apr', 'oct', 'nov'],
  africa: ['jun', 'jul', 'aug', 'sep'],
  americas: ['apr', 'may', 'sep', 'oct'],
  oceania: ['oct', 'nov', 'dec', 'mar'],
};

const REGION_PRICE_ESTIMATES = {
  europe: { flight: 350, hotel: 120, daily: 90 },
  asia: { flight: 450, hotel: 85, daily: 65 },
  africa: { flight: 600, hotel: 90, daily: 70 },
  americas: { flight: 850, hotel: 130, daily: 100 },
  oceania: { flight: 1200, hotel: 160, daily: 120 },
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
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
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
    limit: 30,
    apply: false,
    dryRun: true,
    slug: null,
    overwrite: false,
    repairFallbackDescriptions: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--limit' || arg.startsWith('--limit=')) {
      const parsed = readArgValue(argv, i);
      if (parsed.value) opts.limit = Number.parseInt(parsed.value, 10);
      i = parsed.nextIndex;
    } else if (arg === '--slug' || arg.startsWith('--slug=')) {
      const parsed = readArgValue(argv, i);
      opts.slug = parsed.value.split(',').map((slug) => slug.trim()).filter(Boolean);
      i = parsed.nextIndex;
    } else if (arg === '--overwrite') {
      opts.overwrite = true;
    } else if (arg === '--repair-fallback-descriptions') {
      opts.repairFallbackDescriptions = true;
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
Usage: node scripts/enrich-country-content.js [options]

Options:
  --limit <n>       Max countries to process (default: 30)
  --slug <slugs>    Comma-separated slugs to target
  --overwrite       Replace existing card content fields
  --repair-fallback-descriptions
                   Replace generated fallback descriptions with Wikipedia summaries where possible
  --apply           Write to Supabase (default is dry-run)
  --dry-run         Preview only
  --help            Show this help

Examples:
  npm run enrich:country-content -- --limit=30 --dry-run
  npm run enrich:country-content -- --limit=30 --apply
  npm run enrich:country-content -- --slug=finland,kenya,belgium --apply
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

function hasValue(value) {
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined && value !== '';
}

function normalizeName(value) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getContinent(country) {
  const continent = country.continents?.[0]?.toLowerCase();
  if (continent === 'north america' || continent === 'south america') return 'americas';
  if (continent) return continent;
  return null;
}

function createCountryLookup(restCountries) {
  const byCode = new Map();
  const bySlug = new Map();

  for (const country of restCountries) {
    if (country.cca2) byCode.set(country.cca2.toUpperCase(), country);
    for (const name of [
      country.name?.common,
      country.name?.official,
      country.translations?.rus?.common,
      country.translations?.tur?.common,
      country.translations?.deu?.common,
      country.translations?.fra?.common,
    ]) {
      const slug = normalizeName(name);
      if (slug && !bySlug.has(slug)) bySlug.set(slug, country);
    }
  }

  return { byCode, bySlug };
}

function findRestCountry(row, lookup) {
  const code = (row.cca2 || SLUG_TO_CCA2[row.slug] || '').toUpperCase();
  if (code && lookup.byCode.has(code)) return lookup.byCode.get(code);

  const candidates = [
    row.slug,
    row.name_en,
    row.name_az,
    row.name_ru,
  ].map(normalizeName);

  for (const candidate of candidates) {
    if (candidate && lookup.bySlug.has(candidate)) return lookup.bySlug.get(candidate);
  }

  return null;
}

function firstCurrency(country) {
  const entries = Object.entries(country.currencies || {});
  if (entries.length === 0) return { code: null, name: null };
  const [code, details] = entries[0];
  return { code, name: details?.name || null };
}

function firstLanguage(country) {
  return Object.values(country.languages || {})[0] || null;
}

function callingCode(country) {
  const root = country.idd?.root || '';
  const suffix = country.idd?.suffixes?.[0] || '';
  return root && suffix ? `${root}${suffix}` : null;
}

function estimatePrices(country, continent) {
  const base = REGION_PRICE_ESTIMATES[continent] || REGION_PRICE_ESTIMATES.asia;
  return base;
}

function inferBestMonths(country, continent) {
  const name = (country.name?.common || '').toLowerCase();
  if (['bahamas', 'barbados', 'jamaica', 'maldives'].includes(name)) return ['dec', 'jan', 'feb', 'mar'];
  return MONTHS[continent] || MONTHS.asia;
}

function inferClimate(country, continent) {
  const name = (country.name?.common || '').toLowerCase();
  if (['bahamas', 'barbados', 'jamaica', 'maldives', 'indonesia', 'malaysia'].includes(name)) return 'tropical';
  if (continent === 'europe') return 'temperate';
  if (continent === 'oceania') return 'temperate';
  return 'mixed';
}

function sentenceLimit(text, maxSentences = 2) {
  if (!text) return null;
  const cleaned = text
    .replace(/\s+/g, ' ')
    .replace(/\s+\[[^\]]+\]/g, '')
    .trim();
  const sentences = cleaned.match(/[^.!?]+[.!?]+/g);
  if (sentences?.length) return sentences.slice(0, maxSentences).join(' ').trim();
  return cleaned.split(' ').slice(0, 36).join(' ').trim();
}

async function fetchJson(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TravelAZ/1.0 country-content-enrichment',
      },
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

async function fetchWikipediaSummary(locale, title) {
  if (!title) return null;
  const data = await fetchJson(`${WIKIPEDIA_SUMMARY[locale]}${encodeURIComponent(title)}`);
  await sleep(REQUEST_DELAY);
  if (!data?.extract || data.type === 'disambiguation') return null;
  return sentenceLimit(data.extract, 2);
}

function factualFallback(locale, countryName, capital, continent) {
  const azContinents = {
    europe: 'Avropa',
    asia: 'Asiya',
    africa: 'Afrika',
    americas: 'Amerika',
    oceania: 'Okeaniya',
  };
  const ruContinents = {
    europe: 'Европы',
    asia: 'Азии',
    africa: 'Африки',
    americas: 'Америки',
    oceania: 'Океании',
  };
  const enContinents = {
    europe: 'Europe',
    asia: 'Asia',
    africa: 'Africa',
    americas: 'the Americas',
    oceania: 'Oceania',
  };

  if (locale === 'az') {
    const region = azContinents[continent] || 'beynəlxalq';
    return `${countryName} ${region} regionunda yerləşən səyahət istiqamətidir${capital ? `; paytaxtı ${capital} şəhəridir` : ''}. Səyahət planı üçün viza, mövsüm və büdcə məlumatlarını əvvəlcədən yoxlamaq tövsiyə olunur.`;
  }
  if (locale === 'ru') {
    const region = ruContinents[continent] || 'международных поездок';
    return `${countryName} является направлением для поездок в регионе ${region}${capital ? `; столица — ${capital}` : ''}. Перед поездкой стоит проверить визу, сезон и ориентировочный бюджет.`;
  }
  const region = enContinents[continent] || 'international travel';
  return `${countryName} is a travel destination in ${region}${capital ? ` with capital ${capital}` : ''}. Check visa, season, and estimated budget before planning a trip.`;
}

async function buildDescriptions(row, restCountry, capital, continent) {
  const enTitle = restCountry.name?.common || row.name_en;
  const ruTitle = restCountry.translations?.rus?.common || row.name_ru || row.name_en;
  const azTitle = row.name_az || row.name_en;

  const [enSummary, ruSummary, azSummary] = await Promise.all([
    fetchWikipediaSummary('en', enTitle),
    fetchWikipediaSummary('ru', ruTitle),
    fetchWikipediaSummary('az', azTitle),
  ]);

  return {
    short_desc_en: enSummary || factualFallback('en', row.name_en || enTitle, capital, continent),
    short_desc_ru: ruSummary || factualFallback('ru', row.name_ru || ruTitle, capital, continent),
    short_desc: azSummary || factualFallback('az', row.name_az || azTitle, capital, continent),
  };
}

function shouldProcess(row, opts) {
  if (opts.slug) return true;
  if (opts.repairFallbackDescriptions && hasFallbackDescription(row)) return true;
  const cardFields = ['capital', 'short_desc', 'short_desc_en', 'short_desc_ru', 'avg_flight_azn', 'avg_hotel_azn', 'avg_daily_azn', 'best_months'];
  return cardFields.some((field) => !hasValue(row[field]));
}

function hasFallbackDescription(row) {
  return [row.short_desc, row.short_desc_en, row.short_desc_ru]
    .filter(Boolean)
    .some((description) => (
      description.includes('Səyahət planı üçün viza') ||
      description.includes('Check visa, season') ||
      description.includes('Перед поездкой стоит проверить')
    ));
}

async function getRows(supabase, opts) {
  let query = supabase
    .from('countries')
    .select('id, slug, name_az, name_en, name_ru, cca2, continent, capital, currency, currency_name, language, population, timezone, calling_code, best_months, climate_type, short_desc, short_desc_en, short_desc_ru, avg_flight_azn, avg_hotel_azn, avg_daily_azn, popular_rank, is_featured')
    .order('is_featured', { ascending: false })
    .order('popular_rank', { ascending: true })
    .order('name_en', { ascending: true })
    .limit(opts.slug ? 500 : 500);

  if (opts.slug?.length) query = query.in('slug', opts.slug);

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).filter((row) => shouldProcess(row, opts)).slice(0, opts.limit);
}

function addIfMissing(update, row, field, value, overwrite) {
  if ((overwrite || !hasValue(row[field])) && hasValue(value)) update[field] = value;
}

async function main() {
  loadEnvFile(path.join(__dirname, '..', '.env.local'));
  const opts = parseArgs();
  if (opts.help) {
    printHelp();
    return;
  }

  const supabase = createSupabaseClient(opts.apply);
  const rows = await getRows(supabase, opts);

  console.log(`\nCountry Content Enrichment - ${opts.dryRun ? 'DRY-RUN' : 'APPLY'} mode\n`);
  console.log(`  Limit: ${opts.limit}`);
  console.log(`  Target slugs: ${opts.slug?.join(', ') || 'auto'}`);
  console.log(`  Overwrite existing fields: ${opts.overwrite ? 'yes' : 'no'}\n`);
  console.log(`  Repair fallback descriptions: ${opts.repairFallbackDescriptions ? 'yes' : 'no'}\n`);

  if (rows.length === 0) {
    console.log('No countries need card content enrichment.');
    return;
  }

  const restCountries = await fetchJson(REST_COUNTRIES_URL);
  if (!Array.isArray(restCountries)) throw new Error('Could not load RestCountries data.');
  const lookup = createCountryLookup(restCountries);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of rows) {
    process.stdout.write(`  [${row.slug}] `);
    const restCountry = findRestCountry(row, lookup);
    if (!restCountry) {
      console.log('no RestCountries match');
      skipped++;
      continue;
    }

    const continent = row.continent || getContinent(restCountry);
    const capital = restCountry.capital?.[0] || row.capital;
    const currency = firstCurrency(restCountry);
    const prices = estimatePrices(restCountry, continent);
    const descriptions = await buildDescriptions(row, restCountry, capital, continent);

    const update = {};
    addIfMissing(update, row, 'cca2', restCountry.cca2, opts.overwrite);
    addIfMissing(update, row, 'continent', continent, opts.overwrite);
    addIfMissing(update, row, 'capital', capital, opts.overwrite);
    addIfMissing(update, row, 'currency', currency.code, opts.overwrite);
    addIfMissing(update, row, 'currency_name', currency.name, opts.overwrite);
    addIfMissing(update, row, 'language', firstLanguage(restCountry), opts.overwrite);
    addIfMissing(update, row, 'population', restCountry.population, opts.overwrite);
    addIfMissing(update, row, 'timezone', restCountry.timezones?.[0], opts.overwrite);
    addIfMissing(update, row, 'calling_code', callingCode(restCountry), opts.overwrite);
    addIfMissing(update, row, 'best_months', inferBestMonths(restCountry, continent), opts.overwrite);
    addIfMissing(update, row, 'climate_type', inferClimate(restCountry, continent), opts.overwrite);
    addIfMissing(update, row, 'avg_flight_azn', prices.flight, opts.overwrite);
    addIfMissing(update, row, 'avg_hotel_azn', prices.hotel, opts.overwrite);
    addIfMissing(update, row, 'avg_daily_azn', prices.daily, opts.overwrite);
    const shouldOverwriteDescriptions = opts.overwrite || opts.repairFallbackDescriptions;
    addIfMissing(update, row, 'short_desc', descriptions.short_desc, shouldOverwriteDescriptions);
    addIfMissing(update, row, 'short_desc_en', descriptions.short_desc_en, shouldOverwriteDescriptions);
    addIfMissing(update, row, 'short_desc_ru', descriptions.short_desc_ru, shouldOverwriteDescriptions);

    if (Object.keys(update).length === 0) {
      console.log('already complete');
      skipped++;
      continue;
    }

    console.log(`${Object.keys(update).join(', ')}`);

    if (opts.apply) {
      const { error } = await supabase
        .from('countries')
        .update(update)
        .eq('id', row.id);

      if (error) {
        console.error(`    DB update failed: ${error.message}`);
        errors++;
      } else {
        updated++;
      }
    } else {
      updated++;
    }
  }

  console.log('\n=== Summary ===');
  console.log(`  Mode: ${opts.dryRun ? 'DRY-RUN' : 'APPLY'}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Errors: ${errors}\n`);
  if (opts.dryRun && updated > 0) console.log('Run with --apply to write to Supabase.\n');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
