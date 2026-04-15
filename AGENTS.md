# TravelAZ — Layihə Xülasəsi (AGENTS.md)

## Texnologiyalar
- **Next.js 15** (App Router, `[locale]` dinamik route)
- **React 19**, **TypeScript 5.9**
- **Tailwind CSS v4** (CSS-only config, `@theme inline` ilə globals.css-də)
- **next-intl** (3 dil: az, en, ru → `src/messages/*.json`)
- **Supabase** (Auth, DB 17 cədvəl, Realtime chat)
- **TipTap** (rich text blog editor)
- **sonner** (toast bildirişləri)
- **lucide-react** (iconlar)
- **DOMPurify** (HTML sanitizasiya)

## Əmrlər
- `npm run dev` — Development server
- `npx tsc --noEmit` — TypeScript yoxlama

---

## Qovluq Strukturu

```
src/
├── app/
│   ├── layout.tsx                    → Root layout (dark mode default)
│   ├── page.tsx                      → / → /az redirect
│   ├── globals.css                   → Tailwind v4 + tema CSS variables (dark/light)
│   │
│   ├── [locale]/                     → Bütün səhifələr (az/ru/en prefix)
│   │   ├── layout.tsx                → Header + Footer + Toaster + NextIntlClientProvider
│   │   ├── page.tsx                  → Ana səhifə (GlobeHero + destinasiyalar)
│   │   ├── auth/login/page.tsx       → Login (email/password + Google OAuth)
│   │   ├── auth/register/page.tsx    → Qeydiyyat
│   │   ├── flights/page.tsx          → Bilet axtarışı (mock data)
│   │   ├── hotels/page.tsx           → Otellər (mock data)
│   │   ├── tours/page.tsx            → Daxili turlar (Supabase-dən)
│   │   ├── countries/page.tsx        → Ölkələr siyahısı (hardcoded 10 ölkə)
│   │   ├── countries/[slug]/page.tsx → Ölkə detalı
│   │   ├── companions/page.tsx       → Yoldaş tap
│   │   ├── visa/page.tsx             → Viza məlumatı (hardcoded 5 ölkə)
│   │   ├── blog/page.tsx             → Blog siyahısı (Supabase-dən)
│   │   ├── blog/[id]/page.tsx        → Blog detalı (likes, comments, share)
│   │   ├── blog/new/page.tsx         → Yeni blog (TipTap editor)
│   │   ├── ai-planner/page.tsx       → AI planlaşdırıcı (2 rejim: Plan + En Ucuz)
│   │   ├── ai-planner/ai-planner-client.tsx
│   │   ├── chat/page.tsx             → Mesajlaşma (Realtime, auth tələb olunur)
│   │   ├── profile/page.tsx          → Profil (6 section: dashboard, blogs, companions, videos, map, settings)
│   │   ├── videos/page.tsx           → YouTube video paylaşım
│   │   ├── leaderboard/page.tsx      → Liderlik cədvəli
│   │   └── company/page.tsx          → Tur şirkəti qeydiyyatı
│   │
│   ├── auth/v1/callback/page.tsx     → Supabase OAuth callback
│   │
│   └── api/
│       ├── ai/plan/route.ts          → POST: AI səyahət planı (PlanRequest → TravelPlan)
│       ├── ai/cheap-dates/route.ts   → POST: En ucuz tarixlər (CheapDatesRequest → CheapDatesResponse)
│       ├── blogs/route.ts            → GET, POST: Blog CRUD
│       ├── comments/route.ts         → GET, POST, DELETE: Şərhlər
│       ├── companions/route.ts       → GET, POST, PATCH, DELETE: Yoldaş elanları
│       ├── companies/route.ts        → GET, POST, PATCH: Tur şirkətləri
│       ├── tours/route.ts            → GET, POST: Turlar (11+ filtr, plan limiti: starter=5, pro=20, premium=999)
│       ├── tours/[id]/route.ts       → GET: Tək tur
│       └── youtube/route.ts          → GET, POST, DELETE: YouTube videolar
│
├── components/
│   ├── layout/
│   │   ├── header.tsx                → Dropdown qruplu nav: Rezervasiya, Kəşf et, Xidmətlər, Blog
│   │   ├── footer.tsx                → Footer (3 qrup sütun)
│   │   ├── mobile-menu.tsx           → Mobil accordion menyular
│   │   ├── language-switcher.tsx     → az/ru/en selector
│   │   └── theme-toggle.tsx          → Dark/light toggle
│   │
│   ├── home/
│   │   └── globe-hero.tsx            → SVG qlobus + JS requestAnimationFrame təyyarələr (tema-dəstəkli)
│   │
│   ├── ai-planner/
│   │   ├── PlannerWizard.tsx         → Toggle: Planlaşdır (4 addım) | En Ucuz Tarix (2 addım)
│   │   ├── PlannerLoading.tsx        → Yüklənmə animasiyası (plan/cheap rejimlər)
│   │   ├── PlanResult.tsx            → Plan nəticə konteyner
│   │   ├── PlanResultContent.tsx     → Plan detalları
│   │   ├── PlanActions.tsx           → Paylaş, saxla düymələri
│   │   ├── DayCard.tsx               → Gün kartı (aktivlik, yemək, nəqliyyat, xərc)
│   │   ├── CostBreakdown.tsx         → Xərc bölgüsü vizual
│   │   ├── CheapDatesResult.tsx      → Ucuz tarixlər nəticə kartları
│   │   └── steps/
│   │       ├── DestinationStep.tsx   → Ölkə seçimi (input + populyar grid)
│   │       ├── DateStep.tsx          → Tarix + nəfər sayı
│   │       ├── BudgetStep.tsx        → Büdcə (budget/mid/luxury)
│   │       ├── InterestsStep.tsx     → Maraqlar (8 ikonkalı seçim)
│   │       └── CheapDateStep.tsx     → Gün (manual input) + nəfər + fəsil seçimi (yaz/yay/payız/qış)
│   │
│   ├── blog/
│   │   ├── blog-card.tsx             → Blog kart (şəkil, tag, author, tarix)
│   │   ├── blog-editor.tsx           → TipTap rich text editor
│   │   └── blog-comments.tsx         → Şərh bölməsi
│   │
│   ├── profile/
│   │   ├── profile-layout.tsx        → Layout wrapper
│   │   ├── dashboard-overview.tsx    → Dashboard statlar
│   │   ├── my-blogs.tsx              → İstifadəçi bloqları
│   │   ├── my-companions.tsx         → İstifadəçi yoldaş elanları
│   │   ├── my-videos.tsx             → İstifadəçi videoları
│   │   ├── my-map.tsx                → Ziyarət edilən ölkələr xəritəsi
│   │   └── profile-settings.tsx      → Profil redaktə (ad, bio, sosial şəbəkələr)
│   │
│   ├── chat/
│   │   ├── chat-list.tsx             → Söhbət siyahısı sidebar
│   │   └── chat-window.tsx           → Mesaj göstərici + input
│   │
│   ├── search/
│   │   ├── flight-search.tsx         → Uçuş axtarış forması
│   │   └── hotel-search.tsx          → Otel axtarış forması
│   │
│   ├── country/
│   │   ├── country-card.tsx          → Ölkə kart
│   │   └── visa-info.tsx             → Viza məlumat kart
│   │
│   ├── tour/tour-list.tsx            → Tur siyahısı + filtrlər
│   ├── companion/companion-search.tsx → Yoldaş axtarışı + filtrlər
│   ├── company/company-register.tsx  → Şirkət qeydiyyat forması
│   ├── video/video-list.tsx          → Video grid
│   ├── community/leaderboard.tsx     → Liderlik cədvəli
│   └── ui/confirm-dialog.tsx         → Təsdiq dialoqu (reusable)
│
├── lib/
│   ├── ai/
│   │   ├── provider.ts              → AIProvider interface + getProvider() factory
│   │   │                             AI_PROVIDER env-a görə: gemini|openai|claude|deepseek|groq|glm
│   │   ├── providers/
│   │   │   ├── gemini.ts             → gemini-2.5-flash (fallback: lite, v3-preview, 503-də növbəti)
│   │   │   ├── openai.ts             → gpt-4o-mini
│   │   │   ├── claude.ts             → claude-3.5-haiku
│   │   │   ├── deepseek.ts           → deepseek-chat
│   │   │   ├── groq.ts               → llama-3.3-70b-versatile
│   │   │   └── glm.ts                → glm-4-flash (Zhipu AI)
│   │   ├── prompts.ts                → buildPrompt() + buildCheapDatesPrompt() (10 ölkə kontekst, 3 dil)
│   │   └── parser.ts                 → parseAIResponse() (code block, trailing comma fix, debug log)
│   │
│   └── supabase/
│       ├── server.ts                 → Server-side Supabase client (@supabase/ssr)
│       └── client.ts                 → Browser-side Supabase client
│
├── types/
│   ├── ai-planner.ts                 → PlanRequest, TravelPlan, PlanResponse, CheapDatesRequest/Response
│   ├── blog.ts                       → Blog, BlogFormData
│   ├── comment.ts                    → BlogComment
│   ├── companion.ts                  → Companion, CompanionFormData
│   ├── chat.ts                       → Conversation, Message
│   ├── tour.ts                       → TourCompany, Tour, TourBooking, TourReview, TourFormData
│   ├── country.ts                    → Country, VisaInfo
│   ├── user.ts                       → Profile
│   └── youtube.ts                    → YouTubeLink, YouTubeFormData
│
├── hooks/
│   └── useChat.ts                    → Chat hook (conversations, messages, Realtime subscription)
│
├── i18n/
│   ├── routing.ts                    → Locales: ['az','ru','en'], default: 'az'
│   └── request.ts                    → Server-side message loading
│
├── messages/
│   ├── az.json                       → Azərbaycan tərcümələri (əsas)
│   ├── en.json                       → İngilis
│   └── ru.json                       → Rus
│
└── middleware.ts                      → next-intl routing + Supabase auth (10 PUBLIC_PATHS)
```

---

## Database (Supabase) — 17 Cədvəl

```
profiles              → İstifadəçi profilləri (auto-create on signup)
blogs                 → Blog yazıları (multilingual, tags, views, likes)
countries             → Ölkə məlumatları
visa_info             → Viza məlumatları
companions            → Yoldaş elanları (destination, dates, gender, interests)
youtube_links         → YouTube video linkləri
tour_companies        → Tur şirkətləri (starter/pro/premium plan)
tours                 → Turlar (7 növ, region, qiymət, tarixlər)
tour_bookings         → Tur rezervasiyaları
tour_reviews          → Tur rəyləri
blog_comments         → Blog şərhləri
blog_likes            → Blog bəyənmələri (atomic RPC: increment/decrement)
user_countries        → Ziyarət edilən ölkələr
leaderboard_stats     → Liderlik statistikası
notifications         → Bildirişlər
conversations         → Söhbət (1:1, companion elanına bağlı)
messages              → Mesajlar (Realtime aktiv)
```

**Migration faylları:** `supabase/migrations/001..004` + `blog-likes.sql`

---

## AI Provider Sistemi

`.env.local`-da `AI_PROVIDER=gemini` yazmaqla dəyişir. Bütün provider-lar sırf `fetch`, SDK-sız.

| Provider | Model | Env Key | Qiymət |
|----------|-------|---------|--------|
| gemini | gemini-2.5-flash (fallback: lite, v3-preview) | `GEMINI_API_KEY` | Pulsuz |
| openai | gpt-4o-mini | `OPENAI_API_KEY` | ~$0.15/1M token |
| claude | claude-3.5-haiku | `ANTHROPIC_API_KEY` | ~$0.25/1M token |
| deepseek | deepseek-chat | `DEEPSEEK_API_KEY` | ~$0.27/1M token |
| groq | llama-3.3-70b-versatile | `GROQ_API_KEY` | Pulsuz tier |
| glm | glm-4-flash | `GLM_API_KEY` | Pulsuz/ucuz |

---

## AI Planner Rejimləri

### 1. Planlaşdır (4 addım)
Destinasiya → Tarix/Nəfər → Büdcə (budget/mid/luxury) → Maraqlar (8 seçim) → Tam günlük plan (JSON)

### 2. En Ucuz Tarix (2 addım)
Destinasiya → Gün (manual input 1-30) + Nəfər (1-10) + Fəsil (yaz/yay/payız/qış) → Top 5 ucuz tarix (AI yalnız seçilən fəslin aylarını göstərir)

---

## Tema Sistemi

`globals.css`-də CSS variables:
- **Dark** (`class="dark"`): tünd fon (#0F172A), mavi accent, neon glow
- **Light** (`class="light"`): açıq fon (#F8FAFC), qlobus üçün tünd mavi gradient

Qlobus (`globe-hero.tsx`): `.light .globe-sphere`, `.light .globe-continent` ilə separate styling.

---

## Əsas Konvensiyalar

- Bütün səhifələr `app/[locale]/` altında
- Server component-lər metadata generasiya edir, client component-lərə yönləndirir
- Client component-lər `'use client'` directive ilə
- Tərcümə: `useTranslations('namespace')` → `src/messages/{locale}.json`
- Supabase: `createClient()` — server üçün `@/lib/supabase/server`, client üçün `@/lib/supabase/client`
- AI sorğuları server-side API route-lar vasitəsilə (`/api/ai/*`)
- Navigasiya: Header-də dropdown qruplar (Rezervasiya, Kəşf et, Xidmətlər, Blog)
- Mock data: Flights və Hotels səhifələri real API deyil, hardcoded data istifadə edir
- Ölkə məlumatları: `countries/page.tsx` və `prompts.ts`-da hardcoded (10 ölkə)

---

## Public Assets

```
public/
├── globe.svg     → Qlobus üçün SVG
├── window.svg    → Pəncərə ikonu
├── vercel.svg    → Vercel logo
├── next.svg      → Next.js logo
└── file.svg      → Fayl ikonu
```

---

## Arxitektura Qeydləri

1. **Tailwind v4** — Ayrı config faylı yoxdur, hamısı `globals.css`-də `@theme inline` blokunda
2. **Gemini fallback** — 503 overload olanda avtomatik növbəti modeli sınayır
3. **Blog likes** — Atomic PostgreSQL RPC funksiyaları ilə (race condition qarşısı alınır)
4. **Chat Realtime** — Supabase Realtime channel ilə anında mesaj çatdırma
5. **Tour plan limitləri** — starter=5 tur, pro=20 tur, premium=999 tur
6. **Middleware** — Həm i18n routing, həm Supabase auth bir yerdə
7. **Middleware PUBLIC_PATHS** — Login, register, callback, api və s. auth tələb etmir
