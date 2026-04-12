# Ana Səhifə — 3D Globe Hero Component

## Məqsəd
Ana səhifənin sağ tərəfində 3D qlobus, orbit təyyarələr və bayraq fonu ilə premium vizual hissə yaratmaq. Mövcud heç nə dəyişdirilmir.

## Texniki Yanaşma
- CSS + SVG Globe (0KB əlavə asılılıq)
- CSS radial-gradient + box-shadow ilə 3D sphere effekti
- SVG path ilə sadə kontinent konturları
- CSS @keyframes ilə orbit animasiyası
- Bayraq fonu: CSS repeating pattern, aşağı opacity

## Fayl Strukturu
```
YARADILAN:
src/components/home/globe-hero.tsx    — Globe + təyyarə + bayraq fonu component

DƏYİŞDİRİLƏN:
src/app/[locale]/page.tsx             — GlobeHero import edilir (mövcud məzmun saxlanılır)
```

## Komponent Detalları

### GlobeHero (`globe-hero.tsx`)
- **Qlobus:** 280px diameter (desktop), 200px (mobile)
  - radial-gradient: mavi/yaşıl gradient (okean + quru)
  - box-shadow: glow effekti (primary rəng)
  - SVG overlay: sadə dünya kontinent path-ləri (opacity 0.3)
  - Yavaş rotate: 60s duration, subtle

- **Təyyarələr:** 2 ədəd SVG plane icon
  - Təyyarə 1: Saat istiqamətində orbit, 15s, radius 160px
  - Təyyarə 2: Əks istiqamətdə orbit, 22s, radius 180px
  - CSS transform: rotate + translateX ilə orbit effekti

- **Bayraq Fonu:**
  - Sıra: 🇦🇿 🇹🇷 🇵🇰 🇷🇺 🇬🇪 🇦🇪 🇯🇵 🇫🇷 🇮🇹 🇪🇸
  - Opacity: 0.06
  - Blur: 2px
  - Position: absolute, full width

### Responsive
- Desktop (lg+): Globe sağda, hero məzmun solda
- Tablet (md): Globe kiçilir (240px)
- Mobile: Globe gizlənir (display: none)

## Məhdudiyyətlər
- Heç bir mövcud komponent silinmir
- Heç bir mövcud komponent dəyişdirilmir
- Navbar, search, destinations, footer toxunulmaz
- Yalnız page.tsx-ə import əlavə olunur
- 0KB əlavə npm asılılıq
