#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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

function parseArgs() {
  const opts = { report: path.join('data', 'place-content-audit.json') };
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const value = arg.includes('=') ? arg.split('=').slice(1).join('=') : args[i + 1];
    if (arg === '--report' || arg.startsWith('--report=')) {
      opts.report = value;
      if (!arg.includes('=')) i++;
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

async function fetchAllActivePlaces(supabase) {
  const pageSize = 1000;
  const rows = [];
  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from('places')
      .select('id, status, category, description_az, description_en, description_ru, cover_photo_url, cover_photo_id, source_url, website, address, opening_hours, cities(slug, name_az, name_en)')
      .eq('status', 'active')
      .order('popular_rank', { ascending: true })
      .range(from, to);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < pageSize) break;
  }
  return rows;
}

function percent(part, total) {
  return total ? Math.round((part / total) * 100) : 0;
}

function ensureCityRow(map, place) {
  const slug = place.cities?.slug || 'unknown';
  if (!map.has(slug)) {
    map.set(slug, {
      slug,
      name: place.cities?.name_az || place.cities?.name_en || slug,
      total: 0,
      descriptionAz: 0,
      descriptionAny: 0,
      image: 0,
      sourceUrl: 0,
      website: 0,
      address: 0,
      openingHours: 0,
      attractions: 0,
      attractionDescriptionAz: 0,
      food: 0,
      foodDescriptionAz: 0,
    });
  }
  return map.get(slug);
}

async function main() {
  loadEnvFile(path.join(__dirname, '..', '.env.local'));
  const opts = parseArgs();
  const supabase = createSupabaseClient();
  const places = await fetchAllActivePlaces(supabase);
  const cityMap = new Map();

  for (const place of places) {
    const row = ensureCityRow(cityMap, place);
    const hasAz = Boolean(place.description_az);
    const hasAnyDescription = Boolean(place.description_az || place.description_en || place.description_ru);
    const hasImage = Boolean(place.cover_photo_url || place.cover_photo_id);
    const isAttraction = ['attraction', 'museum', 'landmark', 'historic', 'viewpoint'].includes(place.category);
    const isFood = ['restaurant', 'cafe'].includes(place.category);

    row.total += 1;
    if (hasAz) row.descriptionAz += 1;
    if (hasAnyDescription) row.descriptionAny += 1;
    if (hasImage) row.image += 1;
    if (place.source_url) row.sourceUrl += 1;
    if (place.website) row.website += 1;
    if (place.address) row.address += 1;
    if (place.opening_hours) row.openingHours += 1;
    if (isAttraction) {
      row.attractions += 1;
      if (hasAz) row.attractionDescriptionAz += 1;
    }
    if (isFood) {
      row.food += 1;
      if (hasAz) row.foodDescriptionAz += 1;
    }
  }

  const rows = Array.from(cityMap.values()).map((row) => ({
    ...row,
    missingAz: row.total - row.descriptionAz,
    descriptionAzPercent: percent(row.descriptionAz, row.total),
    imagePercent: percent(row.image, row.total),
  })).sort((a, b) => b.missingAz - a.missingAz || b.total - a.total);

  const priority = rows.filter((row) => row.missingAz > 0).slice(0, 20);
  const totals = rows.reduce((acc, row) => {
    acc.cities += 1;
    acc.places += row.total;
    acc.descriptionAz += row.descriptionAz;
    acc.descriptionAny += row.descriptionAny;
    acc.image += row.image;
    acc.missingAz += row.missingAz;
    return acc;
  }, { cities: 0, places: 0, descriptionAz: 0, descriptionAny: 0, image: 0, missingAz: 0 });

  const report = {
    generatedAt: new Date().toISOString(),
    totals,
    priority,
    cities: rows,
  };

  fs.mkdirSync(path.dirname(opts.report), { recursive: true });
  fs.writeFileSync(opts.report, JSON.stringify(report, null, 2));

  console.log('Place content audit');
  console.log(`  Cities: ${totals.cities}`);
  console.log(`  Places: ${totals.places}`);
  console.log(`  AZ descriptions: ${totals.descriptionAz}/${totals.places}`);
  console.log(`  Any descriptions: ${totals.descriptionAny}/${totals.places}`);
  console.log(`  Images: ${totals.image}/${totals.places}`);
  console.log(`  Missing AZ descriptions: ${totals.missingAz}`);
  console.log(`  Report: ${opts.report}`);
  console.log('\nTop priority cities:');
  for (const row of priority.slice(0, 12)) {
    console.log(`  ${row.slug}: missingAz=${row.missingAz}, total=${row.total}, images=${row.image}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
