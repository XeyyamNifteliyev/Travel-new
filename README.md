# TravelAZ

TravelAZ Next.js 15, Supabase və açıq data mənbələri üzərində qurulan çoxdilli travel platformadır. Layihədə ölkələr, şəhərlər, məkanlar, viza məlumatları, AI planlaşdırıcı, blog, xəbərlər, restoran/kafe datası və community funksiyaları var.

Tripadvisor-dan icazəsiz scraping və review kopyalama edilməməlidir. Kontent OpenStreetMap, Wikipedia/Wikivoyage, GeoNames, RestCountries, Unsplash/Pexels və TravelAZ-in öz istifadəçi rəyləri ilə böyüdülür.

## Lokal Setup

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Əsas yoxlama URL-ləri:

```text
http://localhost:3000/az
http://localhost:3000/az/countries
http://localhost:3000/az/cities
http://localhost:3000/az/visa
http://localhost:3000/az/blog
```

## Environment

`.env.local` üçün vacib dəyişənlər:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` - yalnız server/script üçün.
- `NEXT_PUBLIC_SITE_URL`
- `AI_PROVIDER` və seçilən provider key-i, məsələn `GEMINI_API_KEY`
- `UNSPLASH_ACCESS_KEY`
- `PEXELS_API_KEY`
- `DUFFEL_ACCESS_TOKEN`
- `CRON_SECRET`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Production-da Upstash Redis dəyişənləri mütləq verilməlidir; yoxdursa rate limit yalnız proses memory-si ilə işləyəcək və multi-instance deployment üçün yetərli deyil.

## Əsas Əmrlər

```bash
npx tsc --noEmit
npm run lint
npm run build
npm audit --audit-level=moderate
npm run audit:country-images
npm run audit:country-content
npm run audit:place-content
npm run audit:visa-official-links
```

Kontent və şəkil enrichment:

```bash
npm run enrich:place-images -- --limit=80 --category=attraction,museum,landmark,historic,viewpoint --source=pexels --apply
npm run enrich:place-images -- --limit=80 --category=attraction,museum,landmark,historic,viewpoint --source=unsplash --apply
npm run enrich:place-descriptions -- --limit=300 --strategy=factual --apply --quiet
npm run seed:professional-blogs -- --apply
npm run seed:professional-news -- --apply
```

## Supabase

Migration-lar `supabase/migrations` içindədir. Production-a çıxmazdan əvvəl migration statusu yoxlanmalı və RLS policy-lər live Supabase-də ayrıca audit edilməlidir.

Service role key heç vaxt browser tərəfə çıxmamalıdır. Import, cache, scraper və admin yazıları yalnız server/script axını ilə işləməlidir.

## Security Qaydaları

- Public API-lərdə body allowlist və length limit saxlanmalıdır.
- User-dən `role`, `status`, `is_verified`, `rating`, `views` kimi həssas field-lər qəbul edilməməlidir.
- AI endpoint-lər login və günlük limit tələb etməlidir.
- Write API-lər rate limit-lə qorunmalıdır.
- Clientə Supabase constraint/table/column error detalları göndərilməməlidir.
- HTML render yalnız sanitize edilmiş content ilə olmalıdır.
- JSON-LD output `<` escaping ilə yazılmalıdır.

## Deployment

Docker build Next standalone output istifadə edir:

```bash
docker build -t travelaz .
docker run --env-file .env.local -p 3000:3000 travelaz
```

Production checklist:

```bash
npm ci
npx tsc --noEmit
npm run lint
npm run build
npm audit --audit-level=moderate
```

`next-intl` və Next/PostCSS audit riskləri breaking upgrade tələb edə bilər. Onları ayrıca test branch-i və tam i18n smoke test ilə yeniləmək lazımdır.

## Qalan Launch İşləri

- Place image coverage-i 1700+ səviyyəsinə çatdırmaq.
- `place_reviews=0` problemini real review CTA və moderation flow ilə canlandırmaq.
- `tours` və `tour_companies` boşluğunu ya real data ilə doldurmaq, ya da bölməni müvəqqəti gizlətmək.
- Visa official link coverage-i tamamlamaq.
- Sentry və ya oxşar monitoring əlavə etmək.
