# TravelAZ

Çoxdilli Azərbaycan travel platforması — uçuş, otel, tur, viza, AI planlaşdırıcı, blog və community modulları.

**URL:** [travelaz.vercel.app](https://travelaz.vercel.app) (demo)  
**Stack:** Next.js 15, Supabase, TypeScript, Tailwind v4, next-intl

---

## Texnologiyalar

| Stack | Versiya |
|---|---|
| Next.js | 15 App Router |
| React | 19 |
| TypeScript | 5.9 |
| Tailwind CSS | v4 |
| Supabase | Auth + Database + Realtime |
| next-intl | i18n (az/en/ru) |
| Lucide React | İkonlar |

## Dillər

- Azərbaycan (default)
- English
- Русский

## Setup

```bash
# Klonla
git clone https://github.com/XeyyamNifteliyev/Travel-new.git
cd Travel-new

# Bağımlılıqları yüklə
npm install

# Environment dəyişənləri
cp .env.example .env.local
# .env.local faylını doldur (aşağıya bax)

# Development server
npm run dev        # → http://localhost:3000
```

## Environment Dəyişənləri

```env
# Supabase (məcburi)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# AI Provider (birini seç)
AI_PROVIDER=gemini
GEMINI_API_KEY=

# Unsplash (şəkillər üçün)
UNSPLASH_ACCESS_KEY=
```

Tam siyahı üçün `.env.example` faylına baxın.

## Scripts

| Əmr | Nə edir |
|---|---|
| `npm run dev` | Development server |
| `npx tsc --noEmit` | TypeScript yoxlaması |
| `npm run lint` | ESLint yoxlaması |
| `npm run build` | Production build |
| `npm run enrich:images` | Unsplash şəkil enrichment (dry-run) |

## Viza Məlumatları

Layihədə 4 qatlı viza məlumat sistemi var:

1. **Wikipedia seed** ~185 ölkə (`011_wikipedia_visa_seed.sql`)
2. **Supabase visa_info** — ətraflı seed (6 ölkə)
3. **Hardcoded map** — 7 populyar ölkə (AZ pasport üçün)
4. **External API** — son çarə

## Açıq Data

- Wikipedia / Wikivoyage (ölkə və şəhər məlumatları)
- GeoNames (şəhər seed, population, koordinat)
- OpenStreetMap / Overpass (POI, attraction, restoran)
- Unsplash API (şəkillər)

**Tripadvisor-dan icazəsiz scraping edilmir.**

## AI Provider

SDK-sız, `fetch` üzərindən işləyir. Provider `.env.local`-də `AI_PROVIDER` ilə seçilir:

- `gemini` — GEMINI_API_KEY
- `openai` — OPENAI_API_KEY
- `claude` — ANTHROPIC_API_KEY
- `deepseek` — DEEPSEEK_API_KEY
- `groq` — GROQ_API_KEY (pulsuz, sürətli)

## Migration-lar

Supabase migration-lar `supabase/migrations/` altındadır, ardıcıl nömrələnir (001-026).

Tətbiq etmək üçün Supabase dashboard → SQL Editor → faylı yapışdır → Run.

## Layihə Strukturu

```
src/
  app/           — Next.js App Router səhifələri + API route-lar
  components/    — React komponentləri (home, layout, visa, etc.)
  hooks/         — Custom React hooks (useChat, useUnreadMessages)
  i18n/          — next-intl konfiqurasiyası
  lib/           — Biznes məntiqi (supabase, ai, visa, unsplash, etc.)
  messages/      — Tərcümə faylları (az.json, en.json, ru.json)
  types/         — TypeScript type-ları
```

## Commits

- `feat:` — yeni feature
- `fix:` — xəta düzəlişi
- `docs:` — sənədləşdirmə
- `refactor:` — kod təmizliyi

## License

MIT
