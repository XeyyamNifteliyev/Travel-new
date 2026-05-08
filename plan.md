# TravelAZ Cari Planı

## Xülasə

TravelAZ artıq mock/demo mərhələsindən real travel platformasına keçib. Flights və Hotels Duffel API ilə işləyir, ölkə/şəhər/yer data modeli Supabase-də var, open-data import pipeline qurulub, review moderation əlavə edilib və ana səhifə real countries/cities/places datasına bağlanır.

Tripadvisor content-i icazəsiz scrape və ya copy edilməyəcək. Product value açıq data, real API-lər və TravelAZ-in öz community review sistemi ilə qurulacaq.

## 2026-05-07 Status

- `country_highlights` 10 əsas istiqamət üçün seed edildi: `turkey`, `dubai`, `france`, `italy`, `georgia`, `bali`, `japan`, `thailand`, `greece`, `maldives`.
- Seed idempotentdir: eyni ölkələr üçün əvvəlki highlight-lar silinir, sonra yeni payload yazılır.
- `scripts/seed-country-highlights.js` və `npm run seed:country-highlights` əlavə edildi.
- `scripts/enrich-images.js` artıq `--type=cities` və `--limit=20` formatını da dəstəkləyir.
- 20 şəhər Unsplash ilə zənginləşdirildi; Supabase-də bütün 26 şəhərin `cover_photo_id` sahəsi doludur.
- 25 ölkəlik Unsplash batch işlədi; 21 ölkə real şəkil aldı, 4 ölkə üçün nəticə tapılmadı.
- Şəkil fallback sistemi düzəldildi: qısa Unsplash API ID-ləri və məlum 404 ID-lər artıq sınıq şəkil göstərmir.
- `--repair-invalid` rejimi əlavə edildi və ilk 15 ölkə problemli ID-dən tam `images.unsplash.com` URL-ə repair edildi.
- Ana səhifədə hardcoded şəhər kartları DB-dən gələn `cities` datası ilə əvəz edildi.
- Ana səhifədə real `places` preview əlavə edildi.
- Restoran/kafe üçün ayrıca Overpass import pipeline əlavə edildi və ilk batch-də 10 məşhur şəhər zənginləşdirildi.
- `/restaurants` səhifəsində şəhər filter-i yalnız restoran/kafe datası olan şəhərləri göstərir və bütün yeni mətnlər `az/en/ru` JSON-larına bağlandı.
- Ölkə detal səhifəsindəki “Populyar şəhərlər” kartları şəkilli edildi və hər kart öz şəhər detal səhifəsinə yönləndirir.
- Şəhər detalındakı görməli yer/restoran kartları şəkilli edildi; kartlar TravelAZ place detail-ə, rəsmi sayt varsa ayrıca external linkə yönləndirir.
- Place detail səhifələrində generik fallback abzasları çıxarıldı; description yalnız real/curated məlumat varsa göstərilir, boş olanda isə metadata/source/fakt kartları qalır.
- İstanbul üçün 10 əsas məkanın real curated description-ları DB-yə yazıldı. Ümumi aktiv məkan sayı 2076-dır; description doluluğu növbəti mərhələdə şəhər-şəhər artırılmalıdır.
- `scripts/enrich-place-images.js` məkan adı ilə şəkil axtaran pipeline-a çevrildi. İstanbulda 13 aktiv məkandan 11-i artıq unikal `cover_photo_url` aldı; növbəti şəhərlər eyni əmrlə batch-batch işlənməlidir.
- `scripts/audit-place-content.js` əlavə edildi və bütün active `places` coverage-i səhifələmə ilə yoxlayır.
- `scripts/enrich-place-descriptions.js` genişləndirildi: Wikipedia summary tapır, tapılmayanda OSM/DB faktlarından `az/en/ru` SEO uyğun praktik description qurur.
- 2026-05-08: active məkan description coverage `2076/2076` oldu. Paris, Roma, Dubai, London, Barselona və Tbilisi ayrıca apply edildi; qalanlar factual batch-lərlə dolduruldu.
- Paris üçün 20 görməli yer image batch-i işlədildi: 13 yeni place-specific şəkil yazıldı, 2 duplicate bloklandı, 5 məkan manual review üçün qaldı.
- Image işi şəhər nümunələri ilə məhdud deyil: global `enrich-place-images` batch başladıldı və image coverage `401/2076` oldu. Script `--offset` dəstəkləyir və zəif Unsplash nəticələrini yazmır.
- Növbəti image mərhələsi: bütün şəhərlər üçün 80-lik `--offset` batch-lər + tapılmayan məkanların manual/Wikimedia review-u.

Cari DB snapshot:

| Cədvəl | Say |
| --- | ---: |
| `countries` | 189 |
| `cities` | 26 |
| `places` | 1713 |
| `country_highlights` | 43 |
| `place_reviews` | 0 |
| `place_sources` | 1635 |
| `external_import_logs` | 41 |
| `countries.cover_photo_id IS NOT NULL` | 77 |
| `cities.cover_photo_id IS NOT NULL` | 26 |

## Tamamlanan Əsas İşlər

- Ana səhifə professional marketplace görünüşünə keçirildi.
- Featured countries Supabase-dən gəlir.
- Popular cities artıq DB əsaslıdır.
- Top places preview real `places` datasından oxunur.
- Flights mock data Duffel Flight API ilə əvəz edildi.
- Hotels mock data Duffel Stays API ilə əvəz edildi.
- `cities`, `places`, `place_reviews`, `place_sources`, `external_import_logs` data modeli əlavə edildi.
- Istanbul və 20 əlavə şəhər open-data import edildi.
- Review moderation workflow-u əlavə edildi.
- Viza widget Supabase `visa_info` fallback ilə düzəldildi.
- AI route auth, enrich admin gate və middleware public paths düzəldildi.
- i18n və type cleanup tamamlandı.

## Növbəti Prioritetlər

1. Qalan ölkə şəkillərini Unsplash rate limitə görə batch-batch doldur:

```bash
npm run enrich:images -- --type=countries --limit=50 --apply
```

2. `country_highlights` əhatəsini 10 ölkədən 30+ ölkəyə genişləndir.

3. Restoran/kafe datasını qalan məşhur şəhərlərə mərhələli yay:

```bash
npm run audit:food-places
npm run import:food-places -- --limit=10 --city-limit=10 --apply
```

   - Hər batch-dən sonra `/az/restaurants`, `/en/restaurants`, `/ru/restaurants` səhifələrində city filter və category label-ləri yoxla.

4. `places` datasında `is_featured` və `popular_rank` kurasiyası et ki, ana səhifədə və şəhər səhifələrində ən yaxşı məkanlar birinci görünsün.

5. TravelAZ review sistemini canlı istifadəyə hazırla:
   - review yazmağa CTA-ları gücləndir;
   - empty review state-ləri daha aydın et;
   - admin moderation workflow-u real admin hesabları ilə yoxla.

6. Production visual QA:
   - desktop və mobile ana səhifə;
   - `/az/countries`;
   - `/az/countries/turkey`;
   - `/az/cities`;
   - `/az/cities/istanbul`;
   - `/az/places/[id]`.

7. Booking/payment mərhələsi üçün ayrıca plan hazırla.

## Açıq Data Strategiyası

- Wikipedia/Wikivoyage: qısa description və source metadata.
- OpenStreetMap/Overpass: attraction, museum, restaurant, cafe, hotel, landmark, viewpoint.
- GeoNames: şəhər, population, koordinat və region seed.
- Unsplash: cover photo enrichment.
- TravelAZ Reviews: platformanın öz review datası.

Hər import source/license metadata saxlamalıdır. İcazəsiz Tripadvisor scraping edilməməlidir.

## Test Planı

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

## Assumptions

- Supabase key-ləri `.env.local`-da var.
- Unsplash demo tier saatlıq limitə görə ölkə şəkilləri mərhələli doldurulur.
- Booking/payment indiki mərhələyə daxil deyil.
- Tripadvisor datası icazəsiz istifadə olunmayacaq.
