# TravelAZ Təhlükəsizlik və Performans Düzəlişləri

Bu sənəd production hardening işlərinin qısa statusudur. Daha geniş icra qeydləri `production-hardening.md` faylındadır.

## Tamamlandı

- `/api/blogs` POST user body-dən `status: published` qəbul etmir; yeni bloglar `draft` yaranır.
- Public API-larda əsas allowlist/validation işləri başlanıb.
- Country detail query-ləri paralelləşdirilib.
- Companion filter-lərinə debounce əlavə edilib.
- `032_ai_usage_and_rls_hardening.sql` migration əlavə edildi.
- Açıq RLS yazma policy-ləri bağlanır:
  - `visa_qa_cache`
  - `visa_updates`
  - `scraper_logs`
  - `leaderboard_stats`
  - `notifications`
- AI endpoint-lər üçün daily usage modeli əlavə edildi:
  - Visa AI: 3
  - AI Planner: 3
  - Cheap Dates: 5
- Visa AI cache və usage write-ları service role server client-ə keçirildi.
- Visa scraper `CRON_SECRET` yoxlamasından sonra service role client istifadə edir.
- DOMPurify `npm audit fix` ilə yeniləndi.
- Blog HTML sanitize allowlist-i sərtləşdirildi.
- Cities və restaurants səhifələrində `select('*')` konkret field siyahıları ilə əvəz edildi.
- GitHub Actions CI workflow əlavə edildi.
- `.env.example` UTF-8 formada yeniləndi.

## Qalan Risklər

- `npm audit --audit-level=moderate` hələ `next-intl` və Next/PostCSS chain üçün breaking update istəyir.
- Bütün `select('*')` istifadələri tam bitməyib.
- RLS migration Supabase-də tətbiq edildikdən sonra manual anon/auth test lazımdır.
- Monitoring hələ tam qoşulmayıb: Sentry, slow query log alert, scraper failure alert.
- Place image coverage mərhələli artırılmalıdır.

## Yoxlama

```bash
npx tsc --noEmit
npm run lint
npm run build
npm audit --audit-level=moderate
```
