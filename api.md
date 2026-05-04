# TravelAZ — API Bələdçisi

> Yalnız pulsuz / freemium API-lər. Hər biri üçün qeydiyyat linki, hansı endpoint lazımdır, komissiya faizi və `.env.local`-a nə yazılacağı göstərilib.

---

## Mündəricat

1. [Hava — Open-Meteo](#1-hava--open-meteo)
2. [Xəritə & POI — OpenStreetMap / Overpass](#2-xəritə--poi--openstreetmap--overpass)
3. [Uçuşlar — Amadeus for Developers](#3-uçuşlar--amadeus-for-developers)
4. [Otellər — Amadeus Hotel Search](#4-otellər--amadeus-hotel-search)
5. [Otellər (affiliate) — Booking.com](#5-otellər-affiliate--bookingcom)
6. [Uçuşlar (affiliate) — Skyscanner](#6-uçuşlar-affiliate--skyscanner)
7. [Turlar & Aktivliklər — Viator Affiliate](#7-turlar--aktivliklər--viator-affiliate)
8. [Viza Məlumatı — VisaList açıq data](#8-viza-məlumatı--visalist-açıq-data)
9. [Ölkə / Pasport məlumatı — RestCountries](#9-ölkə--pasport-məlumatı--restcountries)
10. [Şəkillər — Unsplash](#10-şəkillər--unsplash)

---

## 1. Hava — Open-Meteo

**Sayt:** https://open-meteo.com  
**Qeydiyyat:** Tələb etmir — API key yoxdur  
**Pulsuz limit:** Limitsiz (qeyri-kommersial)  
**Komissiya:** Yoxdur (direct data)

### Niyə seç

- Heç bir key, heç bir qeydiyyat — birbaşa `fetch` et
- 7-16 günlük proqnoz, tarixi data, saatlıq breakdown
- TravelAZ-ın ölkə/şəhər səhifələrində dərhal istifadə oluna bilər

### Qeydiyyat addımları

1. https://open-meteo.com/en/docs — sənədləri oxu
2. Heç bir addım yoxdur. API açıqdır.

### `.env.local`

```env
# Open-Meteo key tələb etmir, heç nə əlavə etmə
```

### İstifadə olunan endpoint-lər

```
GET https://api.open-meteo.com/v1/forecast
  ?latitude={LAT}
  &longitude={LON}
  &daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode
  &current_weather=true
  &timezone=auto
  &forecast_days=7
```

### Nümunə — Next.js route handler

```ts
// src/app/api/weather/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&current_weather=true&timezone=auto&forecast_days=7`
  );
  const data = await res.json();
  return Response.json(data);
}
```

### Response strukturu (sadələşdirilmiş)

```json
{
  "current_weather": {
    "temperature": 24.5,
    "windspeed": 12.3,
    "weathercode": 1
  },
  "daily": {
    "time": ["2026-05-04", "2026-05-05"],
    "temperature_2m_max": [27, 25],
    "temperature_2m_min": [18, 17],
    "weathercode": [1, 3]
  }
}
```

**Weathercode cədvəli:** https://open-meteo.com/en/docs#weathervariables

---

## 2. Xəritə & POI — OpenStreetMap / Overpass

**Sayt:** https://overpass-api.de  
**Qeydiyyat:** Tələb etmir  
**Pulsuz limit:** Limitsiz (fair use)  
**Komissiya:** Yoxdur (açıq data)

### Niyə seç

- TravelAZ-da artıq mövcuddur (`scripts/import-open-travel-data.js`)
- Restoran, otel, attraksiya, park — hər şey var
- Leaflet ilə tam uyğun

### Qeydiyyat addımları

1. Heç bir qeydiyyat yoxdur
2. https://overpass-turbo.eu — sorğularını test et
3. TravelAZ-da mövcud script ilə birbaşa import et:

```bash
npm run import:open-travel-data -- --city=istanbul --dry-run
npm run import:open-travel-data -- --city=istanbul --apply
```

### `.env.local`

```env
# Key tələb etmir
OVERPASS_API_URL=https://overpass-api.de/api/interpreter
```

### Nümunə Overpass sorğusu (Bakı restoran)

```
[out:json][timeout:25];
(
  node["amenity"="restaurant"](40.35,49.75,40.45,49.95);
  node["tourism"="attraction"](40.35,49.75,40.45,49.95);
);
out body;
```

### Nominatim (yer axtarışı üçün)

```
GET https://nominatim.openstreetmap.org/search
  ?q=Baku+Azerbaijan
  &format=json
  &addressdetails=1
  &limit=5

# Header əlavə et:
User-Agent: TravelAZ/1.0 (your@email.com)
```

---

## 3. Uçuşlar — Amadeus for Developers

**Sayt:** https://developers.amadeus.com  
**Qeydiyyat:** Tələb edir (pulsuz)  
**Pulsuz limit:** Sandbox — limitsiz test, Production — pay-as-you-go  
**Komissiya:** Birbaşa booking yoxdur — affiliate/redirect modeli

### Niyə seç

- Sandbox tam pulsuz, real GDS data ilə eyni struktur
- `flights/page.tsx`-də mock datanı əvəz edir
- Node.js SDK var, amma TravelAZ-ın fetch-based AI provider stili ilə də işləyir

### Qeydiyyat addımları

1. https://developers.amadeus.com/register — qeydiyyat
2. Email təsdiqindən keç
3. Dashboard → "Create New App"
4. App adı: `TravelAZ`, kateqoriya: `Travel`
5. **API key** və **API secret** al
6. Sandbox aktivdir — heç bir əlavə approval lazım deyil
7. Production üçün: Dashboard → "Move to Production" → biz hesabı yoxlayırlar (1-3 iş günü)

### `.env.local`

```env
AMADEUS_API_KEY=your_api_key_here
AMADEUS_API_SECRET=your_api_secret_here
AMADEUS_BASE_URL=https://test.api.amadeus.com   # sandbox
# AMADEUS_BASE_URL=https://api.amadeus.com      # production
```

### Auth — access token al

```ts
// src/lib/amadeus/auth.ts
export async function getAmadeusToken(): Promise<string> {
  const res = await fetch(`${process.env.AMADEUS_BASE_URL}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.AMADEUS_API_KEY!,
      client_secret: process.env.AMADEUS_API_SECRET!,
    }),
  });
  const data = await res.json();
  return data.access_token; // 30 dəqiqə etibarlıdır
}
```

### Flight axtarış endpoint-i

```
POST /v2/shopping/flight-offers

Body:
{
  "originLocationCode": "GYD",       // Heydər Əliyev
  "destinationLocationCode": "IST",
  "departureDate": "2026-06-15",
  "adults": 1,
  "max": 10,
  "currencyCode": "USD"
}
```

### Route handler nümunəsi

```ts
// src/app/api/flights/route.ts
import { getAmadeusToken } from "@/lib/amadeus/auth";

export async function POST(req: Request) {
  const body = await req.json();
  const token = await getAmadeusToken();

  const res = await fetch(
    `${process.env.AMADEUS_BASE_URL}/v2/shopping/flight-offers`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        originLocationCode: body.from,
        destinationLocationCode: body.to,
        departureDate: body.date,
        adults: body.adults ?? 1,
        max: 10,
        currencyCode: "USD",
      }),
    }
  );

  const data = await res.json();
  return Response.json(data);
}
```

### Faydalı endpoint-lər

| Endpoint | Məqsəd |
|---|---|
| `GET /v1/reference-data/locations?keyword=BAK` | Hava limanı axtarışı |
| `POST /v2/shopping/flight-offers` | Uçuş axtarışı |
| `GET /v1/shopping/flight-dates?origin=GYD&destination=IST` | Ən ucuz tarix |
| `POST /v1/shopping/flight-offers/pricing` | Qiymət yoxlama |

---

## 4. Otellər — Amadeus Hotel Search

**Sayt:** https://developers.amadeus.com (eyni hesab)  
**Qeydiyyat:** Amadeus hesabı — yuxarıda artıq açılıb  
**Pulsuz limit:** Sandbox pulsuz  
**Komissiya:** Yoxdur (axtarış only, booking redirect)

### Endpoint-lər

```
# 1. Şəhərdə otellər
GET /v1/reference-data/locations/hotels/by-city
  ?cityCode=BAK
  &radius=20
  &radiusUnit=KM
  &hotelSource=ALL

# 2. Müsaid otellər (qiymətlər)
GET /v3/shopping/hotel-offers
  ?hotelIds=BKBAKMON
  &checkInDate=2026-06-15
  &checkOutDate=2026-06-18
  &adults=2
  &currency=USD
```

### Route handler nümunəsi

```ts
// src/app/api/hotels/route.ts
import { getAmadeusToken } from "@/lib/amadeus/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = await getAmadeusToken();

  // Addım 1: Şəhərdə otellər
  const hotelsRes = await fetch(
    `${process.env.AMADEUS_BASE_URL}/v1/reference-data/locations/hotels/by-city?cityCode=${searchParams.get("city")}&radius=20&radiusUnit=KM`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const hotels = await hotelsRes.json();
  return Response.json(hotels);
}
```

---

## 5. Otellər (affiliate) — Booking.com

**Sayt:** https://www.booking.com/affiliate-program  
**Qeydiyyat:** Tələb edir (pulsuz, tez qəbul)  
**Pulsuz limit:** Pulsuz qeydiyyat  
**Komissiya:** Booking başına **4-6%** (Booking.com ödəyir)

### Niyə seç

- Azərbaycanda coverage Amadeus-dan çox yaxşıdır
- Booking başına komissiya — passiv gəlir
- Qeydiyyat 1-2 gündə qəbul olunur

### Qeydiyyat addımları

1. https://www.booking.com/affiliate-program/sign-up.html
2. Sayt URL-ni daxil et: `https://travelaz.az`
3. Trafik mənbəyini seç: "Website"
4. Email-ə qəbul məktubu gəlir (24-48 saat)
5. Dashboard-da **Affiliate ID** alırsın
6. **Deep Link** generatoru istifadə et — hər otel üçün ayrı link yarat

### `.env.local`

```env
BOOKING_AFFILIATE_ID=your_affiliate_id_here
```

### Deep Link formatı

```
https://www.booking.com/hotel/az/park-inn-by-radisson-baku.html
  ?aid={BOOKING_AFFILIATE_ID}
  &checkin=2026-06-15
  &checkout=2026-06-18
  &group_adults=2
```

### Search widget alternativ

Booking.com-un hazır search widget-ini sayta embed edə bilərsən:

```html
<!-- Booking.com search box widget -->
<script>
  (function(d, sc, u) {
    var s = d.createElement(sc), p = d.getElementsByTagName(sc)[0];
    s.type = 'text/javascript';
    s.async = true;
    s.src = u + '?v=' + (+new Date());
    p.parentNode.insertBefore(s,p);
  })(document, 'script',
  '//aff.bstatic.com/static/affiliate_base/js/flexiproduct.js');
</script>
<div id="booking_searchbox">
  <form action="//www.booking.com/searchresults.html" method="get">
    <input type="hidden" name="aid" value="{AFFILIATE_ID}">
    <input type="text" name="ss" placeholder="Şəhər və ya otel">
    <input type="date" name="checkin_year_month_day">
    <input type="date" name="checkout_year_month_day">
    <button type="submit">Axtar</button>
  </form>
</div>
```

### Komissiya necə işləyir

```
İstifadəçi TravelAZ-dan Booking.com-a keçir
→ Booking.com affiliate cookie saxlayır (30 gün)
→ İstifadəçi rezervasiya edir
→ Booking.com sənə 4-6% ödəyir
→ Aylıq hesabat + bank köçürməsi
```

---

## 6. Uçuşlar (affiliate) — Skyscanner

**Sayt:** https://www.partners.skyscanner.net  
**Qeydiyyat:** Tələb edir (partner qəbulu 3-7 gün)  
**Pulsuz limit:** Pulsuz  
**Komissiya:** Booking başına **~50-70% revenue share** (aviakompaniyadan)

### Niyə seç

- Tanınan brand — istifadəçi etibarı yüksəkdir
- Revenue share modeli — Skyscanner aviaşirkətdən aldığı komissiyanın yarısını sənə verir
- Widget embed — öz saytında Skyscanner axtarış qutusu

### Qeydiyyat addımları

1. https://www.partners.skyscanner.net/affiliates/travel-apis — müraciət forması
2. Sayt məlumatları: URL, aylıq trafik, hədəf bazar
3. Qəbul məktubunu gözlə (3-7 iş günü)
4. Partner dashboard-da **Partner ID** və **API key** al

### `.env.local`

```env
SKYSCANNER_PARTNER_ID=your_partner_id
SKYSCANNER_API_KEY=your_api_key
```

### Widget embed (API olmadan da işləyir)

```html
<!-- Skyscanner search widget — affiliate link ilə -->
<script src="https://widgets.skyscanner.net/widget-server/js/loader.js" async></script>
<div
  data-skyscanner-widget="SearchWidget"
  data-locale="az-AZ"
  data-origin-iata="GYD"
  data-partner-id="{PARTNER_ID}"
></div>
```

### Flight axtarış API (partner qəbulundan sonra)

```
GET https://partners.api.skyscanner.net/apiservices/v3/flights/live/search/create
  Headers:
    x-api-key: {API_KEY}
  Body:
    {
      "query": {
        "market": "AZ",
        "locale": "az-AZ",
        "currency": "USD",
        "queryLegs": [{
          "originPlaceId": { "iata": "GYD" },
          "destinationPlaceId": { "iata": "IST" },
          "date": { "year": 2026, "month": 6, "day": 15 }
        }],
        "adults": 1,
        "cabinClass": "CABIN_CLASS_ECONOMY"
      }
    }
```

---

## 7. Turlar & Aktivliklər — Viator Affiliate

**Sayt:** https://www.viator.com/partner  
**Qeydiyyat:** Tələb edir (pulsuz, 1-3 gün)  
**Pulsuz limit:** Pulsuz  
**Komissiya:** Booking başına **8%** (Viator ödəyir)

### Niyə seç

- 300,000+ tour və aktivlik, 190+ ölkə
- Azərbaycanda da məzmun mövcuddur
- TravelAZ-ın mövcud `tours` cədvəli ilə paralel işlədə bilərsən

### Qeydiyyat addımları

1. https://www.viator.com/partner — "Become a Partner" düyməsi
2. Sayt məlumatları daxil et
3. Email-ə qəbul məktubu (24-72 saat)
4. Partner dashboard-da **API key** və **Campaign ID** al
5. https://partnerresources.viator.com — tam sənədlər

### `.env.local`

```env
VIATOR_API_KEY=your_api_key_here
VIATOR_CAMPAIGN_ID=your_campaign_id
```

### Əsas endpoint-lər

```
Base URL: https://api.viator.com/partner

# Şəhərə görə turlar
GET /v1/search/products
  ?destinationId=684        # Bakı destination ID
  &count=20
  &sortOrder=PRICE_FROM_LOW_TO_HIGH
  Headers:
    exp-api-key: {API_KEY}

# Destinasiya ID axtar
GET /v1/taxonomy/destinations
  ?destType=CITY&countryId=AZ

# Tur detalı
GET /v1/product/{productCode}
```

### Nümunə route handler

```ts
// src/app/api/tours/viator/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const res = await fetch(
    `https://api.viator.com/partner/v1/search/products?destinationId=${searchParams.get("destId")}&count=20`,
    {
      headers: {
        "exp-api-key": process.env.VIATOR_API_KEY!,
        "Accept-Language": "az",
      },
    }
  );

  const data = await res.json();
  return Response.json(data);
}
```

### Affiliate link formatı

```
https://www.viator.com/tours/{productCode}
  ?pid={CAMPAIGN_ID}
  &mcid=42383
  &medium=api
```

### Komissiya necə işləyir

```
İstifadəçi TravelAZ-dan Viator-a keçir
→ Viator cookie saxlayır (30 gün)
→ İstifadəçi tur satın alır
→ Viator sənə 8% ödəyir
→ Aylıq ödəniş (minimum $50 çatdıqda)
```

---

## 8. Viza Məlumatı — VisaList açıq data

**Sayt:** https://github.com/nickypangers/passport-visa-api  
**Qeydiyyat:** Tələb etmir  
**Pulsuz limit:** Limitsiz  
**Komissiya:** Yoxdur (data)

### Niyə seç

- TravelAZ-ın mövcud Wikipedia scraper-ini tamamlayır
- Pasport + ölkə cütlüyü üzrə viza tələbi
- JSON formatında, birbaşa DB-yə import olunur

### `.env.local`

```env
# Key yoxdur
VISA_API_URL=https://rough-sun-2523.fly.dev
```

### Endpoint

```
GET https://rough-sun-2523.fly.dev/{pasport_ölkə_kodu}/{hədəf_ölkə_kodu}

# Nümunə: Azərbaycan pasportu ilə Türkiyəyə
GET https://rough-sun-2523.fly.dev/AZ/TR

# Response:
{
  "passport": "AZ",
  "destination": "TR",
  "dur": "visa free",
  "note": "90 days"
}
```

### Bütün ölkə cütlüklərini çək

```ts
// src/lib/visa/visalist.ts
export async function getVisaRequirement(passport: string, destination: string) {
  const res = await fetch(
    `${process.env.VISA_API_URL}/${passport}/${destination}`
  );
  if (!res.ok) return null;
  return res.json();
}
```

---

## 9. Ölkə / Pasport məlumatı — RestCountries

**Sayt:** https://restcountries.com  
**Qeydiyyat:** Tələb etmir  
**Pulsuz limit:** Limitsiz  
**Komissiya:** Yoxdur

### Niyə seç

- Ölkə adları, bayraq emoji, valyuta, əhali, koordinat
- TravelAZ-ın `countries` cədvəlini seed etmək üçün ideal

### Endpoint-lər

```
# Bütün ölkələr
GET https://restcountries.com/v3.1/all
  ?fields=name,cca2,cca3,flag,flags,capital,region,population,latlng,currencies

# Ölkə adı ilə
GET https://restcountries.com/v3.1/name/azerbaijan

# Kod ilə
GET https://restcountries.com/v3.1/alpha/AZ
```

### Response nümunəsi

```json
{
  "name": { "common": "Azerbaijan", "official": "Republic of Azerbaijan" },
  "cca2": "AZ",
  "flag": "🇦🇿",
  "flags": { "png": "https://flagcdn.com/w320/az.png" },
  "capital": ["Baku"],
  "region": "Asia",
  "population": 10139177,
  "latlng": [40.5, 47.5],
  "currencies": { "AZN": { "name": "Azerbaijani manat", "symbol": "₼" } }
}
```

---

## 10. Şəkillər — Unsplash

**Sayt:** https://unsplash.com/developers  
**Qeydiyyat:** Tələb edir (pulsuz)  
**Pulsuz limit:** 50 sorğu/saat (demo), 5000/saat (production)  
**Komissiya:** Yoxdur

### Niyə seç

- TravelAZ-da artıq `src/lib/unsplash.ts` mövcuddur
- Ölkə / şəhər / attraksiya şəkilləri

### Qeydiyyat addımları

1. https://unsplash.com/join — hesab aç
2. https://unsplash.com/oauth/applications/new — yeni app yarat
3. App adı: `TravelAZ`, URL: sayt ünvanı
4. **Access Key** al
5. Production approval üçün: 50+ request log olunandan sonra "Apply for production" düyməsi aktivləşir

### `.env.local`

```env
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_access_key_here
```

### Endpoint

```
GET https://api.unsplash.com/search/photos
  ?query=baku+azerbaijan
  &per_page=9
  &orientation=landscape
  Headers:
    Authorization: Client-ID {ACCESS_KEY}
```

---

## Ümumi `.env.local` şablonu

```env
# === HAVA ===
# Open-Meteo — key lazım deyil

# === XƏRİTƏ ===
OVERPASS_API_URL=https://overpass-api.de/api/interpreter

# === UÇUŞLAR — Amadeus ===
AMADEUS_API_KEY=
AMADEUS_API_SECRET=
AMADEUS_BASE_URL=https://test.api.amadeus.com

# === OTELLƏR — Booking.com Affiliate ===
BOOKING_AFFILIATE_ID=

# === UÇUŞLAR — Skyscanner Affiliate ===
SKYSCANNER_PARTNER_ID=
SKYSCANNER_API_KEY=

# === TURLAR — Viator Affiliate ===
VIATOR_API_KEY=
VIATOR_CAMPAIGN_ID=

# === VİZA ===
VISA_API_URL=https://rough-sun-2523.fly.dev

# === ŞƏKİLLƏR — Unsplash ===
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=
```

---

## Komissiya xülasəsi

| API | Model | Faiz | Ödəniş |
|---|---|---|---|
| Booking.com | Tamamlanan rezervasiya | **4-6%** | Aylıq |
| Skyscanner | Revenue share | **~50-70%** Skyscanner payından | Aylıq |
| Viator | Tamamlanan tur | **8%** | Aylıq ($50 min) |
| Amadeus | Yoxdur (data API) | — | — |
| Open-Meteo | Yoxdur | — | — |
| OSM/Overpass | Yoxdur | — | — |
| VisaList | Yoxdur | — | — |
| RestCountries | Yoxdur | — | — |
| Unsplash | Yoxdur | — | — |

---

## Başlama sırası

```
Həftə 1:
  ✓ Open-Meteo    → hava bölməsi canlı (key yoxdur)
  ✓ OSM/Overpass  → cities/places real data
  ✓ RestCountries → countries seed data

Həftə 2:
  ✓ Amadeus qeydiyyat → flight + hotel sandbox
  ✓ Unsplash qeydiyyat → şəkil API

Həftə 3:
  ✓ Booking.com affiliate müraciəti
  ✓ Viator affiliate müraciəti

Həftə 4+:
  ✓ Skyscanner partner müraciəti
  ✓ Affiliate linklər sayta inteqrasiya
  ✓ Komissiya tracking quraşdır
```

---

## İnteqrasiya Statusu

| API | Status | Tarix | Qeyd |
|-----|--------|-------|------|
| Open-Meteo | ✅ İnteqrasiya edildi | 2026-05-04 | `/api/weather` route, weather-widget komponenti, ölkə+şəhər səhifələrində |
| OSM/Overpass | ✅ İnteqrasiya edildi | 2026-05-03 | `scripts/import-open-travel-data.js` ilə import pipeline |
| RestCountries | ✅ İnteqrasiya edildi | 2026-05-04 | `/api/countries/[code]` route, country-info-card komponenti, ölkə səhifəsində |
| VisaList | ✅ İnteqrasiya edildi | 2026-05-04 | `/api/visa/check` route, visa-check-widget komponenti, viza+ölkə+şəhər səhifələrində |
| Amadeus Uçuşlar | ⏳ Gözləmədə | — | API key lazımdır, sandbox pulsuz |
| Amadeus Otellər | ⏳ Gözləmədə | — | Eyni Amadeus hesabı |
| Booking.com Affiliate | ⏳ Gözləmədə | — | Domen + qeydiyyat lazımdır |
| Skyscanner Affiliate | ⏳ Gözləmədə | — | Partner qəbulu 3-7 gün |
| Viator Affiliate | ⏳ Gözləmədə | — | Domen + qeydiyyat lazımdır |
| Unsplash | 🟤 Qismən inteqrasiya | 2026-05-03 | `src/lib/unsplash.ts` CDN helper mövcuddur, API axtarışı hələ yoxdur |

---

*Son yenilənmə: May 2026 — TravelAZ Next.js 15 layihəsi üçün hazırlanmışdır.*
