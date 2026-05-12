# TravelAZ Production Scaling Plan

## Phase 1: Ən Yüksək Təsir (Kritik)

### 1.1 Blog Detail Server Component (SEO Fix)
- [x] `blog/[id]/page.tsx` → `'use client'` çıxarıldı
- [x] Server component kimi yenidən yazıldı (data fetch server-side)
- [x] `generateMetadata` əlavə edildi (title, description, OG)
- [x] Client interactive hissələri `blog-detail-client.tsx`-ə köçürüldü (like, share, comments)
- [x] JSON-LD `blogPostJsonLd` əlavə edildi

### 1.2 generateStaticParams
- [x] `countries/[slug]/page.tsx` → 189 ölkə × 3 locale üçün `generateStaticParams`
- [x] `cities/[slug]/page.tsx` → populyar (is_featured) şəhərlər üçün `generateStaticParams`

### 1.3 Revalidate Əlavə Et (Çatışmayan Səhifələr)
- [x] `cities/[slug]/page.tsx` → `export const revalidate = 3600`
- [x] `places/[id]/page.tsx` → `export const revalidate = 3600`

### 1.4 Middleware Optimization
- [x] Admin path-də `profiles.select('role')` 2-ci DB query-sini JWT `app_metadata.role`-dan oxumaqla əvəz edildi
- [x] Public path-lər artıq skip olunur ✅

### 1.5 Supabase Admin Singleton
- [x] `src/lib/supabase/admin.ts` → modul səviyyəsində singleton cache

---

## Phase 2: Production Readiness

### 2.1 Docker + Standalone Output
- [x] `next.config.ts` → `output: 'standalone'` əlavə edildi
- [x] `Dockerfile` yaradıldı (multi-stage, Node 20 Alpine)
- [x] `.dockerignore` yaradıldı

### 2.2 PM2 Cluster Config
- [x] `ecosystem.config.js` yaradıldı (cluster mode, max memory restart, log management)

### 2.3 New DB Indexes
- [x] `idx_countries_slug` (countries.slug)
- [x] `idx_cities_country_featured` (country_id, is_featured, popular_rank)
- [x] `idx_news_published_created` (is_published, created_at DESC)
- [x] `idx_places_city_status_cat_featured` (city_id, status, category, is_featured)
- [x] `idx_blogs_published_created` (status, created_at DESC)

---

## Phase 3: Redis Rate Limiting

### 3.1 Upstash Redis
- [x] `@upstash/redis` + `@upstash/ratelimit` paketləri əlavə edildi
- [x] `src/lib/rate-limit.ts` → Redis-backed rate limiter (fallback: in-memory dev üçün)
- [x] Environment variables: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (env-dən oxunur, yoxdursa in-memory fallback)
- [x] Bütün rate-limited API route-ları `await checkRateLimit()` ilə uyğunlaşdırıldı

---

## Phase 4: Kiçik Optimizasiyalar

### 4.1 React cache() ilə Deduplikasiya
- [x] `src/lib/data.ts` yaradıldı: `getCountries`, `getCountryBySlug`, `getFeaturedCities` funksiyaları `cache()` ilə

### 4.2 Select * Qalıqlarını Təmizlə
- [x] `youtube/route.ts` → explicit columns
- [x] `comments/route.ts` → explicit columns

---

## Təxmini Capacity (Phase 1-4 sonra)

| Deployment | Concurrent Users | 
|-----------|------------------|
| Tək VPS (2 vCPU) | ~300-500 |
| Tək VPS (4 vCPU) | ~500-1000 |
| Vercel Pro | ~1500+ |
| Vercel + Redis | ~3000+ |