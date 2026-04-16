# TravelAZ Viza Sistemi — Mərhələ 1 İcra Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Azərbaycan pasportu üçün Supabase DB əsaslı viza məlumat sistemi, interaktiv sənəd checklist və AI chat widget.

**Architecture:** Mövcud `visa_info` cədvəli genişləndirilir (yeni sütunlar), yeni `visa_documents` cədvəli yaradılır. İki yeni API route (`/api/visa/[country]`, `/api/visa/ai-answer`), iki səhifə (`/visa` yenilənir, `/visa/[country]` yeni), 4 yeni komponent. Mövcud AI provider sistemi (`getProvider()`) istifadə olunur.

**Tech Stack:** Next.js 15, Supabase, TypeScript, Tailwind CSS v4, next-intl, lucide-react, mövcud AI provider sistemi

---

## Fayl Strukturu

```
YARADILACAQ:
  supabase/migrations/005_visa_system.sql
  src/app/api/visa/[country]/route.ts
  src/app/api/visa/ai-answer/route.ts
  src/app/[locale]/visa/[country]/page.tsx
  src/components/visa/visa-country-grid.tsx
  src/components/visa/visa-search-bar.tsx
  src/components/visa/visa-document-checklist.tsx
  src/components/visa/visa-ai-chat.tsx

YENİLƏNƏCƏK:
  src/types/country.ts                           → VisaInfo genişlənməsi + VisaDocument
  src/app/[locale]/visa/page.tsx                 → DB-dən data, server component
  src/messages/az.json                           → visa namespace genişlənməsi
  src/messages/en.json                           → visa namespace genişlənməsi
  src/messages/ru.json                           → visa namespace genişlənməsi

DƏYİŞMİR:
  src/components/country/visa-info.tsx            → countries/[slug] içində qalır
  src/app/[locale]/countries/[slug]/page.tsx      → dəyişmir
```

---

## Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/005_visa_system.sql`

- [ ] **Step 1: Create migration file**

```sql
-- =============================================
-- TravelAZ Visa System — Phase 1 Migration
-- =============================================

-- 1. visa_info cədvəlinə yeni sütunlar əlavə et
ALTER TABLE visa_info ADD COLUMN IF NOT EXISTS fee_usd DECIMAL(10,2);
ALTER TABLE visa_info ADD COLUMN IF NOT EXISTS fee_azn DECIMAL(10,2);
ALTER TABLE visa_info ADD COLUMN IF NOT EXISTS processing_days_min INT;
ALTER TABLE visa_info ADD COLUMN IF NOT EXISTS processing_days_max INT;
ALTER TABLE visa_info ADD COLUMN IF NOT EXISTS validity_days INT;
ALTER TABLE visa_info ADD COLUMN IF NOT EXISTS max_stay_days INT;
ALTER TABLE visa_info ADD COLUMN IF NOT EXISTS is_evisa BOOLEAN DEFAULT false;
ALTER TABLE visa_info ADD COLUMN IF NOT EXISTS evisa_url TEXT;
ALTER TABLE visa_info ADD COLUMN IF NOT EXISTS official_url TEXT;
ALTER TABLE visa_info ADD COLUMN IF NOT EXISTS appointment_url TEXT;
ALTER TABLE visa_info ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE visa_info ADD COLUMN IF NOT EXISTS data_confidence INT DEFAULT 100;

-- 2. visa_documents cədvəli
CREATE TABLE IF NOT EXISTS visa_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID REFERENCES countries(id) ON DELETE CASCADE,
  visa_type TEXT DEFAULT 'tourist',
  document_name_az TEXT NOT NULL,
  document_name_en TEXT,
  document_name_ru TEXT,
  description_az TEXT,
  is_required BOOLEAN DEFAULT true,
  document_category TEXT,
  accepted_formats TEXT[],
  max_size_mb INT DEFAULT 5,
  notes_az TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE visa_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visa documents are viewable by everyone" ON visa_documents FOR SELECT USING (true);

-- 3. Seed data — 6 ölkə üçün viza məlumatları

-- Əvvəlcə countries cədvəlində bu ölkələrin olduğundan əmin ol
-- Mövcud ölkələr: id 1-10 (hardcoded countries page ilə uyğun gəlməlidir)

-- Türkiyə (vizasız, 90 gün)
INSERT INTO visa_info (country_id, requirement_type, processing_time, documents, notes_az, notes_en, notes_ru, fee_usd, fee_azn, processing_days_min, processing_days_max, validity_days, max_stay_days, is_evisa, official_url, last_verified_at, data_confidence)
SELECT id, 'not_required', '-', '{}', 'Azərbaycan vətəndaşları üçün vizasız (90 gün)', 'Visa-free for Azerbaijani citizens (90 days)', 'Без визы для граждан Азербайджана (90 дней)', 0, 0, 0, 0, 0, 90, false, 'https://baku.be.mfa.gov.tr', NOW(), 100
FROM countries WHERE slug = 'turkey' ON CONFLICT DO NOTHING;

-- Gürcüstan (vizasız, 1 il)
INSERT INTO visa_info (country_id, requirement_type, processing_time, documents, notes_az, notes_en, notes_ru, fee_usd, fee_azn, processing_days_min, processing_days_max, validity_days, max_stay_days, is_evisa, official_url, last_verified_at, data_confidence)
SELECT id, 'not_required', '-', '{}', 'Azərbaycan vətəndaşları üçün vizasız (1 il)', 'Visa-free for Azerbaijani citizens (1 year)', 'Без визы для граждан Азербайджана (1 год)', 0, 0, 0, 0, 0, 365, false, 'https://mfa.gov.ge', NOW(), 100
FROM countries WHERE slug = 'georgia' ON CONFLICT DO NOTHING;

-- BƏƏ / Dubai (gəlişdə viza, 30 gün)
INSERT INTO visa_info (country_id, requirement_type, processing_time, documents, notes_az, notes_en, notes_ru, fee_usd, fee_azn, processing_days_min, processing_days_max, validity_days, max_stay_days, is_evisa, evisa_url, official_url, last_verified_at, data_confidence)
SELECT id, 'on_arrival', 'Anında', '{"Pasport (6 ay)", "Qayıdış bileti"}', 'Gəlişdə viza — 30 gün. Pasport 6 ay etibarlı olmalıdır.', 'Visa on arrival — 30 days. Passport must be valid for 6 months.', 'Виза по прибытии — 30 дней. Паспорт должен быть действителен 6 месяцев.', 0, 0, 0, 0, 0, 30, false, 'https://icp.gov.ae/en/eservices/visaservice', 'https://www.emirates.com/az/azerbaijani/help/visa-passport-information/', NOW(), 95
FROM countries WHERE slug = 'dubai' ON CONFLICT DO NOTHING;

-- Rusiya (vizasız, 90 gün)
INSERT INTO visa_info (country_id, requirement_type, processing_time, documents, notes_az, notes_en, notes_ru, fee_usd, fee_azn, processing_days_min, processing_days_max, validity_days, max_stay_days, is_evisa, official_url, last_verified_at, data_confidence)
SELECT id, 'not_required', '-', '{}', 'Azərbaycan vətəndaşları üçün vizasız (90 gün)', 'Visa-free for Azerbaijani citizens (90 days)', 'Без визы для граждан Азербайджана (90 дней)', 0, 0, 0, 0, 0, 90, false, 'https://baku.mid.ru', NOW(), 100
FROM countries WHERE slug = 'russia' ON CONFLICT DO NOTHING;

-- Yaponiya (viza lazımdır)
INSERT INTO visa_info (country_id, requirement_type, processing_time, documents, notes_az, notes_en, notes_ru, fee_usd, fee_azn, processing_days_min, processing_days_max, validity_days, max_stay_days, is_evisa, official_url, last_verified_at, data_confidence)
SELECT id, 'required', '5-7 iş günü', '{"Pasport (6 ay)", "Viza ərizəsi", "Biyometrik foto (4.5x4.5)", "Maliyyə sübutu", "Səyahət planı", "İş yeri arayışı", "Otel rezervasiyası", "Gediş-dönüş bilet"}', 'Əvvəlcədən müraciət lazımdır. Yaponiya səfirliyinə gedilir.', 'Prior application required. Visit Embassy of Japan.', 'Требуется предварительная заявка. Посетите посольство Японии.', 20, 34, 5, 7, 90, 90, false, 'https://www.az.emb-japan.go.jp', NOW(), 90
FROM countries WHERE slug = 'japan' ON CONFLICT DO NOTHING;

-- Almaniya (Schengen viza)
INSERT INTO visa_info (country_id, requirement_type, processing_time, documents, notes_az, notes_en, notes_ru, fee_usd, fee_azn, processing_days_min, processing_days_max, validity_days, max_stay_days, is_evisa, official_url, appointment_url, last_verified_at, data_confidence)
SELECT id, 'required', '10-15 iş günü', '{"Pasport (6 ay)", "Viza ərizəsi (VFS)", "Biyometrik foto (3.5x4.5)", "Səyahət sığortası (30,000 EUR)", "Bank çıxarışı (son 3 ay)", "İş yeri arayışı", "Otel rezervasiyası", "Gediş-dönüş bilet", "Niyyət məktubu"}', 'Schengen vizası. VFS Global vasitəsilə müraciət. Barmaq izi tələb olunur.', 'Schengen visa via VFS Global. Biometrics required.', 'Шенгенская виза через VFS Global. Требуется биометрия.', 80, 136, 10, 15, 180, 90, false, 'https://baku.diplo.de/az-az/visum', 'https://visa.vfsglobal.com/aze/az/deu', NOW(), 90
FROM countries WHERE slug = 'italy' ON CONFLICT DO NOTHING;

-- İtaliya üçün də Schengen vizası (əgər countries cədvəlində varsa)
INSERT INTO visa_info (country_id, requirement_type, processing_time, documents, notes_az, notes_en, notes_ru, fee_usd, fee_azn, processing_days_min, processing_days_max, validity_days, max_stay_days, is_evisa, official_url, appointment_url, last_verified_at, data_confidence)
SELECT id, 'required', '10-15 iş günü', '{"Pasport (6 ay)", "Viza ərizəsi (VFS)", "Biyometrik foto (3.5x4.5)", "Səyahət sığortası (30,000 EUR)", "Bank çıxarışı (son 3 ay)", "İş yeri arayışı", "Otel rezervasiyası", "Gediş-dönüş bilet"}', 'Schengen vizası. VFS Global vasitəsilə müraciət.', 'Schengen visa via VFS Global.', 'Шенгенская виза через VFS Global.', 80, 136, 10, 15, 180, 90, false, 'https://ambbaku.esteri.it', 'https://visa.vfsglobal.com/aze/az/ita', NOW(), 85
FROM countries WHERE slug = 'italy' ON CONFLICT DO NOTHING;

-- 4. Sənəd siyahıları — Yaponiya üçün
INSERT INTO visa_documents (country_id, visa_type, document_name_az, document_name_en, document_name_ru, is_required, document_category, sort_order, notes_az)
SELECT c.id, 'tourist', doc_name_az, doc_name_en, doc_name_ru, true, doc_cat, doc_order, doc_notes
FROM countries c,
UNNEST(
  ARRAY[
    'Etibarlı pasport (6 aydan çox)',
    'Viza müraciət forması',
    'Biyometrik foto (4.5x4.5 sm)',
    'Maliyyə sübutu (bank çıxarışı)',
    'Səyahət planı / marşrut',
    'İş yeri arayışı',
    'Otel rezervasiyası',
    'Gediş-dönüş aviabilet'
  ],
  ARRAY[
    'Valid passport (6+ months)',
    'Visa application form',
    'Biometric photo (4.5x4.5 cm)',
    'Financial proof (bank statement)',
    'Travel itinerary',
    'Employment certificate',
    'Hotel reservation',
    'Round-trip flight ticket'
  ],
  ARRAY[
    'Действующий паспорт (6+ месяцев)',
    'Анкета на визу',
    'Биометрическое фото (4.5x4.5 см)',
    'Финансовое подтверждение (выписка)',
    'План поездки / маршрут',
    'Справка с работы',
    'Бронирование отеля',
    'Авиабилет туда-обратно'
  ],
  ARRAY['identity','identity','identity','financial','travel','financial','travel','travel'],
  ARRAY[1,2,3,4,5,6,7,8],
  ARRAY[NULL,NULL,'Son 3 ay ərzində çəkilib',NULL,NULL,NULL,NULL,NULL]
) AS t(doc_name_az, doc_name_en, doc_name_ru, doc_cat, doc_order, doc_notes)
WHERE c.slug = 'japan';

-- Sənəd siyahıları — Almaniya (Schengen) üçün
INSERT INTO visa_documents (country_id, visa_type, document_name_az, document_name_en, document_name_ru, is_required, document_category, sort_order)
SELECT c.id, 'tourist', doc_name_az, doc_name_en, doc_name_ru, true, doc_cat, doc_order
FROM countries c,
UNNEST(
  ARRAY[
    'Etibarlı pasport (6 aydan çox)',
    'Viza müraciət forması (VFS)',
    'Biyometrik foto (3.5x4.5 sm)',
    'Səyahət sığortası (min 30,000 EUR)',
    'Bank çıxarışı (son 3 ay)',
    'İş yeri arayışı / Tələbə arayışı',
    'Otel rezervasiyası',
    'Gediş-dönüş aviabilet',
    'Niyyət məktubu'
  ],
  ARRAY[
    'Valid passport (6+ months)',
    'Visa application form (VFS)',
    'Biometric photo (3.5x4.5 cm)',
    'Travel insurance (min 30,000 EUR)',
    'Bank statement (last 3 months)',
    'Employment/student certificate',
    'Hotel reservation',
    'Round-trip flight ticket',
    'Cover letter'
  ],
  ARRAY[
    'Действующий паспорт (6+ месяцев)',
    'Анкета на визу (VFS)',
    'Биометрическое фото (3.5x4.5 см)',
    'Страховка (мин 30,000 EUR)',
    'Выписка из банка (3 месяца)',
    'Справка с работы / учебы',
    'Бронирование отеля',
    'Авиабилет туда-обратно',
    'Сопроводительное письмо'
  ],
  ARRAY['identity','identity','identity','travel','financial','financial','travel','travel','identity'],
  ARRAY[1,2,3,4,5,6,7,8,9]
) AS t(doc_name_az, doc_name_en, doc_name_ru, doc_cat, doc_order)
WHERE c.slug = 'italy';
```

- [ ] **Step 2: Migration-ı Supabase-də işə sal**

Run: `Supabase Dashboard → SQL Editor → paste və run et`

---

## Task 2: Update Types

**Files:**
- Modify: `src/types/country.ts`

- [ ] **Step 1: Mövcud `VisaInfo` interfeysinə yeni sahələr əlavə et və `VisaDocument` interfeysi yarat**

Mövcud faylın məzmununu bu ilə əvəz et:

```typescript
export interface Country {
  id: string;
  slug: string;
  name_az: string;
  name_ru: string;
  name_en: string;
  flag_emoji: string;
  description?: string;
  description_az?: string;
  description_ru?: string;
  description_en?: string;
  best_time: string;
  avg_costs: {
    flight: string;
    hotel: string;
    daily: string;
  };
  popular_places: string[];
}

export interface VisaInfo {
  id: string;
  country_id: string;
  requirement_type: 'required' | 'not_required' | 'on_arrival' | 'e_visa';
  embassy_link?: string;
  processing_time?: string;
  documents: string[];
  notes_az?: string;
  notes_ru?: string;
  notes_en?: string;
  fee_usd?: number;
  fee_azn?: number;
  processing_days_min?: number;
  processing_days_max?: number;
  validity_days?: number;
  max_stay_days?: number;
  is_evisa?: boolean;
  evisa_url?: string;
  official_url?: string;
  appointment_url?: string;
  last_verified_at?: string;
  data_confidence?: number;
}

export interface VisaDocument {
  id: string;
  country_id: string;
  visa_type: string;
  document_name_az: string;
  document_name_en?: string;
  document_name_ru?: string;
  description_az?: string;
  is_required: boolean;
  document_category: string;
  accepted_formats?: string[];
  max_size_mb?: number;
  notes_az?: string;
  sort_order: number;
}

export interface VisaCountryData {
  visa: VisaInfo;
  country: {
    id: string;
    name_az: string;
    name_en: string;
    name_ru: string;
    slug: string;
    flag_emoji: string;
  };
  documents: VisaDocument[];
}
```

- [ ] **Step 2: TypeScript yoxla**

Run: `npx tsc --noEmit`
Expected: No errors

---

## Task 3: Update i18n Translations

**Files:**
- Modify: `src/messages/az.json`
- Modify: `src/messages/en.json`
- Modify: `src/messages/ru.json`

- [ ] **Step 1: az.json `visa` namespace-ini genişləndir**

Mövcud `visa` blokunu bu ilə əvəz et:

```json
"visa": {
    "title": "Viza Mərkəzi",
    "subtitle": "Azərbaycan pasportu ilə dünya ölkələrinə viza tələbləri",
    "required": "Viza lazımdır",
    "notRequired": "Vizasız",
    "onArrival": "Gəlişdə viza",
    "eVisa": "E-viza",
    "documents": "Tələb olunan sənədlər",
    "processingTime": "Emal müddəti",
    "embassy": "Konsulluq məlumatı",
    "searchPlaceholder": "Ölkə axtar...",
    "fee": "Viza haqqı",
    "feeFree": "Pulsuz",
    "validity": "Etibarlılıq",
    "maxStay": "Maks. qalma",
    "evisaAvailable": "Bu ölkə üçün E-viza mövcuddur",
    "applyOnline": "Online müraciət et",
    "ready": "hazır",
    "allDocumentsReady": "Bütün sənədlər hazırdır! Müraciətə başlaya bilərsiniz.",
    "askAI": "AI-ya sual ver",
    "disclaimer": "Bu məlumatlar məlumat vermək məqsəti daşıyır. Viza tələbləri dəyişə bilər. Müraciət etməzdən əvvəl rəsmi konsulluq veb saytını yoxlayın.",
    "lastVerified": "Son yenilənmə",
    "confidence": "Məlumat etibarlılığı",
    "noVisaInfo": "Bu ölkə üçün viza məlumatı tapılmadı",
    "backToVisa": "Viza mərkəzinə qayıt",
    "days": "gün",
    "workDays": "iş günü",
    "appointment": "Randevu al",
    "officialSite": "Rəsmi sayt",
    "aiPlaceholder": "Bu ölkənin vizası haqqında sual ver...",
    "aiSending": "Cavab hazırlanır...",
    "aiQuickQuestions": "Sürətli suallar",
    "category": {
      "identity": "Şəxsiyyət sənədləri",
      "financial": "Maliyyə sənədləri",
      "travel": "Səyahət sənədləri",
      "other": "Digər"
    }
  }
```

- [ ] **Step 2: en.json `visa` namespace-ini genişləndir**

```json
"visa": {
    "title": "Visa Center",
    "subtitle": "Visa requirements for Azerbaijani passport holders",
    "required": "Visa required",
    "notRequired": "Visa-free",
    "onArrival": "Visa on arrival",
    "eVisa": "E-visa",
    "documents": "Required documents",
    "processingTime": "Processing time",
    "embassy": "Embassy information",
    "searchPlaceholder": "Search country...",
    "fee": "Visa fee",
    "feeFree": "Free",
    "validity": "Validity",
    "maxStay": "Max. stay",
    "evisaAvailable": "E-visa available for this country",
    "applyOnline": "Apply online",
    "ready": "ready",
    "allDocumentsReady": "All documents are ready! You can start your application.",
    "askAI": "Ask AI",
    "disclaimer": "This information is for reference only. Visa requirements may change. Please verify with the official embassy website before applying.",
    "lastVerified": "Last verified",
    "confidence": "Data confidence",
    "noVisaInfo": "No visa information found for this country",
    "backToVisa": "Back to Visa Center",
    "days": "days",
    "workDays": "working days",
    "appointment": "Get appointment",
    "officialSite": "Official website",
    "aiPlaceholder": "Ask about this country's visa...",
    "aiSending": "Generating answer...",
    "aiQuickQuestions": "Quick questions",
    "category": {
      "identity": "Identity documents",
      "financial": "Financial documents",
      "travel": "Travel documents",
      "other": "Other"
    }
  }
```

- [ ] **Step 3: ru.json `visa` namespace-ini genişləndir**

```json
"visa": {
    "title": "Визовый центр",
    "subtitle": "Визовые требования для паспорта Азербайджана",
    "required": "Нужна виза",
    "notRequired": "Без визы",
    "onArrival": "Виза по прибытии",
    "eVisa": "Электронная виза",
    "documents": "Необходимые документы",
    "processingTime": "Срок оформления",
    "embassy": "Информация о консульстве",
    "searchPlaceholder": "Поиск страны...",
    "fee": "Визовый сбор",
    "feeFree": "Бесплатно",
    "validity": "Срок действия",
    "maxStay": "Макс. пребывание",
    "evisaAvailable": "Для этой страны доступна электронная виза",
    "applyOnline": "Подать онлайн",
    "ready": "готово",
    "allDocumentsReady": "Все документы готовы! Можно начинать подачу.",
    "askAI": "Спросить AI",
    "disclaimer": "Эта информация носит справочный характер. Визовые требования могут меняться. Перед подачей проверьте на официальном сайте консульства.",
    "lastVerified": "Последняя проверка",
    "confidence": "Достоверность данных",
    "noVisaInfo": "Визовая информация для этой страны не найдена",
    "backToVisa": "Назад в визовый центр",
    "days": "дней",
    "workDays": "рабочих дней",
    "appointment": "Записаться",
    "officialSite": "Официальный сайт",
    "aiPlaceholder": "Задайте вопрос о визе этой страны...",
    "aiSending": "Генерация ответа...",
    "aiQuickQuestions": "Быстрые вопросы",
    "category": {
      "identity": "Личные документы",
      "financial": "Финансовые документы",
      "travel": "Туристические документы",
      "other": "Прочее"
    }
  }
```

---

## Task 4: API Route — Visa Country Data

**Files:**
- Create: `src/app/api/visa/[country]/route.ts`

- [ ] **Step 1: Create GET handler**

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ country: string }> }
) {
  const { country: slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('visa_info')
    .select(`
      *,
      countries!inner(id, name_az, name_en, name_ru, slug, flag_emoji),
      visa_documents(
        id, document_name_az, document_name_en, document_name_ru,
        description_az, is_required, document_category,
        accepted_formats, max_size_mb, notes_az, sort_order
      )
    `)
    .eq('countries.slug', slug)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Ölkə tapılmadı' }, { status: 404 });
  }

  return NextResponse.json(data);
}
```

---

## Task 5: API Route — AI Answer

**Files:**
- Create: `src/app/api/visa/ai-answer/route.ts`

- [ ] **Step 1: Create POST handler**

```typescript
import { createClient } from '@/lib/supabase/server';
import { getProvider } from '@/lib/ai/provider';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { question, country_slug, locale } = await request.json();

  if (!question || !country_slug) {
    return NextResponse.json({ error: 'Sual və ölkə tələb olunur' }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: visaData } = await supabase
    .from('visa_info')
    .select(`
      *,
      countries!inner(name_az, name_en, slug),
      visa_documents(document_name_az, is_required, document_category)
    `)
    .eq('countries.slug', country_slug)
    .single();

  const context = buildVisaContext(visaData, country_slug);
  const localeInstruction: Record<string, string> = {
    az: 'Azərbaycan dilində cavab ver.',
    en: 'Answer in English.',
    ru: 'Отвечай на русском языке.',
  };

  try {
    const provider = getProvider();
    const answer = await provider.generateText(
      `${context}\n\n${localeInstruction[locale] || localeInstruction.az}\n\nSual: ${question}`
    );

    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json({ error: 'AI cavab verə bilmədi' }, { status: 500 });
  }
}

function buildVisaContext(visaData: Record<string, unknown> | null, slug: string): string {
  if (!visaData) {
    return `Ölkə: ${slug}. Ümumi viza qaydaları haqqında cavab ver. Azərbaycan pasportu kontekstində.`;
  }

  const docs = Array.isArray(visaData.visa_documents)
    ? (visaData.visa_documents as { is_required: boolean; document_name_az: string }[])
        .filter((d) => d.is_required)
        .map((d) => d.document_name_az)
        .join(', ')
    : '';

  const country = visaData.countries as { name_az: string };

  return `SEN: TravelAZ saytının viza assistentisən. Azərbaycan vətəndaşlarına kömək edirsən.

ÖLKƏ: ${country.name_az}
Viza növü: ${visaData.requirement_type}
E-viza: ${visaData.is_evisa ? 'Mövcuddur' : 'Mövcud deyil'}
Viza haqqı: ${visaData.fee_usd ? `$${visaData.fee_usd}` : 'Pulsuz'}
İcmal müddəti: ${visaData.processing_days_min || '?'}-${visaData.processing_days_max || '?'} iş günü
Etibarlılıq: ${visaData.validity_days || '?'} gün
Maks. qalma: ${visaData.max_stay_days || '?'} gün

TƏLƏB OLUNAN SƏNƏDLƏR:
${docs || 'Sənəd tələb olunmur'}

QEYDLƏR:
${(visaData.notes_az as string) || ''}

CAVAB QAYDASI:
- Dəqiq, aydın cavab ver
- Şübhəli məlumatı "Rəsmi mənbədən yoxlayın" deyərək qeyd et
- Rəsmi sayt linkini tövsiyə et (${visaData.official_url || 'yoxdur'})`;
}
```

---

## Task 6: Visa Search Bar Component

**Files:**
- Create: `src/components/visa/visa-search-bar.tsx`

- [ ] **Step 1: Create component**

```typescript
'use client';

import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';

interface VisaSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function VisaSearchBar({ value, onChange }: VisaSearchBarProps) {
  const t = useTranslations('visa');

  return (
    <div className="relative max-w-md mb-8">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-sec" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('searchPlaceholder')}
        className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-surface border border-border focus:border-primary focus:outline-none text-sm"
      />
    </div>
  );
}
```

---

## Task 7: Visa Country Grid Component

**Files:**
- Create: `src/components/visa/visa-country-grid.tsx`

- [ ] **Step 1: Create component**

```typescript
'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Clock, DollarSign, CheckCircle, AlertCircle, Plane } from 'lucide-react';
import type { VisaCountryData } from '@/types/country';

interface VisaCountryGridProps {
  countries: VisaCountryData[];
}

const TYPE_CONFIG: Record<string, { color: string; icon: typeof CheckCircle }> = {
  not_required: { color: 'text-green-400 bg-green-500/10 border-green-500/20', icon: CheckCircle },
  on_arrival: { color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', icon: Plane },
  e_visa: { color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: AlertCircle },
  required: { color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: AlertCircle },
};

export default function VisaCountryGrid({ countries }: VisaCountryGridProps) {
  const t = useTranslations('visa');
  const locale = useLocale();

  if (countries.length === 0) {
    return (
      <div className="text-center py-12 text-txt-sec">
        {t('noVisaInfo')}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {countries.map(({ visa, country }) => {
        const config = TYPE_CONFIG[visa.requirement_type] || TYPE_CONFIG.required;
        const Icon = config.icon;
        const name = country[`name_${locale}` as keyof typeof country] || country.name_az;
        const fee = visa.fee_usd ? `$${visa.fee_usd}` : t('feeFree');

        return (
          <Link
            key={country.id}
            href={`/${locale}/visa/${country.slug}`}
            className="bg-bg-surface rounded-xl p-5 border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{country.flag_emoji}</span>
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{name}</h3>
              </div>
            </div>

            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
              <Icon className="w-3 h-3" />
              {t(visa.requirement_type === 'not_required' ? 'notRequired' : visa.requirement_type === 'on_arrival' ? 'onArrival' : visa.requirement_type === 'e_visa' ? 'eVisa' : 'required')}
            </div>

            <div className="flex items-center gap-4 mt-3 text-sm text-txt-sec">
              <div className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                {fee}
              </div>
              {visa.processing_days_max ? (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {visa.processing_days_min}-{visa.processing_days_max} {t('workDays')}
                </div>
              ) : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
```

---

## Task 8: Visa Document Checklist Component

**Files:**
- Create: `src/components/visa/visa-document-checklist.tsx`

- [ ] **Step 1: Create component**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { CheckCircle, Circle, FileText } from 'lucide-react';
import type { VisaDocument } from '@/types/country';

interface VisaDocumentChecklistProps {
  documents: VisaDocument[];
  countrySlug: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  identity: '🪪',
  financial: '💰',
  travel: '✈️',
  other: '📄',
};

export default function VisaDocumentChecklist({ documents, countrySlug }: VisaDocumentChecklistProps) {
  const t = useTranslations('visa');
  const locale = useLocale();
  const storageKey = `visa-checklist-${countrySlug}`;

  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setChecked(new Set(JSON.parse(saved)));
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify([...checked]));
    } catch {}
  }, [checked, storageKey]);

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const grouped = documents.reduce<Record<string, VisaDocument[]>>((acc, doc) => {
    const cat = doc.document_category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(doc);
    return acc;
  }, {});

  const totalRequired = documents.filter((d) => d.is_required).length;
  const totalChecked = [...checked].filter((id) => documents.find((d) => d.id === id && d.is_required)).length;
  const progress = totalRequired > 0 ? Math.round((totalChecked / totalRequired) * 100) : 0;

  return (
    <div className="bg-bg-surface rounded-xl p-5 border border-border mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {t('documents')}
        </h3>
        <span className="text-sm text-txt-sec">
          {totalChecked}/{totalRequired} {t('ready')}
        </span>
      </div>

      <div className="w-full bg-secondary rounded-full h-2 mb-5">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {Object.entries(grouped).map(([category, docs]) => (
        <div key={category} className="mb-4 last:mb-0">
          <p className="text-sm font-medium text-txt-sec mb-2 flex items-center gap-1.5">
            <span>{CATEGORY_ICONS[category] || CATEGORY_ICONS.other}</span>
            {t(`category.${category}` as `category.${typeof category}`)}
          </p>
          <div className="space-y-2">
            {docs.map((doc) => {
              const name = doc[`document_name_${locale}` as keyof VisaDocument] as string || doc.document_name_az;
              const isChecked = checked.has(doc.id);
              return (
                <label key={doc.id} className="flex items-start gap-3 cursor-pointer group">
                  <button
                    type="button"
                    onClick={() => toggle(doc.id)}
                    className="mt-0.5 shrink-0"
                  >
                    {isChecked ? (
                      <CheckCircle className="w-4.5 h-4.5 text-green-400" />
                    ) : (
                      <Circle className="w-4.5 h-4.5 text-txt-sec group-hover:text-primary transition-colors" />
                    )}
                  </button>
                  <div>
                    <span className={`text-sm ${isChecked ? 'line-through text-txt-sec' : ''}`}>
                      {name}
                      {!doc.is_required && (
                        <span className="ml-2 text-xs text-txt-sec">(isteğe bağlı)</span>
                      )}
                    </span>
                    {doc.notes_az && (
                      <p className="text-xs text-txt-sec mt-0.5">{doc.notes_az}</p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      ))}

      {progress === 100 && totalRequired > 0 && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm text-center">
          {t('allDocumentsReady')}
        </div>
      )}
    </div>
  );
}
```

---

## Task 9: Visa AI Chat Component

**Files:**
- Create: `src/components/visa/visa-ai-chat.tsx`

- [ ] **Step 1: Create component**

```typescript
'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { MessageCircle, Send, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_QUESTIONS: Record<string, Record<string, string[]>> = {
  az: {
    required: [
      'Hansı sənədlər tələb olunur?',
      'Viza nə qədər vaxt aparır?',
      'Randevu necə alınır?',
      'Viza haqqı nə qədərdir?',
      'Müraciət rədd edilərsə nə etməli?',
    ],
    not_required: [
      'Qalma müddəti nə qədərdir?',
      'Sərhəddə nə tələb olunur?',
      'Qayıdış bileti lazımdır?',
    ],
    on_arrival: [
      'Gəlişdə viza necə alınır?',
      'Neçə gün qalmaq olar?',
      'Viza haqqı varmı?',
    ],
  },
  en: {
    required: ['What documents are needed?', 'How long does it take?', 'How to get appointment?', 'What is the visa fee?'],
    not_required: ['How long can I stay?', 'What is needed at border?', 'Return ticket required?'],
    on_arrival: ['How to get visa on arrival?', 'How many days can I stay?', 'Is there a fee?'],
  },
  ru: {
    required: ['Какие документы нужны?', 'Сколько времени занимает?', 'Как записаться?', 'Сколько стоит виза?'],
    not_required: ['Сколько можно находиться?', 'Что нужно на границе?', 'Нужен обратный билет?'],
    on_arrival: ['Как получить визу?', 'Сколько дней можно?', 'Есть ли сбор?'],
  },
};

export default function VisaAIChat({
  countrySlug,
  countryName,
  requirementType,
}: {
  countrySlug: string;
  countryName: string;
  requirementType: string;
}) {
  const t = useTranslations('visa');
  const locale = useLocale();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (question: string) => {
    if (!question.trim() || isLoading) return;

    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/visa/ai-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, country_slug: countrySlug, locale }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer || data.error }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Xəta baş verdi. Yenidən cəhd edin.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const typeKey = requirementType === 'not_required' || requirementType === 'on_arrival' ? requirementType : 'required';
  const questions = (QUICK_QUESTIONS[locale] || QUICK_QUESTIONS.az)[typeKey] || QUICK_QUESTIONS.az.required;

  return (
    <div className="bg-bg-surface rounded-xl border border-border p-5 mt-6">
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-primary" />
        {countryName} — {t('askAI')}
      </h3>

      {messages.length === 0 && (
        <div className="mb-4">
          <p className="text-xs text-txt-sec mb-2">{t('aiQuickQuestions')}</p>
          <div className="flex flex-wrap gap-2">
            {questions.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3 min-h-[40px] max-h-[400px] overflow-y-auto mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-bg-base border border-border'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-bg-base border border-border rounded-xl px-4 py-2.5 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-txt-sec">{t('aiSending')}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
          placeholder={t('aiPlaceholder')}
          className="flex-1 border border-border rounded-lg px-3 py-2.5 text-sm bg-bg-base focus:outline-none focus:border-primary"
          disabled={isLoading}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
          className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm disabled:opacity-50 flex items-center gap-1.5"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
```

---

## Task 10: Update Visa Page (Server Component)

**Files:**
- Modify: `src/app/[locale]/visa/page.tsx`

- [ ] **Step 1: Mövcud faylı tam yenidən yaz**

```typescript
import { createClient } from '@/lib/supabase/server';
import VisaCountryGrid from '@/components/visa/visa-country-grid';
import VisaSearchBar from '@/components/visa/visa-search-bar';
import { VisaPageClient } from './visa-page-client';
import type { VisaCountryData } from '@/types/country';

export default async function VisaPage() {
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from('visa_info')
    .select(`
      *,
      countries!inner(id, name_az, name_en, name_ru, slug, flag_emoji),
      visa_documents(id)
    `)
    .order('countries(name_az)');

  const countries: VisaCountryData[] = (rows || []).map((row: Record<string, unknown>) => ({
    visa: row as unknown as VisaCountryData['visa'],
    country: row.countries as VisaCountryData['country'],
    documents: (row.visa_documents || []) as VisaCountryData['documents'],
  }));

  return <VisaPageClient countries={countries} />;
}
```

- [ ] **Step 2: Client wrapper yarat**

Create: `src/app/[locale]/visa/visa-page-client.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import VisaCountryGrid from '@/components/visa/visa-country-grid';
import VisaSearchBar from '@/components/visa/visa-search-bar';
import type { VisaCountryData } from '@/types/country';

export function VisaPageClient({ countries }: { countries: VisaCountryData[] }) {
  const t = useTranslations('visa');
  const [search, setSearch] = useState('');

  const filtered = search
    ? countries.filter(({ country }) => {
        const q = search.toLowerCase();
        return (
          country.name_az.toLowerCase().includes(q) ||
          country.name_en.toLowerCase().includes(q) ||
          country.name_ru.toLowerCase().includes(q) ||
          country.slug.includes(q)
        );
      })
    : countries;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
      <p className="text-txt-sec mb-8">{t('subtitle')}</p>
      <VisaSearchBar value={search} onChange={setSearch} />
      <VisaCountryGrid countries={filtered} />
    </div>
  );
}
```

---

## Task 11: Create Visa Country Detail Page

**Files:**
- Create: `src/app/[locale]/visa/[country]/page.tsx`

- [ ] **Step 1: Create server component**

```typescript
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import VisaDetailClient from '@/components/visa/visa-detail-client';

export default async function VisaDetailPage({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}) {
  const { country: slug, locale } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from('visa_info')
    .select(`
      *,
      countries!inner(id, name_az, name_en, name_ru, slug, flag_emoji),
      visa_documents(
        id, document_name_az, document_name_en, document_name_ru,
        description_az, is_required, document_category,
        accepted_formats, max_size_mb, notes_az, sort_order
      )
    `)
    .eq('countries.slug', slug)
    .single();

  if (!data) notFound();

  const country = data.countries as {
    id: string;
    name_az: string;
    name_en: string;
    name_ru: string;
    slug: string;
    flag_emoji: string;
  };

  const visa = data as Record<string, unknown>;
  const documents = (data.visa_documents || []) as Array<{
    id: string;
    document_name_az: string;
    document_name_en?: string;
    document_name_ru?: string;
    description_az?: string;
    is_required: boolean;
    document_category: string;
    accepted_formats?: string[];
    max_size_mb?: number;
    notes_az?: string;
    sort_order: number;
  }>;

  return (
    <VisaDetailClient
      country={country}
      visa={visa}
      documents={documents}
      locale={locale}
    />
  );
}
```

---

## Task 12: Visa Detail Client Component

**Files:**
- Create: `src/components/visa/visa-detail-client.tsx`

- [ ] **Step 1: Create component**

```typescript
'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Clock, DollarSign, Calendar, ExternalLink, Shield, AlertTriangle } from 'lucide-react';
import VisaDocumentChecklist from './visa-document-checklist';
import VisaAIChat from './visa-ai-chat';
import type { VisaDocument } from '@/types/country';

interface VisaDetailClientProps {
  country: {
    id: string;
    name_az: string;
    name_en: string;
    name_ru: string;
    slug: string;
    flag_emoji: string;
  };
  visa: Record<string, unknown>;
  documents: VisaDocument[];
  locale: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'bugün';
  if (days === 1) return '1 gün əvvəl';
  if (days < 30) return `${days} gün əvvəl`;
  const months = Math.floor(days / 30);
  return `${months} ay əvvəl`;
}

export default function VisaDetailClient({ country, visa, documents, locale }: VisaDetailClientProps) {
  const t = useTranslations('visa');
  const name = country[`name_${locale}` as keyof typeof country] || country.name_az;

  const requirementType = visa.requirement_type as string;
  const feeUsd = visa.fee_usd as number | null;
  const processingMin = visa.processing_days_min as number | null;
  const processingMax = visa.processing_days_max as number | null;
  const validityDays = visa.validity_days as number | null;
  const maxStayDays = visa.max_stay_days as number | null;
  const isEvisa = visa.is_evisa as boolean;
  const evisaUrl = visa.evisa_url as string | null;
  const officialUrl = visa.official_url as string | null;
  const appointmentUrl = visa.appointment_url as string | null;
  const lastVerified = visa.last_verified_at as string | null;
  const notes = visa[`notes_${locale}`] as string | null || visa.notes_az as string;

  const typeLabels: Record<string, string> = {
    not_required: t('notRequired'),
    on_arrival: t('onArrival'),
    e_visa: t('eVisa'),
    required: t('required'),
  };

  const typeColors: Record<string, string> = {
    not_required: 'text-green-400 bg-green-500/10 border-green-500/20',
    on_arrival: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    e_visa: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    required: 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href={`/${locale}/visa`} className="flex items-center gap-2 text-txt-sec hover:text-primary mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" />
        {t('backToVisa')}
      </Link>

      <div className="flex items-start gap-4 mb-8">
        <span className="text-5xl">{country.flag_emoji}</span>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{name}</h1>
          <p className="text-txt-sec text-sm mt-1">Azərbaycan Pasportu — Viza Tələbləri</p>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-sm font-medium border ${typeColors[requirementType] || ''}`}>
          {typeLabels[requirementType] || requirementType}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {processingMax ? (
          <div className="bg-bg-surface rounded-xl p-4 border border-border flex items-start gap-3">
            <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-txt-sec">{t('processingTime')}</p>
              <p className="font-semibold">{processingMin}-{processingMax} {t('workDays')}</p>
            </div>
          </div>
        ) : (
          <div className="bg-bg-surface rounded-xl p-4 border border-border flex items-start gap-3">
            <Clock className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-txt-sec">{t('processingTime')}</p>
              <p className="font-semibold text-green-400">{t('notRequired')}</p>
            </div>
          </div>
        )}

        <div className="bg-bg-surface rounded-xl p-4 border border-border flex items-start gap-3">
          <DollarSign className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-txt-sec">{t('fee')}</p>
            <p className="font-semibold">{feeUsd ? `$${feeUsd}` : t('feeFree')}</p>
          </div>
        </div>

        <div className="bg-bg-surface rounded-xl p-4 border border-border flex items-start gap-3">
          <Calendar className="w-5 h-5 text-accent mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-txt-sec">{maxStayDays ? t('maxStay') : t('validity')}</p>
            <p className="font-semibold">{maxStayDays ? `${maxStayDays} ${t('days')}` : validityDays ? `${validityDays} ${t('days')}` : '—'}</p>
          </div>
        </div>
      </div>

      {isEvisa && evisaUrl && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
          <span className="text-lg">✅</span>
          <div className="flex-1">
            <p className="text-green-400 font-medium text-sm">{t('evisaAvailable')}</p>
          </div>
          <a href={evisaUrl} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg flex items-center gap-1 hover:bg-green-500/30 transition-colors">
            {t('applyOnline')} <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {notes && (
        <div className="bg-bg-surface rounded-xl p-4 border border-border mb-6">
          <p className="text-sm">{notes}</p>
        </div>
      )}

      {documents.length > 0 && (
        <VisaDocumentChecklist documents={documents} countrySlug={country.slug} />
      )}

      {(officialUrl || appointmentUrl) && (
        <div className="flex flex-wrap gap-3 mb-6">
          {officialUrl && (
            <a href={officialUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm px-4 py-2.5 bg-bg-surface border border-border rounded-lg hover:border-primary/50 transition-colors">
              <ExternalLink className="w-4 h-4" />
              {t('officialSite')}
            </a>
          )}
          {appointmentUrl && (
            <a href={appointmentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm px-4 py-2.5 bg-bg-surface border border-border rounded-lg hover:border-primary/50 transition-colors">
              <Calendar className="w-4 h-4" />
              {t('appointment')}
            </a>
          )}
        </div>
      )}

      <VisaAIChat countrySlug={country.slug} countryName={name} requirementType={requirementType} />

      <div className="mt-6 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
        <div className="text-sm text-txt-sec">
          <p>{t('disclaimer')}</p>
          {lastVerified && (
            <p className="mt-1 flex items-center gap-1 text-xs">
              <Shield className="w-3 h-3" />
              {t('lastVerified')}: {timeAgo(lastVerified)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Task 13: Verify

- [ ] **Step 1: TypeScript yoxla**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Dev server-i başlat və səhifələri yoxla**

Run: `npm run dev`

Test et:
- `/az/visa` — ölkə siyahısı göstərir, axtarış işləyir
- `/az/visa/turkey` — Türkiyə vizasız kartı
- `/az/visa/japan` — Yaponiya viza detalı, sənəd checklist, AI chat
- `/en/visa` — ingilis dilində
- `/ru/visa` — rus dilində

---

## Qeydlər

- Mövcud `src/components/country/visa-info.tsx` dəyişmir — `countries/[slug]` səhifəsində istifadə olunur
- Migration-ı Supabase Dashboard SQL Editor-də işə sal
- Countries cədvəlində `slug` dəyərləri hardcoded countries page ilə uyğun gəlməlidir (turkey, dubai, georgia, japan, russia, italy)
- AI chat mövcud AI provider sistemindən istifadə edir — `.env.local`-da `AI_PROVIDER` və müvafiq API key olmalıdır
