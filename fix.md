# TravelAZ Təhlükəsizlik və Performans Düzəlişləri

Bu sənəd `fix.md` analizindən sonra görülən və davam etməli olan işləri saxlayır. Məqsəd public API-larda icazəsiz publish, mass assignment, daxili error sızması və lazımsız ağır query-ləri azaltmaqdır.

## Tamamlandı

- `/api/blogs` POST artıq user body-dən `status: published` qəbul etmir.
- Yeni blog yalnız `draft` statusu ilə yaranır; publish admin/moderation axınına saxlanılıb.
- `/api/blogs`, `/api/companies`, `/api/companions` route-larında body birbaşa DB-yə yazılmır; allowlist, type və length validation əlavə edildi.
- Public blog GET yalnız `published` blogları qaytarır.
- `/api/visa/generate` country create error zamanı clientə Supabase `message/details` göndərmir; daxili detal yalnız server log-da qalır.
- `/api/images/enrich` Supabase fetch/update error mesajlarını clientə ötürmür; generic error qaytarır və detalları serverdə log edir.
- `countries/[slug]` səhifəsində country tapıldıqdan sonra highlights, blogs, visa, cities, places və food places query-ləri `Promise.all` ilə paralelləşdirildi.
- Country detail, place detail, news detail və əsas API route-larında prioritet `select('*')` istifadələri konkret field siyahıları ilə əvəz edildi.
- Place detail-də `place_reviews` və `place_sources` query-ləri də konkret field siyahısı ilə işləyir.
- Companion filter-lərinə 300ms debounce əlavə edildi.
- Companion ölkə şəkilləri hər filter dəyişikliyində yenidən fetch olunmur; component yüklənəndə ayrıca cache kimi çəkilir.

## Hələ Qalanlar

- Repo üzrə bütün `select('*')` istifadələrini mərhələli audit etmək lazımdır. Növbəti prioritet auth/profile/admin səthləridir.
- Error response audit davam etməlidir: clientə constraint, table, column və stack məlumatı çıxmamalıdır.
- Blog publish üçün ayrıca admin/moderation UI və audit trail planlanmalıdır.
- Company və companion form-larında client-side validation server qaydaları ilə uyğunlaşdırılmalıdır.
- Companion filter nəticələri böyük data olduqda pagination və ya infinite scroll ilə tamamlanmalıdır.

## Yoxlama

Bu düzəlişlərdən sonra əsas yoxlamalar:

```bash
npx tsc --noEmit
npm run lint
```

Manual yoxlama:

```text
/az/countries/turkey
/az/companions
/az/blog
/az/news/[id]
/az/admin
```

API davranışı:

- Normal user `/api/blogs` POST-da `status: "published"` göndərsə belə DB-də `draft` yazılmalıdır.
- Admin olmayan user `/api/visa/generate` istifadə edə bilməməlidir.
- Error hallarında clientə Supabase constraint/table/column detalları gəlməməlidir.

