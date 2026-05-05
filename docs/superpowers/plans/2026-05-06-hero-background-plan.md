# Hero Background Image Implementation Plan

> **For agentic workers:** Use inline execution.

**Goal:** Add full-screen travel photo background to the hero section with dark overlay, keeping the globe.

**Architecture:** One file change (`src/app/[locale]/page.tsx`) — add an `<Image>` background behind existing content, wrap in a container with gradient overlay, and adjust text/button colors for readability on dark backgrounds.

**Tech Stack:** Next.js 15, next/image, Unsplash CDN

---

### Task 1: Add hero background image and overlay

**Files:**
- Modify: `src/app/[locale]/page.tsx`

- [ ] **Step 1: Add `Image` import** (already exists at line 1)

- [ ] **Step 2: Add hero background and overlay markup**

Wrap the current hero content in a new container structure. The background image goes at the top of the hero section, the overlay goes on top of it.

```tsx
<section className="relative px-4 pt-28 pb-14 md:pt-36 md:pb-20 min-h-screen overflow-hidden">
  {/* Background image */}
  <div className="absolute inset-0 -z-10">
    <Image
      src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80"
      alt=""
      fill
      className="object-cover"
      sizes="100vw"
      priority
    />
  </div>
  {/* Overlay */}
  <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/70 via-black/50 to-bg-base" />
  {/* Existing gradient dots (remove) */}
```

Replace the existing `<section>` opening lines (200-203) and remove the existing gradient background.

- [ ] **Step 3: Adjust text and button colors for dark overlay**

The existing text `text-txt` class needs to become `text-white` for everything in the hero content area. Specifically:

```tsx
<div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
  <Sparkles className="h-4 w-4" />
  {t('heroEyebrow')}
</div>
```

```tsx
<h1 className="max-w-4xl text-4xl font-black leading-[1.04] tracking-tight text-white md:text-6xl lg:text-7xl drop-shadow-lg">
  {t('heroTitleNew')}
  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-sky-300 to-secondary">
    {t('heroHighlightNew')}
  </span>
</h1>
```

```tsx
<p className="mt-6 max-w-2xl text-base leading-8 text-white/80 md:text-lg drop-shadow">
  {t('heroSubtitleNew')}
</p>
```

```tsx
<Link
  href={`/${locale}/ai-planner`}
  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-slate-900 transition-all hover:-translate-y-0.5 hover:shadow-xl"
>
  <Bot className="h-4 w-4" />
  {t('ctaPlanner')}
</Link>
```

```tsx
<Link
  href={`/${locale}/countries`}
  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:border-primary/60 hover:bg-white/20"
>
  <Map className="h-4 w-4" />
  {t('ctaCountries')}
</Link>
<Link
  href={`/${locale}/visa`}
  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:border-secondary/60 hover:bg-white/20"
>
  <Stamp className="h-4 w-4" />
  {t('ctaVisa')}
</Link>
```

For the stat badge:
```tsx
<div className="absolute bottom-2 left-0 rounded-2xl border border-white/20 bg-black/40 p-4 shadow-2xl backdrop-blur md:left-6">
  <p className="text-xs uppercase tracking-widest text-white/60">{t('heroStatLabel')}</p>
  <p className="mt-1 text-2xl font-black text-white">185+</p>
  <p className="text-sm text-white/70">{t('heroStatText')}</p>
</div>
```

- [ ] **Step 4: Run verification**

```bash
npx tsc --noEmit
npm run lint
```

- [ ] **Step 5: Verify visually**

```bash
npm run dev
```
Check `http://localhost:3000/az` — hero should show background image with dark overlay, globe visible on right, all text in white.
