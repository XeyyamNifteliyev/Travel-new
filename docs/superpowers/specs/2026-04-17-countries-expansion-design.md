# Countries Module Expansion Design

**Date:** 2026-04-17
**Status:** Approved
**Scope:** Backend-first, then frontend

## Overview

Expand the countries module from 10 hardcoded countries to 50+ dynamic countries loaded from Supabase. Add rich data: cover images (Unsplash CDN), YouTube lite embeds, cost breakdowns, climate info, popular places, and safety levels. Professional UI with glass morphism cards, skeleton loading, and full dark/light theme support.

## Approach

**Chosen: Extend existing DB (Approach 1)**

- `ALTER TABLE countries` to add new columns to the existing 185-country table (shared with visa system)
- UPSERT seed data: UPDATE existing countries by slug, INSERT new ones
- Preserve existing `name_az`, `name_en`, `name_ru` columns (not replaced by single `name`)
- No data loss, no foreign key conflicts

## Phase 1: Backend

### Migration: `supabase/migrations/012_countries_expand.sql`

Add columns to existing `countries` table:

| Column | Type | Purpose |
|--------|------|---------|
| `continent` | TEXT | 'europe','asia','americas','africa','oceania' |
| `capital` | TEXT | Capital city |
| `currency` | TEXT | Code: 'EUR','USD','TRY' |
| `currency_name` | TEXT | Full name: 'Euro','Dollar' |
| `language` | TEXT | Primary language |
| `population` | BIGINT | Population |
| `timezone` | TEXT | UTC offset |
| `calling_code` | TEXT | +XX |
| `best_months` | TEXT[] | ARRAY['may','jun','jul','aug'] |
| `climate_type` | TEXT | 'moderate','tropical','desert','cold' |
| `avg_flight_azn` | INTEGER | Avg flight cost from Baku |
| `avg_hotel_azn` | INTEGER | Avg nightly hotel |
| `avg_daily_azn` | INTEGER | Avg daily spend |
| `cover_photo_id` | TEXT | Unsplash photo ID |
| `cover_photo_alt` | TEXT | Alt text |
| `gallery_ids` | TEXT[] | ARRAY of Unsplash IDs (4-6 photos) |
| `youtube_ids` | TEXT[] | ARRAY of YouTube video IDs (3-5) |
| `youtube_titles` | TEXT[] | ARRAY of video titles |
| `top_places` | JSONB | [{name,desc,photo_id,lat,lng,category}] |
| `short_desc` | TEXT | 1-2 sentence description (az) |
| `short_desc_en` | TEXT | English description |
| `short_desc_ru` | TEXT | Russian description |
| `safety_level` | TEXT DEFAULT 'safe' | 'safe','caution','warning' |
| `visa_required` | BOOLEAN DEFAULT true | Visa requirement for AZ passport |
| `popular_rank` | INTEGER DEFAULT 99 | Sort order (1 = most popular) |
| `is_featured` | BOOLEAN DEFAULT false | Show on homepage |

New table: `country_highlights`

| Column | Type | Purpose |
|--------|------|---------|
| `id` | UUID PK | Auto-generated |
| `country_id` | UUID FK -> countries | CASCADE delete |
| `slug` | TEXT | 'eyfel-qulesi' |
| `name` | TEXT | Highlight name (az) |
| `name_en` | TEXT | English name |
| `name_ru` | TEXT | Russian name |
| `description` | TEXT | Description |
| `photo_id` | TEXT | Unsplash photo ID |
| `lat` | DECIMAL(9,6) | Latitude |
| `lng` | DECIMAL(9,6) | Longitude |
| `category` | TEXT | 'landmark','nature','food','museum','shopping' |
| `rank` | INTEGER | Display order |

Indexes:
- `idx_highlights_country` on `country_highlights(country_id)`
- `idx_countries_rank` on `countries(popular_rank)`
- `idx_countries_continent` on `countries(continent)`
- `idx_countries_featured` on `countries(is_featured)` WHERE `is_featured = true`

### Seed: `supabase/migrations/013_countries_seed_50.sql`

- UPDATE existing countries by slug (turkey, uae, france, germany)
- INSERT ~30 new countries with full data
- All country names use existing `name_az/en/ru` columns
- Unsplash IDs tested before use; broken ones replaced with valid alternatives

Countries to include (from olke.md):
Turkey, UAE, France, Germany, Italy, Spain, Japan, Thailand, Georgia, Greece, Netherlands, Morocco, Maldives, Bali, Portugal, Canada, Australia, Brazil, India, Peru, Singapore, Austria, Switzerland, New Zealand, Norway, Iceland, Mexico, Czech Republic, Cuba, Scotland, China, South Korea

### Helper: `src/lib/unsplash.ts`

```typescript
export function getUnsplashUrl(
  photoId: string,
  options: { w?: number; h?: number; q?: number; fit?: string } = {}
): string
```

Returns `https://images.unsplash.com/photo-{photoId}?w=800&q=75&fit=crop&auto=format`

### Config: `next.config.ts`

Add to `images.remotePatterns`:
- `images.unsplash.com` (pathname: `/photo-**`)
- `i.ytimg.com` (YouTube thumbnails)
- Add `formats: ['image/avif', 'image/webp']`
- Add `minimumCacheTTL: 86400`

## Phase 2: Frontend

### `countries/page.tsx` — Server Component

- Remove all hardcoded data
- Supabase query: SELECT 18 columns, ORDER BY popular_rank, LIMIT 60
- ISR: `revalidate = 86400`
- Pass data to new `CountryGrid` client component

### `countries/country-grid-client.tsx` — New Client Component

Features:
- Page header: title + subtitle + result count
- Search input (icon-decorated, rounded)
- Continent filter pills (all, europe, asia, americas, africa, oceania)
- Client-side filtering (no extra Supabase queries)
- Grid layout: `grid-cols-1 sm:2 lg:3 xl:4`
- No results state
- All labels use `useTranslations('countries')`

### `country-card.tsx` — Redesigned

Professional card with:
- Cover image (Next.js Image, lazy load, WebP, blur placeholder)
- Gradient overlay on image (bottom: black -> transparent)
- Country name overlaid on image (white text + shadow)
- Viza badge (top-left): green "Vizasiz" / orange "Viza lazim"
- Safety badge (top-right): green/yellow/red
- Short description (locale-aware, line-clamp-2)
- Cost info row: flight icon + hotel icon
- Best months: small pill badges (max 4)
- Hover: image scale-105, shadow-lg transition
- Dark mode: backdrop-blur glass effect on border
- Fallback: globe emoji when no image

### `countries/[slug]/page.tsx` — Server Component

- Remove all hardcoded data
- Supabase: `SELECT * FROM countries WHERE slug = X`
- Supabase: `SELECT * FROM country_highlights WHERE country_id = X ORDER BY rank`
- Supabase: `SELECT id, title, cover_image, created_at, views, profiles(display_name) FROM blogs WHERE content ILIKE '%country_name%' LIMIT 6`
- `generateMetadata()` for SEO
- ISR: `revalidate = 86400`
- `notFound()` if no country

### `countries/[slug]/country-detail-client.tsx` — New Client Component

Sections in order:

1. **Hero** — Full-width cover image (h-72 md:h-96), rounded-3xl, gradient overlay, country name + capital overlaid
2. **Quick Stats** — 4-column grid: currency, timezone, calling code, visa status (icon + label + value)
3. **Cost Panel** — Blue gradient background, 3-column: flight, hotel, daily (bold numbers)
4. **Best Months** — 12 month pills, good months in green, others in gray
5. **Highlights** — 3-column grid, image cards with name + description
6. **YouTube Videos** — Lite embed (thumbnail + play button, iframe only on click)
7. **Visa CTA** — Orange gradient card with link to `/visa/{slug}`
8. **Related Blogs** — 3-column grid, minimalist cards

### `components/ui/youtube-lite.tsx` — New Component

- Shows YouTube thumbnail (from `i.ytimg.com`)
- Play button overlay (red circle + triangle SVG)
- Title overlay at bottom
- On click: loads real iframe with autoplay
- Aspect ratio: 16:9
- No JS loaded until click (~500KB savings per video)

### `types/country.ts` — Updated

Add new `ExpandedCountry` interface with all new columns. Keep existing `Country` interface for backward compatibility with other parts of the app (visa system).

### i18n Keys — Added to az.json, en.json, ru.json

Namespace: `countries`

Keys: title, subtitle, search, filter_all, filter_europe, filter_asia, filter_americas, filter_africa, filter_oceania, visa_required, visa_free, avg_flight, avg_hotel, avg_daily, best_visit, top_places, videos, user_blogs, visa_info_title, visa_info_sub, visa_info_btn, no_results, currency, timezone, dial_code, safety_safe, safety_caution, safety_warning, back_to_countries, not_found

## File Changes Summary

### New Files
- `supabase/migrations/012_countries_expand.sql`
- `supabase/migrations/013_countries_seed_50.sql`
- `src/lib/unsplash.ts`
- `src/app/[locale]/countries/country-grid-client.tsx`
- `src/app/[locale]/countries/[slug]/country-detail-client.tsx`
- `src/components/ui/youtube-lite.tsx`

### Modified Files
- `next.config.ts` — Add Unsplash + ytimg image domains
- `src/app/[locale]/countries/page.tsx` — Hardcoded -> Supabase
- `src/app/[locale]/countries/[slug]/page.tsx` — Hardcoded -> Supabase
- `src/components/country/country-card.tsx` — Professional redesign
- `src/types/country.ts` — Add ExpandedCountry interface
- `src/messages/az.json` — Add countries namespace keys
- `src/messages/en.json` — Add countries namespace keys
- `src/messages/ru.json` — Add countries namespace keys

## Performance Guarantees

- Next.js Image: auto WebP/AVIF, lazy load, blur placeholder, sizes optimization
- ISR: pages cached for 24 hours, single Supabase query per cache miss
- YouTube: zero JS until user clicks (~500KB savings per video)
- Select optimization: list page loads 18 columns, detail page loads all
- Client-side filtering: no extra queries for search/continent filter
- minimumCacheTTL: 86400 for image CDN cache

## Constraints

- Must not break existing visa system (185 countries remain intact)
- All new columns are nullable (existing countries work without them)
- Unsplash IDs must be validated before seed
- Follow existing project conventions: `useTranslations`, `createClient()`, `'use client'` directives, Tailwind theme variables
