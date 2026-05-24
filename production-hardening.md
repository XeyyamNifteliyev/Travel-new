# TravelAZ Production Hardening

Bu sənəd son yayım qabağı təhlükəsizlik, performans, DevOps və kontent keyfiyyəti üçün cari checklist-dir. Məqsəd saytı "demo" hissindən çıxarıb sürətli, təhlükəsiz və peşəkar production platforması kimi hazırlamaqdır.

## Tamamlanan Hotfix-lər

- `npm audit fix` ilə təhlükəsiz patch-lər tətbiq edildi: `brace-expansion` və `ws` yeniləndi.
- Production CSP-də `unsafe-eval` çıxarıldı; dev mühitində qalır.
- JSON-LD script-lərində `<` escaping standartlaşdırıldı.
- Admin yoxlaması mərkəzləşdirildi: server route-lar və middleware `src/lib/auth/admin.ts` içindəki `isAdminUser` helper-indən istifadə edir.
- Admin rolu əvvəl `user.app_metadata.role`, sonra fallback kimi `profiles.role` ilə yoxlanır.
- Dependency security sprint tamamlandı: `next@16.2.6`, `next-intl@4.12.0`, `eslint-config-next@16.2.6` və `postcss@8.5.15` ilə `npm audit --audit-level=moderate` təmiz keçir.
- Image enrich admin endpoint-i ölkə/şəhər şəkillərində paytaxt/şəhər skyline, architecture, downtown və landmark query-lərini üstün tutur.
- Image enrich endpoint-i heyvan, dağ, dəniz, səhra, meşə və random landscape nəticələrini avtomatik skip edir.
- Companions, companies, tours və YouTube write API-lərinə rate limit əlavə edildi.
- Docker builder mərhələsi tam dependency install edir və standalone output istifadə edir.
- `.env.example` Upstash və site URL dəyişənləri ilə tamamlandı.
- Manual release audit üçün GitHub Actions `workflow_dispatch` job-u əlavə edildi.
- Profil səhifəsində ağır tab komponentləri dinamik yüklənir, ilkin client bundle daha yüngül saxlanır.

## Son Production Polish

- Public sitemap `news`, `places` və `visa` detail URL-ləri ilə genişləndirildi.
- Hotels axınında provider konfiqurasiya edilməyəndə mock kartlar göstərilmir; professional empty state qalır.
- Tours boş marketplace hissəsi professional CTA və izahedici empty state ilə yeniləndi.
- Ana səhifədə saxta fallback tour kartları çıxarıldı; real tur datası yoxdursa kurasiya mesajı və şirkət qeydiyyatı CTA-sı göstərilir.
- Ana səhifə hero Supabase count query-lərindən gələn ölkə, şəhər, məkan və viza metrikləri ilə gücləndirildi.
- `/cities` və `/restaurants` səhifələri professional hero/stat kartları ilə yeniləndi.

## Açıq Risklər

1. Live Supabase RLS policy-ləri dashboard və SQL ilə təsdiqlənməlidir.
   - Migration-larda hardening var, amma production DB-nin real policy vəziyyəti ayrıca yoxlanmalıdır.
   - Xüsusi cədvəllər: `visa_qa_cache`, `visa_updates`, `scraper_logs`, `leaderboard_stats`, `notifications`, `profiles`, `user_countries`.
   - Son hardening migration: `033_rls_policy_final_hardening.sql`.

2. Place image coverage launch üçün hələ tam deyil.
   - Cari hədəf: ən azı 1700+ place image.
   - Wikimedia primary edilməməlidir; Pexels/Unsplash əsas mənbədir.
   - Eyni fallback şəkil çox məkanda təkrar görünməməlidir.

3. Review və tours marketplace hələ canlı data baxımından zəifdir.
   - Review flow real istifadəçi ilə test edilməlidir.
   - Tours bölməsi real data olmadan production-da zəif görünür; ya real partner data əlavə olunmalı, ya da kurasiya/tezliklə state-i saxlanmalıdır.

4. Visa official link coverage hələ aşağıdır.
   - `official_visa_url` yalnız dəqiq rəsmi viza səhifəsi, e-viza portalı, səfirlik/konsulluq səhifəsi və ya səlahiyyətli provider linki olmalıdır.
   - Linklər AI ilə uydurulmamalıdır.
   - 2026-05-25: curated batch coverage `37/187` səviyyəsinə qaldırıldı.

## Release Gate

Bu komandalar uğurlu olmadan production deploy edilməməlidir:

```bash
npm ci
npx tsc --noEmit
npm run lint
npm run build
npm audit --audit-level=moderate
npm run audit:country-images
npm run audit:country-content
npm run audit:place-content
npm run audit:visa-official-links
```

## Manual Security Test

- Anon user `/az/admin` açanda loginə yönlənməlidir.
- Normal user `/az/admin` açanda profile səhifəsinə yönlənməlidir.
- Admin API-lər normal user üçün 403 qaytarmalıdır.
- AI endpoint login olmadan 401 qaytarmalıdır.
- AI günlük limit bitəndə 429 qaytarmalıdır.
- Cache cavablar AI limitdən sayılmamalıdır.
- Scraper endpoint `CRON_SECRET` olmadan işləməməlidir.
- Blog/place HTML XSS payload render etməməlidir.

## Monitoring

Production üçün əlavə olunmalıdır:

- Sentry və ya oxşar API/UI error monitoring.
- Supabase slow query izləmə.
- Visa scraper failure alert.
- Image/content audit nəticələrinin periodik saxlanması.
- Deploy sonrası smoke test.
