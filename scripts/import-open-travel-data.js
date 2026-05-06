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
  barcelona: {
    countrySlug: 'spain',
    slug: 'barcelona',
    name: 'Barcelona',
    nameAz: 'Barselona',
    nameEn: 'Barcelona',
    nameRu: 'Барселона',
    lat: 41.3874,
    lng: 2.1686,
    population: 1620343,
    wikiTitle: 'Barcelona',
  },
  amsterdam: {
    countrySlug: 'netherlands',
    slug: 'amsterdam',
    name: 'Amsterdam',
    nameAz: 'Amsterdam',
    nameEn: 'Amsterdam',
    nameRu: 'Амстердам',
    lat: 52.3676,
    lng: 4.9041,
    population: 905000,
    wikiTitle: 'Amsterdam',
  },
  vienna: {
    countrySlug: 'austria',
    slug: 'vienna',
    name: 'Vienna',
    nameAz: 'Vyana',
    nameEn: 'Vienna',
    nameRu: 'Вена',
    lat: 48.2082,
    lng: 16.3738,
    population: 1911791,
    wikiTitle: 'Vienna',
  },
  prague: {
    countrySlug: 'czech-republic',
    slug: 'prague',
    name: 'Prague',
    nameAz: 'Praqa',
    nameEn: 'Prague',
    nameRu: 'Прага',
    lat: 50.0755,
    lng: 14.4378,
    population: 1309000,
    wikiTitle: 'Prague',
  },
  budapest: {
    countrySlug: 'hungary',
    slug: 'budapest',
    name: 'Budapest',
    nameAz: 'Budapeşt',
    nameEn: 'Budapest',
    nameRu: 'Будапешт',
    lat: 47.4979,
    lng: 19.0402,
    population: 1752200,
    wikiTitle: 'Budapest',
  },
  singapore: {
    countrySlug: 'singapore',
    slug: 'singapore',
    name: 'Singapore',
    nameAz: 'Sinqapur',
    nameEn: 'Singapore',
    nameRu: 'Сингапур',
    lat: 1.3521,
    lng: 103.8198,
    population: 5686300,
    wikiTitle: 'Singapore',
  },
  seoul: {
    countrySlug: 'south-korea',
    slug: 'seoul',
    name: 'Seoul',
    nameAz: 'Seul',
    nameEn: 'Seoul',
    nameRu: 'Сеул',
    lat: 37.5665,
    lng: 126.9780,
    population: 9776000,
    wikiTitle: 'Seoul',
  },
  kuala_lumpur: {
    countrySlug: 'malaysia',
    slug: 'kuala-lumpur',
    name: 'Kuala Lumpur',
    nameAz: 'Kuala-Lumpur',
    nameEn: 'Kuala Lumpur',
    nameRu: 'Куала-Лумпур',
    lat: 3.1390,
    lng: 101.6869,
    population: 1800000,
    wikiTitle: 'Kuala Lumpur',
  },
  cairo: {
    countrySlug: 'egypt',
    slug: 'cairo',
    name: 'Cairo',
    nameAz: 'Qahirə',
    nameEn: 'Cairo',
    nameRu: 'Каир',
    lat: 30.0444,
    lng: 31.2357,
    population: 10200000,
    wikiTitle: 'Cairo',
  },
  new_york: {
    countrySlug: 'usa',
    slug: 'new-york',
    name: 'New York',
    nameAz: 'Nyu-York',
    nameEn: 'New York City',
    nameRu: 'Нью-Йорк',
    lat: 40.7128,
    lng: -74.0060,
    population: 8336817,
    wikiTitle: 'New York City',
  },
  berlin: {
    countrySlug: 'germany',
    slug: 'berlin',
    name: 'Berlin',
    nameAz: 'Berlin',
    nameEn: 'Berlin',
    nameRu: 'Берлин',
    lat: 52.5200,
    lng: 13.4050,
    population: 3749000,
    wikiTitle: 'Berlin',
  },
  athens: {
    countrySlug: 'greece',
    slug: 'athens',
    name: 'Athens',
    nameAz: 'Afina',
    nameEn: 'Athens',
    nameRu: 'Афины',
    lat: 37.9838,
    lng: 23.7275,
    population: 664046,
    wikiTitle: 'Athens',
  },
  lisbon: {
    countrySlug: 'portugal',
    slug: 'lisbon',
    name: 'Lisbon',
    nameAz: 'Lissabon',
    nameEn: 'Lisbon',
    nameRu: 'Лиссабон',
    lat: 38.7223,
    lng: -9.1393,
    population: 504526,
    wikiTitle: 'Lisbon',
  },
  baku: {
    countrySlug: 'azerbaijan',
    slug: 'baku',
    name: 'Baku',
    nameAz: 'Bakı',
    nameEn: 'Baku',
    nameRu: 'Баку',
    lat: 40.4093,
    lng: 49.8671,
    population: 2303100,
    wikiTitle: 'Baku',
  },
  antalya: {
    countrySlug: 'turkey',
    slug: 'antalya',
    name: 'Antalya',
    nameAz: 'Antalya',
    nameEn: 'Antalya',
    nameRu: 'Анталья',
    lat: 36.8969,
    lng: 30.7133,
    population: 1088000,
    wikiTitle: 'Antalya',
  },
  dubrovnik: {
    countrySlug: 'croatia',
    slug: 'dubrovnik',
    name: 'Dubrovnik',
    nameAz: 'Dubrovnik',
    nameEn: 'Dubrovnik',
    nameRu: 'Дубровник',
    lat: 42.6507,
    lng: 18.0944,
    population: 41562,
    wikiTitle: 'Dubrovnik',
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
    mode: 'overpass',
    geonamesUsername: null,
    citiesPerCountry: 5,
    enrichPresets: false,
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
    else if (arg.startsWith('--mode=')) args.mode = arg.slice('--mode='.length);
    else if (arg.startsWith('--geonames-username=')) args.geonamesUsername = arg.slice('--geonames-username='.length);
    else if (arg.startsWith('--cities-per-country=')) args.citiesPerCountry = Number(arg.slice('--cities-per-country='.length));
    else if (arg === '--enrich-presets') args.enrichPresets = true;
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
  --mode=<mode>     Import mode: 'overpass' (default) or 'geonames'
  --geonames-username=<user>  GeoNames API username (or set GEONAMES_USERNAME)
  --cities-per-country=<n>    Cities per country in geonames mode. Default: 5
  --enrich-presets    Enrich CITY_PRESETS with GeoNames data

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

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchGeoNamesCities(countryCode, maxRows, username) {
  const url = `https://api.geonames.org/searchJSON?country=${countryCode}&featureClass=P&orderby=population&maxRows=${maxRows}&username=${encodeURIComponent(username)}`;

  try {
    const data = await fetchJson(url);
    if (data.status) {
      throw new Error(`GeoNames error: ${data.status.message || JSON.stringify(data.status)}`);
    }
    return Array.isArray(data.geonames) ? data.geonames : [];
  } catch (error) {
    if (error.message && (error.message.includes('403') || error.message.includes('limit'))) {
      console.log(`  Rate limited, waiting 5s and retrying...`);
      await delay(5000);
      const data = await fetchJson(url);
      if (data.status) {
        throw new Error(`GeoNames error after retry: ${data.status.message || JSON.stringify(data.status)}`);
      }
      return Array.isArray(data.geonames) ? data.geonames : [];
    }
    throw error;
  }
}

async function fetchGeoNamesCityDetail(geonameId, username) {
  const url = `https://api.geonames.org/getJSON?geonameId=${geonameId}&username=${encodeURIComponent(username)}`;

  try {
    const data = await fetchJson(url);
    if (data.status) {
      throw new Error(`GeoNames error: ${data.status.message || JSON.stringify(data.status)}`);
    }
    return data;
  } catch (error) {
    if (error.message && (error.message.includes('403') || error.message.includes('limit'))) {
      console.log(`  Rate limited, waiting 5s and retrying...`);
      await delay(5000);
      const data = await fetchJson(url);
      if (data.status) {
        throw new Error(`GeoNames error after retry: ${data.status.message || JSON.stringify(data.status)}`);
      }
      return data;
    }
    throw error;
  }
}

function extractAlternateName(alternateNames, langCode) {
  if (!alternateNames) return null;

  if (Array.isArray(alternateNames)) {
    const match = alternateNames.find((alt) => alt.lang === langCode);
    return match ? match.name : null;
  }

  return null;
}

const COUNTRY_CODE_MAP = {
  turkey: 'TR', france: 'FR', italy: 'IT', dubai: 'AE', georgia: 'GE',
  japan: 'JP', thailand: 'TH', uk: 'GB', iran: 'IR', russia: 'RU',
  germany: 'DE', spain: 'ES', egypt: 'EG', usa: 'US', brazil: 'BR',
  china: 'CN', india: 'IN', australia: 'AU', canada: 'CA', mexico: 'MX',
  southkorea: 'KR', malaysia: 'MY', indonesia: 'ID', vietnam: 'VN',
  philippines: 'PH', singapore: 'SG', netherlands: 'NL', belgium: 'BE',
  switzerland: 'CH', austria: 'AT', portugal: 'PT', greece: 'GR',
  czechrepublic: 'CZ', poland: 'PL', sweden: 'SE', norway: 'NO',
  denmark: 'DK', finland: 'FI', ireland: 'IE', argentina: 'AR',
  colombia: 'CO', chile: 'CL', peru: 'PE', morocco: 'MA',
  southafrica: 'ZA', tanzania: 'TZ', kenya: 'KE', ethiopia: 'ET',
  nigeria: 'NG', ghana: 'GH', pakistan: 'PK', bangladesh: 'BD',
  uzbekistan: 'UZ', kazakhstan: 'KZ', azerbaijan: 'AZ', armenia: 'AM',
  belarus: 'BY', ukraine: 'UA', moldova: 'MD', romania: 'RO',
  bulgaria: 'BG', serbia: 'RS', croatia: 'HR', slovenia: 'SI',
  slovakia: 'SK', hungary: 'HU', israel: 'IL', jordan: 'JO',
  lebanon: 'LB', saudiarabia: 'SA', qatar: 'QA', kuwait: 'KW',
  oman: 'OM', bahrain: 'BH', cyprus: 'CY', malta: 'MT',
  iceland: 'IS', newzealand: 'NZ', cambodia: 'KH', myanmar: 'MM',
  nepal: 'NP', srilanka: 'LK', mongolia: 'MN',
};

function deriveCountryCode(slug, cca2) {
  if (cca2 && cca2.length === 2) return cca2.toUpperCase();
  const normalized = (slug || '').toLowerCase().replace(/[^a-z]/g, '');
  return COUNTRY_CODE_MAP[normalized] || null;
}

function mapGeoNamesToCityRow(geoCity, countryId) {
  const name = geoCity.name || geoCity.toponymName;
  if (!name) return null;

  const nameRu = extractAlternateName(geoCity.alternateNames, 'ru');

  return {
    country_id: countryId,
    slug: slugify(name),
    name_az: name,
    name_en: name,
    name_ru: nameRu,
    region: geoCity.adminName1 || null,
    admin_region: geoCity.adminName2 || null,
    lat: typeof geoCity.lat === 'number' ? geoCity.lat : null,
    lng: typeof geoCity.lng === 'number' ? geoCity.lng : null,
    population: typeof geoCity.population === 'number' ? geoCity.population : null,
    source: 'geonames',
    source_id: String(geoCity.geonameId),
    source_url: `https://www.geonames.org/${geoCity.geonameId}`,
    license: 'CC BY',
    attribution_text: 'GeoNames',
    last_synced_at: new Date().toISOString(),
  };
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

function buildGeoNamesSeedSql(cities) {
  const now = new Date().toISOString();
  const lines = [];

  lines.push('-- TravelAZ GeoNames city seed');
  lines.push(`-- Generated: ${now}`);
  lines.push('-- Source: GeoNames (CC BY)');
  lines.push('-- Run this after supabase/migrations/020_open_travel_data.sql has been applied.');
  lines.push('');
  lines.push('begin;');
  lines.push('');

  for (const city of cities) {
    const safeRef = (city.countrySlug || 'unknown').replace(/[^a-z0-9_]/gi, '_');
    lines.push(`with country_ref_${safeRef} as (`);
    lines.push(`  select id from countries where cca2 = ${sqlString(city.countryCode)} or slug = ${sqlString(city.countrySlug)} limit 1`);
    lines.push(')');
    lines.push('insert into cities (');
    lines.push('  country_id, slug, name_az, name_en, name_ru, region, admin_region,');
    lines.push('  lat, lng, population, source, source_id, source_url, license, attribution_text, last_synced_at');
    lines.push(')');
    lines.push('select');
    lines.push(`  country_ref_${safeRef}.id, ${sqlString(city.slug)}, ${sqlString(city.name_az)}, ${sqlString(city.name_en)}, ${sqlString(city.name_ru)},`);
    lines.push(`  ${sqlString(city.region)}, ${sqlString(city.admin_region)},`);
    lines.push(`  ${sqlNumber(city.lat)}, ${sqlNumber(city.lng)}, ${sqlNumber(city.population)},`);
    lines.push(`  ${sqlString(city.source)}, ${sqlString(city.source_id)}, ${sqlString(city.source_url)},`);
    lines.push(`  ${sqlString(city.license)}, ${sqlString(city.attribution_text)}, now()`);
    lines.push(`from country_ref_${safeRef}`);
    lines.push('on conflict (country_id, slug) do update set');
    lines.push('  name_az = excluded.name_az,');
    lines.push('  name_en = excluded.name_en,');
    lines.push('  name_ru = excluded.name_ru,');
    lines.push('  region = excluded.region,');
    lines.push('  admin_region = excluded.admin_region,');
    lines.push('  lat = excluded.lat,');
    lines.push('  lng = excluded.lng,');
    lines.push('  population = excluded.population,');
    lines.push('  source = excluded.source,');
    lines.push('  source_id = excluded.source_id,');
    lines.push('  source_url = excluded.source_url,');
    lines.push('  license = excluded.license,');
    lines.push('  attribution_text = excluded.attribution_text,');
    lines.push('  last_synced_at = now()');
    lines.push(';');
    lines.push('');
  }

  lines.push('insert into external_import_logs (source, entity_type, status, imported_count, skipped_count, metadata, started_at, finished_at)');
  lines.push(`select 'geonames', 'city', 'success', count(*), 0, ${sqlJson({ generated_at: now, mode: 'geonames_seed' })}, now(), now()`);
  lines.push('from cities where source = \'geonames\';');
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

    // Supabase JS client doesn't support partial unique indexes in onConflict.
    // Use insert with ignoreDuplicates for places, then query existing + insert missing sources.
    let insertedPlaces = [];
    let insertedCount = 0;
    let skippedCount = 0;

    // Batch insert in groups of 20 to avoid payload limits
    const batchSize = 20;
    for (let i = 0; i < placePayloads.length; i += batchSize) {
      const batch = placePayloads.slice(i, i + batchSize);
      const { data: batchData, error: batchError } = await supabase
        .from('places')
        .insert(batch)
        .select('id, source, source_place_id, source_url, license, attribution_text, raw_data');

      if (batchError) {
        // If duplicate, try one by one
        if (batchError.code === '23505') {
          for (const place of batch) {
            const { data: singleData, error: singleError } = await supabase
              .from('places')
              .insert(place)
              .select('id, source, source_place_id, source_url, license, attribution_text, raw_data');
            if (singleError) {
              if (singleError.code === '23505') {
                skippedCount++;
              } else {
                throw singleError;
              }
            } else if (singleData) {
              insertedPlaces.push(singleData[0]);
              insertedCount++;
            }
          }
        } else {
          throw batchError;
        }
      } else if (batchData) {
        insertedPlaces.push(...batchData);
        insertedCount += batchData.length;
      }
    }

    const sourcePayloads = (insertedPlaces || []).map((place) => ({
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
        .insert(sourcePayloads);

      if (sourcesError && sourcesError.code !== '23505') {
        throw sourcesError;
      }
    }

    await finishImportLog(supabase, logId, 'success', insertedCount, skippedCount, null);

    return {
      cityId: upsertedCity.id,
      importedPlaces: insertedCount,
    };
  } catch (error) {
    await finishImportLog(supabase, logId, 'failed', 0, places.length, error.message);
    throw error;
  }
}

async function runGeoNamesSeed(args) {
  const username = args.geonamesUsername || process.env.GEONAMES_USERNAME;
  if (!username) {
    throw new Error('GEONAMES_USERNAME is required. Set it in .env.local or pass --geonames-username.');
  }

  const supabase = createPublicSupabaseClient();
  const { data: countries, error: countriesError } = await supabase
    .from('countries')
    .select('id, slug, cca2')
    .order('slug');

  if (countriesError) throw countriesError;

  console.log(`Found ${countries.length} countries in database.`);

  const allCityRows = [];
  const skipped = [];

  for (const country of countries) {
    const code = deriveCountryCode(country.slug, country.cca2);
    if (!code) {
      console.log(`  Skipping ${country.slug}: no cca2 code available.`);
      skipped.push({ slug: country.slug, reason: 'no cca2' });
      continue;
    }

    console.log(`Fetching cities for ${country.slug} (${code})...`);

    let geoCities;
    try {
      geoCities = await fetchGeoNamesCities(code, args.citiesPerCountry, username);
      await delay(200);
    } catch (error) {
      console.log(`  Error fetching ${country.slug}: ${error.message}. Skipping.`);
      skipped.push({ slug: country.slug, reason: error.message });
      continue;
    }

    for (const geoCity of geoCities) {
      const cityRow = mapGeoNamesToCityRow(geoCity, country.id);
      if (cityRow) {
        cityRow.countrySlug = country.slug;
        cityRow.countryCode = code;
        allCityRows.push(cityRow);
      }
    }
  }

  console.log(`\nTotal: ${allCityRows.length} cities from ${countries.length - skipped.length} countries.`);
  if (skipped.length > 0) {
    console.log(`Skipped ${skipped.length} countries: ${skipped.map((s) => s.slug).join(', ')}`);
  }

  return { cities: allCityRows, skipped };
}

async function enrichPresets(args) {
  const username = args.geonamesUsername || process.env.GEONAMES_USERNAME;
  if (!username) {
    throw new Error('GEONAMES_USERNAME is required. Set it in .env.local or pass --geonames-username.');
  }

  const enrichedPresets = [];

  for (const [key, preset] of Object.entries(CITY_PRESETS)) {
    const code = deriveCountryCode(preset.countrySlug, null);
    if (!code) {
      console.log(`Skipping ${key}: no country code.`);
      continue;
    }

    console.log(`Enriching ${preset.name} (${code})...`);

    let geoCities;
    try {
      geoCities = await fetchGeoNamesCities(code, 10, username);
      await delay(200);
    } catch (error) {
      console.log(`  Error: ${error.message}. Skipping.`);
      continue;
    }

    const match = geoCities.find(
      (g) => g.name === preset.wikiTitle || g.name === preset.name || g.toponymName === preset.name
    );

    if (!match) {
      console.log(`  No GeoNames match for ${preset.name}.`);
      continue;
    }

    let detail = match;
    try {
      detail = await fetchGeoNamesCityDetail(match.geonameId, username);
      await delay(200);
    } catch (error) {
      console.log(`  Detail fetch failed for ${preset.name}: ${error.message}. Using search data.`);
    }

    const nameRu = extractAlternateName(detail.alternateNames, 'ru');

    const enriched = {
      ...preset,
      population: typeof detail.population === 'number' ? detail.population : preset.population,
      region: detail.adminName1 || null,
      admin_region: detail.adminName2 || null,
      geonameId: detail.geonameId,
      nameRu: nameRu || preset.nameRu,
      countryCode: code,
      countrySlug: preset.countrySlug,
    };

    enrichedPresets.push(enriched);
    console.log(`  Enriched: pop=${enriched.population}, region=${enriched.region}`);
  }

  return enrichedPresets;
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

  if (args.mode === 'geonames') {
    const { cities, skipped } = await runGeoNamesSeed(args);

    if (args.out) {
      const outPath = path.resolve(process.cwd(), args.out);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, JSON.stringify(cities, null, 2), 'utf8');
      console.log(`Preview written to ${outPath}`);
    }

    if (args.sqlOut) {
      const sqlOutPath = path.resolve(process.cwd(), args.sqlOut);
      fs.mkdirSync(path.dirname(sqlOutPath), { recursive: true });
      fs.writeFileSync(sqlOutPath, buildGeoNamesSeedSql(cities), 'utf8');
      console.log(`SQL seed written to ${sqlOutPath}`);
    }

    if (args.apply) {
      const supabase = createSupabaseClient();
      const logId = await createImportLog(supabase, 'geonames', 'city', {
        mode: 'geonames_seed',
        cities_per_country: args.citiesPerCountry,
      });

      try {
        const { data, error } = await supabase
          .from('cities')
          .upsert(
            cities.map((c) => ({
              country_id: c.country_id,
              slug: c.slug,
              name_az: c.name_az,
              name_en: c.name_en,
              name_ru: c.name_ru,
              region: c.region,
              admin_region: c.admin_region,
              lat: c.lat,
              lng: c.lng,
              population: c.population,
              source: c.source,
              source_id: c.source_id,
              source_url: c.source_url,
              license: c.license,
              attribution_text: c.attribution_text,
              last_synced_at: c.last_synced_at,
            })),
            { onConflict: 'country_id,slug' }
          );

        if (error) throw error;

        const imported = data ? data.length : cities.length;
        await finishImportLog(supabase, logId, 'success', imported, skipped.length, null);
        console.log(`Imported ${imported} cities to Supabase.`);
      } catch (error) {
        await finishImportLog(supabase, logId, 'failed', 0, cities.length, error.message);
        throw error;
      }
    } else {
      console.log(`\nMode: dry-run. Top cities:`);
      for (const city of cities.slice(0, 20)) {
        console.log(`- [${city.countrySlug}] ${city.name_az} (pop: ${city.population})`);
      }
    }

    return;
  }

  if (args.enrichPresets) {
    const enriched = await enrichPresets(args);

    if (args.out) {
      const outPath = path.resolve(process.cwd(), args.out);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, JSON.stringify(enriched, null, 2), 'utf8');
      console.log(`Enriched presets written to ${outPath}`);
    }

    if (args.sqlOut) {
      const sqlOutPath = path.resolve(process.cwd(), args.sqlOut);
      fs.mkdirSync(path.dirname(sqlOutPath), { recursive: true });
      const cityRows = enriched
        .map((p) => {
          const row = mapGeoNamesToCityRow(
            {
              name: p.name,
              lat: p.lat,
              lng: p.lng,
              population: p.population,
              geonameId: p.geonameId,
              adminName1: p.region,
              adminName2: p.admin_region,
              alternateNames: null,
            },
            null
          );
          if (row) {
            row.countrySlug = p.countrySlug;
            row.countryCode = p.countryCode;
          }
          return row;
        })
        .filter(Boolean);
      fs.writeFileSync(sqlOutPath, buildGeoNamesSeedSql(cityRows), 'utf8');
      console.log(`SQL written to ${sqlOutPath}`);
    }

    console.log(`\nEnriched ${enriched.length} presets.`);
    for (const p of enriched) {
      console.log(`- ${p.name}: pop=${p.population}, region=${p.region}, geonameId=${p.geonameId}`);
    }

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
  )).filter(p => p.slug && p.slug.trim() !== '').slice(0, args.limit);

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
