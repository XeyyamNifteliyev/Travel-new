#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const REPORT_PATH = path.join(__dirname, '..', 'data', 'country-image-audit.json');

const KNOWN_BAD_UNSPLASH_REFS = new Set([
  '1524231757913-4be64b2825c7',
  '1502602915149-bb4f5dc63d43',
  '1499856562261-6a300a60f98b',
  '1516483107680-cf12f4bb3a06',
  'https://images.unsplash.com/photo-1753133661886-7e8a93e2d64e',
]);

const NON_CITY_IMAGE_TERMS = [
  'animal',
  'wildlife',
  'donkey',
  'horse',
  'camel',
  'giraffe',
  'elephant',
  'lion',
  'zebra',
  'monkey',
  'bird',
  'cattle',
  'oxen',
  'goat',
  'sheep',
  'mountain',
  'beach',
  'sea',
  'ocean',
  'forest',
  'desert',
  'lake',
  'waterfall',
  'island',
  'valley',
  'snow',
  'surf',
  'rice',
  'field',
  'farm',
  'farmland',
  'landscape',
  'paddy',
  'pasture',
  'rural',
  'terrace',
  'village',
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

function normalizePhotoRef(photoRef) {
  if (!photoRef) return null;
  if (KNOWN_BAD_UNSPLASH_REFS.has(photoRef)) return null;
  if (photoRef.startsWith('https://upload.wikimedia.org/')) return photoRef.split('?')[0];
  if (photoRef.startsWith('https://images.unsplash.com/photo-')) return photoRef.split('?')[0];
  if (photoRef.startsWith('https://images.pexels.com/photos/')) return photoRef.split('?')[0];
  if (/^\d{8,}-[a-zA-Z0-9_-]+$/.test(photoRef)) return `https://images.unsplash.com/photo-${photoRef}`;
  return null;
}

function getNonCityImageTerm(country) {
  const text = [
    country.cover_photo_alt,
    country.cover_photo_id,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return NON_CITY_IMAGE_TERMS.find((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
  }) || null;
}

function getRiskReason(country, duplicates) {
  if (!country.cover_photo_id) return 'missing';
  if (KNOWN_BAD_UNSPLASH_REFS.has(country.cover_photo_id)) return 'known_bad_404';
  if (!normalizePhotoRef(country.cover_photo_id)) return 'invalid_or_short_unsplash_id';

  const normalized = normalizePhotoRef(country.cover_photo_id);
  if (normalized && duplicates.has(normalized)) return 'duplicate_cover_photo';
  const nonCityTerm = getNonCityImageTerm(country);
  if (nonCityTerm) return `animal_or_nature_risk:${nonCityTerm}`;
  if (
    country.is_featured &&
    !country.cover_photo_id.startsWith('https://images.unsplash.com/photo-') &&
    !country.cover_photo_id.startsWith('https://upload.wikimedia.org/') &&
    !country.cover_photo_id.startsWith('https://images.pexels.com/photos/')
  ) {
    return 'featured_not_trusted_full_url';
  }

  return null;
}

async function main() {
  loadEnvFile(path.join(__dirname, '..', '.env.local'));
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('countries')
    .select('id, slug, name_az, name_en, capital, continent, cover_photo_id, cover_photo_alt, popular_rank, is_featured')
    .order('popular_rank', { ascending: true });

  if (error) throw error;

  const countries = data || [];
  const byPhoto = new Map();

  for (const country of countries) {
    const normalized = normalizePhotoRef(country.cover_photo_id);
    if (!normalized) continue;
    if (!byPhoto.has(normalized)) byPhoto.set(normalized, []);
    byPhoto.get(normalized).push(country.slug);
  }

  const duplicateMap = new Map(
    [...byPhoto.entries()]
      .filter(([, slugs]) => slugs.length > 1)
      .map(([photoRef, slugs]) => [photoRef, slugs])
  );

  const nullCover = countries.filter((country) => !country.cover_photo_id);
  const invalid = countries.filter((country) => country.cover_photo_id && !normalizePhotoRef(country.cover_photo_id));
  const featuredRisk = countries.filter((country) => country.is_featured && getRiskReason(country, duplicateMap));
  const needsAttention = countries
    .map((country) => ({
      slug: country.slug,
      name_en: country.name_en,
      popular_rank: country.popular_rank,
      is_featured: country.is_featured,
      cover_photo_id: country.cover_photo_id,
      cover_photo_alt: country.cover_photo_alt,
      normalized_photo: normalizePhotoRef(country.cover_photo_id),
      reason: getRiskReason(country, duplicateMap),
    }))
    .filter((item) => item.reason);

  const report = {
    generated_at: new Date().toISOString(),
    totals: {
      countries: countries.length,
      with_cover_photo: countries.length - nullCover.length,
      missing_cover_photo: nullCover.length,
      invalid_or_short: invalid.length,
      duplicate_groups: duplicateMap.size,
      needs_attention: needsAttention.length,
    },
    duplicate_groups: [...duplicateMap.entries()].map(([photoRef, slugs]) => ({
      photo_ref: photoRef,
      slugs,
    })),
    featured_risk: featuredRisk.map((country) => ({
      slug: country.slug,
      name_en: country.name_en,
      cover_photo_id: country.cover_photo_id,
      cover_photo_alt: country.cover_photo_alt,
      reason: getRiskReason(country, duplicateMap),
    })),
    missing_sample: nullCover.slice(0, 40).map((country) => country.slug),
    invalid_sample: invalid.slice(0, 40).map((country) => ({
      slug: country.slug,
      cover_photo_id: country.cover_photo_id,
    })),
    needs_attention: needsAttention,
  };

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);

  console.log('Country image audit');
  console.log(`  Countries: ${report.totals.countries}`);
  console.log(`  With cover: ${report.totals.with_cover_photo}`);
  console.log(`  Missing cover: ${report.totals.missing_cover_photo}`);
  console.log(`  Invalid/short: ${report.totals.invalid_or_short}`);
  console.log(`  Duplicate groups: ${report.totals.duplicate_groups}`);
  console.log(`  Needs attention: ${report.totals.needs_attention}`);
  console.log(`  Report: ${REPORT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
