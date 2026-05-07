#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const REPORT_PATH = path.join(__dirname, '..', 'data', 'country-content-audit.json');

const REQUIRED_CARD_FIELDS = [
  'capital',
  'short_desc',
  'short_desc_en',
  'short_desc_ru',
  'avg_flight_azn',
  'avg_hotel_azn',
  'avg_daily_azn',
  'best_months',
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

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and a Supabase key are required.');
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function hasValue(value) {
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined && value !== '';
}

function getMissingFields(country) {
  return REQUIRED_CARD_FIELDS.filter((field) => !hasValue(country[field]));
}

async function main() {
  loadEnvFile(path.join(__dirname, '..', '.env.local'));
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('countries')
    .select('id, slug, name_az, name_en, continent, capital, short_desc, short_desc_en, short_desc_ru, avg_flight_azn, avg_hotel_azn, avg_daily_azn, best_months, cover_photo_id, popular_rank, is_featured')
    .order('is_featured', { ascending: false })
    .order('popular_rank', { ascending: true })
    .order('name_en', { ascending: true });

  if (error) throw error;

  const countries = data || [];
  const fieldCoverage = Object.fromEntries(
    REQUIRED_CARD_FIELDS.map((field) => [
      field,
      countries.filter((country) => hasValue(country[field])).length,
    ])
  );

  const needsAttention = countries
    .map((country) => ({
      slug: country.slug,
      name_en: country.name_en,
      continent: country.continent,
      popular_rank: country.popular_rank,
      is_featured: country.is_featured,
      missing_fields: getMissingFields(country),
    }))
    .filter((country) => country.missing_fields.length > 0);

  const complete = countries.filter((country) => getMissingFields(country).length === 0);

  const report = {
    generated_at: new Date().toISOString(),
    totals: {
      countries: countries.length,
      complete_card_content: complete.length,
      needs_attention: needsAttention.length,
      field_coverage: fieldCoverage,
    },
    priority_batch: needsAttention.slice(0, 30),
    missing_by_field: Object.fromEntries(
      REQUIRED_CARD_FIELDS.map((field) => [
        field,
        countries
          .filter((country) => !hasValue(country[field]))
          .slice(0, 50)
          .map((country) => country.slug),
      ])
    ),
    needs_attention: needsAttention,
  };

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);

  console.log('Country content audit');
  console.log(`  Countries: ${report.totals.countries}`);
  console.log(`  Complete card content: ${report.totals.complete_card_content}`);
  console.log(`  Needs attention: ${report.totals.needs_attention}`);
  for (const [field, count] of Object.entries(fieldCoverage)) {
    console.log(`  ${field}: ${count}/${report.totals.countries}`);
  }
  console.log(`  Report: ${REPORT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
