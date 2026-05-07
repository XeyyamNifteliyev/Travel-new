# TravelAZ - Agent Konteksti və Cari Roadmap

Bu fayl gələcək agentlər üçün TravelAZ layihəsinin cari vəziyyətini, konvensiyalarını və növbəti addımlarını saxlayır. Fayl UTF-8 Azərbaycan dilində saxlanmalıdır.

## Layihə Xülasəsi

TravelAZ Next.js 15 üzərində qurulan çoxdilli travel platformadır. Layihədə lokalizasiya edilmiş route-lar, Supabase əsaslı data, AI planlaşdırıcı, viza alətləri, blog, chat, turlar, ölkə/şəhər/place səhifələri və community review sistemi var.

Tripadvisor-dan icazəsiz scraping, review kopyalama və content kopyalama edilməməlidir. Oxşar product value açıq data, real API-lər və TravelAZ-in öz review sistemi ilə qurulmalıdır.

## 2026-05-07 Status Update

- `country_highlights` 10 əsas istiqamət üçün seed edildi: `turkey`, `dubai`, `france`, `italy`, `georgia`, `bali`, `japan`, `thailand`, `greece`, `maldives`.
- Supabase-ə 43 highlight yazıldı.
- `scripts/seed-country-highlights.js` əlavə edildi.
- Ana səhifədə hardcoded şəhər kartları real `cities` query ilə əvəz edildi.
- Ana səhifəyə real `places` preview bloku əlavə edildi.
- Ana səhifə şəhər və yer kurasiyası edildi: `cities` və `places` cədvəllərində `is_featured`/`popular_rank` dəyərləri tənzimləndi.
- `/countries` səhifəsində pagination əlavə edildi.
- Qitə filtrləri server-side işləyir.
- `scripts/fix-continents.js` əlavə edildi və 178 ölkənin `continent` dəyəri `cca2` kodlarına əsasən yeniləndi.
- `scripts/audit-country-content.js` və `scripts/enrich-country-content.js` əlavə edildi.
- Bütün 189 ölkə üçün kart datası tamamlandı: `capital`, `short_desc`, `short_desc_en`, `short_desc_ru`, `avg_flight_azn`, `avg_hotel_azn`, `avg_daily_azn`, `best_months`.
- Ölkə kartlarının content hissəsinə sabit minimum hündürlük verildi ki, məlumatı az/çox olan kartlar vizual olaraq bir-birindən çox fərqlənməsin.

## Şəkil Problemi - Aktiv Prioritet

Hazırda layihənin ən böyük vizual problemi ölkə kartlarındakı şəkillərdir.

Son audit nəticəsinə görə:

- `countries`: 189
- `countries.cover_photo_id IS NOT NULL`: təxminən 77-80
- 100+ ölkədə `cover_photo_id` boşdur.
- Boş ölkələr runtime fallback pool-a düşür və çox kartda eyni şəkillər görünür.
- Bəzi ölkələrdə qısa Unsplash API ID-ləri var, məsələn `OxtZP_h8tbQ`; bunlar tam `images.unsplash.com` URL deyil.
- Məqsəd fallback-ları azaltmaq deyil, hər ölkəyə öz ölkəsinə aid gözəl, işlək və mümkün qədər unikal şəkil yazmaqdır.

Şəkil işi üçün əsas əmrlər:

```bash
npm run audit:country-images
npm run enrich:images -- --type=countries --priority-countries --limit=20 --apply
npm run enrich:images -- --type=countries --repair-invalid --limit=20 --apply
npm run enrich:images -- --type=countries --limit=50 --apply
npm run enrich:images -- --type=countries --slug=turkey,france,georgia --apply
```

Paytaxt şəkli qaydası:

- Ölkə cover şəkillərində əsas seçim paytaxtın şəhər görüntüsü, memarlıq, skyline, downtown, küçə və landmark görüntüsü olmalıdır.
- Dəniz, dağ, meşə, səhra, göl, heyvan və random landscape şəkilləri ölkə kartı üçün uyğun sayılmır.
- `scripts/enrich-images.js` ölkələr üçün əvvəlcə `{capital} {country} city skyline`, `{capital} {country} architecture`, `{capital} {country} downtown`, `{capital} {country} landmark` query-lərini yoxlayır.
- Unsplash nəticəsinin alt/description/tag mətnində animal, donkey, horse, mountain, beach, sea, forest, desert, rice, field, farm, landscape, rural kimi sözlər varsa həmin şəkil avtomatik skip edilməlidir.
- Paytaxt şəkli tapılmayan ölkələr manual review tələb edir; yanlış təbiət/heyvan şəkli göstərməkdənsə həmin ölkə üçün Wikimedia/Commons-dan real paytaxt memarlığı tapmaq daha yaxşıdır.

### Ölkə Şəkilləri Üçün İcra Ardıcıllığı

Bu ardıcıllıq hər yeni sessiyada qorunmalıdır ki, şəkil işi təsadüfi yox, idarəli davam etsin:

1. Əvvəl audit işlət:

```bash
npm run audit:country-images
```

2. Əvvəl invalid və qısa Unsplash ID-ləri düzəlt:

```bash
npm run enrich:images -- --type=countries --repair-invalid --limit=10 --apply
```

3. Sonra tanınmış və saytda daha çox görünəcək ölkələri batch ilə düzəlt:

```bash
npm run enrich:images -- --type=countries --slug=ireland,indonesia,israel,jordan,hungary,latvia,lithuania,luxembourg,malta,pakistan,peru,philippines --limit=20 --apply
```

4. Sonra qalan boş ölkələri 20-lik batch-lərlə doldur:

```bash
npm run enrich:images -- --type=countries --limit=20 --apply
```

5. Hər batch-dən sonra yenidən audit və yoxlama işlət:

```bash
npm run audit:country-images
npx tsc --noEmit
npm run lint
```

Qalan ölkələr `data/country-image-audit.json` içindəki `needs_attention`, `missing_sample` və `invalid_sample` siyahılarına əsasən seçilməlidir. Unsplash limitə düşərsə, qalan batch növbəti sessiyada eyni ardıcıllıqla davam etdirilməlidir.

Şəkil pipeline qaydaları:

- `scripts/audit-country-images.js` hər sessiyada işlədilə bilər; nəticəni `data/country-image-audit.json` faylına yazır.
- `scripts/enrich-images.js` artıq ölkələr üçün generic `Country travel landscape` ilə kifayətlənmir.
- Ölkələr üçün query ardıcıllığı:
  - `{capital} {country} city skyline`
  - `{capital} {country} architecture`
  - `{capital} {country} downtown`
  - `{capital} {country} landmark`
  - `{country} capital city`
- DB-yə qısa ID yox, tam `https://images.unsplash.com/photo-...` URL yazılmalıdır.
- Eyni şəkil URL-i başqa ölkədə varsa, yeni ölkəyə yazılmamalıdır.
- `src/lib/unsplash.ts` fallback pool-u son çarədir; əsas mənbə DB-dəki real ölkə şəkli olmalıdır.
- Yeni 404 ID tapıldıqda `KNOWN_BAD_UNSPLASH_REFS` siyahısına əlavə edilməlidir.

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
npm run audit:country-images
npm run audit:country-content
npm run enrich:country-content -- --limit=30 --dry-run
npm run enrich:country-content -- --limit=30 --apply
npm run seed:country-highlights -- --apply
```

Open data import script default olaraq dry-run işləyir. Supabase-ə yazmaq üçün `--apply` və `.env.local` içində `SUPABASE_SERVICE_ROLE_KEY` lazımdır.

## Vacib Fayllar

- `plan.md` - cari roadmap və qalan işlər
- `README.md` - setup, env və developer workflow
- `src/app/[locale]/page.tsx` - professional ana səhifə
- `src/app/[locale]/countries/page.tsx` - ölkələr səhifəsi, server-side pagination/filter
- `src/app/[locale]/countries/country-grid-client.tsx` - ölkə grid, search, filter, pagination UI
- `src/components/country/country-card.tsx` - ölkə kartları və image fallback
- `src/lib/unsplash.ts` - Unsplash URL helper-ləri, fallback pool və known bad image refs
- `scripts/enrich-images.js` - duplicate-safe Unsplash image enrichment
- `scripts/audit-country-images.js` - ölkə şəkil audit report-u
- `scripts/audit-country-content.js` - ölkə kart content audit report-u
- `scripts/enrich-country-content.js` - RestCountries və Wikipedia əsasında boş ölkə content field-lərini doldurur
- `scripts/import-open-travel-data.js` - Overpass/Wikipedia/GeoNames import pipeline
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
- Tripadvisor-dan icazəsiz scraping etmə.

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
- Ölkə pagination və server-side qitə filterləri.
- Bütün 189 ölkə üçün kart content enrichment: capital, 3 dildə short description, təxmini flight/hotel/daily qiymətlər və best months.

## Natamam Qalanlar

1. Qalan ölkə şəkillərini batch-batch doldurmaq.
   - Əsas problem budur.
   - `npm run audit:country-images` ilə vəziyyəti yoxla.
   - Əvvəl priority ölkələri düzəlt.
   - Sonra boş və invalid şəkilləri batch-batch doldur.
   - Unsplash demo tier saatlıq limit verdiyi üçün mərhələli edilməlidir.

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
npm run audit:country-images
npm run audit:country-content
```

Manual URL yoxlaması:

```text
http://localhost:3000/az
http://localhost:3000/en
http://localhost:3000/ru
http://localhost:3000/az/countries
http://localhost:3000/az/countries/turkey
http://localhost:3000/az/countries/france
http://localhost:3000/az/countries/georgia
http://localhost:3000/az/cities
http://localhost:3000/az/cities/istanbul
```

## Gələcək Agentlər Üçün Qeydlər

- User dəyişikliklərini revert etmə.
- Untracked `data/` və `supabase/imports/*.sql` faylları əvvəlki import/debug çıxışları ola bilər; task üçün lazım deyilsə toxunma.
- `UNSPLASH_ACCESS_KEY` server-only environment variable-dur, client-side expose etmə.
- `SUPABASE_SERVICE_ROLE_KEY` yalnız server/script tərəfində istifadə olunmalıdır.
- `SLUG_TO_ISO` xəritəsi `src/lib/unsplash.ts` içindədir; yeni ölkə əlavə ediləndə lazım olsa yenilə.
- Şəkil problemi tam bitmiş sayılmır: bütün ölkələrdə real, unikal və ölkəyə uyğun şəkil olana qədər bunu aktiv natamam iş kimi gör.
