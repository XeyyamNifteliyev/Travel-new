# TravelAZ

TravelAZ Azərbaycan bazarı üçün çoxdilli travel platformadır. Layihə uçuş, otel, ölkə və şəhər bələdçiləri, viza yoxlaması, AI planlaşdırıcı, turlar, blog, chat və community modullarını bir yerdə birləşdirir.

Tripadvisor-dan icazəsiz scraping və review kopyalama edilmir. Yer və şəhər datası OpenStreetMap/Overpass, GeoNames, Wikipedia/Wikivoyage metadata-sı və TravelAZ-in öz review sistemi ilə qurulur.

## Stack

| Texnologiya | İstifadə |
| --- | --- |
| Next.js 15 | App Router, server components, API routes |
| React 19 | UI komponentləri |
| TypeScript 5.9 | Type safety |
| Tailwind CSS v4 | Dizayn sistemi |
| next-intl | `az`, `en`, `ru` lokalizasiya |
| Supabase | Auth, DB, realtime chat |
| Duffel | Flights və hotels/stays API |
| Unsplash | Ölkə və şəhər şəkil enrichment |

## Setup

```bash
git clone https://github.com/XeyyamNifteliyev/Travel-new.git
cd Travel-new
npm install
cp .env.example .env.local
npm run dev
```

Development URL: `http://localhost:3000/az`

## Environment

Əsas dəyişənlər:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

AI_PROVIDER=gemini
GEMINI_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
DEEPSEEK_API_KEY=
GROQ_API_KEY=
GLM_API_KEY=

UNSPLASH_ACCESS_KEY=
DUFFEL_ACCESS_TOKEN=
DUFFEL_BASE_URL=https://api.duffel.com
GEONAMES_USERNAME=
CRON_SECRET=
```

Tam siyahı üçün `.env.example` faylına bax.

## Əmrlər

| Əmr | Nə edir |
| --- | --- |
| `npm run dev` | Local server, port 3000 |
| `npx tsc --noEmit` | TypeScript yoxlaması |
| `npm run lint` | ESLint yoxlaması |
| `npm run build` | Production build |
| `npm run import:open-travel-data -- --check-db` | Open data cədvəllərinin row count yoxlaması |
| `npm run import:open-travel-data -- --city=istanbul --dry-run` | Overpass/Wikipedia preview |
| `npm run import:open-travel-data -- --city=istanbul --apply` | Şəhər və POI datasını Supabase-ə yazır |
| `npm run import:open-travel-data -- --mode=geonames --dry-run` | GeoNames city seed preview |
| `npm run enrich:images -- --type=cities --limit=20 --apply` | Şəhər şəkillərini Unsplash ilə doldurur |
| `npm run enrich:images -- --type=countries --limit=50 --apply` | Ölkə şəkillərini batch ilə doldurur |
| `npm run enrich:images -- --type=countries --limit=20 --repair-invalid --apply` | Sınmış/qısa Unsplash ID-ləri tam işlək URL-lə repair edir |
| `npm run seed:country-highlights -- --apply` | Əsas ölkələr üçün highlight-ları idempotent seed edir |

`enrich:images` həm `--type cities`, həm də `--type=cities` formatını dəstəkləyir.

## Supabase və Data

Migration-lar `supabase/migrations/` altında ardıcıl saxlanır. Cari xətt 028-ə qədər gedir və aşağıdakı real-data cədvəlləri mövcuddur:

- `cities`
- `places`
- `place_reviews`
- `place_review_helpful_votes`
- `place_sources`
- `external_import_logs`
- `country_highlights`

Cari content pipeline:

1. GeoNames şəhər seed-i yaradır.
2. Overpass/OpenStreetMap şəhər üzrə POI-ləri çəkir.
3. Wikipedia summary və source/license metadata saxlanır.
4. Unsplash ölkə/şəhər şəkillərini `cover_photo_id` kimi yazır.
5. TravelAZ istifadəçiləri öz review-larını yaradır, admin moderation approve/reject edir.

## AI Provider

AI SDK-sız işləyir və provider `AI_PROVIDER` ilə seçilir:

- `gemini`
- `openai`
- `claude`
- `deepseek`
- `groq`
- `glm`

Əsas fayllar: `src/lib/ai/provider.ts`, `src/lib/ai/prompts.ts`, `src/lib/ai/parser.ts`, `src/lib/ai/providers/*`.

## Əsas Route-lar

- `/az` - professional ana səhifə, GlobeHero, real countries/cities/places preview
- `/az/countries` - ölkə kataloqu
- `/az/countries/[slug]` - ölkə detalı, highlight-lar, city/place preview
- `/az/cities` - şəhərlər
- `/az/cities/[slug]` - şəhər detalı və POI-lər
- `/az/places/[id]` - məkan detalı və review forması
- `/az/flights` - Duffel flight search
- `/az/hotels` - Duffel stays search
- `/az/visa` - viza yoxlama
- `/az/admin` - review moderation

## Yoxlama

Hər böyük dəyişiklikdən sonra:

```bash
npx tsc --noEmit
npm run lint
npm run import:open-travel-data -- --check-db
```

Vizual yoxlama üçün:

```text
http://localhost:3000/az
http://localhost:3000/az/countries
http://localhost:3000/az/countries/turkey
http://localhost:3000/az/cities
http://localhost:3000/az/cities/istanbul
```

## Qalan Böyük İşlər

- Booking/payment flow.
- TravelAZ review-larının real istifadəçi bazası ilə böyüdülməsi.
- Daha çox ölkə üçün country highlights.
- Unsplash rate limit bitdikcə qalan ölkə şəkillərinin batch enrichment-i.
- Production deploy sonrası Core Web Vitals və vizual QA.
