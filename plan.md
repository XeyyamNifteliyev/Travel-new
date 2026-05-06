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

Cari DB snapshot:

| Cədvəl | Say |
| --- | ---: |
| `countries` | 189 |
| `cities` | 26 |
| `places` | 1593 |
| `country_highlights` | 43 |
| `place_reviews` | 0 |
| `place_sources` | 1515 |
| `external_import_logs` | 29 |
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

3. `places` datasında `is_featured` və `popular_rank` kurasiyası et ki, ana səhifədə və şəhər səhifələrində ən yaxşı məkanlar birinci görünsün.

4. TravelAZ review sistemini canlı istifadəyə hazırla:
   - review yazmağa CTA-ları gücləndir;
   - empty review state-ləri daha aydın et;
   - admin moderation workflow-u real admin hesabları ilə yoxla.

5. Production visual QA:
   - desktop və mobile ana səhifə;
   - `/az/countries`;
   - `/az/countries/turkey`;
   - `/az/cities`;
   - `/az/cities/istanbul`;
   - `/az/places/[id]`.

6. Booking/payment mərhələsi üçün ayrıca plan hazırla.

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
