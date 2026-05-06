# TravelAZ - Agent Konteksti və Cari Roadmap

Bu fayl gələcək agentlər üçün TravelAZ layihəsinin cari vəziyyətini, konvensiyalarını və növbəti addımlarını saxlayır. Fayl Azərbaycan dilində saxlanmalıdır.

## Layihə Xülasəsi

TravelAZ Next.js 15 üzərində qurulan çoxdilli travel platformadır. Layihədə lokalizasiya edilmiş route-lar, Supabase əsaslı data, AI planlaşdırıcı, viza alətləri, blog, chat, turlar, ölkə/şəhər/place səhifələri və community review sistemi var.

Tripadvisor-dan icazəsiz scraping, review kopyalama və content kopyalama edilməməlidir. Oxşar product value açıq data və TravelAZ-in öz review sistemi ilə qurulmalıdır.

## 2026-05-07 Status Update

- `country_highlights` 10 əsas istiqamət üçün seed edildi: `turkey`, `dubai`, `france`, `italy`, `georgia`, `bali`, `japan`, `thailand`, `greece`, `maldives`.
- Supabase-ə 43 highlight yazıldı.
- `scripts/seed-country-highlights.js` əlavə edildi. Əmr: `npm run seed:country-highlights -- --apply`.
- `scripts/enrich-images.js` parser-i düzəldildi; artıq `--type=cities`, `--type countries`, `--limit=20`, `--limit 20` formatları işləyir.
- 20 şəhər Unsplash ilə zənginləşdirildi. Hazırda 26 şəhərin hamısında `cover_photo_id` var.
- Ölkələr üçün 25-lik Unsplash batch işlədi: 21 ölkə real şəkil aldı, 4 ölkə üçün nəticə tapılmadı.
- Şəkil fallback məntiqi düzəldildi: qısa Unsplash API ID-ləri və məlum 404 ID-lər artıq sınıq image URL yaratmır.
- `--repair-invalid` rejimi əlavə edildi; bu rejim problemli `cover_photo_id` dəyərlərini tam `images.unsplash.com` URL-ləri ilə əvəz edir.
- Ana səhifədə hardcoded şəhər kartları real `cities` query ilə əvəz edildi.
- Ana səhifəyə real `places` preview bloku əlavə edildi.
- `README.md`, `plan.md` və `AGENTS.md` cari vəziyyətə uyğun yeniləndi.

Cari DB snapshot:

- `countries`: 189
- `cities`: 26
- `places`: 1593
- `country_highlights`: 43
- `place_reviews`: 0
- `place_sources`: 1515
- `external_import_logs`: 29
- `countries_with_cover`: 77
- `cities_with_cover`: 26

## Texnologiyalar

- Next.js 15 App Router
- React 19
- TypeScript 5.9
- Tailwind CSS v4
- next-intl: `az`, `en`, `ru`
- Supabase: auth, database, realtime chat
- Duffel: flights və hotels/stays
- Unsplash API: ölkə və şəhər cover photo enrichment
- OpenStreetMap/Overpass, GeoNames, Wikipedia/Wikivoyage metadata
- TipTap, sonner, lucide-react, DOMPurify
- Leaflet / react-leaflet

## Əsas Əmrlər

```bash
npm run dev
npx tsc --noEmit
npm run lint
npm run build
npm run import:open-travel-data -- --check-db
npm run import:open-travel-data -- --city=istanbul --dry-run
npm run import:open-travel-data -- --city=istanbul --apply
npm run import:open-travel-data -- --mode=geonames --dry-run
npm run enrich:images -- --type=cities --limit=20 --apply
npm run enrich:images -- --type=countries --limit=50 --apply
npm run enrich:images -- --type=countries --limit=20 --repair-invalid --apply
npm run seed:country-highlights -- --apply
```

Open data import script default olaraq dry-run işləyir. Supabase-ə yazmaq üçün `--apply` və `.env.local` içində `SUPABASE_SERVICE_ROLE_KEY` lazımdır.

## Vacib Fayllar

- `plan.md` - cari roadmap və qalan işlər
- `README.md` - setup, env və developer workflow
- `src/app/[locale]/page.tsx` - professional ana səhifə
- `src/components/home/globe-hero.tsx` - animasiyalı qlobus və təyyarələr
- `src/components/home/home-search-panel.tsx` - ana səhifə search tab-ları
- `src/components/country/country-card.tsx` - ölkə kartları və image fallback
- `src/app/[locale]/countries/[slug]/page.tsx` - ölkə detal data fetch
- `src/app/[locale]/countries/[slug]/country-detail-client.tsx` - ölkə detal UI
- `src/app/[locale]/cities/page.tsx` - şəhər siyahısı
- `src/app/[locale]/cities/[slug]/page.tsx` - şəhər detalı
- `src/app/[locale]/places/[id]/page.tsx` - place detalı
- `src/components/place/place-review-form.tsx` - review yazma forması
- `src/components/place/review-moderation-panel.tsx` - admin moderation UI
- `src/lib/open-travel-data.ts` - city/place/review mapper-ləri
- `src/lib/unsplash.ts` - Unsplash və flag helper-ləri
- `scripts/import-open-travel-data.js` - Overpass/Wikipedia/GeoNames import pipeline
- `scripts/enrich-images.js` - Unsplash image enrichment
- `scripts/seed-country-highlights.js` - ölkə highlight seed script-i
- `src/messages/*.json` - i18n mesajları

## Database və Migration-lar

Migration siyahısı hazırda `028_seed_20_cities_open_data.sql` faylına qədər gedir.

Mühüm cədvəllər:

- `profiles`
- `blogs`, `blog_comments`, `blog_likes`
- `countries`, `country_highlights`
- `visa_info`, `visa_documents`, `visa_qa_cache`, `visa_updates`
- `news`
- `companions`
- `tour_companies`, `tours`, `tour_bookings`, `tour_reviews`
- `conversations`, `messages`, `notifications`
- `cities`, `places`, `place_reviews`, `place_review_helpful_votes`, `place_sources`, `external_import_logs`

## AI Provider Sistemi

AI provider-lar SDK-sızdır və server-side `fetch` istifadə edir. `.env.local` içində `AI_PROVIDER` ilə provider seçilir.

Dəstəklənən provider-lar:

- `gemini` - `GEMINI_API_KEY`
- `openai` - `OPENAI_API_KEY`
- `claude` - `ANTHROPIC_API_KEY`
- `deepseek` - `DEEPSEEK_API_KEY`
- `groq` - `GROQ_API_KEY`
- `glm` - `GLM_API_KEY`

Əsas fayllar:

- `src/lib/ai/provider.ts`
- `src/lib/ai/prompts.ts`
- `src/lib/ai/parser.ts`
- `src/lib/ai/providers/*`

## Konvensiyalar

- Bütün user-facing səhifələr `src/app/[locale]/` altında olmalıdır.
- Default locale `az`-dir.
- Server component-lərdə `getTranslations`, client component-lərdə `useTranslations` istifadə et.
- Server Supabase client `@/lib/supabase/server` içindən gəlir.
- Browser Supabase client `@/lib/supabase/client` içindən gəlir.
- AI çağırışları server-side API route-lar üzərindən edilməlidir.
- Tailwind v4 tema dəyişənləri `src/app/globals.css` içindədir.
- UI control-lar üçün `lucide-react` ikonlarından istifadə et.
- Yeni abstraction əlavə etməzdən əvvəl mövcud route və component pattern-lərinə bax.
- İstifadəçinin və ya başqa agentin dəyişikliklərini geri çevirmə.

## Açıq Data Strategiyası

- Wikipedia/Wikivoyage: ölkə və şəhər travel guide istinadları
- OpenStreetMap/Overpass: POI, attraction, restoran, kafe, hotel, landmark, viewpoint
- GeoNames: şəhər, population, koordinat və region seed datası
- Unsplash: cover photo enrichment
- TravelAZ Reviews: platformanın öz istifadəçi rəyləri

Hər import source/license metadata saxlamalıdır.

## Tamamlanan Böyük İşlər

- Flights real API: Duffel Flight API.
- Hotels real API: Duffel Stays API.
- Cities/Places/Reviews data modeli.
- Open data import pipeline.
- City və place səhifələri.
- Review moderation workflow.
- AI route auth və image enrich admin gate.
- Viza widget `cca2` və Supabase fallback düzəlişi.
- i18n və type cleanup.
- Image optimization.
- Mobile menu və footer polish.
- GlobeHero təyyarə animasiyaları.
- Ana səhifə DB əsaslı countries/cities/places preview.
- Country highlights seed.

## Natamam Qalanlar

1. Qalan ölkə şəkillərini batch-batch doldurmaq.
   - Əmr: `npm run enrich:images -- --type=countries --limit=50 --apply`
   - Unsplash demo tier saatlıq limit verdiyi üçün bir neçə saatlıq mərhələdə edilməlidir.

2. `country_highlights` əhatəsini genişləndirmək.
   - Hazırda 10 istiqamət var.
   - Növbəti hədəf: ən azı 30 ölkə.

3. `places` kurasiyası.
   - `is_featured` və `popular_rank` real travel dəyərinə görə düzülməlidir.
   - Ana səhifədə ən yaxşı məkanlar görünməlidir.

4. Review sistemini canlandırmaq.
   - `place_reviews=0`.
   - Review CTA-ları, empty state-lər və admin moderation real hesablarla yoxlanmalıdır.

5. Booking/payment.
   - Hələ bu mərhələyə daxil deyil.
   - Sonra booking confirmation, payment flow, provider order API-ləri, cancellation/refund policy planlanmalıdır.

6. Production visual QA və Core Web Vitals.

## Yoxlama Bazası

Hər böyük dəyişiklikdən sonra:

```bash
npx tsc --noEmit
npm run lint
npm run import:open-travel-data -- --check-db
```

Manual URL yoxlaması:

```text
http://localhost:3000/az
http://localhost:3000/en
http://localhost:3000/ru
http://localhost:3000/az/countries
http://localhost:3000/az/countries/turkey
http://localhost:3000/az/cities
http://localhost:3000/az/cities/istanbul
```

## Gələcək Agentlər Üçün Qeydlər

- User dəyişikliklərini revert etmə.
- Untracked `data/` və `supabase/imports/*.sql` faylları əvvəlki import/debug çıxışları ola bilər; task üçün lazım deyilsə toxunma.
- `UNSPLASH_ACCESS_KEY` server-only environment variable-dur, client-side expose etmə.
- `SUPABASE_SERVICE_ROLE_KEY` yalnız server/script tərəfində istifadə olunmalıdır.
- `SLUG_TO_ISO` xəritəsi `src/lib/unsplash.ts` içindədir; yeni ölkə əlavə ediləndə lazım olsa yenilə.
- Tripadvisor-dan icazəsiz scraping etmə.

## Şəkil Problemi Üçün Daimi Qeyd

- Hər yeni sessiyada şəkilləri ayrıca aktiv problem kimi yoxla: ana səhifə, `/az/countries`, `/az/countries/turkey` və `/az/cities` səhifələrində kart şəkilləri default/sınıq görünürsə, əvvəl `npm run enrich:images -- --type=countries --limit=20 --repair-invalid --apply`, sonra rate limit imkan verirsə `npm run enrich:images -- --type=countries --limit=50 --apply` işlət.
- Şəkil problemi tam bitmiş sayılmır: qalan ölkələr batch-batch real şəkillərlə doldurulana qədər bunu aktiv natamam iş kimi gör.
- `src/lib/unsplash.ts` içindəki fallback pool və `KNOWN_BAD_UNSPLASH_REFS` siyahısı qorunmalıdır; yeni 404 ID tapıldıqda həmin siyahıya əlavə et.
