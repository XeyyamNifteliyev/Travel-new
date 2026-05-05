# Hero Background Image Design

## Context

Ana səhifədə hero section hazırda qlobus + mətn + stat badge + axtarış panelindən ibarətdir. Arxa fon `radial-gradient` ilə rəng keçididir. Məqsəd: travel platformasına uyğun, premium hisslər qazandıran **full-screen fon şəkli** əlavə etmək, qlobusu saxlayaraq.

## Qərarlar

- **Qlobus:** saxlanılır, yerləşdiyi mövqedə qalır
- **Fon şəkli:** statik travel foto (static hardcoded)
- **Overlay:** güclü tünd gradient — mətn həmişə oxunaqlı
- **Dəyişən bölmə:** yalnız hero (digər bölmələr toxunulmur)

## Texniki Həll

### Şəkil
- Unsplash CDN üzərindən `next/image` ilə yüklənir
- `UNSPLASH_ACCESS_KEY` env-i artıq var, amma dinamik API çağırışı yox — sabit photo ID istifadə olunur
- Şəkil ID: `W3Z6aLpW6oI` (mavi dəniz + sahil mənzərəsi, qlobusun mavi tonlarına uyğun)
- `sizes: "100vw"`, `priority: true` (LCP optimizasiyası)
- `object-cover` ilə full-width, full-height kəsilir

### Layout
- Hero `<section>`: `relative min-h-screen` (cari `min-h` dəyərindən yüksək)
- `<Image>`: `absolute inset-0` ilə fon yerləşir
- Overlay: üç qat — yuxarıdan gradient, bitdikdən sonra rəng keçidi:
  - Dark mode: `from-black/70 via-black/50 to-bg-base`
  - Light mode: `from-black/60 via-black/40 to-bg-base` (tündlük qorunur)
- Bütün mətn elementləri overlay üstündə qalır

### Mətn Stilleri
- Başlıq (`h1`): ağ rəng (`text-white`), kölgə ilə (`drop-shadow`)
- Alt mətn (`p`): `text-white/80` — yüngül şəffaflıq
- CTA düymələri:
  - Primary: `bg-white text-slate-900` (diqqət çəkən)
  - Secondary: `border border-white/30 text-white`
- Eyebrow badge: `bg-white/10 backdrop-blur border border-white/20`
- Stat badge: cari `bg-bg-surface/85 backdrop-blur` saxlanılır

### Responsive
- Mobil: şəkil 640px-ə qədər eyni, mətn kiçilir
- Desktop: 1024px+ full-screen təəssürat

## Fayl Dəyişiklikləri

**Yalnız:** `src/app/[locale]/page.tsx`
- Hero section-a `<Image>` background əlavə et
- Overlay div əlavə et
- Mətn rənglərini ağa çevir
- CTA düymələrini overlay-ə uyğun düzəlt

**Dəyişilmir:**
- `GlobeHero` komponenti (eynən qalır)
- Axtarış paneli (HomeSearchPanel)
- Qalan bölmələr (countries grid, tours, blog, etc.)

## Seçilmiş Şəkil

Unsplash photo ID: `W3Z6aLpW6oI` — mavi dəniz + qayalı sahil + yaşıl təpələr
- Çox yönlü, həm dark həm light modda işləyir
- Mavi tonlar qlobusun rəng palitrasına uyğun
- URL: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80`
