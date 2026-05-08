#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const REPORT_PATH = path.join(__dirname, '..', 'data', 'food-places-audit.json');

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

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL and a Supabase key are required.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function main() {
  loadEnvFile(path.join(__dirname, '..', '.env.local'));
  const supabase = createSupabaseClient();

  const { data: cities, error: cityError } = await supabase
    .from('cities')
    .select('id, slug, name_az, name_en, population, is_featured, popular_rank, countries(slug, name_en)')
    .order('is_featured', { ascending: false })
    .order('popular_rank', { ascending: true })
    .order('population', { ascending: false });
  if (cityError) throw cityError;

  const { data: foodPlaces, error: foodError } = await supabase
    .from('places')
    .select('id, category, city_id, cities(slug, name_en, countries(slug, name_en))')
    .in('category', ['restaurant', 'cafe'])
    .eq('status', 'active')
    .limit(10000);
  if (foodError) throw foodError;

  const counts = new Map();
  for (const city of cities || []) {
    counts.set(city.id, {
      city_id: city.id,
      city_slug: city.slug,
      city_name: city.name_en || city.name_az,
      country_slug: city.countries?.slug || null,
      is_featured: city.is_featured,
      popular_rank: city.popular_rank,
      population: city.population,
      restaurant: 0,
      cafe: 0,
      total: 0,
    });
  }

  for (const place of foodPlaces || []) {
    if (!place.city_id || !counts.has(place.city_id)) continue;
    const row = counts.get(place.city_id);
    row.total += 1;
    if (place.category === 'restaurant') row.restaurant += 1;
    if (place.category === 'cafe') row.cafe += 1;
  }

  const byCity = [...counts.values()].sort((a, b) => b.total - a.total || (a.popular_rank ?? 999) - (b.popular_rank ?? 999));
  const missing = byCity.filter((city) => city.total === 0);
  const lowCoverage = byCity.filter((city) => city.total > 0 && city.total < 10);
  const nextBatch = [...missing, ...lowCoverage]
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || (a.popular_rank ?? 999) - (b.popular_rank ?? 999) || (b.population ?? 0) - (a.population ?? 0))
    .slice(0, 20);

  const report = {
    generated_at: new Date().toISOString(),
    totals: {
      cities: cities?.length || 0,
      food_places: foodPlaces?.length || 0,
      cities_with_food: byCity.filter((city) => city.total > 0).length,
      cities_without_food: missing.length,
      cities_low_coverage: lowCoverage.length,
    },
    top_cities: byCity.slice(0, 30),
    next_batch: nextBatch,
    cities: byCity,
  };

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);

  console.log('Food places audit');
  console.log(`  Cities: ${report.totals.cities}`);
  console.log(`  Food places: ${report.totals.food_places}`);
  console.log(`  Cities with food: ${report.totals.cities_with_food}`);
  console.log(`  Cities without food: ${report.totals.cities_without_food}`);
  console.log(`  Low coverage cities (<10): ${report.totals.cities_low_coverage}`);
  console.log(`  Report: ${REPORT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
