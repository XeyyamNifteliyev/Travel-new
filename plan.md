# TravelAZ Tamamlama Plani

## Xulase

TravelAZ hazirda guclu baza uzərində qurulub: Next.js 15, Supabase, coxdilli sistem, AI planner, viza, olkeler, blog, chat, turlar ve profil modullari movcuddur. Novbeti meqsed mock/demo hisseleri real travel platformasi seviyyesine qaldirmaqdir.

Bu planin esas istiqametleri:

- Ana sehifeni daha professional ve travel marketplace formatina getirmek.
- Flights ve Hotels mock datasini real API-lerle evezlemek.
- Olke, seher, attraction, restaurant, hotel ve POI melumat bazasi qurmaq.
- Tripadvisor-dan icazesiz scraping etmeden pulsuz aciq menbelerden istifade etmek.
- TravelAZ-in oz review sistemini yaratmaq.
- i18n, type-safety, README ve AGENTS.md borclarini temizlemek.

Tripadvisor content-i icazesiz kopyalanmayacaq. Evezinde Wikivoyage, Wikipedia/Wikimedia, OpenStreetMap/Overpass, GeoNames ve TravelAZ istifadeci reyleri istifade olunacaq.

## Cari Eksikler

- Ana sehife yalniz hero ve 4 hardcoded olke kartindan ibaretdir.
- Featured destinations Supabase `countries` datasindan dinamik gelmir.
- Flights sehifesi `mockFlights` ile isleyir ve real avia API-yə bagli deyil.
- Hotels sehifesi `mockHotels` ile isleyir ve real availability/booking melumati yoxdur.
- Seher, attraction, restaurant, hotel POI ve yerli review sistemi yoxdur.
- Tripadvisor tipli "yerler ve reyler" tecrubesi yoxdur.
- README hele de default Next.js mezmunundadir.
- AGENTS.md kohne migration siyahisi saxlayir ve cari repo veziyyetini tam eks etdirmir.
- Bezi UI metnleri hardcoded qalir ve `az/en/ru` tercume sistemi ile tam baglanmayib.
- Bir cox yerde `any` istifade olunur; Supabase relation neticeleri ucun typed mapper layer yoxdur.

## Ana Sehife Redesign

Ana sehife TravelAZ-in butun deyerini ilk ekranda gostermelidir: seyahat axtarisi, viza yoxlamasi, AI plan, dinamik olkeler, turlar ve community.

Planlasdirilan bolmeler:

- **Premium hero**
  - Guclu travel basligi, qisa value proposition ve esas CTA-lar: `AI plan qur`, `Viza yoxla`, `Olkeleri kesf et`.
  - Movcud `GlobeHero` daha boyuk ve premium kompozisiyada istifade olunacaq.

- **Search panel**
  - Tabs: Flights, Hotels, Visa, AI Planner.
  - Real API hazir olmayan yerde crash yox, aydin config/empty state gosterilecek.

- **Dynamic featured countries**
  - 4 hardcoded kart evezine Supabase `countries` cedvelinden 8-12 olke.
  - Kartlarda cover image, viza statusu, orta xerc, en yaxsi aylar ve CTA.

- **Popular cities**
  - Yeni `cities` cedvelinden seher kartlari.
  - Seher sehifeleri sonradan places ve reviews ile zenginlesdirilecek.

- **Top places preview**
  - Attractions, museums, restaurants, cafes, hotels ve landmarks.
  - Melumatlar oz DB-den oxunacaq; DB aciq data import pipeline ile dolacaq.

- **AI Planner spotlight**
  - Planlasdirma ve "en ucuz tarix" rejimlerini one cixaran blok.

- **Visa center preview**
  - Populyar olkeler ucun viza status kartlari.
  - 185 olke viza bazasina kecid.

- **Tours preview**
  - Supabase-den yeni ve ya featured turlar.
  - Tur sirketleri ucun qeydiyyat CTA-si.

- **Community preview**
  - Son bloglar, yoldas elanlari, videolar ve leaderboard qisa gorunusu.

- **Trust strip**
  - Real data, AI planner, viza bazasi, community reviews ve dark/light theme ustunlukleri.

## Pulsuz Data Strategiyasi

### Wikivoyage / Wikipedia / Wikimedia

- Olke ve seher travel guide melumatlari ucun istifade olunacaq.
- Uzun metnler kor-korane kopyalanmayacaq; source ve license metadata saxlanacaq.
- Lazim olan yerde qisa summary, source link ve attribution gosterilecek.

### OpenStreetMap / Overpass

Attractions ve POI datasini pulsuz toplamaq ucun esas menbe olacaq.

Istifade olunacaq tag-lar:

- `tourism=attraction`
- `tourism=museum`
- `tourism=hotel`
- `amenity=restaurant`
- `amenity=cafe`
- `historic=*`
- `tourism=viewpoint`
- `leisure=park`

Saxlanacaq melumatlar:

- ad
- kateqoriya
- lat/lng
- address
- website
- phone
- opening_hours
- source
- source_url
- last_synced_at

### GeoNames

- Seher seed datasinin baslangici ucun istifade olunacaq.
- Olke, seher, population, koordinat ve admin region melumatlari cekilecek.

### TravelAZ Reviews

- Tripadvisor reyleri kopyalanmayacaq.
- TravelAZ-in oz istifadeci rey sistemi qurulacaq.
- Istifadeciler olke, seher, attraction, hotel ve restoran ucun rey yaza bilecek.
- Rating, review text, visit date, photos ve helpful votes desteklenecek.

## Yeni Data Model

Status: `supabase/migrations/020_open_travel_data.sql` yaradildi. Bu migration asagidaki cedvelleri, esas indeksleri, RLS policy-leri ve `place_reviews` esasinda `places.rating_summary` / `places.review_count` avtomatik yenileme trigger-lerini elave edir.

Helpful votes status: `supabase/migrations/022_place_review_helpful_votes.sql` yaradildi. Bu migration `place_review_helpful_votes` cedvelini, RLS policy-lerini ve `place_reviews.helpful_count` trigger-lerini elave edir.

TypeScript status: `src/types/place.ts` ve `src/lib/open-travel-data.ts` yaradildi. DB row-lari ve UI summary/detail mapper-leri hazirdir.

### `cities`

Seher melumatlari ucun cedvel.

Esas sahələr:

- `id`
- `country_id`
- `slug`
- `name_az`
- `name_en`
- `name_ru`
- `lat`
- `lng`
- `population`
- `description_az`
- `description_en`
- `description_ru`
- `cover_photo`
- `source`
- `source_url`
- `created_at`
- `updated_at`

### `places`

Attraction, restaurant, hotel, cafe, museum ve landmark datasini saxlayacaq.

Esas sahələr:

- `id`
- `city_id`
- `country_id`
- `name`
- `category`
- `lat`
- `lng`
- `address`
- `website`
- `phone`
- `opening_hours`
- `source`
- `source_place_id`
- `source_url`
- `rating_summary`
- `review_count`
- `last_synced_at`
- `created_at`
- `updated_at`

### `place_reviews`

TravelAZ istifadecilerinin oz reyleri.

Esas sahələr:

- `id`
- `place_id`
- `user_id`
- `rating`
- `title`
- `content`
- `visit_date`
- `photos`
- `helpful_count`
- `status`
- `created_at`
- `updated_at`

### `place_review_helpful_votes`

TravelAZ review-lari ucun "faydali oldu" vote datasini saxlayir.

Esas saheler:

- `id`
- `review_id`
- `user_id`
- `created_at`

### `place_sources`

Her place ucun menbe ve attribution melumati.

Esas sahələr:

- `id`
- `place_id`
- `source`
- `source_url`
- `license`
- `attribution_text`
- `imported_at`

### `external_import_logs`

Import proseslerini izlemek ucun cedvel.

Esas sahələr:

- `id`
- `source`
- `entity_type`
- `status`
- `imported_count`
- `error`
- `started_at`
- `finished_at`

## Import Pipeline

Status: `scripts/import-open-travel-data.js` yaradildi ve `package.json`-a `npm run import:open-travel-data` komandasi elave edildi.

Ilk merhelede manual import script qurulub. Sonradan periodik sync ucun GitHub Actions elave oluna biler.

Plan:

1. GeoNames-den seher seed datasini cekmek.
2. Overpass-dan seherlere gore POI datasini import etmek.
3. Wikivoyage/Wikipedia-dan seher ve olke description/source melumatini import etmek.
4. Source/license attribution melumatini `place_sources` ve ilgili cedvellerde saxlamaq.
5. Duplicate-lərin qarsisini almaq ucun slug + koordinat yaxinligi ile merge mexanizmi qurmaq.
6. Import neticesini `external_import_logs` cedveline yazmaq.

Hazir komanda numuneleri:

```bash
npm run import:open-travel-data -- --check-db
npm run import:open-travel-data -- --city=istanbul --dry-run
npm run import:open-travel-data -- --city=istanbul --limit=8 --radius=2500 --dry-run
npm run import:open-travel-data -- --city=istanbul --sql-out=supabase/imports/istanbul_open_data.sql
npm run import:open-travel-data -- --city=istanbul --apply
```

Qeyd: `--apply` Supabase-e data yazir ve `.env.local` icinde `SUPABASE_SERVICE_ROLE_KEY` teleb edir. Default rejim `dry-run`-dir.

DB check status: `npm run import:open-travel-data -- --check-db` cədvəllərin Supabase-də mövcud olduğunu göstərir; hazırda `cities`, `places`, `place_reviews`, `place_sources`, `external_import_logs` boşdur.

SQL fallback status: `supabase/imports/istanbul_open_data.sql` yaradılıb. Service role key olmadan ilkin importu Supabase SQL Editor-də bu faylla tətbiq etmək olar.

Country detail status: `src/app/[locale]/countries/[slug]/page.tsx` artiq `cities` ve `places` datasini oxuyur, `country-detail-client.tsx` ise data varsa "Populyar seherler" ve "Aciq data yerleri" bolmelerini gosterir. Data yoxdursa sehife qirilmir.

City/place page status: `src/app/[locale]/cities/[slug]/page.tsx` ve `src/app/[locale]/places/[id]/page.tsx` yaradildi. Place detail sehifesinde source/license bloku ve TravelAZ review listesi var.

Review form status: `src/components/place/place-review-form.tsx` yaradildi. Login olmus istifadeci place ucun rating, title, content ve visit date ile rey gondere biler.

Helpful vote status: `src/components/place/place-helpful-button.tsx` yaradildi. Login olmus istifadeci review-u faydali kimi isare ede ve geri ala biler; say `place_reviews.helpful_count` ile sinxron saxlanir.

Istanbul seed status: `supabase/migrations/021_seed_istanbul_open_data.sql` yaradildi. Bu migration Istanbul ucun seher datasini ve ilk 8 OpenStreetMap place datasini seed edir.

Fix status: Supabase-de `42P10 no unique or exclusion constraint matching the ON CONFLICT specification` xetasi ucun `021_seed_istanbul_open_data.sql` ve import generatorunda partial unique index sertleri elave edildi: `where source_place_id is not null` ve `where source_id is not null`.

Qeyd: Import pipeline Tripadvisor-un pullu API-sini dolanmaq ve ya icazesiz content kopyalamaq ucun istifade olunmayacaq.

## Real API Kecid Plani

### Flights

- Flights ucun provider adapter layer yaradılacaq.
- Ilkin provider kimi Amadeus Flight Offers uygun namizeddir.
- UI provider-specific response ile yox, normalized `FlightOffer` tipi ile isleyecek.
- API key yoxdursa sehife crash etmeyecek; config/empty state gosterecek.
- `mockFlights` yalniz explicit demo mode aktiv olduqda qala biler.

### Hotels

- Hotels ucun provider adapter layer yaradılacaq.
- Ilkin provider kimi Amadeus Hotel Search ve ya uygun free-tier provider istifade oluna biler.
- UI normalized `HotelOffer` tipi ile isleyecek.
- API key yoxdursa sehife crash etmeyecek; config/empty state gosterecek.
- `mockHotels` uzunmuddetli istifade olunmayacaq.

### Places

- Places ucun aciq data provider layer yaradılacaq.
- Ilkin menbeler: OpenStreetMap/Overpass, GeoNames, Wikivoyage/Wikipedia.
- UI normalized `PlaceSummary` ve `PlaceDetail` tipləri ile isleyecek.

## Prioritet Sirasi

1. DONE: `plan.md` faylini yaratmaq.
2. DONE: Ana sehifeni professional redesign etmek.
3. DONE: Featured countries-i Supabase-den dinamik etmek.
4. DONE: `cities`, `places`, `place_reviews`, `place_sources`, `external_import_logs` migration-larini elave etmek.
5. DONE: City/place/review TypeScript type-lari ve mapper layer elave etmek.
6. PARTIAL: OpenStreetMap/Wikipedia import pipeline qurmaq.
7. PARTIAL: Olke detail sehifesinde cities/places preview bolmelerini gostermek.
8. PARTIAL: `--check-db` ve `--sql-out` workflow elave etmek.
9. DONE: Istanbul open-data seed migration-i elave etmek.
10. `SUPABASE_SERVICE_ROLE_KEY` elave edilende `--apply` importunu kicik city batch ile yoxlamaq.
11. PARTIAL: Ayrica city ve place detail sehifelerini qurmaq.
12. DONE: TravelAZ review submit/read UI elave etmek.
13. GeoNames city seed variantini elave etmek.
14. PARTIAL: Review helpful votes migration/UI elave etmek; moderation novbeti addimdir.
15. Flights mock datasini real API adapteri ile evezlemek.
16. Hotels mock datasini real API adapteri ile evezlemek.
17. DONE: i18n hardcoded metnlerini temizlemek (~200+ metn messages/*.json fayllarina çıxarıldı).
18. DONE: README ve AGENTS.md fayllarini cari veziyyete uygun yenilemek.
19. DONE: En riskli `any` istifadelerini typed DTO/mappers ile azaltmaq (55 `any` → 0).

## Test Plani

Her esas merheleden sonra:

- `npx tsc --noEmit`
- `npm run lint`
- Ana sehife `az`, `en`, `ru` locale-larinda yoxlanacaq.
- API key olmayan halda Flights/Hotels/Places sehifeleri qirilmamalidir.
- Supabase bos data qaytaranda sehifeler normal empty state gostermelidir.
- Import script duplicate yaratmamalidir.
- Import script `dry-run` rejimde DB-ye yazmamali, `--apply` rejimde `external_import_logs` yazmalidir.
- `--check-db` cədvəlləri yoxlamalı, amma data yazmamalıdır.
- `--sql-out` SQL faylı yaratmalıdır və generated SQL idempotent olmalıdır.
- Source attribution gorunmelidir.
- Review helpful vote login teleb etmeli ve tekrar klikde vote-u geri almalıdır.
- Review sistemi auth teleb etmelidir.
- Mobile ve desktop viewport-larda ana sehife vizual yoxlanmalidir.
- `http://localhost:3000/az/countries/turkey` 200 qaytarmalidir.
- Importdan sonra `/az/cities/istanbul` ve `/az/places/{id}` sehifeleri real data ile yoxlanmalidir.
- `supabase/migrations/021_seed_istanbul_open_data.sql` migration siyahisinda gorunmelidir.
- Login olmus user place review formundan rey gondere bilmelidir.

## Assumptions

- Tripadvisor content-i icazesiz scraping ve ya review kopyalama ile istifade olunmayacaq.
- Aciq menbelerden gelen data source/license metadata ile saxlanacaq.
- Ilk hedef real content ve real search-dir; payment/booking ayrica merhelede planlanacaq.
- Ana sehife travel marketplace, AI planner ve community hisslerini birlesdiren professional tecrube olacaq.
- Mock data yalniz development/demo mode ucun qalacaq, normal product flow-da real API ve real DB esas olacaq.
