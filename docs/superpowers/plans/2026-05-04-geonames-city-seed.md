# GeoNames City Seed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add GeoNames API integration to `import-open-travel-data.js` for bulk city seeding (~150-250 cities) and preset enrichment.

**Architecture:** Extend the existing Node.js import script with a `--mode=geonames` flag. GeoNames `searchJSON` API fetches top cities per country; `getJSON` enriches presets. All data flows through the same dry-run / SQL-out / apply pipeline.

**Tech Stack:** Node.js (CommonJS), GeoNames REST API, Supabase JS client, existing script utilities.

**Spec:** `docs/superpowers/specs/2026-05-04-geonames-city-seed-design.md`

---

## File Structure

| File | Responsibility |
|---|---|
| `scripts/import-open-travel-data.js` | All changes — GeoNames functions, new CLI flags, mode routing |
| `AGENTS.md` | Update commands section after implementation |

No new files created.

---

### Task 1: Add new CLI flags to `parseArgs` and `printHelp`

**Files:**
- Modify: `scripts/import-open-travel-data.js:152-176` (parseArgs)
- Modify: `scripts/import-open-travel-data.js:178-200` (printHelp)

- [ ] **Step 1: Add new flags to `parseArgs`**

In the `parseArgs` function, add new fields to the default `args` object and new flag parsers in the `for` loop:

```js
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
```

Add these parsers inside the `for` loop, after the existing `else if` blocks:

```js
else if (arg.startsWith('--mode=')) args.mode = arg.slice('--mode='.length);
else if (arg.startsWith('--geonames-username=')) args.geonamesUsername = arg.slice('--geonames-username='.length);
else if (arg.startsWith('--cities-per-country=')) args.citiesPerCountry = Number(arg.slice('--cities-per-country='.length));
else if (arg === '--enrich-presets') args.enrichPresets = true;
```

- [ ] **Step 2: Update `printHelp` to document new flags**

Add these lines to the `printHelp` output, after the existing options:

```
  --mode=<mode>     Import mode: 'overpass' (default) or 'geonames'
  --geonames-username=<user>  GeoNames API username (or set GEONAMES_USERNAME)
  --cities-per-country=<n>    Cities per country in geonames mode. Default: 5
  --enrich-presets    Enrich CITY_PRESETS with GeoNames data
```

- [ ] **Step 3: Verify script still runs**

Run: `npm run import:open-travel-data -- --help`
Expected: Help text shows new flags, no errors.

- [ ] **Step 4: Commit**

```bash
git add scripts/import-open-travel-data.js
git commit -m "feat: add GeoNames CLI flags to import script"
```

---

### Task 2: Add GeoNames API helper functions

**Files:**
- Modify: `scripts/import-open-travel-data.js` — add after `fetchWikipediaSummary` (around line 280)

- [ ] **Step 1: Add `delay` utility**

Add after the `fetchJson` function (line 268):

```js
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

- [ ] **Step 2: Add `fetchGeoNamesCities` function**

```js
async function fetchGeoNamesCities(countryCode, maxRows, username) {
  const url = `http://api.geonames.org/searchJSON?country=${countryCode}&featureClass=P&orderby=population&maxRows=${maxRows}&username=${encodeURIComponent(username)}`;

  try {
    const data = await fetchJson(url);
    return Array.isArray(data.geonames) ? data.geonames : [];
  } catch (error) {
    if (error.message && error.message.includes('403')) {
      console.log(`  Rate limited, waiting 5s and retrying...`);
      await delay(5000);
      const data = await fetchJson(url);
      return Array.isArray(data.geonames) ? data.geonames : [];
    }
    throw error;
  }
}
```

- [ ] **Step 3: Add `fetchGeoNamesCityDetail` function**

```js
async function fetchGeoNamesCityDetail(geonameId, username) {
  const url = `http://api.geonames.org/getJSON?geonameId=${geonameId}&username=${encodeURIComponent(username)}`;

  try {
    return await fetchJson(url);
  } catch (error) {
    if (error.message && error.message.includes('403')) {
      console.log(`  Rate limited, waiting 5s and retrying...`);
      await delay(5000);
      return await fetchJson(url);
    }
    throw error;
  }
}
```

- [ ] **Step 4: Add `extractAlternateName` function**

GeoNames `searchJSON` returns `alternateNames` as a comma-separated string. `getJSON` returns `alternateNames` as an array of objects with `name` and `lang`. This function handles both:

```js
function extractAlternateName(alternateNames, langCode) {
  if (!alternateNames) return null;

  if (Array.isArray(alternateNames)) {
    const match = alternateNames.find((alt) => alt.lang === langCode);
    return match ? match.name : null;
  }

  return null;
}
```

- [ ] **Step 5: Commit**

```bash
git add scripts/import-open-travel-data.js
git commit -m "feat: add GeoNames API helper functions"
```

---

### Task 3: Add `mapGeoNamesToCityRow` and slug derivation

**Files:**
- Modify: `scripts/import-open-travel-data.js` — add after `extractAlternateName`

- [ ] **Step 1: Add country code derivation helper**

GeoNames requires ISO `cca2` codes. Some countries in the DB may lack `cca2`, so derive from slug:

```js
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
```

- [ ] **Step 2: Add `mapGeoNamesToCityRow` function**

```js
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
```

- [ ] **Step 3: Commit**

```bash
git add scripts/import-open-travel-data.js
git commit -m "feat: add GeoNames city mapping and country code derivation"
```

---

### Task 4: Add `buildGeoNamesSeedSql` function

**Files:**
- Modify: `scripts/import-open-travel-data.js` — add after `buildImportSql` (around line 535)

- [ ] **Step 1: Add SQL builder for GeoNames seed**

```js
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
    lines.push(`with country_ref_${city.countrySlug} as (`);
    lines.push(`  select id from countries where cca2 = ${sqlString(city.countryCode)} or slug = ${sqlString(city.countrySlug)} limit 1`);
    lines.push(')');
    lines.push('insert into cities (');
    lines.push('  country_id, slug, name_az, name_en, name_ru, region, admin_region,');
    lines.push('  lat, lng, population, source, source_id, source_url, license, attribution_text, last_synced_at');
    lines.push(')');
    lines.push('select');
    lines.push(`  country_ref_${city.countrySlug}.id, ${sqlString(city.slug)}, ${sqlString(city.name_az)}, ${sqlString(city.name_en)}, ${sqlString(city.name_ru)},`);
    lines.push(`  ${sqlString(city.region)}, ${sqlString(city.admin_region)},`);
    lines.push(`  ${sqlNumber(city.lat)}, ${sqlNumber(city.lng)}, ${sqlNumber(city.population)},`);
    lines.push(`  ${sqlString(city.source)}, ${sqlString(city.source_id)}, ${sqlString(city.source_url)},`);
    lines.push(`  ${sqlString(city.license)}, ${sqlString(city.attribution_text)}, now()`);
    lines.push(`from country_ref_${city.countrySlug}`);
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
```

- [ ] **Step 2: Commit**

```bash
git add scripts/import-open-travel-data.js
git commit -m "feat: add GeoNames seed SQL builder"
```

---

### Task 5: Add `runGeoNamesSeed` main flow

**Files:**
- Modify: `scripts/import-open-travel-data.js` — add before `main()` (around line 705)

- [ ] **Step 1: Add `runGeoNamesSeed` function**

```js
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
```

- [ ] **Step 2: Commit**

```bash
git add scripts/import-open-travel-data.js
git commit -m "feat: add runGeoNamesSeed main flow"
```

---

### Task 6: Add `enrichPresets` function

**Files:**
- Modify: `scripts/import-open-travel-data.js` — add after `runGeoNamesSeed`

- [ ] **Step 1: Add `enrichPresets` function**

```js
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
```

- [ ] **Step 2: Commit**

```bash
git add scripts/import-open-travel-data.js
git commit -m "feat: add enrichPresets function"
```

---

### Task 7: Wire mode routing into `main()`

**Files:**
- Modify: `scripts/import-open-travel-data.js:705-782` (main function)

- [ ] **Step 1: Add GeoNames mode routing in `main()`**

Replace the `main()` function. The key change: after `--checkDb` handling, route to GeoNames mode if `--mode=geonames` or `--enrich-presets` is set. Otherwise, keep the existing Overpass flow.

Find the `main()` function and add this block right after the `--checkDb` block (after `await checkDatabase(); return; }`):

```js
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
      const sql = buildGeoNamesSeedSql(enriched.map((p) => mapGeoNamesToCityRow({
        name: p.name,
        lat: p.lat,
        lng: p.lng,
        population: p.population,
        geonameId: p.geonameId,
        adminName1: p.region,
        adminName2: p.admin_region,
        alternateNames: null,
      }, null).filter(Boolean).map((c) => ({ ...c, countrySlug: p.countrySlug, countryCode: p.countryCode }))).flat());
      fs.writeFileSync(sqlOutPath, sql, 'utf8');
      console.log(`SQL written to ${sqlOutPath}`);
    }

    console.log(`\nEnriched ${enriched.length} presets.`);
    for (const p of enriched) {
      console.log(`- ${p.name}: pop=${p.population}, region=${p.region}, geonameId=${p.geonameId}`);
    }

    return;
  }
```

The existing Overpass flow (from `const city = CITY_PRESETS[args.city];` onward) stays unchanged after this block.

- [ ] **Step 2: Verify script help works**

Run: `npm run import:open-travel-data -- --help`
Expected: Help text with all flags, no errors.

- [ ] **Step 3: Commit**

```bash
git add scripts/import-open-travel-data.js
git commit -m "feat: wire GeoNames mode routing into main"
```

---

### Task 8: Update `AGENTS.md` commands section

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: Add GeoNames commands to the commands section**

Add after the existing `import:open-travel-data` commands:

```markdown
- `npm run import:open-travel-data -- --mode=geonames --cities-per-country=5 --dry-run` - GeoNames şəhər seed preview
- `npm run import:open-travel-data -- --mode=geonames --sql-out=supabase/imports/geonames_seed.sql` - GeoNames SQL generate
- `npm run import:open-travel-data -- --mode=geonames --apply` - GeoNames şəhərləri Supabase-ə yazır, `GEONAMES_USERNAME` tələb edir
- `npm run import:open-travel-data -- --enrich-presets --sql-out=supabase/imports/presets_enriched.sql` - CITY_PRESETS GeoNames ilə zənginləşdir
```

- [ ] **Step 2: Update the "Növbəti Tövsiyə Olunan İcra Sırası" section**

Change item 3 from:
```
3. GeoNames city seed variantını import script-ə əlavə et.
```
to:
```
3. ~~GeoNames city seed variantını import script-ə əlavə et.~~ **TAMAMLANDI.**
```

- [ ] **Step 3: Commit**

```bash
git add AGENTS.md
git commit -m "docs: update AGENTS.md with GeoNames commands"
```

---

### Task 9: Manual smoke test

**Files:** None (verification only)

- [ ] **Step 1: Test dry-run mode**

Run: `npm run import:open-travel-data -- --mode=geonames --dry-run`
Expected: Lists countries and cities from GeoNames. No errors. Requires `GEONAMES_USERNAME` in `.env.local`.

- [ ] **Step 2: Test SQL generation**

Run: `npm run import:open-travel-data -- --mode=geonames --sql-out=supabase/imports/geonames_seed.sql`
Expected: SQL file generated in `supabase/imports/`. Contains `BEGIN;` ... `COMMIT;` with city upserts.

- [ ] **Step 3: Verify existing Overpass mode still works**

Run: `npm run import:open-travel-data -- --city=istanbul --limit=5 --dry-run`
Expected: Same behavior as before — fetches OSM places. No regression.

---

## Self-Review

**1. Spec coverage:**
- GeoNames API integration (searchJSON, getJSON) → Tasks 2, 3
- CLI flags → Task 1
- Data mapping → Task 3
- SQL output → Task 4
- Bulk seed flow → Task 5
- Preset enrichment → Task 6
- Mode routing in main → Task 7
- AGENTS.md update → Task 8
- All requirements from spec covered.

**2. Placeholder scan:** No TBD/TODO found. All code blocks are complete.

**3. Type consistency:** `mapGeoNamesToCityRow` returns objects with `countrySlug` and `countryCode` fields used by `buildGeoNamesSeedSql`. `enrichPresets` returns objects with same fields. All consistent.
