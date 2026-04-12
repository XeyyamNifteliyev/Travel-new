# AI Səyahət Planlaşdırıcısı — Dizayn Sənədi

> TravelAZ platformasına AI-powered səyahət planı yaradıcı modulun dizaynı.

## 1. Ümumi

### Məqsəd
İstifadəçi ölkə, tarix, büdcə, maraqlar daxil edir → AI (Google Gemini) detallı günlük səyahət planı hazırlayır. Plan platformanın öz bazasından (ölkə səhifələri, viza məlumatları, daxili turlar) istifadə edir.

### Texniki Stack
- **AI Model:** Google Gemini Flash (pulsuz kvota: 15 RPM, 1M token/ay)
- **İnteqrasiya:** Server-side API route (API key gizli)
- **Frontend:** Next.js 15, TypeScript, Tailwind CSS
- **Backend:** Supabase (plan saxlama)
- **i18n:** next-intl (az/ru/en)

### URL Strukturu
```
/az/ai-planner       → AI Səyahət Planlaşdırıcı
/ru/ai-planner       → AI Планировщик Путешествий
/en/ai-planner       → AI Travel Planner
```

---

## 2. Arxitektura

### Axın
```
İstifadəçi → Wizard Form (4 addım)
          → POST /api/ai/plan
          → Server: Supabase-dən ölkə/viza/tur məlumatları çəkir
          → Server: Gemini API-ə structured prompt göndərir (platforma konteksti ilə)
          → Server: AI cavabını parse edib JSON formatında qaytarır
          → Frontend: Nəticəni card-based UI-da göstərir
          → İstifadəçi: Planı yadda saxlaya, paylaşa bilər
```

### Seçilən Yanaşma: Server-Side API Route
- API key server-də qalır, təhlükəsizdir
- Platforma məlumatlarını DB-dən çəkib prompt-a əlavə etmək asandır
- Rate limiting server tərəfdə idarə olunur
- Gələcəkdə streaming əlavə etmək mümkündür

---

## 3. API Endpoint

### POST /api/ai/plan

**Request:**
```typescript
interface PlanRequest {
  destination: string;       // "Yaponiya"
  startDate: string;         // "2026-06-10"
  endDate: string;           // "2026-06-17"
  budget: number;            // 1500 (AZN)
  travelers: number;         // 2
  interests: string[];       // ["mədəniyyət", "qastro", "təbiət"]
  travelStyle: "budget" | "mid" | "luxury";
  language: "az" | "ru" | "en";
}
```

**Response:**
```typescript
interface PlanResponse {
  plan: {
    summary: string;
    totalEstimatedCost: {
      amount: number;
      currency: "AZN";
      breakdown: {
        flights: number;
        accommodation: number;
        food: number;
        activities: number;
        transport: number;
      };
    };
    days: DayPlan[];
    tips: string[];
    visaInfo: {
      required: boolean;
      type: string;
      processingTime: string;
    };
    bestTimeToVisit: string;
    packingList: string[];
  };
  platformData: {
    countryPage: string;        // "/az/olkeler/yaponiya"
    tours: Tour[];              // Əlaqəli daxili turlar
    flightsLink: string;        // Bilet axtarış linki
    hotelsLink: string;         // Otel axtarış linki
    visaPage: string;           // "/az/viza/yaponiya"
  };
}

interface DayPlan {
  day: number;
  title: string;
  activities: Activity[];
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  transport: string;
  estimatedCost: number;
}

interface Activity {
  time: string;
  activity: string;
  location: string;
  cost: number;
  tip?: string;
}
```

### GET /api/ai/plans

İstifadəçinin saxlanmış planlarını qaytarır.

### POST /api/ai/plans/[id]/save

Planı dashboard-da saxlamaq üçün.

---

## 4. Wizard Form (4 Addım)

### Addım 1: Destinasiya
- Axtarış inputu (ölkə və ya şəhər)
- Populyar destinasiyalar grid şəklində (bayraq + ad)
- Platformanın ölkə bazasından autocomplete

### Addım 2: Tarix və Müddət
- Başlanğıc / bitiş tarix (date picker)
- Neçə nəfər (1-10 selector)
- Müddət avtomatik hesablanır

### Addım 3: Büdcə və Tərz
- 4 seçim: Büdcə (<500 AZN), Orta (500-1500 AZN), Lüks (1500+ AZN), Xüsusi məbləğ
- Nəfər başı hesablanır

### Addım 4: Maraqlar
- 8 kateqoriya (checkbox): Mədəniyyət, Təbiət, Qastro, Alış-veriş, Çimərlik, Fotoqrafiya, Gecə həyatı, Ailə
-minimum 1 seçim tələb olunur

### Loading State
- Progress bar + addım-addım status mesajları
- "Yaponiya məlumatları yüklənir..." → "Viza məlumatları tapıldı" → "Gün 3 proqramı hazırlanır..."

---

## 5. Nəticə Səhifəsi

### Layout
1. **Başlıq:** Ölkə, tarix, nəfər, büdcə ümumi məlumat
2. **Xərc bölgüsü:** 4 kart (Uçuş, Qalma, Yemək, Aktivitələr) + ümumi məbləğ
3. **Viza informasiya:** Viza tələbi + link
4. **Günlük plan:** Accordion kartlar (hər gün üçün)
   - Vaxt, aktivlik, yer, xərc, məsləhət
   - Yemək tövsiyələri (səhər, nahar, şam)
   - Nəqliyyat məlumatı
5. **Məsləhətlər:** Vacib tövsiyələr siyahısı
6. **Çanta siyahısı:** Yanınıza alınması lazım olanlar
7. **Platforma linkləri:** Bilet axtar, Otel tap, Viza səhifəsi, Ölkə səhifəsi
8. **Aksiyonlar:** Planı paylaş, Yadda saxla, Yenidən hazırla

### Planı Yadda Saxlama
- Qeydiyyatlı istifadəçilər dashboard-da "AI Planlarım" bölməsində saxlaya bilər
- Plan tarixçəsi saxlanılır
- Plan-ı export edə bilər (PDF gələcəkdə)

### Planı Paylaşma
- Unikal URL ilə paylaşma (ictimai link)
- Sosial şəbəkə düymələri

---

## 6. Database Schema

```sql
CREATE TABLE ai_travel_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  travelers INTEGER DEFAULT 1,
  budget TEXT NOT NULL,
  interests TEXT[] NOT NULL,
  travel_style TEXT NOT NULL,
  language TEXT DEFAULT 'az',
  plan_data JSONB NOT NULL,
  is_saved BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ai_plans_user ON ai_travel_plans(user_id);
CREATE INDEX idx_ai_plans_share ON ai_travel_plans(share_token) WHERE share_token IS NOT NULL;
```

---

## 7. Fayl Strukturu

```
/src/
  app/
    [locale]/
      ai-planner/
        page.tsx
      dashboard/
        ai-plans/
          page.tsx
    api/
      ai/
        plan/
          route.ts
        plans/
          route.ts
        plans/[id]/
          save/
            route.ts
  components/
    ai-planner/
      PlannerWizard.tsx
      steps/
        DestinationStep.tsx
        DateStep.tsx
        BudgetStep.tsx
        InterestsStep.tsx
      PlanResult.tsx
      DayCard.tsx
      ActivityItem.tsx
      CostBreakdown.tsx
      PlanActions.tsx
      PlannerLoading.tsx
  lib/
    ai/
      gemini.ts
      prompts.ts
      parser.ts
      types.ts
```

---

## 8. AI Prompt Strateqiyası

### System Prompt (Azərbaycan nümunəsi)
```
Sən TravelAZ platformasının AI səyahət planlaşdırıcısısın.
Azərbaycanlı səyahətçilər üçün Azərbaycan dilində detallı səyahət planı hazırla.

Qaydalar:
- Azərbaycan manatı (AZN) istifadə et
- Bakıdan (GYD) ucuşları nəzərdə tut
- Realist qiymətlər ver
- Hər gün üçün 3-5 aktivlik tövsiyə et
- Yemək tövsiyələri lokal mətbəxə əsaslanmalıdır
- Nəqliyyat variantları göstər

Platforma məlumatları:
{platformContext}

Cavabı aşağıdakı JSON strukturunda ver:
{jsonSchema}
```

### Platforma Konteksti
AI prompt-a əlavə olunacaq məlumatlar:
- Ölkə səhifəsindən: məşhur yerlər, orta xərclər, iqlim
- Viza mərkəzindən: viza tələbi, prosesing vaxtı
- Daxili turlardan: əlaqəli turlar (varsa)

### Parser
AI cavabından JSON çıxarmaq üçün:
1. Markdown code block içində JSON axtar
2. Raw text-dən JSON parse et
3. Schema validation (zod ilə)
4. Uğursuz olarsa, default fallback plan qaytar

---

## 9. Rate Limiting

| İstifadəçi növü | Limit |
|---|---|
| Qeydiyyatsız (IP-based) | 3 plan/gün |
| Pulsuz üzv | 5 plan/gün |
| Premium üzv | 20 plan/gün |

Həddi aşanda: "Günün limitinə çatdınız. Sabaha qədər gözləyin və ya premium olun" mesajı.

---

## 10. i18n

### Namespace: `ai-planner`
Wizard UI mətnləri, nəticə səhifəsi mətnləri, error mesajları 3 dilə tərcümə olunacaq.

### AI Prompt Dilinə Görə
3 ayrı prompt variantı (az, ru, en) — hər biri öz dilində cavab verir.

---

## 11. Dashboard inteqrasiya

Sidebar menyusuna əlavə olunacaq:
```
✨ AI Planlaşdırıcı     → /az/ai-planner
📋 AI Planlarım         → /az/dashboard/ai-plans
```

Dashboard ana panelində widget:
```
┌──────────────────────┐
│ ✨ AI Planlarım      │
│ 3 saxlanmış plan     │
│ Son: Yaponiya 7 gün  │
│ [Yeni Plan Yarat]    │
└──────────────────────┘
```

---

## 12. Gələcək Genişlənmələr (Bu fazaya daxil deyil)

- Streaming cavab (typewriter effect)
- AI chat düzəliş (planı söhbət şəklində dəqiqləşdirmək)
- Plan export (PDF)
- Şəkil tanıma (məkan şəkli yüklə, AI tanısın)
- Daha çox AI modeli dəstəyi (OpenAI, Claude)

---

*Sənəd tarixi: 2026-04-12*
*TravelAZ AI Səyahət Planlaşdırıcısı Dizayn Sənədi v1.0*
