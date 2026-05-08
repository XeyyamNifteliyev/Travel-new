#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
}

loadEnvFile(path.join(__dirname, '..', '.env.local'));

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;
const PEXELS_KEY = process.env.PEXELS_API_KEY;
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const RATE_DELAY = 1500;

const CUISINE_QUERIES = {
  italian: 'italian food pasta restaurant',
  pizza: 'pizza restaurant margherita',
  japanese: 'japanese restaurant sushi',
  sushi: 'sushi restaurant plate',
  thai: 'thai food restaurant',
  chinese: 'chinese restaurant food',
  indian: 'indian restaurant curry',
  mexican: 'mexican restaurant tacos',
  french: 'french restaurant bistro',
  greek: 'greek restaurant food',
  turkish: 'turkish restaurant kebab',
  korean: 'korean restaurant bbq',
  mediterranean: 'mediterranean restaurant food',
  seafood: 'seafood restaurant fish',
  barbecue: 'bbq restaurant grill meat',
  regional: 'traditional restaurant food',
  international: 'international restaurant fine dining',
  steak: 'steakhouse restaurant grill',
  burger: 'burger restaurant',
  cafe: 'coffee shop cafe interior',
  coffee: 'coffee shop latte art',
  bakery: 'bakery pastry bread',
  dessert: 'dessert cake pastry',
  fine_dining: 'fine dining restaurant elegant',
  georgian: 'georgian restaurant khachapuri',
  russian: 'russian restaurant borscht',
  vietnamese: 'vietnamese restaurant pho',
  lebanese: 'lebanese restaurant mezze',
  spanish: 'spanish restaurant tapas',
  german: 'german restaurant bratwurst',
  hungarian: 'hungarian restaurant goulash',
  austrian: 'austrian restaurant vienna',
  czech: 'czech restaurant prague',
  polish: 'polish restaurant pierogi',
  romanian: 'romanian restaurant traditional',
  serbian: 'serbian restaurant traditional',
  bulgarian: 'bulgarian restaurant traditional',
  croatian: 'croatian restaurant traditional',
  scandinavian: 'scandinavian restaurant food',
  filipino: 'filipino restaurant food',
  malaysian: 'malaysian restaurant food',
  indonesian: 'indonesian restaurant food',
  moroccan: 'moroccan restaurant food',
  ethiopian: 'ethiopian restaurant injera',
  brazilian: 'brazilian restaurant food',
  argentinian: 'argentinian restaurant steak',
  peru: 'peruvian restaurant food',
  caribbean: 'caribbean restaurant food',
  irish: 'irish pub restaurant',
  british: 'british pub restaurant',
  dutch: 'dutch restaurant food',
  belgian: 'belgian restaurant food',
  portuguese: 'portuguese restaurant food',
  swiss: 'swiss restaurant food',
};

const DEFAULT_QUERIES = {
  restaurant: 'restaurant food dish plate',
  cafe: 'coffee shop cafe interior',
};

const usedUrls = new Set();
let unsplashLimited = false;
let pexelsLimited = false;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function getCuisineQuery(subcategory, category) {
  if (subcategory) {
    const cuisines = subcategory.split(';').map(c => c.trim().toLowerCase());
    for (const c of cuisines) {
      if (CUISINE_QUERIES[c]) return CUISINE_QUERIES[c];
    }
  }
  return DEFAULT_QUERIES[category] || DEFAULT_QUERIES.restaurant;
}

function isMostlyNonLatin(str) {
  const latin = str.replace(/[^a-zA-Z]/g, '');
  const total = str.replace(/\s/g, '').length;
  return total > 0 && latin.length / total < 0.4;
}

async function searchPexels(query) {
  if (!PEXELS_KEY || pexelsLimited) {
    return null;
  }
  const params = new URLSearchParams({
    query,
    per_page: '15',
    orientation: 'landscape',
  });
  const res = await fetch(`https://api.pexels.com/v1/search?${params}`, {
    headers: { Authorization: PEXELS_KEY },
  });
  if (!res.ok) {
    if (res.status === 429) {
      console.log('    Pexels 429 rate limit, will retry later.');
      pexelsLimited = true;
    } else {
      console.log(`    Pexels error: ${res.status}`);
    }
    return null;
  }
  const data = await res.json();
  const photos = data.photos || [];
  for (const p of photos) {
    const url = p.src?.landscape || p.src?.large;
    if (url && !usedUrls.has(url)) {
      usedUrls.add(url);
      return url;
    }
  }
  return null;
}

async function searchUnsplash(query) {
  if (!UNSPLASH_KEY || unsplashLimited) return null;
  const params = new URLSearchParams({
    query,
    per_page: '30',
    orientation: 'landscape',
    client_id: UNSPLASH_KEY,
  });
  const res = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
    headers: { 'Accept-Version': 'v1' },
  });
  if (!res.ok) {
    if (res.status === 403) {
      console.log('    Unsplash 403 rate limit, switching to Pexels.');
      unsplashLimited = true;
    } else {
      console.log(`    Unsplash error: ${res.status}`);
    }
    return null;
  }
  const data = await res.json();
  const results = data.results || [];
  for (const r of results) {
    const url = r.urls?.regular;
    if (url && !usedUrls.has(url)) {
      usedUrls.add(url);
      return url;
    }
  }
  return null;
}

async function searchImage(query) {
  let url = await searchPexels(query);
  if (url) return url;
  url = await searchUnsplash(query);
  return url;
}

async function main() {
  const isDryRun = !process.argv.includes('--apply');
  let limit = 50;
  const limitIdx = process.argv.indexOf('--limit');
  if (limitIdx > -1 && process.argv[limitIdx + 1]) limit = parseInt(process.argv[limitIdx + 1], 10);

  console.log(`\nRestaurant Image Enrichment (Pexels + Unsplash) - ${isDryRun ? 'DRY-RUN' : 'APPLY'}`);
  console.log(`  Limit: ${limit}\n`);

  const { data: existingImg } = await supabase
    .from('places')
    .select('cover_photo_url')
    .in('category', ['restaurant', 'cafe'])
    .not('cover_photo_url', 'is', null);
  existingImg?.forEach(p => { if (p.cover_photo_url) usedUrls.add(p.cover_photo_url); });
  console.log(`  Already have images: ${usedUrls.size}`);

  const { data: places } = await supabase
    .from('places')
    .select('id, name, subcategory, category, cover_photo_url, cities(name_en, countries(name_en))')
    .in('category', ['restaurant', 'cafe'])
    .is('cover_photo_url', null)
    .eq('status', 'active')
    .limit(limit);

  if (!places || places.length === 0) {
    console.log('No places without images.');
    return;
  }

  console.log(`  Need images: ${places.length}\n`);

  let enriched = 0;
  let skipped = 0;

  for (const place of places) {
    const city = place.cities?.name_en || '';
    const country = place.cities?.countries?.name_en || '';
    const cuisineQuery = getCuisineQuery(place.subcategory, place.category);
    const nonLatin = isMostlyNonLatin(place.name);
    const firstName = nonLatin ? '' : (place.name.split(/[\s&\-\/]+/).filter(w => w.length > 1)[0] || '');
    const queries = [];

    if (city && firstName) queries.push(`${cuisineQuery} ${firstName} ${city}`);
    if (city) queries.push(`${cuisineQuery} ${city}`);
    if (country && firstName) queries.push(`${cuisineQuery} ${firstName} ${country}`);
    if (country) queries.push(`${cuisineQuery} ${country}`);
    if (firstName) queries.push(`${cuisineQuery} ${firstName}`);
    queries.push(cuisineQuery);

    console.log(`  [${place.name}] (${city}, ${country})`);

    let imageUrl = null;
    for (const q of queries) {
      if (pexelsLimited && unsplashLimited) break;
      imageUrl = await searchImage(q);
      if (imageUrl) break;
      if (pexelsLimited && unsplashLimited) break;
    }

    if (!imageUrl) {
      console.log('    No image found.');
      skipped++;
      await sleep(pexelsLimited && unsplashLimited ? 60000 : RATE_DELAY);
      if (pexelsLimited && unsplashLimited) {
        pexelsLimited = false;
        unsplashLimited = false;
      }
      continue;
    }

    console.log(`    Found: ${imageUrl.substring(0, 70)}...`);

    if (!isDryRun) {
      const { error } = await supabase
        .from('places')
        .update({ cover_photo_url: imageUrl, updated_at: new Date().toISOString() })
        .eq('id', place.id);
      if (error) console.log(`    ERROR: ${error.message}`);
    }

    enriched++;
    await sleep(RATE_DELAY);
  }

  console.log(`\n=== Summary ===`);
  console.log(`  Mode: ${isDryRun ? 'DRY-RUN' : 'APPLY'}`);
  console.log(`  Enriched: ${enriched}`);
  console.log(`  Skipped: ${skipped}`);
}

main().catch(console.error);