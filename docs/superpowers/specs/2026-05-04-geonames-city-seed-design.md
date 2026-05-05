# GeoNames City Seed — Design Spec

**Date:** 2026-05-04
**Status:** Approved
**Scope:** Add GeoNames API integration to existing `import-open-travel-data.js` script for city data enrichment and bulk seeding.

## Background

TravelAZ `cities` table currently has 1 row (Istanbul). The existing `import-open-travel-data.js` script imports places via Overpass/Wikipedia per city, but requires a city to already exist. GeoNames provides free city data (population, coordinates, region, alternate names) that can seed ~150-250 cities across ~50 countries in the database.

## Requirements

1. Enrich existing 10 `CITY_PRESETS` with GeoNames data (region, admin_region, population, alternate names)
2. Bulk seed top 3-5 cities per country from GeoNames (~150-250 total)
3. Use free GeoNames API (username-based auth, 1000 req/month)
4. Integrate into existing `import-open-travel-data.js` script via `--mode` flag
5. Support dry-run, SQL output, and direct apply modes

## Approach

Single-pass GeoNames mode added to the existing import script. No new scripts or files.

## API Integration

### Endpoints

- `http://api.geonames.org/searchJSON` — city search by country, sorted by population
- `http://api.geonames.org/getJSON` — city detail by geonameId (for preset enrichment)

### Authentication

- Env variable: `GEONAMES_USERNAME` in `.env.local`
- CLI override: `--geonames-username=XXX`
- Free tier: 1000 requests/month (sufficient for ~50 countries x 5 cities = ~50-100 requests)

### Rate Limiting

- 200ms delay between requests
- On HTTP 403 (rate limit): wait 5 seconds, retry once

### Data Mapping

| GeoNames field | cities column |
|---|---|
| `geonameId` | `source_id` |
| `name` | `name_az`, `name_en` |
| `lat` / `lng` | `lat` / `lng` |
| `population` | `population` |
| `adminName1` | `region` |
| `adminName2` | `admin_region` |
| `countryCode` | → `countries` lookup via `cca2` |
| `alternateNames` | parse for `name_ru` |

### Source Attribution

All GeoNames-sourced cities:
- `source = 'geonames'`
- `source_id = geonameId`
- `license = 'CC BY'`
- `attribution_text = 'GeoNames'`

## Script Architecture

### New CLI Flags

| Flag | Description | Default |
|---|---|---|
| `--mode=geonames` | GeoNames city seed mode | overpass (existing) |
| `--geonames-username=XXX` | Override GeoNames username | from env |
| `--cities-per-country=N` | Max cities per country | 5 |
| `--enrich-presets` | Enrich CITY_PRESETS with GeoNames data | false |

### New Functions (in `import-open-travel-data.js`)

1. **`fetchGeoNamesCities(countryCode, maxRows, username)`** — searchJSON call, returns city list
2. **`fetchGeoNamesCityDetail(geonameId, username)`** — getJSON call, returns enriched data
3. **`mapGeoNamesToCityRow(geoCity, countryId)`** — GeoNames response → cities upsert payload
4. **`extractAlternateName(alternateNames, langCode)`** — parse alternateNames for language-specific name
5. **`runGeoNamesSeed(args)`** — main flow: read countries → call GeoNames → upsert
6. **`enrichPresets(username)`** — fetch GeoNames detail for each CITY_PRESET, enrich with region/admin_region

### Flow: `--mode=geonames --apply`

```
1. Read countries from Supabase: {id, slug, cca2}
2. For each country:
   a. Call GeoNames searchJSON (top N cities by population)
   b. 200ms delay between requests
   c. Check existing cities table for conflicts (country_id + slug)
   d. Map to cities upsert payload
3. Upsert all new cities
4. Log to external_import_logs
```

### Flow: `--enrich-presets`

```
1. For each CITY_PRESETS entry:
   a. Search GeoNames by name + country code
   b. Fetch detail (region, admin_region, population, alternate names)
   c. Update preset data
2. Generate SQL output or apply directly
```

## SQL Output

New `buildGeoNamesSeedSql(cities)` function generates:

```sql
begin;
with country_ref as (select id from countries where cca2 = 'TR' ...)
insert into cities (country_id, slug, name_az, ...)
  select ... from country_ref
  on conflict (country_id, slug) do update set ...;
insert into external_import_logs (...)
  select 'geonames', 'city', 'success', count(*), ...;
commit;
```

## Idempotency

- `cities` table has `unique (country_id, slug)` → `ON CONFLICT DO UPDATE`
- `external_import_logs` duplicate check via `metadata->>'geonames_batch'`
- Re-running produces same result

## Error Handling

| Error | Action |
|---|---|
| API timeout | Retry once after 3s. Skip country on failure, log as `partial` |
| Country missing `cca2` | Skip country, console warning |
| HTTP 403 (rate limit) | Wait 5s, retry once |
| Any error | Log to `external_import_logs.error`, continue with next country |

## Countries Table Dependency

GeoNames searches by ISO country code (`cca2`). If `countries.cca2` is null, attempt to derive from slug (e.g., `turkey` → `TR`). If derivation fails, skip that country.

## Usage Examples

```bash
# Dry-run preview
npm run import:open-travel-data -- --mode=geonames --cities-per-country=5 --dry-run

# Generate SQL file
npm run import:open-travel-data -- --mode=geonames --sql-out=supabase/imports/geonames_seed.sql

# Apply directly to Supabase
npm run import:open-travel-data -- --mode=geonames --apply

# Enrich existing presets
npm run import:open-travel-data -- --enrich-presets --sql-out=supabase/imports/presets_enriched.sql

# Check DB status
npm run import:open-travel-data -- --check-db
```

## Files Changed

| File | Change |
|---|---|
| `scripts/import-open-travel-data.js` | Add GeoNames mode, enrich-presets, new functions |
| `.env.local` | Add `GEONAMES_USERNAME` (manual) |
| `AGENTS.md` | Update commands section, mark GeoNames seed as done |
