#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const REPORT_PATH = path.join(__dirname, '..', 'data', 'visa-official-links-audit.json');

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

function isBroadSource(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes('wikipedia.org') ||
    lower.endsWith('.gov') ||
    lower.endsWith('.gov/') ||
    lower.endsWith('.mfa.gov') ||
    lower.endsWith('.mfa.gov/')
  );
}

async function main() {
  loadEnvFile(path.join(__dirname, '..', '.env.local'));
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('visa_info')
    .select(`
      id, official_visa_url, official_visa_url_verified_at, official_url, evisa_url, appointment_url,
      countries!inner(slug, name_az, name_en, flag_emoji)
    `)
    .order('countries(name_az)');

  if (error) throw error;

  const rows = data || [];
  const missing = rows.filter((row) => !row.official_visa_url);
  const exact = rows.filter((row) => row.official_visa_url);
  const broadFallback = rows.filter((row) => !row.official_visa_url && isBroadSource(row.official_url));
  const hasAnyOfficialLink = rows.filter((row) => row.official_visa_url || row.official_url || row.evisa_url || row.appointment_url);

  const report = {
    generated_at: new Date().toISOString(),
    totals: {
      visa_rows: rows.length,
      official_visa_url: exact.length,
      missing_official_visa_url: missing.length,
      any_official_link: hasAnyOfficialLink.length,
      broad_fallback_without_exact: broadFallback.length,
    },
    priority_missing: missing.slice(0, 50).map((row) => ({
      slug: row.countries.slug,
      name_az: row.countries.name_az,
      name_en: row.countries.name_en,
      official_url: row.official_url,
      evisa_url: row.evisa_url,
      appointment_url: row.appointment_url,
    })),
    broad_fallback_sample: broadFallback.slice(0, 50).map((row) => ({
      slug: row.countries.slug,
      name_az: row.countries.name_az,
      official_url: row.official_url,
    })),
  };

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);

  console.log(`Visa rows: ${report.totals.visa_rows}`);
  console.log(`official_visa_url: ${report.totals.official_visa_url}`);
  console.log(`missing official_visa_url: ${report.totals.missing_official_visa_url}`);
  console.log(`Report: ${REPORT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
