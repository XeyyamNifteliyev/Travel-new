# Category Tabs on City Detail Page

**Date**: 2026-05-05
**Status**: Approved
**Scope**: City detail page — category filter tabs for places

## Problem

The city detail page (`/az/cities/[slug]`) shows all places in a flat 3-column grid with no way to filter by type. A user visiting Istanbul sees attractions, restaurants, and hotels mixed together with no classification. The homepage promises "Attractions", "Restaurants", "Hotels" as discovery paths but the city page delivers an undifferentiated list.

## Decision

Add client-side category tab filtering to the city detail page. 6 tabs group the existing `PlaceCategory` values. No new routes or server queries — all filtering happens in the browser using data already fetched from Supabase.

## Category Mapping

| Tab Key      | Icon              | PlaceCategory Values                              | i18n Key             |
|--------------|--------------------|---------------------------------------------------|----------------------|
| `all`        | `LayoutGrid`      | (no filter)                                       | `places.all`         |
| `attractions`| `Compass`         | attraction, museum, landmark, viewpoint, historic | `places.attractions` |
| `restaurants`| `UtensilsCrossed` | restaurant, cafe                                   | `places.restaurants` |
| `hotels`     | `BedDouble`       | hotel                                             | `places.hotels`      |
| `nightlife`  | `Music`           | nightlife                                         | `places.nightlife`   |
| `shopping`   | `ShoppingBag`     | shopping                                          | `places.shopping`    |

Categories `transport` and `other` are not shown as tabs. They appear only under the "All" tab.

## Architecture

### New Component

`src/components/place/category-tabs.tsx` — client component receiving `places` prop, managing `activeCategory` state, and rendering:

1. Horizontal tab bar with icons and translated labels
2. Filtered place grid (reuses existing place card layout)
3. Empty state message when a category has zero places

### Modified Files

- `src/app/[locale]/cities/[slug]/page.tsx` — extract the places grid section into a client-rendered area that wraps `CategoryTabs`, passing the fetched places as a prop
- `src/messages/az.json`, `en.json`, `ru.json` — add i18n keys under `places` namespace: `all`, `attractions`, `restaurants`, `hotels`, `nightlife`, `shopping`, `emptyCategory`

### Unchanged

- No new routes
- No Supabase query changes (same query, same 24-place limit)
- No changes to the place detail page or review system
- No changes to the import pipeline

## Data Flow

```
Supabase query (server component)
  → places[] passed as prop
  → CategoryTabs (client component)
     activeCategory state (default: "all")
     filteredPlaces = places.filter(p => categoryGroups[activeCategory].includes(p.category))
     → Place grid rendered with filteredPlaces
```

### Category Group Map (in code)

```typescript
const CATEGORY_GROUPS: Record<string, PlaceCategory[]> = {
  all: [],                                                    // no filter
  attractions: ['attraction', 'museum', 'landmark', 'viewpoint', 'historic'],
  restaurants: ['restaurant', 'cafe'],
  hotels: ['hotel'],
  nightlife: ['nightlife'],
  shopping: ['shopping'],
};
```

When `activeCategory === 'all'`, all places render. Otherwise, filter by membership in the group array.

## UI Design

- Tab bar: horizontal, scrollable on mobile, with active tab highlighted (bottom border or background)
- Each tab: icon (lucide-react) + translated label
- Place cards: existing card layout with a colored category badge in the corner
- Empty state: centered text "Bu kateqoriyada hələ yer yoxdur" with an icon
- Default tab: "All" (showing everything, current behavior preserved)

## i18n Keys

Under `places` namespace in all three locale files:

```json
{
  "all": "Hamısı" / "All" / "Все",
  "attractions": "Görməli yerlər" / "Attractions" / "Достопримечательности",
  "restaurants": "Restoranlar" / "Restaurants" / "Рестораны",
  "hotels": "Otellər" / "Hotels" / "Отели",
  "nightlife": "Gecə həyatı" / "Nightlife" / "Ночная жизнь",
  "shopping": "Alış-veriş" / "Shopping" / "Шоппинг",
  "emptyCategory": "Bu kateqoriyada hələ yer yoxdur" / "No places in this category yet" / "В этой категории пока нет мест"
}
```

## Out of Scope

- Dedicated `/attractions` or `/restaurants` routes (future work)
- Server-side category filtering (unnecessary at current data scale)
- Infinite scroll or pagination changes
- Place card redesign
- Importing additional city data (focus on UI first, Istanbul for testing)