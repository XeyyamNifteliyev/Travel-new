# TravelAZ Production Scaling Plan

## Phase 1: Ən Yüksək Təsir (Kritik)

### 1.1 Blog Detail Server Component (SEO Fix)
- [ ] `blog/[id]/page.tsx` → `'use client'` çıxarılacaq
- [ ] Server component kimi yenidən yazılacaq (data fetch server-side)
- [ ] `generateMetadata` əlavə et (title, description, OG)
- [ ] Client interactive hissələri `blog-detail-client.tsx`-ə köçür (like, share, comments)
- [ ] JSON-LD `blogPostJsonLd` əlavə et

### 1.2 generateStaticParams
- [ ] `countries/[slug]/page.tsx` → 189 ölkə × 3 locale üçün `generateStaticParams`
- [ ] `cities/[slug]/page.tsx` → populyar (is_featured) şəhərlər üçün `generateStaticParams`

### 1.3 Revalidate Əlavə Et (Çatışmayan Səhifələr)
- [ ] `cities/[slug]/page.tsx` → `export const revalidate = 3600`
- [ ] `places/[id]/page.tsx` → `export const revalidate = 3600`

### 1.4 Middleware Optimization
- [ ] Admin path-də `profiles.select('role')` 2-ci DB query-sini JWT metadata-dan oxumaqla əvəz et
- [ ] Public path-lər artıq skip olunur ✅

### 1.5 Supabase Admin Singleton
- [ ] `src/lib/supabase/admin.ts` → modul səviyyəsində singleton cache

---

## Phase 2: Production Readiness

### 2.1 Docker + Standalone Output
- [ ] `next.config.ts` → `output: 'standalone'` əlavə et
- [ ] `Dockerfile` yarad (multi-stage, Node 20 Alpine)
- [ ] `.dockerignore` yarad

### 2.2 PM2 Cluster Config
- [ ] `ecosystem.config.js` yarad (cluster mode, max memory restart, log management)

### 2.3 New DB Indexes
- [ ] `idx_cities_country_featured` (country_id, is_featured, popular_rank)
- [ ] `idx_news_published_created` (is_published, created_at DESC)
- [ ] Mövcud indeksləri yoxla və lazım olanları əlavə et

---

## Phase 3: Redis Rate Limiting

### 3.1 Upstash Redis
- [ ] `@upstash/redis` + `@upstash/ratelimit` paketlərini əlavə et
- [ ] `src/lib/rate-limit.ts`-i Redis-ə köçür (fallback: in-memory dev üçün)
- [ ] Environment variables: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- [ ] Bütün rate-limited API route-ları yeni funksiya ilə uyğunlaşdır

---

## Phase 4: Kiçik Optimizasiyalar

### 4.1 React cache() ilə Deduplikasiya
- [ ] `src/lib/data.ts` yarad: `getCountries`, `getCities` və s. funksiyaları `cache()` ilə wrap et

### 4.2 Select * Qalıqlarını Təmizlə
- [ ] `youtube/route.ts` → explicit columns
- [ ] `comments/route.ts` → explicit columns

---

## Təxmini Capacity (Phase 1-4 sonra)

| Deployment | Concurrent Users | 
|-----------|------------------|
| Tək VPS (2 vCPU) | ~300-500 |
| Tək VPS (4 vCPU) | ~500-1000 |
| Vercel Pro | ~1500+ |
| Vercel + Redis | ~3000+ |