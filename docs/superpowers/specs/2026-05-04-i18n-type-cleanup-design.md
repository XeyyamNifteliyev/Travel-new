# TravelAZ i18n və Type Cleanup Dizaynı

## Xülasə

TravelAZ platformasında 27 faylda ~200+ hardcoded mətn və 55 `any` istifadəsi var. Bu dizayn module-by-module yanaşması ilə hər iki problemi həll edir: əvvəlcə type cleanup, sonra i18n.

## Arxitektura

Hər modul üçün iki addım:
1. **Type cleanup əvvəl** - Supabase response tipləri, DTO mapper-lər, `any`-ləri araden qaldır
2. **i18n sonra** - hardcoded mətnləri `messages/*.json` fayllarına çıxart

### Yeni Fayllar

- `src/types/supabase-helpers.ts` - `User` tipinin re-export-u `@supabase/supabase-js`-dən, `Profile` interfeysi
- `src/types/blog.ts` - `BlogWithAuthor` tipi əlavə olunacaq
- `src/types/tour.ts` - `TourWithCompany` tipi (yoxdursa yaradılacaq)

### Namespace Strategiyası

`messages/*.json` fayllarında:
- `profile` - profil bölməsi (yeni)
- `chat` - chat sistemi (yeni)
- `aiPlanner` - AI planner sub-komponentlər (mövcud, genişlənəcək)
- `blog` comments hissəsi (mövcud, genişlənəcək)
- `common` - ümumi mətnlər (mövcud, genişlənəcək: `delete`, `cancel`, `save`, `close` və s.)

## Modul Planı

### Modul 1: Profil (8 fayl, ~100 mətn, 15 `any`)

Fayllar:
- `dashboard-overview.tsx` - User tipi import, stat label-lər i18n
- `profile-layout.tsx` - Menyu adları i18n, User tipi
- `profile-settings.tsx` - Form label-ləri i18n, User+Profile tipləri
- `my-blogs.tsx` - Blog tipi, CRUD mətnləri i18n
- `my-companions.tsx` - Companion tipi, CRUD mətnləri i18n
- `my-videos.tsx` - Video tipi, CRUD mətnləri i18n
- `my-map.tsx` - Country tipi, map mətnləri i18n, COUNTRIES array-i Supabase-dən və ya i18n ilə
- `profile/page.tsx` - Menyu adları i18n, User tipi

Type əlavələri:
- `BlogListItem` interfeysi (id, title, status, created_at, views)
- `CompanionItem` interfeysi (id, destination, dates, status, gender_preference)
- `VideoItem` interfeysi (id, title, youtube_url, description, created_at)
- `UserCountry` interfeysi (id, country_code, country_name, visited_at)

Namespace: `profile`

### Modul 2: Chat (3 fayl, ~50 mətn, 1 `any`)

Fayllar:
- `chat/page.tsx` - Səhifə mətnləri i18n, User tipi
- `chat-list.tsx` - Siyahı mətnləri i18n, blok/sil dialoqları
- `chat-window.tsx` - Mesaj mətnləri i18n, status, placeholder-lər

Type əlavələri:
- Chat komponentlərində `any` yoxdur demək olar, yalnız `User` import

Namespace: `chat`

### Modul 3: Blog + Comments (4 fayl, ~10 mətn, 13 `any`)

Fayllar:
- `blog/page.tsx` - `BlogWithAuthor` tipi, author `as any` aradan qaldır
- `blog/[id]/page.tsx` - author type fix
- `blog-comments.tsx` - `CommentItem` tipi, i18n mətnlər
- `blog-card.tsx` - author type fix

Type əlavələri:
- `BlogWithAuthor` - Blog-a `author: { name: string; avatar_url: string | null }` əlavə edən interfeys
- `CommentItem` - Comment API response üçün typed interfeys

Namespace: `blog` (genişlənir)

### Modul 4: Tour + Company + Video + Leaderboard (5 fayl, ~20 mətn, 10 `any`)

Fayllar:
- `tour-list.tsx` - `TourWithCompany` tipi
- `company-register.tsx` - Plan mətnləri i18n, Company tipi
- `video-list.tsx` - COUNTRIES array i18n, Video tipi
- `leaderboard.tsx` - Blog tipi, i18n mətnlər
- `companion-search.tsx` - Companion API response tipi

Type əlavələri:
- `TourWithCompany` - Tour-a `company: { company_name: string; is_verified: boolean }` əlavə edən interfeys

Namespace: `tour`, `company` (yaxud mövcud namespace-lərdə genişlənir)

### Modul 5: Qalan kiçik fixlər (~10 mətn, 6 `any`)

Fayllar:
- `DayCard.tsx`, `CostBreakdown.tsx` - AI planner i18n (namespace: `aiPlanner`)
- `mobile-menu.tsx` - User+Session tipləri import
- `footer.tsx` - 1 mətn i18n
- `flight-search.tsx` - 2 mətn i18n
- `ai-planner-client.tsx` - 1 mətn i18n
- `confirm-dialog.tsx` - default mətnlər i18n
- `theme-toggle.tsx` - aria-label i18n
- `layout.tsx`, `request.ts` - locale `as any` → typed fix
- `hotels/page.tsx` - `Record<string, any>` → `Record<string, React.ComponentType<...>>`

## Data Flow

### i18n Data Flow
1. `messages/az.json`, `en.json`, `ru.json` fayllarına yeni key-lər əlavə olunur
2. Client komponentlərdə `useTranslations('namespace')` ilə oxunur
3. Server komponentlərdə `getTranslations('namespace')` ilə oxunur
4. Mövcud namespace-lər genişlənir, yeni namespace-lər yalnız lazım olduqda yaradılır

### Type Flow
1. `src/types/supabase-helpers.ts` - `User` re-export `@supabase/supabase-js`-dən
2. `BlogWithAuthor`, `TourWithCompany` kimi tiplər mövcud type fayllarına əlavə edilir
3. Komponentlərdə `any` → typed interface əvəzləməsi
4. API response mapper-lərdə `any` → explicit interfeyslər

## Error Handling

- `catch (error: any)` → `catch (error: unknown)` + `error instanceof Error ? error.message : String(error)`
- Heç bir funksionallıq dəyişməyəcək, yalnız tip təhlükəsizliyi artacaq

## Test Strategiyası

Hər moduldan sonra:
- `npx tsc --noEmit` - type xətaları yoxdur
- `npm run lint` - lint warning-lər yoxdur
- Ən azı bir locale-də səhifə vizual yoxlanılır

## Nəticə

- ~200+ hardcoded mətn i18n sisteminə keçiriləcək
- 55 `any` istifadəsi typed interfeyslərlə əvəz olunacaq
- Heç bir funksionallıq dəyişməyəcək
- 5 modul, module-by-module sıra ilə
