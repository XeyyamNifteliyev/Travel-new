# Profil Dashboard — Design Spec

## Məqsəd
Login-dan sonra `/profile` səhifəsində sol sidebar menulu dashboard yaratmaq. İstifadəçi blog, yoldaş, video əlavə edə və silə bilər. Başqa heç bir fayla toxunulmur.

## Texniki Yanaşma
- Client-side routing (Yanaşma 1) — `useState` ilə aktiv bölmə dəyişir
- Yeni komponentlər yaradılır, mövcud fayllar dəyişdirilmir (yalnız `profile/page.tsx`)
- Header və footer toxunulmaz qalır

## Fayl Strukturu (YENİLƏR)
```
src/components/profile/
├── profile-layout.tsx        — Sidebar + content wrapper
├── dashboard-overview.tsx    — Ana Panel (statistika)
├── my-blogs.tsx              — Bloglarım (CRUD)
├── my-companions.tsx         — Yoldaş Tap (CRUD)
├── my-videos.tsx             — Videolarım (YouTube link CRUD)
├── my-map.tsx                — Xəritəm (ölkələr)
└── profile-settings.tsx      — Tənzimləmələr (profil redaktə)

src/app/[locale]/profile/
└── page.tsx                  — Dəyişdiriləcək (yeni layout)
```

## Sidebar Menyu
```
┌─────────────────────────┐
│ 👤 İstifadəçi adı      │
│ 📧 email                │
├─────────────────────────┤
│ 📊 Ana Panel            │
│ 📝 Bloglarım            │
│ 👥 Yoldaş Tap           │
│ 🎥 Videolarım           │
│ 🌍 Xəritəm              │
│ ⚙️ Tənzimləmələr        │
├─────────────────────────┤
│ 🚪 Çıxış               │
└─────────────────────────┘
```

## Bölmələr

### 1. Ana Panel (`dashboard-overview.tsx`)
- Blog sayı, yoldaş sayı, video sayı, ölkə sayı (statistika kartları)
- Son aktivlik siyahısı (son blog, son yoldaş, son video)

### 2. Bloglarım (`my-blogs.tsx`)
- İstifadəçinin bloglarını cədvəl/kart formatında göstər
- "Yeni Bloq" düyməsi → mövcud `blog/new` səhifəsinə yönləndir
- Hər blogda: "Sil" düyməsi (təsdiq modal ilə)
- `blogs` cədvəlindən `author_id = user.id` ilə oxu
- Silmə: `DELETE FROM blogs WHERE id = ? AND author_id = user.id`

### 3. Yoldaş Tap (`my-companions.tsx`)
- İstifadəçinin yoldaş elanlarını göstər
- "Yeni Elan" düyməsi → mövcud `companions` səhifəsinə yönləndir
- Hər elanda: "Sil" düyməsi
- `companions` cədvəlindən `user_id = user.id` ilə oxu
- Silmə: `DELETE FROM companions WHERE id = ? AND user_id = user.id`

### 4. Videolarım (`my-videos.tsx`)
- YouTube link əlavə etmək formu (URL + başlıq)
- Mövcud videoları kart formatında göstər
- Hər videoda: "Sil" düyməsi
- `youtube_links` cədvəli ilə işlə
- YouTube thumbnail avtomatik çıxarılır (video ID-dən)
- Əlavə: `INSERT INTO youtube_links (...)`
- Silmə: `DELETE FROM youtube_links WHERE id = ? AND user_id = user.id`

### 5. Xəritəm (`my-map.tsx`)
- İstifadəçinin getdiyi ölkələri göstər
- "Ölkə əlavə et" dropdown
- `user_countries` cədvəli ilə işlə

### 6. Tənzimləmələr (`profile-settings.tsx`)
- Ad, bio, avatar URL, sosial şəbəkə linkləri
- `profiles` cədvəlini update et

## Auth Qoruma
- Bütün bölmələr login tələb edir
- Login deyilsə → `/auth/login` yönləndir

## Məhdudiyyətlər
- Header komponentinə toxunulmur
- Footer komponentinə toxunulmur
- Başqa səhifələrə toxunulmur
- Yalnız `profile/page.tsx` dəyişdirilir
- Yeni komponentlər `src/components/profile/` altında yaradılır

## Database Dəyişiklikləri
- `profiles` cədvəlinə yeni sütunlar: `instagram`, `youtube`, `tiktok`, `facebook`
- Migration: `supabase/migrations/003_faza2.5_profile_social.sql`

## Yekun Fayl Siyahısı
```
YARADILAN:
src/components/profile/profile-layout.tsx    — (inteqrasiya olundu page.tsx-ə)
src/components/profile/dashboard-overview.tsx
src/components/profile/my-blogs.tsx
src/components/profile/my-companions.tsx
src/components/profile/my-videos.tsx
src/components/profile/my-map.tsx
src/components/profile/profile-settings.tsx
supabase/migrations/003_faza2.5_profile_social.sql

DƏYİŞDİRİLƏN:
src/app/[locale]/profile/page.tsx             — Tam yeniləndi (sidebar + content layout)
```

## Database Dəyişiklikləri
- `profiles` cədvəlinə yeni sütunlar: `instagram`, `youtube`, `tiktok`, `facebook`
- Migration: `supabase/migrations/003_faza2.5_profile_social.sql`

## Yekun Fayl Siyahısı
```
YARADILAN:
src/components/profile/profile-layout.tsx    — (inteqrasiya olundu page.tsx-ə)
src/components/profile/dashboard-overview.tsx
src/components/profile/my-blogs.tsx
src/components/profile/my-companions.tsx
src/components/profile/my-videos.tsx
src/components/profile/my-map.tsx
src/components/profile/profile-settings.tsx
supabase/migrations/003_faza2.5_profile_social.sql

DƏYİŞDİRİLƏN:
src/app/[locale]/profile/page.tsx             — Tam yeniləndi (sidebar + content layout)
```
