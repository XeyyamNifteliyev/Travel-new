# TravelAZ — Ölkələr Modulu Proqress Hesabatı

## Hazırdır — Bütün İşlər Tamamlandı (TypeScript xətasız)

### Yeni Fayllar

| # | Fayl | Təsvir |
|---|------|--------|
| 1 | `supabase/migrations/012_countries_expand.sql` | DB migration: 26 yeni sütun + `country_highlights` cədvəli + 4 index |
| 2 | `supabase/migrations/013_countries_seed_50.sql` | 32 ölkə tam seed datası (şəkil, video, xərc, yerlər) |
| 3 | `src/lib/unsplash.ts` | `getUnsplashUrl()` — Unsplash CDN URL generator (WebP, avto-format) |
| 4 | `src/components/ui/youtube-lite.tsx` | Lite YouTube embed (thumbnail göstərir, klikdə iframe yükləyir) |
| 5 | `src/app/[locale]/countries/country-grid-client.tsx` | Ölkə siyahısı: axtarış + kontinent filtri + grid layout |
| 6 | `src/app/[locale]/countries/[slug]/country-detail-client.tsx` | Detal səhifəsi: hero şəkil, stat kartlar, xərc, aylar, yerlər, video, viza CTA, bloglar |

### Dəyişdirilmiş Fayllar

| # | Fayl | Dəyişiklik |
|---|------|-----------|
| 1 | `next.config.ts` | `images.remotePatterns`: Unsplash + ytimg əlavə, AVIF/WebP format, 24 saat cache |
| 2 | `src/types/country.ts` | `ExpandedCountry` + `CountryHighlight` interfeysləri əlavə |
| 3 | `src/components/country/country-card.tsx` | Tam redesign: Unsplash şəkil, viza badge, safety badge, xərc, aylar, hover zoom |
| 4 | `src/app/[locale]/countries/page.tsx` | Hardcoded 10 ölkə → Supabase-dən dinamik (ISR 24 saat) |
| 5 | `src/app/[locale]/countries/[slug]/page.tsx` | Hardcoded → Supabase (country + highlights + bloglar), SEO metadata |
| 6 | `src/messages/az.json` | `countries` namespace: 25+ yeni tərcümə açarı |
| 7 | `src/messages/en.json` | `countries` namespace: 25+ yeni tərcümə açarı |
| 8 | `src/messages/ru.json` | `countries` namespace: 25+ yeni tərcümə açarı |

### 32 Ölkə Seed Datası

Tam məlumat (şəkil, video, xərc, yerlər, 3 dil təsvir):

| # | Ölkə | Qitə | Populyarlik | Viza | Featured |
|---|------|------|-------------|------|----------|
| 1 | Türkiyə 🇹🇷 | Europe | #1 | Vizasız | ✅ |
| 2 | BƏƏ 🇦🇪 | Asia | #2 | Viza lazım | ✅ |
| 3 | Fransa 🇫🇷 | Europe | #3 | Viza lazım | ✅ |
| 4 | İtaliya 🇮🇹 | Europe | #4 | Viza lazım | ✅ |
| 5 | İspaniya 🇪🇸 | Europe | #5 | Viza lazım | ✅ |
| 6 | Yaponiya 🇯🇵 | Asia | #6 | Viza lazım | ✅ |
| 7 | Almaniya 🇩🇪 | Europe | #7 | Viza lazım | |
| 8 | Tailand 🇹🇭 | Asia | #8 | Viza lazım | ✅ |
| 9 | Gürcüstan 🇬🇪 | Asia | #9 | Vizasız | ✅ |
| 10 | Yunanıstan 🇬🇷 | Europe | #10 | Viza lazım | ✅ |
| 11 | İran 🇮🇷 | Asia | #11 | Vizasız | |
| 12 | Rusiya 🇷🇺 | Europe | #12 | Vizasız | |
| 13 | Niderland 🇳🇱 | Europe | #13 | Viza lazım | |
| 14 | Maldiv 🇲🇻 | Asia | #14 | Viza lazım | ✅ |
| 15 | İngiltərə 🇬🇧 | Europe | #15 | Viza lazım | |
| 16 | Portuqaliya 🇵🇹 | Europe | #16 | Viza lazım | |
| 17 | Bali 🇮🇩 | Asia | #17 | Viza lazım | ✅ |
| 18 | Kanada 🇨🇦 | Americas | #18 | Viza lazım | |
| 19 | Avstraliya 🇦🇺 | Oceania | #19 | Viza lazım | |
| 20 | Mərakeş 🇲🇦 | Africa | #20 | Viza lazım | |
| 21 | Hindistan 🇮🇳 | Asia | #21 | Viza lazım | |
| 22 | Braziliya 🇧🇷 | Americas | #22 | Viza lazım | |
| 23 | Cənubi Koreya 🇰🇷 | Asia | #23 | Viza lazım | |
| 24 | Çin 🇨🇳 | Asia | #24 | Viza lazım | |
| 25 | Sinqapur 🇸🇬 | Asia | #25 | Viza lazım | |
| 26 | İsveçrə 🇨🇭 | Europe | #26 | Viza lazım | |
| 27 | Norveç 🇳🇴 | Europe | #27 | Viza lazım | |
| 28 | İslandiya 🇮🇸 | Europe | #28 | Viza lazım | |
| 29 | Meksika 🇲🇽 | Americas | #29 | Viza lazım | |
| 30 | Çexiya 🇨🇿 | Europe | #30 | Viza lazım | |
| 31 | Avstriya 🇦🇹 | Europe | #31 | Viza lazım | |
| 32 | Yeni Zelandiya 🇳🇿 | Oceania | #32 | Viza lazım | |

### İstifadə Qaydası

1. Supabase Dashboard → SQL Editor → `012_countries_expand.sql` çalıştır
2. Sonra `013_countries_seed_50.sql` çalıştır
3. `npm run dev` → http://localhost:3000/az/countries

### Ölkə Siyahısı Səhifəsi Xüsusiyyətləri
- Supabase-dən dinamik yükləmə (ISR 24 saat cache)
- Kontinent filtri (Avropa, Asiya, Amerika, Afrika, Okeaniya)
- Axtarış (ad ilə)
- Professional kartlar: Unsplash şəkil, viza badge, safety badge, xərc, ən yaxşı aylar
- Dark/light tema dəstəyi
- Nəticə sayı göstərir

### Ölkə Detal Səhifəsi Xüsusiyyətləri
- Hero şəkil (Unsplash, gradient overlay, ölkə adı + paytaxt)
- Sürətli məlumatlar (valyuta, timezone, telefon kodu, viza)
- Ortalama xərclər (bilet, otel, gündəlik — AZN ilə)
- 12 ay təqvimi (yaxşı aylar yaşıl)
- Məşhur yerlər grid (şəkilli kartlar)
- YouTube videolar (lite embed — klikdə yüklənir)
- Viza məlumatına link (narıncı CTA)
- Əlaqəli bloglar
- Safety badge (safe/caution/warning)
