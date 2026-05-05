#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

try {
  const envPath = path.join(__dirname, '..', '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const idx = line.indexOf('=');
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  });
} catch (e) {
  // .env.local not found, rely on existing env
}

const UNSPLASH_API = 'https://api.unsplash.com/search/photos';
const RATE_LIMIT_DELAY = 1100;

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    type: 'all',
    limit: 20,
    dryRun: true,
    apply: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--type' && args[i + 1]) { opts.type = args[++i]; }
    else if (args[i] === '--limit' && args[i + 1]) { opts.limit = parseInt(args[++i], 10); }
    else if (args[i] === '--apply') { opts.apply = true; opts.dryRun = false; }
    else if (args[i] === '--dry-run') { opts.dryRun = true; }
    else if (args[i] === '--help' || args[i] === '-h') { opts.help = true; }
  }

  return opts;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function searchUnsplash(query, accessKey) {
  const params = new URLSearchParams({
    query,
    per_page: '1',
    orientation: 'landscape',
    client_id: accessKey,
  });

  try {
    const res = await fetch(`${UNSPLASH_API}?${params}`, {
      headers: { 'Accept-Version': 'v1' },
    });

    if (!res.ok) {
      console.error(`  [unsplash] HTTP ${res.status}: ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    const results = data.results || [];
    if (results.length === 0) return null;

    return {
      id: results[0].id,
      alt_description: results[0].alt_description,
      urls: results[0].urls,
    };
  } catch (err) {
    console.error('  [unsplash] fetch error:', err.message);
    return null;
  }
}

async function enrichTable(supabase, table, accessKey, opts) {
  console.log(`\n=== Enriching ${table} (limit: ${opts.limit}) ===\n`);

  const nameCol = table === 'countries' ? 'name_en' : 'name_en';
  const selectCols = table === 'countries'
    ? 'id, slug, name_en, cover_photo_id'
    : 'id, slug, name_en, cover_photo_id';

  const { data: rows, error } = await supabase
    .from(table)
    .select(selectCols)
    .is('cover_photo_id', null)
    .limit(opts.limit);

  if (error) {
    console.error(`  Error fetching ${table}:`, error.message);
    return { enriched: 0, errors: 1 };
  }

  if (!rows || rows.length === 0) {
    console.log(`  No ${table} without cover_photo_id found.`);
    return { enriched: 0, errors: 0 };
  }

  console.log(`  Found ${rows.length} ${table} without cover_photo_id\n`);

  let enriched = 0;
  let errors = 0;

  for (const row of rows) {
    const query = `${row[nameCol]} travel landscape`;
    process.stdout.write(`  [${row.slug}] "${query}" → `);

    const result = await searchUnsplash(query, accessKey);

    if (!result) {
      console.log('❌ no result');
      errors++;
      await sleep(RATE_LIMIT_DELAY);
      continue;
    }

    console.log(`✅ ${result.id} (${result.alt_description || 'no description'})`);

    if (!opts.dryRun) {
      const { error: updateError } = await supabase
        .from(table)
        .update({ cover_photo_id: result.id })
        .eq('id', row.id);

      if (updateError) {
        console.error(`    ⚠️  DB update failed: ${updateError.message}`);
        errors++;
      } else {
        enriched++;
      }
    } else {
      console.log(`    (dry-run: would set cover_photo_id = "${result.id}")`);
      enriched++;
    }

    await sleep(RATE_LIMIT_DELAY);
  }

  return { enriched, errors };
}

async function main() {
  const opts = parseArgs();

  if (opts.help) {
    console.log(`
Usage: node scripts/enrich-images.js [options]

Options:
  --type <type>     "countries", "cities", or "all" (default: "all")
  --limit <n>       Max rows to process per table (default: 20)
  --apply           Actually write to database (default: dry-run)
  --dry-run         Preview only, no DB writes (default)
  --help            Show this help

Environment variables required:
  UNSPLASH_ACCESS_KEY   Unsplash API access key
  NEXT_PUBLIC_SUPABASE_URL   Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY  Supabase service role key (--apply mode)
`);
    process.exit(0);
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.error('Error: UNSPLASH_ACCESS_KEY environment variable is required.');
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = opts.dryRun
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (--apply) are required.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const mode = opts.dryRun ? 'DRY-RUN' : 'APPLY';
  console.log(`\n🖼️  Unsplash Image Enrichment — ${mode} mode\n`);
  console.log(`  Type: ${opts.type}`);
  console.log(`  Limit: ${opts.limit} per table`);
  console.log(`  Unsplash API key: ${accessKey.substring(0, 8)}...\n`);

  let totalEnriched = 0;
  let totalErrors = 0;

  if (opts.type === 'countries' || opts.type === 'all') {
    const result = await enrichTable(supabase, 'countries', accessKey, opts);
    totalEnriched += result.enriched;
    totalErrors += result.errors;
  }

  if (opts.type === 'cities' || opts.type === 'all') {
    const result = await enrichTable(supabase, 'cities', accessKey, opts);
    totalEnriched += result.enriched;
    totalErrors += result.errors;
  }

  console.log(`\n=== Summary ===`);
  console.log(`  Mode: ${mode}`);
  console.log(`  Enriched: ${totalEnriched}`);
  console.log(`  Errors: ${totalErrors}\n`);

  if (opts.dryRun && totalEnriched > 0) {
    console.log('💡 Run with --apply to actually update the database.\n');
  }
}

main().catch(console.error);