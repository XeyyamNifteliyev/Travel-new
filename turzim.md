# ✈️ TravelAZ — Tam Səyahət Platforması: Layihə Planı v3.0

> **Məqsəd:** Azərbaycanlı istifadəçilər üçün bilet, otel, viza, daxili turlar, yoldaş axtarışı, blog və video-kontentdən ibarət "hər şey bir yerdə" səyahət platforması.
>
> **Dil dəstəyi:** 🇦🇿 Azərbaycan · 🇷🇺 Русский · 🇬🇧 English

---

## 📋 MÜNDƏRİCAT

1. [Platforma Strukturu](#1-platforma-strukturu)
2. [Çoxdilli Dəstək](#2-çoxdilli-dəstək)
3. [Bilet və Otel — Saytdaxili Axtarış](#3-bilet-və-otel--saytdaxili-axtarış)
4. [Əsas Modullar](#4-əsas-modullar)
5. [Blog Sistemi — Cəmiyyətin Gücü](#5-blog-sistemi--cəmiyyətin-gücü)
6. [Azərbaycan Daxili Turlar Modulu](#6-azərbaycan-daxili-turlar-modulu)
7. [Affiliate Gəlir Sistemi](#7-affiliate-gəlir-sistemi)
8. [Əlavə Gəlir Mənbələri](#8-əlavə-gəlir-mənbələri)
9. [Texniki Stack](#9-texniki-stack)
10. [Dizayn Prinsipləri](#10-dizayn-prinsipləri)
11. [Təhlükəsizlik](#11-təhlükəsizlik)
12. [Ödəniş Sistemi — ePoint](#12-ödəniş-sistemi--epoint)
13. [**YENİ: Dashboard Dizaynı**](#13-dashboard-dizaynı)
14. [MVP Yol Xəritəsi](#14-mvp-yol-xəritəsi)
15. [Məsləhətlər](#15-məsləhətlər)

---

## 1. Platforma Strukturu

```
TravelAZ/
├── 🏠 Ana Səhifə (axtarış + featured destinations)
├── ✈️ Bilet Axtarışı (saytdaxili UI → Skyscanner API)
├── 🏨 Otel Axtarışı (saytdaxili UI → Booking.com API)
├── 🗺️ Ölkə Səhifələri (məşhur yerlər + viza)
├── 🏔️ Azərbaycan Daxili Turlar
│   ├── Tur şirkəti elanları (ödənişli qeydiyyat)
│   └── Tur axtarışı + rezervasiya
├── 👥 İcma Dashboardu
│   ├── Yoldaş tap (filtrlər ilə)
│   ├── Bloglar (ödənişsiz, limitsiz)
│   └── Video linklər (YouTube embed)
├── 🛂 Viza Mərkəzi
├── 💳 Ödəniş (ePoint) ← ən sonda
├── 📊 İstifadəçi Dashboard (YENİ!) ← müasir, funksional
└── 👤 İstifadəçi Profili
    ├── 🌍 Getdiyim ölkələr (xəritə)
    └── 📝 Bloglarım
```

---

## 2. Çoxdilli Dəstək

### Dəstəklənən Dillər
| Dil | Kod | İstifadəçi Kütləsi |
|---|---|---|
| 🇦🇿 Azərbaycan | `az` | Əsas hədəf auditoriya |
| 🇷🇺 Русский | `ru` | Azərbaycanda böyük istifadəçi bazası |
| 🇬🇧 English | `en` | Beynəlxalq istifadəçilər + SEO |

### Texniki Tətbiq — next-intl

```
Framework: next-intl (Next.js üçün ən yaxşı i18n həlli)

Fayl strukturu:
/messages/
  az.json   ← Azərbaycan dilindəki bütün mətnlər
  ru.json   ← Rus dilindəki bütün mətnlər
  en.json   ← İngilis dilindəki bütün mətnlər

URL strukturu:
  travelaz.az/az/...   → Azərbaycanca
  travelaz.az/ru/...   → Rusca
  travelaz.az/en/...   → İngiliscə
```

```javascript
// next-intl istifadəsi
import { useTranslations } from 'next-intl';

export default function SearchBox() {
  const t = useTranslations('search');
  return <button>{t('findTicket')}</button>;
  // az: "Bilet tap"
  // ru: "Найти билет"
  // en: "Find Ticket"
}
```

### Dil Seçimi UI
- Header-də bayraq ikonlu dropdown: 🇦🇿 AZ | 🇷🇺 RU | 🇬🇧 EN
- İstifadəçinin seçimi `localStorage` + cookie-də saxlanır
- Brauzerin dilini avtomatik tanıyır (Accept-Language header)
- SEO üçün hər dilin ayrı URL-i olur (`hreflang` taqları)

### Məzmun Strategiyası
```
Statik məzmun (UI, düymələr):    3 dildə tam tərcümə
Ölkə/viza məlumatları:           3 dildə tam məzmun
Blog yazıları:                   İstifadəçinin yazdığı dildə
                                 (filtrdə dil seçimi olur)
Tur elanları:                    Şirkətin daxil etdiyi dildə
                                 (az/ru/en seçimi ilə)
```

---

## 3. Bilet və Otel — Saytdaxili Axtarış

> **Strateji:** İstifadəçi **heç vaxt saytı tərk etmir** — axtarış, nəticələr və seçim bizim saytda baş verir. Ödəniş mərhələsində isə Skyscanner/Booking.com-un öz ödəniş səhifəsinə yönləndirilir.

### 3.1 ✈️ Bilet Axtarışı — Saytdaxili UI

**Axın:**
```
İstifadəçi → Öz axtarış formumuzu doldurur
           → Nəticələr BİZİM saytda göstərilir
           → "Bilet Al" düyməsinə basır
           → Skyscanner-in ödəniş səhifəsinə keçir
           → Ödəniş Skyscanner-də tamamlanır
           → Bizə affiliate komisyon yazılır
```

**Skyscanner API inteqrasiyası:**
```javascript
// Skyscanner Live Prices API (RapidAPI vasitəsilə)
const searchFlights = async ({ from, to, date, passengers }) => {
  const res = await fetch(
    `https://skyscanner-api.p.rapidapi.com/v3/flights/live/search/create`,
    {
      method: "POST",
      headers: {
        "x-rapidapi-key": process.env.SKYSCANNER_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: {
          market: "AZ", locale: "az-AZ", currency: "AZN",
          queryLegs: [{ originPlaceId: from, destinationPlaceId: to, date }],
          adults: passengers
        }
      })
    }
  );
  return res.json();
};
```

**Öz UI-mızda nəticə kartı:**
```
┌─────────────────────────────────────────────┐
│ ✈️  Baku → Istanbul                         │
│ AZAL  |  06:30 → 08:45  |  2s 15d           │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                              💰 245 AZN     │
│                      [Bilet Al →]           │
└─────────────────────────────────────────────┘
          ↑ bizim saytda göstərilir
          "Bilet Al" → Skyscanner ödəniş səhifəsi
```

**Qeydiyyat:** [partners.skyscanner.net](https://partners.skyscanner.net) → API partner olun

---

### 3.2 🏨 Otel Axtarışı — Saytdaxili UI

**Axın:**
```
İstifadəçi → Şəhər + tarix + qonaq sayı daxil edir
           → Nəticələr BİZİM saytda göstərilir (foto, qiymət, reytinq)
           → "Rezervasiya Et" düyməsinə basır
           → Booking.com-un otel səhifəsinə keçir
           → Ödəniş Booking.com-da tamamlanır
           → Bizə 4–6% komisyon yazılır
```

**Booking.com API inteqrasiyası:**
```javascript
// Booking.com Demand API (tərəfdaşlara verilir)
const searchHotels = async ({ city, checkin, checkout, guests }) => {
  const res = await fetch(
    `https://distribution-xml.booking.com/2.9/json/hotels`,
    {
      headers: {
        Authorization: `Basic ${btoa(
          `${process.env.BOOKING_USER}:${process.env.BOOKING_PASS}`
        )}`
      }
    }
  );
  return res.json();
};
```

**Alternativ (daha sadə başlanğıc):**
Booking.com-un hazır **"Search Box" widgeti** — iframe ilə yerləşdirilir, 1 gün içində quraşdırılır. Daha az özelləşmə, amma sürətli başlanğıc.

**Öz UI-mızda otel kartı:**
```
┌─────────────────────────────────────────────┐
│ 🏨 Grand Hotel Istanbul ★★★★               │
│ 📍 Sultanahmet  |  ⭐ 8.7/10 (2,341 rəy)   │
│ 🛏️ Standart otaq, 2 nəfər                  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ ✅ Pulsuz ləğv  ✅ Səhər yeməyi daxil       │
│                          💰 120 AZN/gecə   │
│                   [Rezervasiya Et →]        │
└─────────────────────────────────────────────┘
         ↑ bizim saytda göstərilir
         "Rezervasiya Et" → Booking.com
```

**Qeydiyyat:** [join.booking.com](https://join.booking.com) → Affiliate + Demand API

---

## 4. Əsas Modullar

### 4.1 🗺️ Ölkə Səhifələri

Hər ölkə üçün ayrıca çoxdilli səhifə:

```
/az/olkeler/yaponiya   → Azərbaycanca
/ru/strany/yaponiya    → Rusca
/en/countries/japan    → İngiliscə
```

Hər ölkə səhifəsinin məzmunu:
- Məşhur yerlər (foto + xəritə nöqtəsi + ən yaxşı ziyarət vaxtı)
- Ortalama xərclər cədvəli (bilet, otel, gündəlik)
- Viza məlumatı (→ Viza Mərkəzinə link)
- İqlim təqvimi
- İstifadəçilərin bu ölkə haqqında blogları (canlı feed)
- Birbaşa bilet + otel axtarışı widgeti

---

### 4.2 👥 İcma Dashboardu

**İstifadəçi özəllikləri:**
- Profil (ad, yaş, cinsiyyət, maraqlar, dil bilikləri)
- Getdiyi ölkələri interaktiv xəritədə işarələmək
- Blog yazıları (ödənişsiz, limitsiz — bax §5)
- YouTube video linklərini paylaşmak (avtomatik thumbnail)
- Sosial şəbəkə hesablarını əlavə etmək

**Yoldaş Axtarışı — Filtrlər:**
```
✅ Gedilən ölkə / şəhər
✅ Cinsiyyət
✅ Tarix aralığı
✅ Yaş aralığı
✅ Maraqlar (təbiət / şəhər / qastro / mədəniyyət / fotoqrafiya)
✅ Dil biliyi
✅ Blog yazısı dili (az / ru / en)
```

---

### 4.3 🛂 Viza Mərkəzi

Hər ölkə üçün 3 dildə:

| Məlumat | Detal |
|---|---|
| Viza tələbi | Lazımdır / Lazım deyil / On-arrival / E-viza |
| Rəsmi konuslluq saytı | Birbaşa link (ölkə saytı açılır) |
| Azərbaycanlılar üçün xüsusi şərtlər | ✅/❌ |
| Ortalama prosesing vaxtı | X iş günü |
| Tələb olunan sənədlər | İnteraktiv checklist |
| Konuslluq ünvanı (Bakıda) | Xəritə + telefon + iş saatları |
| Onlayn müraciət linki | Varsa, birbaşa link |

> ⚠️ **Hüquqi qeyd:** Viza məlumatları yalnız məlumatlandırma məqsədlidir. Rəsmi konuslluq saytını həmişə yoxlayın.

---

## 5. Blog Sistemi — Cəmiyyətin Gücü

> **Prinsip:** Blogerlərdən **heç bir ödəniş alınmır**. Əksinə, onlara **maksimum dəyər verilir** — çünki keyfiyyətli məzmun platformanın ən böyük aktividir.

### Blogerlərin Sayta Faydası
```
✅ Üzvi (SEO) trafik → hər blog yazısı indekslənir
✅ Canlı icma → digər səyahətçilər blog vasitəsilə tapılır
✅ Affiliate klikləri → blogdakı ölkə/otel linklərindən gəlir
✅ İctimai etibar → real təcrübələr yeni istifadəçi cəlb edir
```

### Blogerlərin Aldığı Dəyər (PULSUZ)
```
🎁 Limitsiz blog yazısı
🎁 Şəxsi profil səhifəsi (portfolio kimi işləyir)
🎁 Bütün sosial şəbəkə linklərini əlavə etmək
🎁 YouTube kanalına link + avtomatik video thumbnail
🎁 "Müəllif kartı" — hər blog sonunda profil görünür
🎁 Yazıların axtarış sistemlərində (Google) indekslənməsi
🎁 Aylıq "Ən Yaxşı Yazıçı" lövhəsi — ana səhifədə tanıtım
🎁 Öz sosial şəbəkələrini platformada reklam etmək imkanı
🎁 Yazılardan paylaş düymələri — öz auditoriyasına çatır
```

### Blog Yazısı Strukturu
```
┌─────────────────────────────────────────────────┐
│  [Başlıq]              [🇯🇵 Yaponiya] [2025 Yan]│
│  ✍️ Anar Həsənov  |  ☕ 8 dəq oxuma  | ❤️ 142   │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Rich Text Məzmun — TipTap Editor]             │
│  [Foto qalereya — max 20 şəkil]                 │
│  [YouTube video linki → avtomatik embed]        │
│  [Xərc cədvəli — opsional]                      │
│  [Xəritə nöqtəsi — opsional]                    │
│                                                 │
├─────────────────────────────────────────────────┤
│  🔗 Paylaş:                                     │
│  [Instagram] [Facebook] [WhatsApp] [Telegram]   │
│  [TikTok] [X/Twitter] [LinkedIn] [Kopyala]      │
├─────────────────────────────────────────────────┤
│  👤 Müəllif haqqında                            │
│  Anar Həsənov | 34 ölkə | 12 blog              │
│  [Instagram ↗] [YouTube ↗] [TikTok ↗]          │
└─────────────────────────────────────────────────┘
```

### Bloger Motivasiya Sistemi
```
🏆 Liderlik Cədvəli (aylıq):
   1. Ən çox oxunan yazıçı → Ana səhifədə banner
   2. Ən çox paylaşılan → "Həftənin Yazıçısı" badge-i
   3. Ən çox bəyənilən → Profildə "Top Contributor" nişanı

📊 Şəxsi Statistika (hər bloger görür):
   - Neçə nəfər oxudu
   - Neçə dəfə paylaşıldı
   - Profil neçə dəfə ziyarət edildi
   - Ən populyar yazısı
```

---

## 6. Azərbaycan Daxili Turlar Modulu

> **Konsept:** Azərbaycanda tur xidməti göstərən şirkətlər platformada **ödənişli hesab** açır və elanlarını yerləşdirir. İstifadəçilər isə pulsuz olaraq bu turları axtarır və rezervasiya edir.

### 6.1 Tur Şirkəti Qeydiyyatı (B2B — Ödənişli)

**Qeydiyyat Paketləri (ePoint vasitəsilə ödənilir):**

| Plan | Qiymət | Özəlliklər |
|---|---|---|
| Starter | 50 AZN/ay | 5 aktiv elan, əsas profil |
| Pro | 120 AZN/ay | 20 aktiv elan, şəkil qalereya, prioritet sıralama |
| Premium | 250 AZN/ay | Limitsiz elan, ana səhifə tanıtımı, statistika paneli |

**Şirkət profili ehtiva edir:**
```
✅ Şirkət adı, loqo, əlaqə məlumatları
✅ Lisenziya nömrəsi (etibarlılıq üçün)
✅ Müştəri rəyləri (yalnız rezervasiya edənlər yaza bilər)
✅ Ortalama reytinq
✅ Aktiv tur elanları
✅ WhatsApp / Telegram birbaşa əlaqə düyməsi
```

### 6.2 Tur Elanı Strukturu

```
┌─────────────────────────────────────────────────┐
│  🏔️ Şahdağ Qış Turu — 2 Gecə 3 Gün             │
│  ⭐ 4.8/5  (67 rəy)  |  🏢 SunTravel MMC        │
├─────────────────────────────────────────────────┤
│  📅 Tarixlər: 15 Yan, 22 Yan, 29 Yan            │
│  👥 Qrup: 8–15 nəfər                            │
│  🚌 Nəqliyyat: Daxildir                         │
│  🏨 Otel: 3★ — daxildir                         │
│  🍽️ Qidalanma: Səhər yeməyi                     │
├─────────────────────────────────────────────────┤
│  Proqram:                                       │
│  Gün 1: Bakı → Quba → Şahdağ                   │
│  Gün 2: Xizək / Kanatlı yol / Ekskursiya        │
│  Gün 3: Şahdağ → Laza → Bakı                   │
├─────────────────────────────────────────────────┤
│           💰 180 AZN / nəfər                    │
│  [WhatsApp ilə əlaqə] [Rezervasiya Et]          │
└─────────────────────────────────────────────────┘
```

### 6.3 Daxili Tur Axtarış Filtirləri

```
✅ Region (Quba, Şəki, Lənkəran, Naxçıvan, Qarabağ...)
✅ Tur növü (aktiv / mədəni / qastro / ailə / solo)
✅ Tarix aralığı
✅ Qiymət aralığı
✅ Qrup ölçüsü
✅ Nəqliyyat (daxil / daxil deyil)
✅ Qidalanma (daxil / daxil deyil)
✅ Dil (az / ru / en)
✅ Reytinq (4★+)
```

### 6.4 Rezervasiya Axını

```
İstifadəçi tur seçir
       ↓
"Rezervasiya Et" → Şirkətin WhatsApp/Telegram-ına
                   YA DA platformada onlayn rezervasiya formu
       ↓
Onlayn ödəniş (ePoint) — tam məbləğ YA DA depozit
       ↓
Şirkətə bildiriş → Şirkət təsdiq edir
       ↓
İstifadəçiyə email/SMS təsdiqnaməsi
```

### 6.5 Platformanın Gəliri (Daxili Turlardan)

```
💰 Aylıq abunə (şirkət qeydiyyatı):   50–250 AZN/ay
💰 Rezervasiya komisyonu:              5–8% hər rezervasiyadan
💰 Featured elan (ana səhifə):         +50 AZN/həftə
```

---

## 7. Affiliate Gəlir Sistemi

```
GƏLİR MƏNBƏYİ           KOMİSYON        ÖDƏMƏ
──────────────────────────────────────────────
Skyscanner bilet          1–3%           Aylıq
Booking.com otel          4–6%           Aylıq
Rentalcars.com            5–10%          Aylıq
GetYourGuide (turlar)     8%             Aylıq
TripAdvisor               Sabit/klik     Aylıq
SafetyWing (sığorta)      15–25%         Aylıq
```

**Affiliate linklerin idarəsi:**
- Hər linkə **UTM parametrləri** əlavə edin
- Hansı ölkə/destinasiya daha çox klik aldığını izləyin
- Google Analytics + Affiliate paneli birlikdə işləsin
- Server-side redirect ilə affiliate ID-lər gizlədilir

---

## 8. Əlavə Gəlir Mənbələri

### 8.1 💎 Premium Üzvlük (İstifadəçi üçün)
```
Pulsuz:          Limitsiz blog, yoldaş axtarışı, əsas özəlliklər
Premium (15 AZN/ay):  Reklamlarsız, yoldaş öncelik sıralama,
                       ucuz bilet alert bildirişləri (email/push)
```

### 8.2 📣 Reklam Yerləşdirmə
- Tur şirkətləri, aviakompaniyalar üçün banner
- **Sponsored Ölkə Səhifəsi** — turizm idarəsi ilə razılaşma
- Google AdSense (başlanğıcda)
- **Featured Destinasiya** — ana səhifədə "Həftənin Tövsiyəsi"

### 8.3 🤝 Daxili Tur Şirkəti Abunəsi
- Bax §6.1 — 50–250 AZN/ay + 5–8% rezervasiya komisyonu

### 8.4 📦 Sığorta Affiliate
- SafetyWing, AXA Travel Insurance
- Hər sığorta satışından **15–25%** komisyon
- Bilet axtarışı nəticəsinin yanında "Səyahət Sığortası" bölməsi

### 8.5 📍 Sponsored Məkan Yerləşdirmə
- Otellər, restoranlar "Məşhur Yerlər" siyahısında üst mövqe üçün ödəyir

### 8.6 📧 Sponsored Newsletter
- Hər həftə göndərilən "Ucuz Bilet" email-i — şirkətlər sponsor ola bilər

---

## 9. Texniki Stack

### Frontend
```
Framework:    Next.js 14 (App Router)
Dil:          TypeScript
Stil:         Tailwind CSS + shadcn/ui
Animasiya:    Framer Motion
Xəritə:       Mapbox GL JS (ölkə işarələmə)
Editor:       TipTap (blog yazısı üçün rich text)
i18n:         next-intl (az / ru / en)
```

### Backend
```
Runtime:      Node.js (Next.js API Routes) + Supabase
Database:     PostgreSQL (Supabase)
Auth:         Supabase Auth (Google, Facebook, Email)
Fayl yükləmə: Supabase Storage (şəkillər)
Cache:        Redis (Upstash — bilet sorğuları)
Email:        Resend.com
Push bildiriş: OneSignal (ucuz bilet alertləri)
```

### Xarici API-lər
```
Bilet axtarışı:   Skyscanner API (RapidAPI vasitəsilə)
Otel axtarışı:    Booking.com Demand API
Xəritə:           Mapbox / Google Maps
Tərcümə yardımı:  DeepL API (avtomatik məzmun tərcüməsi)
```

### Hosting & DevOps
```
Hosting:      Vercel (frontend + API)
CDN:          Cloudflare
Monitoring:   Sentry + Vercel Analytics
CI/CD:        GitHub Actions
```

### Aylıq Xərclər (başlanğıc)
```
Vercel (Pro):           ~20 USD
Supabase (Pro):         ~25 USD
Cloudflare (Free):       0 USD
Upstash Redis:          ~10 USD
RapidAPI (Skyscanner):  ~30 USD (istifadəyə görə)
Mapbox:                  0 USD (50k yükləməyə qədər)
Resend:                  0 USD (3000 email/ay)
CƏMI:                  ~85 USD/ay
```

---

## 10. Dizayn Prinsipləri

### Rəng Paleti (Müasir Turizm)
```css
--primary:      #0EA5E9;  /* Göy mavi — azadlıq, səma */
--secondary:    #F59E0B;  /* Qızıl sarı — günəş, isti */
--accent:       #10B981;  /* Yaşıl — təbiət */
--dark:         #0F172A;  /* Tünd fon */
--surface:      #1E293B;  /* Kart arxa planı */
--az-flag:      #0092BC;  /* Azərbaycan bayrağı mavi */
```

### UI/UX Prinsipləri
- **Mobile-first** dizayn (istifadəçilərin 70%+ mobildir)
- **Glassmorphism** efektlər (şəffaf kartlar, blur)
- **RTL dəstəyi** hazırlanmalıdır (gələcəkdə ərəb dili üçün)
- **Skeleton loading** (məzmun yüklənərkən placeholder)
- **Dark mode** standart olaraq, light mode seçim kimi
- **Omnisearch** — bilet + otel + ölkə + tur eyni axtarış çubuğunda

### Performans Hədəfləri
```
LCP (Largest Contentful Paint): < 2.5s
FID (First Input Delay):        < 100ms
CLS (Cumulative Layout Shift):  < 0.1
Lighthouse Skoru:               90+
```

---

## 11. Təhlükəsizlik

### Authentication & Authorization
```
✅ JWT + Refresh Token (Supabase idarə edir)
✅ OAuth 2.0 (Google, Facebook)
✅ Rate Limiting (Upstash Ratelimit)
✅ CSRF mühafizəsi
✅ SQL Injection qorunması (Supabase ORM)
✅ XSS qorunması (Content Security Policy)
✅ Rol sistemi: İstifadəçi / Tur Şirkəti / Admin
```

### Məlumat Qorunması
```
✅ HTTPS məcburi (Cloudflare)
✅ Şifrə heç vaxt açıq saxlanmır (Supabase hash edir)
✅ Affiliate linklər server-side redirect ilə
✅ İstifadəçi datası export/sil funksiyası (GDPR)
✅ Uşaqların qorunması üçün yaş yoxlaması
✅ Tur şirkəti lisenziya yoxlaması (manual admin təsdiqi)
```

### Affiliate Link Qorunması
```javascript
// /api/redirect?dest=booking&hotel=xyz&session=abc
// → server-side: affiliate ID əlavə et → yönləndir
// → istifadəçi affiliate ID-ni görməz
// → hər klik database-də qeydə alınır (analytics)
```

---

## 12. Ödəniş Sistemi — ePoint

> ⏳ **Ödəniş sistemi ən sonda qurulacaq.**

**ePoint inteqrasiyası üçün addımlar:**
1. [epoint.az](https://epoint.az) tərəfdaşlıq müraciəti
2. Merchant ID və API açarları alın
3. Test mühitində sınaqdan keçirin
4. Production-a keçin

**ePoint ilə nə ödənilə bilər:**
```
✅ Premium üzvlük (istifadəçi)
✅ Tur şirkəti aylıq abunəsi
✅ Daxili tur rezervasiyası (depozit və ya tam məbləğ)
✅ Sponsored məkan / featured elan
✅ Reklam yerləşdirmə
```

**Texniki inteqrasiya:**
```javascript
// ePoint ödəniş axını
const payment = await epoint.createTransaction({
  amount: 120.00,         // AZN
  currency: "AZN",
  description: "SunTravel Pro Plan - 1 ay",
  orderId: uuid(),
  successUrl: "/dashboard/payment-success",
  failUrl: "/dashboard/payment-fail",
  callbackUrl: "/api/payment/epoint-callback"
});
redirect(payment.paymentUrl);
```

---

## 13. Dashboard Dizaynı

> 🎨 **Məqsəd:** İstifadəçi və Tur Şirkətləri üçün müasir, funksional, çoxdilli dashboard — mobil və desktop üçün responsive.

---

### 13.1 Dashboard Növləri

Platformada **3 növ dashboard** olacaq:

| Rol | Dashboard | URL |
|---|---|---|
| 👤 İstifadəçi | Traveler Dashboard | `/az/dashboard` |
| 🏢 Tur Şirkəti | Company Dashboard | `/az/company/dashboard` |
| 👨‍💼 Admin | Admin Panel | `/az/admin` (gələcək) |

---

### 13.2 👤 İstifadəçi Dashboard (Traveler Dashboard)

#### Layout Strukturu

```
┌──────────────────────────────────────────────────────────────┐
│  [HEADER: Logo | Search | Notifications | Language | Avatar] │
├────────────┬─────────────────────────────────────────────────┤
│            │                                                 │
│            │  [MAIN CONTENT AREA]                            │
│  SIDEBAR   │                                                 │
│            │  • Ana Panel / Profil / Bloglar / Turlar        │
│  (Menu)    │  • Dinamik statistika və widget-lər            │
│            │  • İnteraktiv xəritə                            │
│            │                                                 │
│            │                                                 │
├────────────┴─────────────────────────────────────────────────┤
│  [FOOTER: Copyright | Links | Social Media]                  │
└──────────────────────────────────────────────────────────────┘
```

---

#### Sidebar Menyusu (Sol Panel)

**Desktop (≥1024px):**
- Sidebar həmişə açıq (280px en)
- Hover efektləri və animasiyalar
- İkonlar + mətn

**Tablet/Mobile (<1024px):**
- Hamburger menu icon
- Overlay sidebar (açılanda ekranın üzərində)
- Swipe to close funksiyası

**Menyu punktləri:**

```
┌─────────────────────────────┐
│  👤 Anar Həsənov            │
│  Premium Üzv 💎             │
│  34 ölkə ziyarət edilib 🌍  │
├─────────────────────────────┤
│  📊 Ana Panel               │
│  🌍 Xəritəm                 │
│  ✈️ Səyahətlərim            │
│  📝 Bloglarım               │
│  🎥 Videolarım              │
│  👥 Yoldaş Tap              │
│  🏔️ Daxili Turlar           │
│  🔖 Yadda Saxlanılanlar     │
│  📈 Statistikam             │
│  ⚙️ Tənzimləmələr           │
│  💎 Premium ol              │
├─────────────────────────────┤
│  🚪 Çıxış                   │
└─────────────────────────────┘
```

---

#### 13.2.1 📊 Ana Panel (Overview)

**Widget Grid System (Responsive):**
- Desktop: 3-4 columns grid
- Tablet: 2 columns grid
- Mobile: 1 column stack

**Dashboard Widgetləri:**

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 Xoş gəldin, Anar! 👋                                        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ 🌍 Ölkələr   │  │ 📝 Bloglar   │  │ 👁️ Baxışlar  │         │
│  │   34 ölkə    │  │   12 yazı    │  │   2,847 view │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  🗺️ Getdiyim Ölkələr (İnteraktiv Xəritə)                  │ │
│  │  [Mapbox GL JS — işarələnmiş ölkələr highlight]           │ │
│  │  Hover: ölkə adı + blog sayı + ən son ziyarət tarixi      │ │
│  │  Click: ölkə səhifəsinə keçid                             │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────┐  ┌──────────────────────┐  │
│  │  📈 Son Aktivlik              │  │  🔥 Trending Bloglar │  │
│  │  • Yaponiya bloqu - 142 ❤️    │  │  1. Tokyo Quide      │  │
│  │  • İstanbul video - 89 👁️     │  │  2. Dubai Tips       │  │
│  │  • Şəki turuna qatıldın       │  │  3. Paris Secrets    │  │
│  └───────────────────────────────┘  └──────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  💡 Tövsiyələr                                            │ │
│  │  • Profilini tamamla — 20% daha çox görünüş!             │ │
│  │  • Premium ol — reklamlardan qurtar 💎                    │ │
│  │  • Yeni bloq yaz — SEO trafikini artır                   │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

#### 13.2.2 🌍 Xəritəm (Visited Countries)

**Tam ekran interaktiv xəritə:**
```
┌─────────────────────────────────────────────────────────────────┐
│  🌍 Mənim Səyahət Xəritəm                                       │
│  [Filtrlər: Bütün ölkələr | Bloglu ölkələr | Planladığım]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [MAPBOX GL JS — Dünya Xəritəsi]                               │
│  • Getmiş olduğum ölkələr: Yaşıl rəng (#10B981)                │
│  • Planladığım ölkələr: Sarı rəng (#F59E0B)                    │
│  • Digər ölkələr: Boz rəng                                     │
│                                                                 │
│  Hover efekti:                                                  │
│  ┌─────────────────────┐                                       │
│  │ 🇯🇵 Yaponiya        │                                       │
│  │ ✅ 3 blog yazısı    │                                       │
│  │ 📅 Son: 2025 Mart   │                                       │
│  │ [Bloqlara bax →]    │                                       │
│  └─────────────────────┘                                       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  [+ Ölkə əlavə et] düyməsi → Axtarış modalı açılır            │
│  [Statistika]: 34 ölkə ziyarət edilib | 12 planlı destinasiya  │
└─────────────────────────────────────────────────────────────────┘
```

---

#### 13.2.3 📝 Bloglarım (My Blogs)

**Cədvəl + Kart görünüşü (toggle ilə):**

```
┌─────────────────────────────────────────────────────────────────┐
│  📝 Bloglarım                              [+ Yeni Bloq Yarat]  │
│  [Görünüş: 📋 List | 🎴 Cards]  [Filtr: Hamısı | Dərc | Draft] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 🇯🇵 Tokyo səyahətim — 7 gün 6 gecə                        │ │
│  │ ✍️ 2025-01-15  |  ☕ 8 dəq oxuma  |  ❤️ 142  |  👁️ 1,230 │ │
│  │ [Düzəliş et] [Sil] [Paylaş] [Statistika]                  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 🇦🇪 Dubai ucuz qalma yolları                              │ │
│  │ ✍️ 2025-02-10  |  ☕ 5 dəq oxuma  |  ❤️ 89  |  👁️ 567    │ │
│  │ [Düzəliş et] [Sil] [Paylaş] [Statistika]                  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [Səhifələmə: 1 2 3 ... 5]                                     │
└─────────────────────────────────────────────────────────────────┘
```

**Bloq Statistika Modal (klik edəndə açılır):**

```
┌────────────────────────────────────────┐
│  📈 Tokyo səyahətim — Statistika       │
├────────────────────────────────────────┤
│  👁️ Görüntülənmə: 1,230               │
│  ❤️ Bəyənmə: 142                       │
│  💬 Şərh: 23                           │
│  🔗 Paylaşma: 45                       │
│  📅 Ən aktiv gün: 2025-01-20           │
│  🌍 Ən çox baxan ölkə: Azərbaycan     │
│                                        │
│  [Line Chart: Son 30 gün baxış]       │
│  [Close]                               │
└────────────────────────────────────────┘
```

---

#### 13.2.4 👥 Yoldaş Tap (Find Travel Buddy)

**Filtr + Nəticələr:**

```
┌─────────────────────────────────────────────────────────────────┐
│  👥 Səyahət Yoldaşı Tap                                         │
├──────────────────┬──────────────────────────────────────────────┤
│  FILTRLƏR        │  NƏTİCƏLƏR (24 nəfər tapıldı)              │
│                  │                                              │
│  📍 Destinasiya  │  ┌────────────────────────────────────────┐ │
│  [Yaponiya ▼]    │  │ 👤 Leyla Məmmədova, 28                │ │
│                  │  │ 🇯🇵 Tokyo, 2025 Aprel 10-20           │ │
│  📅 Tarix        │  │ 📸 Fotoqrafiya | Mədəniyyət           │ │
│  [10-20 Apr]     │  │ 🗣️ AZ, RU, EN                         │ │
│                  │  │ [Profil] [Mesaj göndər]               │ │
│  🚻 Cinsiyyət    │  └────────────────────────────────────────┘ │
│  ⚪ Hamısı       │                                              │
│  ⚪ Qadın         │  ┌────────────────────────────────────────┐ │
│  ⚪ Kişi          │  │ 👤 Rəşad Əliyev, 32                   │ │
│                  │  │ 🇯🇵 Osaka, 2025 Aprel 12-18           │ │
│  🎯 Maraqlar     │  │ 🍜 Qastro | Şəhər                     │ │
│  ☑️ Təbiət       │  │ 🗣️ AZ, EN                             │ │
│  ☑️ Mədəniyyət   │  │ [Profil] [Mesaj göndər]               │ │
│  ☐ Qastro        │  └────────────────────────────────────────┘ │
│  ☐ Fotoqrafiya   │                                              │
│                  │  [Səhifələmə: 1 2 3]                        │
│  [Təmizlə]       │                                              │
│  [Axtar]         │                                              │
└──────────────────┴──────────────────────────────────────────────┘
```

---

#### 13.2.5 ⚙️ Tənzimləmələr (Settings)

**Tab sistem:**

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚙️ Tənzimləmələr                                               │
│  [Profil | Hesab | Bildirişlər | Məxfilik | Dil və Region]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📝 PROFIL MƏLUMATLARI                                          │
│  ┌─────────────────────────────────────┐                       │
│  │  [Profil Şəkli] — drag & drop        │                       │
│  │  Ad: [Anar Həsənov_________]          │                       │
│  │  Bio: [Səyahət həvəskarı..._____]     │                       │
│  │  Yaş: [34___]  Cins: [Kişi ▼]         │                       │
│  │  Şəhər: [Bakı________]                │                       │
│  └─────────────────────────────────────┘                       │
│                                                                 │
│  🌐 SOSIAL ŞƏBƏKƏLƏR                                            │
│  Instagram: [@anar_travels____________]                         │
│  YouTube: [youtube.com/c/anar______]                            │
│  TikTok: [@anartravels____________]                             │
│  Facebook: [Əlavə et]                                           │
│                                                                 │
│  🔔 BİLDİRİŞ TƏNZİMLƏMƏLƏRİ                                    │
│  ☑️ Email bildirişləri                                          │
│  ☑️ Push bildirişlər (ucuz bilet alertləri)                    │
│  ☐ SMS bildirişlər                                              │
│                                                                 │
│  [Yadda saxla] [Ləğv et]                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

### 13.3 🏢 Tur Şirkəti Dashboard (Company Dashboard)

#### Sidebar Menyusu

```
┌─────────────────────────────┐
│  🏢 SunTravel MMC           │
│  Pro Plan 💼                │
│  Lisenziya: #123456         │
├─────────────────────────────┤
│  📊 Ana Panel               │
│  🏔️ Tur Elanlarım           │
│  📅 Rezervasiyalar          │
│  ⭐ Rəylər                  │
│  📈 Statistika              │
│  💳 Ödənişlər               │
│  ⚙️ Tənzimləmələr           │
│  🎯 Plan Yüksəlt            │
├─────────────────────────────┤
│  🚪 Çıxış                   │
└─────────────────────────────┘
```

---

#### 13.3.1 📊 Şirkət Ana Paneli

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 SunTravel MMC Dashboard                                     │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ 🏔️ Aktiv Tur │  │ 📅 Rezerv.   │  │ ⭐ Reytinq   │         │
│  │   15/20 elan │  │   34 tur     │  │   4.8/5.0    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  📈 Aylıq Statistika (Mart 2025)                          │ │
│  │  [Line Chart: Rezervasiya sayı / Gəlir / Profil baxışı]  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────┐  ┌──────────────────────┐  │
│  │  ⏰ Gözləyən Rezervasiyalar   │  │  🔥 Ən Populyar Tur  │  │
│  │  1. Şahdağ — 2 nəfər          │  │  Şəki 2 Gün          │  │
│  │  2. Qəbələ — 4 nəfər          │  │  67 rezervasiya      │  │
│  │  [Hamısına bax →]             │  │  4.9⭐ reytinq       │  │
│  └───────────────────────────────┘  └──────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  💡 Platformadan Təkliflər                                │ │
│  │  • Premium plana keç — ana səhifədə görün! 🚀            │ │
│  │  • Yeni turlarınızı əlavə edin — mart ayı aktiv          │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

#### 13.3.2 🏔️ Tur Elanları (Tour Listings)

```
┌─────────────────────────────────────────────────────────────────┐
│  🏔️ Tur Elanlarım                          [+ Yeni Tur Əlavə Et]│
│  [Görünüş: 📋 Cədvəl | 🎴 Kartlar]  [Aktiv: 15 | Draft: 2]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 🏔️ Şahdağ Qış Turu — 2 Gecə 3 Gün                        │ │
│  │ ⭐ 4.8/5 (67 rəy)  |  👁️ 1,240 baxış  |  📅 34 rezerv    │ │
│  │ Status: ✅ Aktiv  |  Son yeniləmə: 2025-03-10             │ │
│  │ [Düzəliş] [Deaktiv et] [Statistika] [Preview]            │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 🏛️ Şəki Mədəniyyət Turu — 1 Gün                          │ │
│  │ ⭐ 4.9/5 (89 rəy)  |  👁️ 2,100 baxış  |  📅 67 rezerv    │ │
│  │ Status: ✅ Aktiv  |  Son yeniləmə: 2025-03-05             │ │
│  │ [Düzəliş] [Deaktiv et] [Statistika] [Preview]            │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [Səhifələmə: 1 2 3]                                           │
└─────────────────────────────────────────────────────────────────┘
```

**Yeni Tur Əlavə Et Modal:**

```
┌──────────────────────────────────────────────────────┐
│  ➕ Yeni Tur Əlavə Et                                │
├──────────────────────────────────────────────────────┤
│  [Tab: Əsas Məlumat | Proqram | Qiymət | Şəkillər]  │
│                                                      │
│  Tur Adı: [Şahdağ Qış Turu___________________]      │
│  Region: [Quba-Xaçmaz ▼]                             │
│  Tur Növü: [Aktiv ▼]                                 │
│  Müddət: Gün [2] Gecə [3]                            │
│  Qrup: Min [8] Max [15]                              │
│  Dil: ☑️ AZ  ☑️ RU  ☑️ EN                            │
│                                                      │
│  Təsvir:                                             │
│  [Rich Text Editor — TipTap]                         │
│                                                      │
│  [Növbəti: Proqram →]                                │
└──────────────────────────────────────────────────────┘
```

---

#### 13.3.3 📅 Rezervasiyalar (Bookings)

```
┌─────────────────────────────────────────────────────────────────┐
│  📅 Rezervasiyalar                                              │
│  [Filtr: Hamısı | Gözləyir | Təsdiqləndi | Ləğv edildi]        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 🏔️ Şahdağ Qış Turu — 2025 Aprel 15                       │ │
│  │ 👤 Leyla Məmmədova  |  2 nəfər  |  💰 360 AZN            │ │
│  │ Status: ⏰ Gözləyir təsdiq                                │ │
│  │ [Təsdiqlə] [Rədd et] [Mesaj göndər] [Detallar]           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 🏛️ Şəki Mədəniyyət Turu — 2025 Aprel 20                  │ │
│  │ 👤 Rəşad Əliyev  |  4 nəfər  |  💰 280 AZN               │ │
│  │ Status: ✅ Təsdiqləndi                                    │ │
│  │ [Ləğv et] [Mesaj göndər] [Qəbz çap et] [Detallar]       │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [Səhifələmə: 1 2 3 ... 8]                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

#### 13.3.4 📈 Statistika (Analytics)

```
┌─────────────────────────────────────────────────────────────────┐
│  📈 Şirkət Statistikası                                         │
│  [Dövr: Bu həftə | Bu ay | Son 3 ay | İl ərzində]              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ 💰 Gəlir     │  │ 📅 Rezerv.   │  │ 👁️ Baxış     │         │
│  │  4,200 AZN   │  │   34 tur     │  │   8,450      │         │
│  │  +15% ↗      │  │   +8% ↗      │  │   +22% ↗     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  📊 Gəlir Dinamikası (Son 6 ay)                           │ │
│  │  [Bar Chart: Aylıq gəlir müqayisəsi]                      │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────┐  ┌──────────────────────┐  │
│  │  🏆 Top 5 Turlar (Rezervasiya)│  │  📍 Ən Aktiv Ölkələr │  │
│  │  1. Şahdağ — 67 rezerv        │  │  1. 🇦🇿 Azərbaycan   │  │
│  │  2. Şəki — 54 rezerv          │  │  2. 🇹🇷 Türkiyə      │  │
│  │  3. Qəbələ — 43 rezerv        │  │  3. 🇷🇺 Rusiya       │  │
│  │  4. Quba — 38 rezerv          │  │  (istifadəçi coğr.)  │  │
│  │  5. Lənkəran — 29 rezerv      │  └──────────────────────┘  │
│  └───────────────────────────────┘                             │
│                                                                 │
│  [Excel Export] [PDF Report]                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

### 13.4 UI/UX Komponentləri və Animasiyalar

#### Dizayn Sistemi

**Rəng Paleti (Dashboard):**
```css
/* Light Mode */
--bg-primary:    #F8FAFC;   /* Ümumi arxa plan */
--bg-secondary:  #FFFFFF;   /* Kart arxa planı */
--text-primary:  #0F172A;   /* Əsas mətn */
--text-secondary:#64748B;   /* İkinci dərəcəli mətn */
--border:        #E2E8F0;   /* Sərhədlər */

/* Dark Mode (Default) */
--bg-primary:    #0F172A;   /* Ümumi arxa plan */
--bg-secondary:  #1E293B;   /* Kart arxa planı */
--text-primary:  #F1F5F9;   /* Əsas mətn */
--text-secondary:#94A3B8;   /* İkinci dərəcəli mətn */
--border:        #334155;   /* Sərhədlər */

/* Accent Colors */
--primary:       #0EA5E9;   /* Mavi — əsas aksentlər */
--success:       #10B981;   /* Yaşıl — uğurlu əməliyyatlar */
--warning:       #F59E0B;   /* Sarı — xəbərdarlıqlar */
--danger:        #EF4444;   /* Qırmızı — xəta / silmə */
--info:          #6366F1;   /* Bənövşəyi — məlumat */
```

**Typography:**
```css
/* Font Family */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Heading Sizes */
h1: 2.5rem / 40px — bold
h2: 2rem / 32px — bold
h3: 1.5rem / 24px — semibold
h4: 1.25rem / 20px — semibold
h5: 1rem / 16px — medium

/* Body Text */
body: 0.875rem / 14px — regular
small: 0.75rem / 12px — regular
```

**Spacing System (Tailwind-ə uyğun):**
```
4px → p-1, m-1
8px → p-2, m-2
12px → p-3, m-3
16px → p-4, m-4
24px → p-6, m-6
32px → p-8, m-8
48px → p-12, m-12
64px → p-16, m-16
```

---

#### Animasiyalar (Framer Motion)

**Səhifə Keçidləri:**
```javascript
// Fade + Slide Up
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: "easeInOut" }
};

// Sidebar açılma/bağlanma
const sidebarVariants = {
  open: { x: 0, opacity: 1 },
  closed: { x: -280, opacity: 0 }
};

// Kart hover
const cardHover = {
  scale: 1.02,
  boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
  transition: { duration: 0.2 }
};
```

**Skeleton Loading:**
```javascript
// Məzmun yüklənərkən
<div className="animate-pulse">
  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
</div>
```

**Mikro İnteraksiyalar:**
- Düymə kliki: Scale down → scale up (0.95 → 1)
- Toast bildirişlər: Slide in from top-right
- Modal açılması: Fade in + scale from 0.9 to 1
- Dropdown menu: Slide down + fade
- Chart animasiyaları: Staggered loading

---

#### Responsive Breakpoints

```css
/* Tailwind default breakpoints */
sm:  640px   /* Mobil (landscape) */
md:  768px   /* Tablet */
lg:  1024px  /* Desktop (sidebar açılır) */
xl:  1280px  /* Böyük ekran */
2xl: 1536px  /* Ekstra böyük */
```

**Mobil Optimizasiyası:**
- Touch-friendly button size (min 44x44px)
- Swipe to navigate (cards, sidebar)
- Pull to refresh (blog feed, rezervasiyalar)
- Bottom navigation bar (mobil üçün)
- Hamburger menu (tablet və kiçik ekranlar)

---

### 13.5 Komponent Kitabxanası

**shadcn/ui komponentləri:**
```
✅ Button — primary, secondary, ghost, outline
✅ Card — shadow, glassmorphism
✅ Dialog / Modal
✅ Dropdown Menu
✅ Input — text, number, date, search
✅ Textarea — rich text (TipTap inteqrasiyası)
✅ Select / Combobox
✅ Checkbox / Radio
✅ Switch (toggle)
✅ Tabs
✅ Toast / Notification
✅ Badge — status, count
✅ Avatar — user, company
✅ Progress Bar / Circular Progress
✅ Skeleton Loader
✅ Data Table — sortable, filterable
✅ Pagination
✅ Calendar / Date Picker
```

**Xüsusi Komponentlər:**
```
✅ InteractiveMap — Mapbox GL JS wrapper
✅ RichTextEditor — TipTap editor
✅ StatCard — statistika kartı (widget)
✅ TrendChart — mini line chart (sparkline)
✅ UserCard — yoldaş axtarışı kartı
✅ BlogCard — blog preview
✅ TourCard — tur elanı kartı
✅ ReservationCard — rezervasiya kartı
✅ NotificationBell — dropdown notification list
✅ LanguageSwitcher — dil dəyişdirici
✅ ThemeToggle — dark/light mode
```

---

### 13.6 Performans və Optimizasiya

**Lazy Loading:**
```javascript
// Route-based code splitting
const Dashboard = lazy(() => import('./Dashboard'));
const BlogEditor = lazy(() => import('./BlogEditor'));
const CompanyPanel = lazy(() => import('./CompanyPanel'));

// Xəritə lazy load (böyük library)
const MapComponent = lazy(() => import('./InteractiveMap'));
```

**Image Optimization:**
```javascript
// Next.js Image component
<Image
  src="/uploads/avatar.jpg"
  width={64}
  height={64}
  alt="User avatar"
  loading="lazy"
  placeholder="blur"
/>
```

**Caching:**
- API cavabları: React Query (staleTime: 5 min)
- Xəritə tile-ları: Browser cache
- Statistika: Redis cache (1 saat)
- Avatar şəkilləri: CDN + Browser cache

**Bundle Size:**
- Mapbox yalnız Xəritə səhifəsində yüklənir
- Chart.js yalnız Statistika səhifəsində
- TipTap editor yalnız Bloq Redaktorunda
- Total JS bundle: <300KB (gzipped)

---

### 13.7 Accessibility (A11y)

**WCAG 2.1 Uyğunluğu:**
```
✅ Klaviatura naviqasiyası (Tab, Enter, Esc)
✅ Screen reader dəstəyi (ARIA labels)
✅ Rəng kontrastı minimum 4.5:1
✅ Focus indicators (outline görünən)
✅ Skip to main content linki
✅ Alt text bütün şəkillər üçün
✅ Form error messages (ARIA live region)
✅ Responsive font sizes (rem/em)
```

**Klaviatura Qısayolları:**
```
Ctrl/Cmd + K → Search açılır
Ctrl/Cmd + B → Sidebar toggle
Ctrl/Cmd + N → Yeni bloq (dashboard-da)
Esc → Modal bağlanır
```

---

### 13.8 Texniki Tətbiq

**Folder Structure:**

```
/app/
  /[locale]/
    /dashboard/
      layout.tsx        # Dashboard layout (sidebar + header)
      page.tsx          # Ana panel
      /blogs/
        page.tsx        # Bloglarım
        /new/
          page.tsx      # Yeni bloq yarat
        /[id]/
          /edit/
            page.tsx    # Bloq redaktə et
      /map/
        page.tsx        # İnteraktiv xəritə
      /companions/
        page.tsx        # Yoldaş tap
      /tours/
        page.tsx        # Daxili turlar
      /bookmarks/
        page.tsx        # Yadda saxlanılanlar
      /stats/
        page.tsx        # Statistika
      /settings/
        page.tsx        # Tənzimləmələr
    /company/
      /dashboard/
        layout.tsx      # Şirkət layout
        page.tsx        # Şirkət ana panel
        /tours/
          page.tsx      # Tur elanları
          /new/
            page.tsx    # Yeni tur əlavə et
        /bookings/
          page.tsx      # Rezervasiyalar
        /reviews/
          page.tsx      # Rəylər
        /analytics/
          page.tsx      # Statistika
        /payments/
          page.tsx      # Ödənişlər
        /settings/
          page.tsx      # Tənzimləmələr

/components/
  /dashboard/
    Sidebar.tsx
    Header.tsx
    StatCard.tsx
    TrendChart.tsx
    NotificationBell.tsx
  /ui/               # shadcn/ui components
  /shared/           # Paylaşılan komponentlər

/lib/
  /api/
    dashboard.ts
    company.ts
  /hooks/
    useDashboard.ts
    useCompany.ts
```

**API Routes:**

```javascript
// /api/dashboard/stats
GET → İstifadəçi statistikası

// /api/dashboard/blogs
GET → Blogların siyahısı
POST → Yeni bloq yarat

// /api/dashboard/map
GET → Ziyarət edilmiş ölkələr
POST → Ölkə əlavə et

// /api/company/tours
GET → Şirkətin turları
POST → Yeni tur əlavə et
PUT → Tur yenilə
DELETE → Tur sil

// /api/company/bookings
GET → Rezervasiyalar
PUT → Rezervasiya statusunu yenilə
```

---

### 13.9 Dashboard Özəllikləri (Feature List)

**İstifadəçi Dashboard:**
```
✅ Real-time statistika
✅ İnteraktiv dünya xəritəsi (Mapbox)
✅ Bloq yaratma/redaktə (rich text editor)
✅ Video paylaşımı (YouTube embed)
✅ Yoldaş axtarışı (advanced filters)
✅ Yadda saxlanılanlar (bookmarks)
✅ Push bildirişlər (ucuz bilet alertləri)
✅ Dark/Light mode toggle
✅ 3 dil dəstəyi (az/ru/en)
✅ Export data (GDPR uyğun)
✅ Premium üzvlük paneli
```

**Tur Şirkəti Dashboard:**
```
✅ Tur elanı idarəetməsi (CRUD)
✅ Rezervasiya idarəetməsi
✅ Müştəri mesajları
✅ Rəy idarəetməsi
✅ Ətraflı statistika (charts, graphs)
✅ Ödəniş tarixçəsi
✅ Plan upgrade sistemi
✅ Eksport funksiyası (PDF, Excel)
✅ Multi-language tour creation
✅ Şəkil qalereya idarəetməsi
```

---

## 14. MVP Yol Xəritəsi

### Faza 1 — MVP (2–3 ay)
```
✅ Next.js + Supabase layihəsi qur
✅ 3 dil dəstəyi (az/ru/en) — next-intl
✅ Bilet axtarışı (saytdaxili UI + Skyscanner API)
✅ Otel axtarışı (saytdaxili UI + Booking.com widget)
✅ 10 ölkə üçün məzmun (3 dildə)
✅ Viza məlumatları səhifəsi
✅ İstifadəçi qeydiyyatı (Google + Email)
✅ Blog sistemi (limitsiz, ödənişsiz)
✅ Sosial paylaşma düymələri
✅ Vercel-ə deploy et
```

### Faza 2 — İcma + Azərbaycan Turları (3–5-ci ay)
```
✅ Yoldaş axtarışı (filtrlər ilə)
✅ YouTube link paylaşımı + thumbnail
✅ Xəritə üzərində ölkə işarələmə
✅ Tur şirkəti qeydiyyat paneli (B2B)
✅ Daxili tur elanları modulu
✅ Tur axtarış filtirləri
✅ 50+ ölkə məzmunu (3 dildə)
✅ "Ən Yaxşı Yazıçı" liderlik cədvəli
✅ Blog şərhləri sistemi
✅ Blog axtarış və tag filtrləri
✅ Database schema genişləndirilməsi (10 yeni cədvəl)
✅ API route-ları (companions, tours, companies, youtube, comments)
✅ Dark theme UI bütün yeni səhifələr üçün
✅ i18n tərcümələr (AZ/RU/EN) — 6 yeni namespace
✅ Mobil responsive dizayn
✅ Tur şirkəti plan sistemi (Starter/Pro/Premium)
✅ Tur rezervasiya sistemi
✅ Tur rəy sistemi
```

### **Faza 2.5 — Dashboard Sistemi (YENİ!) (5–6-cı ay)**
```
🎯 İstifadəçi Dashboard (Traveler)
  ✅ Sidebar navigation (responsive)
  ✅ Ana Panel (overview widgets)
  ✅ İnteraktiv xəritə (Mapbox GL JS)
  ✅ Blog idarəetmə paneli
  ✅ Bloq statistika modal
  ✅ Video paylaşım sistemi
  ✅ Yoldaş tap interfeysi
  ✅ Yadda saxlanılanlar
  ✅ Tənzimləmələr səhifəsi
  ✅ Dark/Light mode toggle
  ✅ Notification sistem

🎯 Tur Şirkəti Dashboard (Company)
  ✅ Şirkət sidebar navigation
  ✅ Şirkət ana panel (stats)
  ✅ Tur elanı CRUD interfeysi
  ✅ Rezervasiya idarəetmə paneli
  ✅ Rəy idarəetmə sistemi
  ✅ Statistika və analytics
  ✅ Ödəniş tarixçəsi
  ✅ Plan upgrade UI
  ✅ Export funksiyası

🎯 UI/UX Təkmilləşdirmə
  ✅ shadcn/ui komponent inteqrasiyası
  ✅ Framer Motion animasiyaları
  ✅ Skeleton loading states
  ✅ Toast notification sistemi
  ✅ Responsive grid system
  ✅ Mobile optimization (swipe, bottom nav)
  ✅ Accessibility (WCAG 2.1)
  ✅ Performance optimization (lazy loading, code splitting)

🎯 Texniki İnfrastruktur
  ✅ Dashboard API endpoints
  ✅ Real-time statistika (Supabase Realtime)
  ✅ Image upload (drag & drop)
  ✅ Data export (PDF, Excel)
  ✅ Redis caching (statistika)
  ✅ Error handling və logging
```

### Faza 3 — Monetizasiya (6–8-ci ay)
```
🔄 ePoint ödəniş inteqrasiyası
🔄 Premium üzvlük sistemi
🔄 Tur şirkəti aylıq abunə
🔄 Onlayn tur rezervasiyası (ePoint ilə)
🔄 Sponsored məkan / featured elan sistemi
🔄 Sığorta affiliate inteqrasiyası
🔄 Push bildirişlər (ucuz bilet alertləri)
```

### Faza 4 — Böyümə (8+ ay)
```
✅ AI səyahət planlaşdırıcısı (Google Gemini API)
✅ Dark/Light mode toggle (bütün səhifələr)
🔄 Mobil app (React Native / Expo)
🔄 Newsletter sistemi (sponsored)
🔄 Influencer tərəfdaşlıqları
🔄 Ərəb dili dəstəyi (RTL)
🔄 Beynəlxalq tur şirkəti qeydiyyatı
```

### **Faza 3.5 — AI Səyahət Planlaşdırıcısı (YENİ!)**
```
🎯 AI Planlaşdırıcı Modulu
  ✅ Google Gemini Flash API inteqrasiyası (pulsuz kvota)
  ✅ Server-side API route (/api/ai/plan) — API key gizli
  ✅ 4-addımlı wizard form (Destinasiya → Tarix → Büdcə → Maraqlar)
  ✅ AI cavabı JSON parse + fallback handling
  ✅ Platforma ölkə/viza məlumatlarını prompt-a əlavə etmə
  ✅ Detallı nəticə səhifəsi (günlük plan, xərc bölgüsü, məsləhətlər, çanta siyahısı)
  ✅ Plan paylaşma + link kopyalama
  ✅ Platforma linkləri (bilet, otel, viza, ölkə səhifəsi)
  ✅ Loading state animasiyalı
  ✅ Header navigasiyasında Sparkles ikonlu link
  ✅ i18n tərcümələr (AZ/RU/EN) — aiPlanner namespace

📁 Yaradılan Fayllar:
  src/types/ai-planner.ts
  src/lib/ai/gemini.ts
  src/lib/ai/prompts.ts
  src/lib/ai/parser.ts
  src/app/api/ai/plan/route.ts
  src/app/[locale]/ai-planner/page.tsx
  src/app/[locale]/ai-planner/ai-planner-client.tsx
  src/components/ai-planner/PlannerWizard.tsx
  src/components/ai-planner/PlannerLoading.tsx
  src/components/ai-planner/PlanResult.tsx
  src/components/ai-planner/PlanResultContent.tsx
  src/components/ai-planner/DayCard.tsx
  src/components/ai-planner/CostBreakdown.tsx
  src/components/ai-planner/PlanActions.tsx
  src/components/ai-planner/steps/DestinationStep.tsx
  src/components/ai-planner/steps/DateStep.tsx
  src/components/ai-planner/steps/BudgetStep.tsx
  src/components/ai-planner/steps/InterestsStep.tsx
```

### **Dark/Light Mode Sistemi (YENİ!)**
```
🎯 Theme Toggle
  ✅ CSS Custom Properties ilə dark/light rəng sistemi
  ✅ ThemeToggle komponenti (header-da günəş/ay ikonu)
  ✅ localStorage-da seçim saxlanılır
  ✅ Bütün mövcud səhifələr theme variable-lara keçirilib
  ✅ Header, Footer, Language Switcher, Mobile Menu uyğunlaşdırılıb
  ✅ AI Planner, Tour List, Country, Visa səhifələri uyğunlaşdırılıb

📁 Yaradılan/Dəyişdirilən Fayllar:
  src/components/layout/theme-toggle.tsx (YENİ)
  src/app/globals.css (theme variables əlavə edildi)
  src/app/layout.tsx (default dark class)
  src/components/layout/header.tsx
  src/components/layout/footer.tsx
  src/components/layout/language-switcher.tsx
  src/components/layout/mobile-menu.tsx

🎨 Theme Variable-lar:
  --bg-base, --bg-surface, --bg-surface-hover, --bg-input
  --border, --border-light
  --text-primary, --text-secondary, --text-muted
  --header-bg, --card-bg, --dropdown-bg

  Tailwind class-ları:
  bg-bg-base, bg-bg-surface, bg-bg-surface-hover, bg-bg-input
  border-border, text-txt, text-txt-sec, text-txt-muted
  bg-header-bg, bg-card-bg, bg-dropdown-bg
```

---

## 15. Məsləhətlər

### ⭐ Strateji Məsləhətlər

**1. Azərbaycana fokusla başla**
İlk 3 ayda Azərbaycanlıların ən çox getdiyi 10 ölkəyə (Türkiyə, Dubai, Rusiya, Georgia, İran, Tailand, Yaponiya, Avropa ölkələri) 3 dildə keyfiyyətli məzmun hazırla. Ümumi olmaq əvəzinə konkret ol.

**2. SEO-ya ilk gündən başla**
"Türkiyəyə ucuz bilet", "Dubaya viza necə alınır", "Ucuz bilet Azerbaijan" — bu cür axtarışlar üçün 3 dildə məzmun hazırla. Azərbaycan dilində turizm SEO-su hələ boş bir sahədir — ilk olmaq şansınız var.

**3. Blogerləri platforma elçisi et**
Hər blogerə şəxsi referral linki ver. Dostlarını gətirəndə onun profilində badge görünsün. İcma böyüdükcə məzmun özü gəlir.

**4. Tur şirkətləri ilə görüş**
Bakıda 20–30 aktiv tur şirkəti var. Onlarla görüş, ilk 3 ay pulsuz yerləşdirmə təklif et, rəylər toplansın. Sonra ödənişli plana keç.

**5. Email siyahısı qur**
Hər qeydiyyatdan email topla. "Hər həftə ən ucuz 5 destinasiya" newsletter-i sərfəlidir — affiliate klikləri artırır. Sponsored newsletter-dən ayrıca gəlir.

**6. WhatsApp/Telegram istifadəçi dəstəyi**
Azərbaycanda istifadəçilər məktub deyil, mesaj göndərməyi sevir. Sayta WhatsApp/Telegram dəstək düyməsi əlavə et — dönüşüm artır.

**7. Dashboard ilk təəssüratı**
İstifadəçi qeydiyyatdan sonra gördüyü ilk şey dashboard olmalıdır. Əgər bu interfeys çaşdırıcı və ya köhnə görünürsə, istifadəçi geri qayıtmayacaq. Dashboard — platformanın ürəyidir.

**8. Mobil optimizasiya prioritetdir**
Azərbaycanda internet istifadəçilərinin 75%+ mobil cihazdan giriş edir. Dashboard mobile-first dizaynla hazırlanmalıdır.

### ⚠️ Çəkinmə Lazım Olan Şeylər
- Affiliate linklər üçün şəffaf olun — istifadəçilərə deyin (etik + hüquqi)
- Bilet/otel qiymətlərini özünüz "zəmanət verin" deməyin — dəyişir
- Viza məlumatlarını "100% dəqiq" kimi sunmayın — konuslluq dəyişə bilər
- Tur şirkəti lisenziyasını yoxlamadan qeydiyyata almayın — platforma itibarı
- Dashboard-u həddindən artıq widget ilə doldurmayın — sadəlik əsasdır

---

## 📊 Gəlir Proqnozu

| Ay | Ziyarətçi | Affiliate | Premium | Tur Şirkətləri | CƏMİ |
|---|---|---|---|---|---|
| 1–2 | 500 | 50 AZN | 0 | 0 | ~50 AZN |
| 3–4 | 2,000 | 400 AZN | 150 AZN | 300 AZN | ~850 AZN |
| 5–6 | 5,000 | 1,000 AZN | 500 AZN | 800 AZN | ~2,300 AZN |
| 9–12 | 15,000+ | 3,000 AZN | 1,500 AZN | 2,500 AZN | ~7,000+ AZN |

> *Proqnozlar ortalama dönüşüm nisbətlərinə əsaslanır. Aktiv SEO, sosial media və 3 dil dəstəyi ilə daha sürətli böyümə mümkündür.*

---

## 🔗 Faydalı Linklər

| Resurs | Link |
|---|---|
| Skyscanner Partner | partners.skyscanner.net |
| Skyscanner API (RapidAPI) | rapidapi.com/skyscanner |
| Booking.com Affiliate | join.booking.com |
| GetYourGuide Partner | supply.getyourguide.com |
| Rentalcars Affiliate | rentalcars.com/affiliate |
| SafetyWing Affiliate | safetywing.com/affiliate |
| ePoint Merchant | epoint.az |
| next-intl (i18n) | next-intl.vercel.app |
| Next.js Docs | nextjs.org/docs |
| Supabase Docs | supabase.com/docs |
| TipTap Editor | tiptap.dev |
| Mapbox | mapbox.com |
| Vercel | vercel.com |
| shadcn/ui | ui.shadcn.com |
| Framer Motion | framer.com/motion |

---

*Sənəd hazırlanma tarixi: 2026 | TravelAZ Layihə Planı v3.0*
*Dashboard Dizaynı Əlavə Edildi: Faza 2.5 — Müasir və Funksional İnterfeys*