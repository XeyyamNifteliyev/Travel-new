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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const WIKIDATA_SPARQL = 'https://query.wikidata.org/sparql';
const COMMONS_THUMB = 'https://en.wikipedia.org/wiki/Special:FilePath';
const RATE_DELAY = 1500;

const OSM_PROPERTIES = {
  node: 'P10689',
  way: 'P11693',
  relation: 'P11693',
};

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { limit: 20, dryRun: true };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) opts.limit = parseInt(args[i + 1], 10);
    if (args[i] === '--apply') opts.dryRun = false;
    if (args[i] === '--dry-run') opts.dryRun = true;
  }
  return opts;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function commonsThumbnailUrl(filename, width = 800) {
  const encoded = encodeURIComponent(filename);
  return `${COMMONS_THUMB}/${encoded}?width=${width}`;
}

function escapeSparql(str) {
  return str.replace(/"/g, '\\"').replace(/\\/g, '\\\\');
}

async function fetchWikidataByOsmId(osmType, osmId) {
  const property = OSM_PROPERTIES[osmType];
  if (!property) return null;

  const sparql = `
    SELECT ?item ?image WHERE {
      ?item wdt:${property} "${osmId}" .
      OPTIONAL { ?item wdt:P18 ?image . }
    }
    LIMIT 1
  `;

  const url = `${WIKIDATA_SPARQL}?query=${encodeURIComponent(sparql)}&format=json`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'TravelAZ/1.0 place-image-enrichment' },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const bindings = data.results?.bindings || [];
  if (bindings.length === 0 || !bindings[0].image) return null;

  const imageUri = bindings[0].image.value;
  return decodeURIComponent(imageUri.split('/').pop());
}

async function fetchWikidataByName(placeName, cityName) {
  const safeName = escapeSparql(placeName);
  const cityClause = cityName ? `?item wdt:P131+ ?city . ?city rdfs:label "${escapeSparql(cityName)}"@en .` : '';

  const sparql = `
    SELECT ?item ?image WHERE {
      ?item rdfs:label "${safeName}"@en .
      ${cityClause}
      OPTIONAL { ?item wdt:P18 ?image . }
    }
    LIMIT 1
  `;

  const url = `${WIKIDATA_SPARQL}?query=${encodeURIComponent(sparql)}&format=json`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'TravelAZ/1.0 place-image-enrichment' },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const bindings = data.results?.bindings || [];
  if (bindings.length === 0 || !bindings[0].image) return null;

  const imageUri = bindings[0].image.value;
  return decodeURIComponent(imageUri.split('/').pop());
}

async function main() {
  const opts = parseArgs();
  console.log(`\nPlace Image Enrichment - ${opts.dryRun ? 'DRY-RUN' : 'APPLY'} mode`);
  console.log(`  Limit: ${opts.limit}\n`);

  const { data: places } = await supabase
    .from('places')
    .select('id, name, source_place_id, cover_photo_url, cities(name_en)')
    .in('category', ['restaurant', 'cafe'])
    .is('cover_photo_url', null)
    .not('source_place_id', 'is', null)
    .limit(opts.limit);

  if (!places || places.length === 0) {
    console.log('No places without images found.');
    return;
  }

  console.log(`Found ${places.length} places without images.\n`);

  let enriched = 0;
  let skipped = 0;

  for (const place of places) {
    const sourceId = place.source_place_id;
    const parts = sourceId.split('/');
    const osmType = parts[0];
    const osmId = parts[1];

    console.log(`  [${place.name}] (OSM: ${sourceId})...`);

    let imageFilename = null;

    try {
      imageFilename = await fetchWikidataByOsmId(osmType, osmId);
    } catch (e) {
      console.log(`    SPARQL error (OSM): ${e.message}`);
    }

    if (!imageFilename && place.name) {
      await sleep(RATE_DELAY);
      const cityName = place.cities?.name_en || null;
      try {
        imageFilename = await fetchWikidataByName(place.name, cityName);
      } catch (e) {
        console.log(`    SPARQL error (name): ${e.message}`);
      }
    }

    if (!imageFilename) {
      console.log(`    No image found.`);
      skipped++;
      await sleep(RATE_DELAY);
      continue;
    }

    const imageUrl = commonsThumbnailUrl(imageFilename);
    console.log(`    Found: ${imageFilename}`);

    if (!opts.dryRun) {
      const { error } = await supabase
        .from('places')
        .update({ cover_photo_url: imageUrl, updated_at: new Date().toISOString() })
        .eq('id', place.id);
      if (error) {
        console.log(`    ERROR: ${error.message}`);
      } else {
        console.log(`    Updated.`);
      }
    }

    enriched++;
    await sleep(RATE_DELAY);
  }

  console.log(`\n=== Summary ===`);
  console.log(`  Mode: ${opts.dryRun ? 'DRY-RUN' : 'APPLY'}`);
  console.log(`  Processed: ${places.length}`);
  console.log(`  Enriched: ${enriched}`);
  console.log(`  Skipped: ${skipped}`);
}

main().catch(console.error);
