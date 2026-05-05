# Category Tabs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add client-side category tab filtering to the city detail page so users can browse places by type (Attractions, Restaurants, Hotels, Nightlife, Shopping).

**Architecture:** A new `CategoryTabs` client component receives the full `places` array as a prop, manages `activeCategory` state, and filters places by category group mapping. The existing city detail server component passes places to this client component. No new routes or server queries.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.9, Tailwind CSS v4, lucide-react, next-intl

---

### Task 1: Add i18n keys for category tabs

**Files:**
- Modify: `src/messages/az.json`
- Modify: `src/messages/en.json`
- Modify: `src/messages/ru.json`

- [ ] **Step 1: Add category tab keys to `az.json`**

Add these keys inside the `"places"` object (after `"reviewRejected"`):

```json
    "all": "Hamısı",
    "attractions": "Görməli yerlər",
    "restaurants": "Restoranlar",
    "hotels": "Otellər",
    "nightlife": "Gecə həyatı",
    "shopping": "Alış-veriş",
    "emptyCategory": "Bu kateqoriyada hələ yer yoxdur"
```

- [ ] **Step 2: Add category tab keys to `en.json`**

Same location inside `"places"`:

```json
    "all": "All",
    "attractions": "Attractions",
    "restaurants": "Restaurants",
    "hotels": "Hotels",
    "nightlife": "Nightlife",
    "shopping": "Shopping",
    "emptyCategory": "No places in this category yet"
```

- [ ] **Step 3: Add category tab keys to `ru.json`**

Same location inside `"places"`:

```json
    "all": "Все",
    "attractions": "Достопримечательности",
    "restaurants": "Рестораны",
    "hotels": "Отели",
    "nightlife": "Ночная жизнь",
    "shopping": "Шоппинг",
    "emptyCategory": "В этой категории пока нет мест"
```

- [ ] **Step 4: Verify i18n compiles**

Run: `npx tsc --noEmit`
Expected: 0 errors

---

### Task 2: Create CategoryTabs component

**Files:**
- Create: `src/components/place/category-tabs.tsx`

- [ ] **Step 1: Create `category-tabs.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Star, LayoutGrid, Compass, UtensilsCrossed, BedDouble, Music, ShoppingBag } from 'lucide-react';
import type { PlaceSummary } from '@/types/place';
import type { PlaceCategory } from '@/types/place';
import type { Locale } from '@/i18n/routing';

const CATEGORY_TABS = [
  { key: 'all', icon: LayoutGrid },
  { key: 'attractions', icon: Compass },
  { key: 'restaurants', icon: UtensilsCrossed },
  { key: 'hotels', icon: BedDouble },
  { key: 'nightlife', icon: Music },
  { key: 'shopping', icon: ShoppingBag },
] as const;

export type CategoryTabKey = typeof CATEGORY_TABS[number]['key'];

const CATEGORY_GROUPS: Record<string, PlaceCategory[]> = {
  all: [],
  attractions: ['attraction', 'museum', 'landmark', 'viewpoint', 'historic', 'park', 'beach'],
  restaurants: ['restaurant', 'cafe'],
  hotels: ['hotel'],
  nightlife: ['nightlife'],
  shopping: ['shopping'],
};

const CATEGORY_COLORS: Record<string, string> = {
  all: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  attraction: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  museum: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  landmark: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  viewpoint: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  historic: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  park: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  beach: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  restaurant: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  cafe: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  hotel: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  nightlife: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300',
  shopping: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  transport: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

interface CategoryTabsProps {
  places: PlaceSummary[];
  locale: string;
}

export function CategoryTabs({ places, locale }: CategoryTabsProps) {
  const t = useTranslations('places');
  const [activeCategory, setActiveCategory] = useState<CategoryTabKey>('all');

  const filteredPlaces = activeCategory === 'all'
    ? places
    : places.filter((p) => CATEGORY_GROUPS[activeCategory]?.includes(p.category));

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {CATEGORY_TABS.map(({ key, icon: Icon }) => {
          const isActive = activeCategory === key;
          const count = key === 'all'
            ? places.length
            : places.filter((p) => CATEGORY_GROUPS[key]?.includes(p.category)).length;
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-bg-surface border border-border text-txt-sec hover:border-primary/40 hover:text-primary'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t(key)}
              <span className={`text-xs ${isActive ? 'text-white/70' : 'text-txt-sec/60'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {filteredPlaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredPlaces.map((place) => (
            <Link
              key={place.id}
              href={`/${locale}/places/${place.id}`}
              className="rounded-2xl border border-border bg-bg-surface p-4 hover:border-primary/30 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <span className={`text-[10px] px-2 py-1 rounded-full font-semibold capitalize ${CATEGORY_COLORS[place.category] || CATEGORY_COLORS.other}`}>
                  {place.category}
                </span>
                {place.ratingSummary > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-300">
                    <Star className="w-3 h-3 fill-current" />
                    {place.ratingSummary.toFixed(1)}
                  </span>
                )}
              </div>
              <h3 className="font-semibold mt-3 line-clamp-2">{place.name}</h3>
              {place.address && <p className="text-xs text-txt-sec mt-2 line-clamp-2">{place.address}</p>}
              <p className="text-xs text-txt-sec mt-4">{place.reviewCount} {t('reviews')}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-bg-surface p-8 text-center text-txt-sec">
          {t('emptyCategory')}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: 0 errors

---

### Task 3: Wire CategoryTabs into city detail page

**Files:**
- Modify: `src/app/[locale]/cities/[slug]/page.tsx`

- [ ] **Step 1: Import CategoryTabs and update the page**

Replace the entire `<section>` that renders the places grid (lines 108-140 of the current page.tsx) with the CategoryTabs component. The changes are:

1. Add import: `import { CategoryTabs } from '@/components/place/category-tabs';`
2. Remove the `ArrowLeft, ExternalLink, MapPin, Star, Users` imports — keep only `ArrowLeft, ExternalLink, MapPin, Users` (remove `Star` since it moves to CategoryTabs)
3. Replace the places grid section with `<CategoryTabs places={places} locale={locale} />`

The full updated file:

```tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft, ExternalLink, MapPin, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { mapCityToSummary, mapPlaceToSummary } from '@/lib/open-travel-data';
import { WeatherWidget } from '@/components/weather/weather-widget';
import { VisaCheckWidget } from '@/components/visa/visa-check-widget';
import { CategoryTabs } from '@/components/place/category-tabs';
import type { Metadata } from 'next';
import type { Locale } from '@/i18n/routing';
import type { CityWithCountryRow, PlaceWithRelationsRow } from '@/types/place';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('cities')
    .select('name_az, description_az, description_en')
    .eq('slug', slug)
    .maybeSingle();

  return {
    title: data?.name_az ? `${data.name_az} - TravelAZ` : 'City - TravelAZ',
    description: data?.description_az || data?.description_en || '',
  };
}

export default async function CityDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const currentLocale = locale as Locale;
  const t = await getTranslations({ locale, namespace: 'places' });
  const supabase = await createClient();

  const { data: cityRow } = await supabase
    .from('cities')
    .select('*, countries(id, slug, name_az, name_en, name_ru, flag_emoji)')
    .eq('slug', slug)
    .maybeSingle();

  if (!cityRow) notFound();

  const city = mapCityToSummary(cityRow as CityWithCountryRow, currentLocale);

  const { data: placeRows } = await supabase
    .from('places')
    .select('*, cities(id, slug, name_az, name_en, name_ru), countries(id, slug, name_az, name_en, name_ru, flag_emoji)')
    .eq('city_id', city.id)
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('popular_rank', { ascending: true })
    .order('rating_summary', { ascending: false })
    .limit(24);

  const places = ((placeRows || []) as PlaceWithRelationsRow[]).map((place) => mapPlaceToSummary(place, currentLocale));

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <Link href={`/${locale}/countries/${city.country?.slug || ''}`} className="inline-flex items-center gap-2 text-txt-sec hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        {city.country?.name || t('back')}
      </Link>

      <section className="rounded-3xl border border-border bg-bg-surface p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary mb-3">
              <MapPin className="w-4 h-4" />
              {city.country?.name || t('city')}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">{city.name}</h1>
            {city.description && (
              <p className="text-txt-sec mt-4 max-w-3xl leading-7">{city.description}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 min-w-64">
            {city.population ? (
              <div className="rounded-2xl border border-border bg-bg p-4">
                <Users className="w-5 h-5 text-primary mb-2" />
                <div className="text-xl font-bold">{city.population.toLocaleString(locale === 'ru' ? 'ru' : locale === 'en' ? 'en' : 'az')}</div>
                <div className="text-xs text-txt-sec">{t('population')}</div>
              </div>
            ) : null}
            <div className="rounded-2xl border border-border bg-bg p-4">
              <Star className="w-5 h-5 text-primary mb-2" />
              <div className="text-xl font-bold">{places.length}</div>
              <div className="text-xs text-txt-sec">{t('places')}</div>
            </div>
          </div>
        </div>
        {city.sourceUrl && (
          <a href={city.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs text-txt-sec hover:text-primary mt-5">
            {t('source')}: {city.source || 'open data'} <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {city.lat && city.lng && (
          <WeatherWidget lat={city.lat} lon={city.lng} />
        )}
        <VisaCheckWidget compact />
      </div>

      <section>
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold">{t('placesInCity')}</h2>
            <p className="text-sm text-txt-sec mt-1">{t('placesInCitySub')}</p>
          </div>
        </div>

        <CategoryTabs places={places} locale={locale} />
      </section>
    </main>
  );
}
```

Wait — I need to keep `Star` import since it's used in the stats card. Let me verify.

Actually, looking at the original code, `Star` is used on line 88-89 for the place count stats card. So we need to keep it in the import. Let me correct: **keep `Star` in the import**. The import line should be:

```tsx
import { ArrowLeft, ExternalLink, MapPin, Star, Users } from 'lucide-react';
```

And the `Star` import stays. Only the places grid section (lines 116-133) is removed and replaced by `<CategoryTabs>`.

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: 0 errors, 0 warnings

---

### Task 4: Visual verification

- [ ] **Step 1: Start dev server**

Run: `npm run dev`

- [ ] **Step 2: Verify category tabs on Istanbul city page**

Open: `http://localhost:3000/az/cities/istanbul`

Expected behavior:
- 6 tabs visible: Hamısı, Görməli yerlər, Restoranlar, Otellər, Gecə həyatı, Alış-veriş
- Default tab is "Hamısı" showing all places
- Clicking each tab filters the place grid
- Tab shows count badge
- Empty category shows "Bu kateqoriyada hələ yer yoxdur"
- Each place card has a colored category badge

- [ ] **Step 3: Verify locale switching**

Check `/en/cities/istanbul` and `/ru/cities/istanbul` for translated tab labels.

- [ ] **Step 4: Commit**

```bash
git add src/components/place/category-tabs.tsx src/app/[locale]/cities/[slug]/page.tsx src/messages/az.json src/messages/en.json src/messages/ru.json
git commit -m "feat: add category tab filtering to city detail page"
```