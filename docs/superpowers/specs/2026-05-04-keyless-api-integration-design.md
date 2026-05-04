# Key-siz API Inteqrasiyası — Design Spec

**Tarix:** 2026-05-04
**Status:** Tamamlandı

## Xülasə

TravelAZ-a 3 key-siz API inteqrasiya edildi: Open-Meteo (hava), RestCountries (ölkə info), VisaList (viza yoxlama). Heç biri üçün API key və ya domen tələb olunmur.

## Arxitektura

Hər API üçün eyni pattern:
1. `src/lib/` — TypeScript interfeyslər + normalize mapper
2. `src/app/api/` — Server-side proxy route (cache headers ilə)
3. `src/components/` — Client widget komponenti (i18n + loading/error state)

## 1. Open-Meteo — Hava Proqnozu

### Fayllar

| Fayl | Məqsəd |
|------|--------|
| `src/lib/weather.ts` | `WeatherCurrent`, `WeatherDaily`, `WeatherResponse` interfeysləri + `normalizeWeatherResponse()` + `getWeatherLabel()` |
| `src/app/api/weather/route.ts` | GET `/api/weather?lat=X&lon=Y` — Open-Meteo proxy, 30 dəqiqə cache |
| `src/components/weather/weather-widget.tsx` | Full və compact variantlarda hava widget-i |
| `src/components/weather/weather-icon.tsx` | Weathercode → Lucide icon mapper |

### Yerləşdirildiyi səhifələr

- Ölkə detail səhifəsi: compact hava widget (paytaxt/ölkə koordinatı ilə)
- Şəhər detail səhifəsi: full hava widget (7 günlük proqnoz)

### i18n namespace: `weather`

`currentWeather`, `loading`, `feelsLike`, `wind`, hava vəziyyəti adları, gün adları (az/en/ru).

## 2. RestCountries — Ölkə Məlumatları

### Fayllar

| Fayl | Məqsəd |
|------|--------|
| `src/lib/countries-api.ts` | `CountryInfo` interfeysi + `normalizeCountryResponse()` |
| `src/app/api/countries/[code]/route.ts` | GET `/api/countries/AZ` — RestCountries proxy, 24 saat cache |
| `src/components/country/country-info-card.tsx` | Ölkə info kartı: paytaxt, əhali, valyuta, region, dillər, ərazi |

### Yerləşdirildiyi səhifələr

- Ölkə detail səhifəsi: ölkə info kartı (hero altında)

### i18n namespace: `countryInfo`

`loading`, `capital`, `population`, `currency`, `region`, `languages`, `area`.

## 3. VisaList — Real-time Viza Yoxlama

### Fayllar

| Fayl | Məqsəd |
|------|--------|
| `src/lib/visa/visalist-api.ts` | `VisaRequirement`, `VisaStatus` interfeysləri + `normalizeVisaResponse()` |
| `src/app/api/visa/check/route.ts` | GET `/api/visa/check?passport=AZ&destination=TR` — VisaList proxy, 1 saat cache |
| `src/components/visa/visa-check-widget.tsx` | Full və compact variantlarda viza yoxlama widget-i |

### Status mapping

- `visa free` → yaşıl badge "Viza tələb olunmur"
- `visa on arrival` → sarı badge "Sərhəddə viza"
- `e-visa` → mavi badge "Elektron viza"
- `visa required` → qırmızı badge "Viza tələb olunur"

### Yerləşdirildiyi səhifələr

- Viza əsas səhifəsi: full viza yoxlama widget
- Ölkə detail səhifəsi: compact viza yoxlama (hədəf ölkə öncədən seçilib)
- Şəhər detail səhifəsi: compact viza yoxlama

### i18n namespace: `visaCheck`

`title`, `selectPassport`, `selectDestination`, `check`, status adları, `duration`, `notes`, `loading`, `error`.

## Əlavə Dəyişikliklər

- `src/types/country.ts`: `ExpandedCountry` interfeysinə `cca2?`, `lat?`, `lng?` field-ları əlavə edildi.
- `src/messages/az.json`, `en.json`, `ru.json`: `weather`, `countryInfo`, `visaCheck` namespace-ləri əlavə edildi.

## Cache Strategiyası

| API | Cache Duration | Stale-while-revalidate |
|-----|---------------|----------------------|
| Open-Meteo | 30 dəqiqə | 1 saat |
| RestCountries | 24 saat | 48 saat |
| VisaList | 1 saat | 2 saat |

## Yoxlama

- `npx tsc --noEmit` — 0 error
- `npm run lint` — 0 error, 19 pre-existing `<img>` warning
