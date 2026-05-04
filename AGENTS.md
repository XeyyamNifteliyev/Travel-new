# TravelAZ - Layihə Konteksti və Cari Roadmap

## Cari Vəziyyət

TravelAZ Next.js 15 üzərində qurulan çoxdilli travel platformadır. Layihədə lokalizasiya edilmiş route-lar, Supabase əsaslı data, AI planlaşdırıcı, viza alətləri, blog, chat, turlar və ölkə səhifələri var.

Son tamamlanan işlər:

- Repo kökündə `plan.md` yaradıldı və TravelAZ üçün əsas tamamlama roadmap-i ora yazıldı.
- Ana səhifə sadə hero + 4 hardcoded ölkə kartından professional travel marketplace görünüşünə keçirildi.
- Ana səhifəyə GlobeHero, search tab-ları, featured countries, AI planner spotlight, tours preview, community preview, visa CTA əlavə edildi.
- Ölkələr səhifəsində kartlar üçün Unsplash travel şəkil xəritəsi əlavə edildi.
- Open data migration-ları (020-022), city/place/review TypeScript tipləri, mapper-lər, import pipeline əlavə edildi.
- İstanbul open-data seed migration-ı, city/place detail route-ları, review form və helpful vote UI əlavə edildi.
- **i18n tam cleanup həyata keçirildi:** Bütün komponentlərdəki ~200+ hardcoded Azərbaycan mətni `messages/*.json` fayllarına çıxarıldı. Yeni namespace-lər: `profile` (genişləndirildi), `chat` (yeni), `blog` comments (genişləndi). AI planner sub-komponentlər, footer, confirm-dialog, theme-toggle i18n-ə keçirildi.
- **Type tam cleanup həyata keçirildi:** 55 `any` istifadəsinin hamısı typed interfeyslərlə əvəz olundu. `src/types/supabase-helpers.ts` yaradıldı (User, ProfileRow, BlogListItem, CompanionItem, VideoItem, UserCountryItem). Supabase User import conflict-ləri `User as SupabaseUser` patterni ilə həll edildi. Locale `as any` → `typeof routing.locales[number]`, `catch (error: any)` → `catch (error: unknown)`, `Record<string, any>` → `Record<string, React.ComponentType<...>>` fixləri tətbiq edildi.
- `docs/superpowers/specs/2026-05-04-i18n-type-cleanup-design.md` dizayn spek yazıldı.
- **Key-siz API inteqrasiyası tamamlandı:** Open-Meteo (hava proqnozu), RestCountries (ölkə info), VisaList (viza yoxlama) API-ləri inteqrasiya edildi. Hər biri üçün server-side route, lib helper, client widget və i18n namespace yaradıldı.
  - Open-Meteo: `src/lib/weather.ts`, `/api/weather`, `src/components/weather/weather-widget.tsx` — ölkə və şəhər səhifələrində
  - RestCountries: `src/lib/countries-api.ts`, `/api/countries/[code]`, `src/components/country/country-info-card.tsx` — ölkə səhifəsində
  - VisaList: `src/lib/visa/visalist-api.ts`, `/api/visa/check`, `src/components/visa/visa-check-widget.tsx` — viza, ölkə və şəhər səhifələrində
  - `ExpandedCountry` interfeysinə `cca2?`, `lat?`, `lng?` field-ları əlavə edildi
  - `api.md` inteqrasiya status cədvəli yeniləndi
- **Image optimization tamamlandı:** 19 `<img>` istifadəsinin hamısı `next/image` ilə əvəz olundu. 12 fayl, 19 dəyişiklik (blog, chat, hotels, news, companion, profile, tour, video komponentləri). `next.config.ts`-ə `img.youtube.com` və `*.supabase.co` remote pattern-ləri əlavə edildi. `npm run lint` artıq 0 error, 0 warning qaytarır.

Son yoxlamalar:

- `npx tsc --noEmit` 0 error qaytarır.
- `npm run lint` 0 error, 0 warning.
- Profil, chat, blog, tour, company, video, leaderboard, AI planner, layout komponentlərinin hamısı typed və i18n-ə keçirilib.

## Texnologiyalar

- Next.js 15 App Router
- React 19
- TypeScript 5.9
- Tailwind CSS v4, CSS-only config `src/app/globals.css` içindədir
- next-intl, dillər: `az`, `en`, `ru`
- Supabase: auth, database, realtime chat
- TipTap: blog editor
- sonner: toast bildirişləri
- lucide-react: iconlar
- DOMPurify: HTML sanitizasiya
- Unsplash CDN helper: ölkə və travel şəkilləri
- Leaflet / react-leaflet: xəritə funksiyaları

## Əmrlər

- `npm run dev` - development server, adətən port 3000
- `npx tsc --noEmit` - TypeScript yoxlaması
- `npm run lint` - ESLint yoxlaması
- `npm run build` - production build
- `npm run import:open-travel-data -- --check-db` - açıq data cədvəllərini və row count-ları yoxlayır
- `npm run import:open-travel-data -- --city=istanbul --dry-run` - açıq data import preview
- `npm run import:open-travel-data -- --city=istanbul --sql-out=supabase/imports/istanbul_open_data.sql` - Supabase SQL Editor üçün import SQL yaradır
- `npm run import:open-travel-data -- --city=istanbul --apply` - açıq data importunu Supabase-ə yazır, `SUPABASE_SERVICE_ROLE_KEY` tələb edir

## Vacib Fayllar

- `plan.md` - cari mərhələnin əsas roadmap və backlog faylı
- `AGENTS.md` - bu fayl, agentlər üçün layihə konteksti və iş qaydaları
- `src/app/[locale]/page.tsx` - yenilənmiş ana səhifə
- `src/components/home/home-search-panel.tsx` - ana səhifənin search tab paneli
- `src/components/home/globe-hero.tsx` - animasiyalı qlobus vizualı
- `src/components/country/country-card.tsx` - ölkə kartı UI və şəkil fallback məntiqi
- `src/messages/*.json` - tərcümə faylları
- `src/lib/supabase/server.ts` - server-side Supabase client
- `src/lib/supabase/client.ts` - browser-side Supabase client
- `src/lib/unsplash.ts` - Unsplash və flag helper-ləri
- `src/lib/open-travel-data.ts` - city/place/review mapper-ləri
- `src/types/place.ts` - open travel data TypeScript type-ları
- `scripts/import-open-travel-data.js` - Overpass/Wikipedia import script-i
- `src/app/[locale]/cities/[slug]/page.tsx` - city detail səhifəsi
- `src/app/[locale]/places/[id]/page.tsx` - place detail və review oxuma səhifəsi
- `src/components/place/place-review-form.tsx` - TravelAZ place review forması
- `src/components/place/place-helpful-button.tsx` - place review helpful vote düyməsi
- `supabase/imports/istanbul_open_data.sql` - İstanbul üçün generator çıxışı olan open-data SQL faylı
- `supabase/migrations/021_seed_istanbul_open_data.sql` - İstanbul open-data seed migration-ı
- `supabase/migrations/022_place_review_helpful_votes.sql` - review helpful vote migration-ı
- `supabase/migrations/*` - database schema və seed migration-ları
- `src/lib/weather.ts` - Open-Meteo hava proqnozu tipləri və mapper
- `src/lib/countries-api.ts` - RestCountries ölkə info tipləri və mapper
- `src/lib/visa/visalist-api.ts` - VisaList viza yoxlama tipləri və mapper
- `src/components/weather/weather-widget.tsx` - hava proqnozu widget (full + compact)
- `src/components/country/country-info-card.tsx` - ölkə info kartı
- `src/components/visa/visa-check-widget.tsx` - real-time viza yoxlama widget

## Cari Qovluq Strukturu

```text
src/
  app/
    layout.tsx
    page.tsx
    globals.css
    [locale]/
      layout.tsx
      page.tsx
      auth/login/page.tsx
      auth/register/page.tsx
      flights/page.tsx
      hotels/page.tsx
      tours/page.tsx
      countries/page.tsx
      countries/country-grid-client.tsx
      countries/[slug]/page.tsx
      countries/[slug]/country-detail-client.tsx
      cities/[slug]/page.tsx
      places/[id]/page.tsx
      companions/page.tsx
      visa/page.tsx
      visa/visa-page-client.tsx
      visa/[country]/page.tsx
      news/page.tsx
      news/news-list-client.tsx
      news/[id]/page.tsx
      news/[id]/news-detail-client.tsx
      blog/page.tsx
      blog/[id]/page.tsx
      blog/new/page.tsx
      ai-planner/page.tsx
      ai-planner/ai-planner-client.tsx
      chat/page.tsx
      profile/page.tsx
      videos/page.tsx
      leaderboard/page.tsx
      company/page.tsx
    auth/v1/callback/page.tsx
    api/
      ai/plan/route.ts
      ai/cheap-dates/route.ts
      blogs/route.ts
      comments/route.ts
      companions/route.ts
      companies/route.ts
      countries/[code]/route.ts
      tours/route.ts
      tours/[id]/route.ts
      weather/route.ts
      youtube/route.ts
      visa/[country]/route.ts
      visa/ai-answer/route.ts
      visa/check/route.ts
      visa/generate/route.ts
      visa/scraper/route.ts
      news/route.ts
  components/
    home/
      globe-hero.tsx
      home-search-panel.tsx
    layout/
    ai-planner/
    blog/
    chat/
    companion/
    company/
    country/
    map/
    news/
    place/
    profile/
    search/
    tour/
    ui/
    video/
    visa/
    weather/
  hooks/
    useChat.ts
    useUnreadMessages.ts
  i18n/
    request.ts
    routing.ts
  lib/
    ai/
    supabase/
    open-travel-data.ts
    unsplash.ts
    weather.ts
    countries-api.ts
    visa/visalist-api.ts
  messages/
    az.json
    en.json
    ru.json
  types/
```

## Database və Migration-lar

Migration siyahısı hazırda `022_place_review_helpful_votes.sql` faylına qədər gedir:

- `001_initial_schema.sql`
- `002_faza2_schema.sql`
- `003_faza2.5_profile_social.sql`
- `004_chat_system.sql`
- `005_visa_system.sql`
- `006_seed_countries.sql`
- `007_seed_all.sql`
- `008_visa_qa_cache.sql`
- `009_news.sql`
- `010_visa_scraper.sql`
- `011_summary.json`
- `011_wikipedia_visa_seed.sql`
- `012_countries_expand.sql`
- `013_countries_seed_50.sql`
- `014_fix_data.sql`
- `015_blocked_users.sql`
- `016_chat_delete_policies.sql`
- `017_message_update_policy.sql`
- `018_companions_gender.sql`
- `019_blog_views.sql`
- `020_open_travel_data.sql`
- `021_seed_istanbul_open_data.sql`
- `022_place_review_helpful_votes.sql`

Məlum cari cədvəllər:

- `profiles`
- `blogs`
- `blog_comments`
- `blog_likes`
- `countries`
- `country_highlights`
- `visa_info`
- `visa_documents`
- `visa_qa_cache`
- `visa_updates`
- `scraper_logs`
- `news`
- `companions`
- `youtube_links`
- `tour_companies`
- `tours`
- `tour_bookings`
- `tour_reviews`
- `user_countries`
- `leaderboard_stats`
- `notifications`
- `conversations`
- `messages`
- `cities`
- `places`
- `place_reviews`
- `place_review_helpful_votes`
- `place_sources`
- `external_import_logs`

## AI Provider Sistemi

AI provider-lar SDK-sızdır və `fetch` istifadə edir.

`.env.local` içində `AI_PROVIDER` dəyişəni ilə provider seçilir.

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

## Əsas Konvensiyalar

- Bütün user-facing səhifələr `src/app/[locale]/` altında yerləşir.
- Dəstəklənən dillər `az`, `en`, `ru`; default dil `az`.
- Server component-lərdə `getTranslations`, client component-lərdə `useTranslations` istifadə et.
- Server Supabase client `@/lib/supabase/server` içindən gəlir.
- Browser Supabase client `@/lib/supabase/client` içindən gəlir.
- AI çağırışları server-side API route-lar üzərindən edilir.
- Tailwind v4 tema dəyişənləri `src/app/globals.css` içindədir.
- UI control-lar üçün `lucide-react` iconlarından istifadə et.
- Yeni abstraction əlavə etməzdən əvvəl mövcud route və component pattern-lərinə bax.
- İstifadəçinin və ya başqa agentin dəyişikliklərini geri çevirmə.
- Tripadvisor-dan icazəsiz scraping, review kopyalama və content kopyalama etmə.

## Açıq Data Strategiyası

Tripadvisor content-i icazəsiz scrape və ya copy edilməməlidir. Planlaşdırılan alternativ yanaşma:

- Wikivoyage / Wikipedia / Wikimedia: ölkə və şəhər travel guide istinadları
- OpenStreetMap / Overpass: POI, attraction, restoran, kafe, hotel və landmark datası
- GeoNames: şəhər, population, koordinat və region seed datası
- TravelAZ Reviews: platformanın öz istifadəçi rəyləri

Gələcək open-data modulu mütləq source və license metadata saxlamalıdır.

Open-data mərhələsi üçün əlavə edilən cədvəllər:

- `cities`
- `places`
- `place_reviews`
- `place_review_helpful_votes`
- `place_sources`
- `external_import_logs`

## Natamam Qalanlar

`plan.md` əsasında davam etdirilməli əsas işlər:

1. **Flights real API**
   - Cari vəziyyət: `src/app/[locale]/flights/page.tsx` hələ də `mockFlights` istifadə edir.
   - Lazımdır: provider adapter layer, ilkin olaraq Amadeus Flight Offers, normalize olunmuş `FlightOffer`, API key yoxdursa empty/config state.

2. **Hotels real API**
   - Cari vəziyyət: `src/app/[locale]/hotels/page.tsx` hələ də `mockHotels` istifadə edir.
   - Lazımdır: provider adapter layer, normalize olunmuş `HotelOffer`, real availability/search, API key yoxdursa empty/config state.

3. **Cities / Places / Reviews data modeli**
   - Cari vəziyyət: `020_open_travel_data.sql`, `src/types/place.ts` və `src/lib/open-travel-data.ts` əlavə edilib.
   - Növbəti addım: migration-ı real Supabase DB-yə tətbiq edib import datasını doldurmaq.

4. **Open data import pipeline**
   - Cari vəziyyət: `scripts/import-open-travel-data.js` ilə Overpass + Wikipedia dry-run və `--apply` başlanğıcı var.
   - Lazımdır: service role key əlavə ediləndən sonra `--apply` test etmək, GeoNames city seed variantı, daha geniş city preset-ləri və periodik sync.

5. **City və place səhifələri**
   - Cari vəziyyət: country detail preview, city detail route, place detail route, review submit forması və helpful vote UI hazırdır.
   - Lazımdır: import datası DB-yə yazıldıqdan sonra real data ilə vizual yoxlama və review moderation.

6. **README yenilənməsi**
   - Cari vəziyyət: README hələ də əsasən default Next.js mətnidir.
   - Lazımdır: setup, env dəyişənləri, Supabase migration-lar, AI provider, dev workflow və deployment qeydləri.

7. **Booking/payment**
   - Cari vəziyyət: birinci real-data mərhələsindən kənardadır.
   - Sonra lazımdır: booking confirmation, payment flow, provider order API-ləri, cancellation/refund policy.

## Növbəti Tövsiyə Olunan İcra Sırası

1. Supabase-də yeni migration-ları tətbiq et: `020_open_travel_data.sql`, `021_seed_istanbul_open_data.sql` və `022_place_review_helpful_votes.sql`.
2. Importdan sonra `/az/countries/turkey`, `/az/cities/istanbul` və yaradılan `/az/places/{id}` səhifələrini vizual yoxla.
3. GeoNames city seed variantını import script-ə əlavə et.
4. Review moderation status workflow-u əlavə et.
5. Flights mock datasını provider adapter və API route ilə əvəz et.
6. Hotels mock datasını provider adapter və API route ilə əvəz et.
7. README-ni yenilə.

## Yoxlama Bazası

Hər böyük dəyişiklikdən əvvəl və sonra bunları run et:

```bash
npx tsc --noEmit
npm run lint
```

Ana səhifə və locale dəyişiklikləri üçün əlavə yoxla:

```text
http://localhost:3000/az
http://localhost:3000/en
http://localhost:3000/ru
```

Ölkə kartları və şəkil fallback dəyişiklikləri üçün yoxla:

```text
http://localhost:3000/az/countries
http://localhost:3000/az/countries/turkey
```

Open data import preview üçün yoxla:

```bash
npm run import:open-travel-data -- --city=istanbul --limit=8 --radius=2500 --dry-run
npm run import:open-travel-data -- --check-db
```

## Gələcək Agentlər Üçün Qeydlər

- User dəyişikliklərini və əlaqəsiz işləri revert etmə.
- `plan.md` cari mərhələnin roadmap source of truth faylıdır.
- Ana səhifə artıq yenilənib; növbəti mərhələdə real data və API işlərinə fokuslan.
- Open data import script default olaraq dry-run işləyir. Supabase-ə yazmaq üçün `--apply` və `.env.local` içində `SUPABASE_SERVICE_ROLE_KEY` lazımdır.
- Hazır `.env.local` yoxlamasında `SUPABASE_SERVICE_ROLE_KEY` görünmədi; ona görə cloud DB-yə yazı avtomatik edilməyib.
- Ölkə kartları artıq ölkəyə uyğun travel şəkillərini UI fallback olaraq istifadə edir. Daha təmiz həll üçün gələcəkdə Supabase `countries.cover_photo_id` dəyərlərini migration ilə backfill etmək olar.
- Layihə Tripadvisor-dan icazəsiz scraping etməməlidir. Oxşar product value açıq data və TravelAZ-a məxsus review sistemi ilə qurulmalıdır.
