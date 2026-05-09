# TravelAZ Production Hardening Status

## Məqsəd

TravelAZ production-a yaxınlaşdığı üçün əsas boşluqlar təhlükəsizlik, AI abuse protection, XSS/dependency, performans, DevOps və monitoring istiqamətində mərhələli bağlanır.

## Tamamlanan Düzəlişlər

- RLS hardening migration əlavə edildi: `032_ai_usage_and_rls_hardening.sql`.
- `visa_qa_cache`, `visa_updates`, `scraper_logs`, `leaderboard_stats`, `notifications` üçün açıq yazma policy-ləri bağlanır.
- Yeni `ai_daily_usage` cədvəli planlandı: `visa`, `planner`, `cheap_dates` üçün user/day/feature əsaslı limit.
- AI endpoint-lər limitə bağlandı:
  - Visa AI: gündə 3 yeni sual.
  - AI Planner: gündə 3 plan.
  - Cheap Dates: gündə 5 sorğu.
- AI usage və visa cache yazıları service-role server client ilə edilir.
- Visa scraper cron endpoint-i `CRON_SECRET` yoxlamasından sonra service-role client istifadə edir.
- `npm audit fix` işlədildi və DOMPurify təhlükəsizlik patch-i yeniləndi.
- Blog detail HTML sanitizer allowlist-i sərtləşdirildi; URL-lərdə yalnız `http`, `https`, `mailto`, relative path və anchor qəbul edilir.
- Cities list/detail və restaurants səhifələrində `select('*')` konkret field siyahıları ilə əvəz edildi.
- City detail-də places və food places query-ləri paralelləşdirildi.
- Blog editor və admin/profile ağır tab-ları dynamic import ilə lazy-load edilir.
- GitHub Actions CI workflow əlavə edildi: install, typecheck, lint, build və high-level audit.
- `.env.example` UTF-8 və oxunaqlı formada yeniləndi.
- Next.js `outputFileTracingRoot` set edildi.

## Hələ Qalanlar

- `npm audit --audit-level=moderate` hələ `next-intl` və Next/PostCSS chain üçün breaking update tələb edir. Bunu ayrıca major migration kimi etmək lazımdır.
- Bütün `select('*')` istifadələri tam bitməyib; növbəti səthlər chat/profile/tours/youtube detallarında davam etməlidir.
- RLS migration Supabase-də tətbiq edildikdən sonra anon/auth manual test edilməlidir.
- Sentry və ya alternativ error monitoring hələ qoşulmayıb.
- Supabase slow query log və scraper failure alert mexanizmi sənədləşdirilib, amma production inteqrasiyası edilməyib.
- Place image coverage hələ mərhələli artırılmalıdır.

## Yoxlama Komandaları

```bash
npx tsc --noEmit
npm run lint
npm run build
npm audit --audit-level=moderate
```

## Manual Security Test

- Anon/auth user Supabase REST ilə `visa_qa_cache` insert/update edə bilməməlidir.
- Server `/api/visa/ai-answer` cache yazmağa davam etməlidir.
- `/api/visa/scraper` yalnız düzgün `CRON_SECRET` ilə işləməlidir.
- AI endpoint-lər login olmayan user üçün `401`, limit dolanda `429` qaytarmalıdır.
