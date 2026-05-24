# TravelAZ Sayt Auditi

Bu sənəd TravelAZ layihəsinin hazırkı vəziyyətini `Senior Frontend`, `Senior Backend`, `Senior Fullstack`, `Senior DevOps` və `Senior Hacker / Security` baxışları ilə qiymətləndirir. Məqsəd ümumi tənqid vermək deyil; real riskləri, məhsul boşluqlarını və texniki borcu prioritetləşdirməkdir.

Audit canlı production penetration test deyil. Qiymətləndirmə repo-dakı mövcud kod, route-lar, səhifə axınları və layihə roadmap-ı əsasında hazırlanıb.

## Qısa Nəticə

TravelAZ artıq “demo” səviyyəsini keçib və real məhsul skeleti formalaşıb: çoxdilli route-lar, Supabase əsaslı data modeli, AI alətləri, visa axınları, countries/cities/places platforması, companions, tours və blog/news xətti var. Problem məhsulun olmamasında deyil; problem bu qədər geniş səthin eyni keyfiyyətdə bərkidilməməsindədir.

Ən əsas risklər:

- təhlükəsizlik və role model konsistensiyası tam bərk deyil
- trust layer zəifdir: review sistemi, moderation flow və user-generated content dəyəri hələ kifayət qədər canlı deyil
- bəzi public API route-larında input, output və authorization sərtliyi qeyri-bərabərdir
- frontend-də məhsul hissi güclüdür, amma bəzi səhifələrdə fallback və completeness fərqi hələ görünür
- ops və production hardening istiqamətində aydın işlər var, amma tam bağlanmayıb

## Repo Evidence

- [middleware.ts](/C:/Users/Asus/OneDrive/Desktop/Travel-new/middleware.ts)
- [next.config.ts](/C:/Users/Asus/OneDrive/Desktop/Travel-new/next.config.ts)
- [src/app/api/comments/route.ts](/C:/Users/Asus/OneDrive/Desktop/Travel-new/src/app/api/comments/route.ts)
- [src/app/api/visa/generate/route.ts](/C:/Users/Asus/OneDrive/Desktop/Travel-new/src/app/api/visa/generate/route.ts)
- [src/app/api/reviews/moderate/route.ts](/C:/Users/Asus/OneDrive/Desktop/Travel-new/src/app/api/reviews/moderate/route.ts)
- [src/app/api/images/enrich/route.ts](/C:/Users/Asus/OneDrive/Desktop/Travel-new/src/app/api/images/enrich/route.ts)
- [src/app/[locale]/page.tsx](/C:/Users/Asus/OneDrive/Desktop/Travel-new/src/app/[locale]/page.tsx)
- [src/app/[locale]/places/[id]/page.tsx](/C:/Users/Asus/OneDrive/Desktop/Travel-new/src/app/[locale]/places/[id]/page.tsx)
- [src/hooks/useChat.ts](/C:/Users/Asus/OneDrive/Desktop/Travel-new/src/hooks/useChat.ts)
- [src/lib/rate-limit.ts](/C:/Users/Asus/OneDrive/Desktop/Travel-new/src/lib/rate-limit.ts)

## Critical

### 1. Admin role modeli iki fərqli həqiqət mənbəyinə söykənir

**Problem**

- `middleware.ts` admin yoxlamasını `user.app_metadata.role` ilə edir.
- API route-ların bir hissəsi isə `profiles.role` cədvəlinə baxır.

**Niyə riskdir**

- Eyni istifadəçi bir yerdə admin, başqa yerdə admin olmayan kimi görünə bilər.
- Authorization behavior predict edilə bilməz.
- Incident zamanı “doğru source of truth hansıdır?” sualı yaranır.

**Nəticəsi nədir**

- Admin panelə giriş, admin-only API-lər və moderation flow-larında uyğunsuz davranış yarana bilər.
- Bu tip uyğunsuzluq həm privilege escalation, həm də legit admin-in bloklanması riski yaradır.

**Nə etmək lazımdır**

- Admin role üçün tək source of truth seçilməlidir.
- Bütün middleware və API authorization eyni helper üzərindən işləməlidir.
- Role check logic shared server utility-yə çıxarılmalıdır.

### 2. CSP hələ çox yumşaqdır

**Problem**

- `next.config.ts` içində `script-src 'unsafe-eval' 'unsafe-inline'` aktivdir.
- Bu, production hardening üçün zəif default-dur.

**Niyə riskdir**

- XSS impact radius artır.
- Sonradan daxil edilən zəif sanitize olunmuş content və ya third-party injection daha təhlükəli olur.

**Nəticəsi nədir**

- UGC, AI-generated content və rich text olan məhsul üçün browser-level müdafiə zəifləyir.

**Nə etmək lazımdır**

- Production CSP nonce/hash əsaslı daha sərt modelə keçirilməlidir.
- `unsafe-inline` və `unsafe-eval` minimuma endirilməlidir.
- Hansı səhifələrin bunu tələb etdiyi inventarlaşdırılmalıdır.

### 3. AI ilə DB mutation edən admin route yüksək risklidir

**Problem**

- `src/app/api/visa/generate/route.ts` AI response əsasında yeni `countries`, `visa_info`, `visa_documents` yazır.
- JSON shape yoxlanır, amma business correctness zəmanəti zəifdir.

**Niyə riskdir**

- AI “formally valid, factually wrong” cavab verə bilər.
- Rəsmi link, viza qaydası, sənəd kateqoriyası kimi sahələr səhv olarsa məhsul etibarı zədələnər.

**Nəticəsi nədir**

- TravelAZ yanlış hüquqi/travel məlumatı yayıb trust itirə bilər.
- Sonradan cleanup və data correction xərci artır.

**Nə etmək lazımdır**

- Bu route “seed directly to production data” yox, “draft/staging review” modelinə keçirilməlidir.
- Admin təsdiqi olmadan canonical visa data publish edilməməlidir.
- Official URL və visa facts ayrıca verification mərhələsinə bağlanmalıdır.

## High

### 4. Public create axınlarında qoruma səviyyəsi qeyri-bərabərdir

**Problem**

- `blogs` route nisbətən daha sərt validasiya edir və `draft` yaradır.
- `comments`, `companions`, `companies`, `tours` route-larında bu sərtlik bərabər deyil.
- Bəzi endpoint-lərdə rate-limit var, bəzilərində yoxdur.

**Niyə riskdir**

- Abuse həmişə ən zəif route-dan gəlir.
- Müxtəlif route-larda müxtəlif təhlükəsizlik səviyyəsi sistemi bütöv deyil, fraqmentli göstərir.

**Nəticəsi nədir**

- Spam, data quality düşməsi, moderation yükü və support xərci artır.

**Nə etmək lazımdır**

- Public POST/PATCH/DELETE route-lar üçün vahid checklist olmalıdır:
  - auth
  - input allowlist
  - length limit
  - enum validation
  - rate-limit
  - generic error response

### 5. `comments` route hələ geniş select və qarışıq response pattern istifadə edir

**Problem**

- `src/app/api/comments/route.ts` POST sonrası `.select()` ilə bütün default response-u geri qaytarır.
- Bu, layihənin öz “select('*') və geniş select etmə” prinsipinə zidd istiqamətdir.

**Niyə riskdir**

- Lazımsız sahələr response-a düşə bilər.
- Data contract stabil olmur.

**Nəticəsi nədir**

- Frontend coupling artır, backend sonradan rahat refactor edilmir.

**Nə etmək lazımdır**

- Comments üçün explicit select shape verilməlidir.
- Bütün route-lar minimal response principle ilə standardlaşdırılmalıdır.

### 6. Chat client-də raw error message-lər birbaşa UI state-ə ötürülür

**Problem**

- `src/hooks/useChat.ts` müxtəlif əməliyyatlarda `error.message` birbaşa `setError` ilə istifadə edir.

**Niyə riskdir**

- Supabase error-ları bəzən daxili texniki detalları üzə çıxara bilər.
- Məhsul dili və təhlükəsizlik tonu pozulur.

**Nəticəsi nədir**

- User-facing error UX zəifləyir.
- Daxili struktur barədə artıq siqnal verilə bilər.

**Nə etmək lazımdır**

- Client-side generic error mapping əlavə olunmalıdır.
- Raw error yalnız server log və ya debug mode üçün saxlanmalıdır.

### 7. Review/moderation səthi var, amma review sistemi hələ məhsulu daşıyan trust qatına çevrilməyib

**Problem**

- `place_reviews` moderation route-u var, amma roadmap qeydlərinə görə review sayı hələ çox zəifdir.
- Place detail səhifəsi review UX-i daşıyır, amma community proof yetərli deyil.

**Niyə riskdir**

- Travel məhsulunda trust əsas valyutadır.
- İstifadəçi review görmürsə, platforma “catalog only” hissi verir.

**Nəticəsi nədir**

- Conversion, retention və fərqlənmə zəifləyir.

**Nə etmək lazımdır**

- Review activation ayrıca məhsul prioritetinə çevrilməlidir.
- Empty state, CTA, first-review reward və moderation turnaround daha güclü edilməlidir.

## Medium

### 8. Frontend məhsul hissi güclüdür, amma completeness fərqi hiss olunur

**Problem**

- Ana səhifə vizual olaraq güclüdür, amma bəzi modullar fallback və curated data qarışığı ilə işləyir.
- Place, city, country və tour səthləri arasında “hamısı eyni dərəcədə hazırdır” hissi yoxdur.

**Niyə riskdir**

- İstifadəçi bir güclü səhifədən zəif səhifəyə keçəndə platforma bütövlüyü pozulur.

**Nəticəsi nədir**

- İlk təəssürat güclü olsa da, dərinlikdə etibar azalır.

**Nə etmək lazımdır**

- “Surface parity” prioriteti qoyulmalıdır.
- Ən çox trafik alan səhifələrdə completeness score izlənməlidir.

### 9. Product journey-lər tam bağlanmayıb

**Problem**

- Flights, hotels, visa, companions, tours, blog, places var; amma bunların hamısı bir-birini conversion baxımından sistemli şəkildə qidalandırmır.

**Niyə riskdir**

- Feature çoxluğu məhsul dəyəri deyil.
- Əlaqəsiz feature-lar istifadəçini yönləndirmir.

**Nəticəsi nədir**

- User “nə etməliyəm?” sualında qalır.

**Nə etmək lazımdır**

- Destination journey xəritəsi qurulmalıdır:
  - kəşf et
  - viza yoxla
  - plan qur
  - hotel/flight bax
  - places saxla
  - yoldaş tap

### 10. Ops observability görünmür

**Problem**

- Repo-da structured observability, audit dashboards, alerting və request tracing görünmür.

**Niyə riskdir**

- Problemlər istifadəçi şikayəti gələndən sonra görünür.
- AI, external API və Supabase əsaslı sistemdə bu gecikmə bahalıdır.

**Nəticəsi nədir**

- Debug vaxtı uzanır.
- Production incidents daha gec həll olunur.

**Nə etmək lazımdır**

- Error tracking, endpoint latency, rate-limit deny, external API failure və image enrichment success/fail metrikləri əlavə olunmalıdır.

## Low

### 11. Məhsul dili və locale polish bərabər deyil

**Problem**

- Repo daxilində bəzi text-lərdə encoding izləri və qarışıq locale keyfiyyəti hiss olunur.
- Bəzi user-facing cavablar az/en/ru arasında stil baxımından bərabər deyil.

**Niyə riskdir**

- Çoxdilli məhsulda dil keyfiyyəti birbaşa brend keyfiyyəti kimi görünür.

**Nəticəsi nədir**

- Lokal istifadəçi üçün etibar, xarici istifadəçi üçün peşəkarlıq hissi azalır.

**Nə etmək lazımdır**

- i18n copy audit ayrıca sprint kimi aparılmalıdır.
- Error message, empty state və CTA dilləri də standardlaşdırılmalıdır.

### 12. Home page güclüdür, amma trust proof daha sistemli təqdim olunmur

**Problem**

- Hero və destinations blokları güclüdür, amma real review density, curated authority və why-choose-us proof daha sərt görünmür.

**Niyə riskdir**

- Travel platformalarda gözəl UI təkbaşına kifayət etmir; trust siqnalları lazımdır.

**Nəticəsi nədir**

- Yeni istifadəçi “gözəl dizayn” görür, amma “niyə bu platformaya etibar etməliyəm?” cavabı zəif qalır.

**Nə etmək lazımdır**

- Ana səhifədə real counts, verified sources, moderation promise və community proof elementləri gücləndirilməlidir.

## Rol Baxışları

### Senior Frontend Baxışı

Ən yaxşı tərəf: ana səhifə artıq generik deyil, vizual niyyəti var. Ən zəif tərəf: bu keyfiyyət bütün məhsul səthlərinə eyni dərəcədə yayılmayıb. Frontend problemi “pis görünür” deyil; problem “bəzən premium, bəzən yarımçıq görünür” hissidir.

Əsas frontend problemləri:

- trust və social proof qatının vizual prioriteti zəifdir
- loading/error/empty states məhsul şəxsiyyətini tam daşımır
- review və place detail səthləri daha çox istifadəçi davranışını cəlb etməlidir
- fallback content hələ bəzən hiss olunur

### Senior Backend Baxışı

Backend-də yaxşı istiqamət var: explicit select, basic validation, auth checks, AI limits. Amma sistemin problemi consistency-dir. Bəzi route-lar sağlam pattern istifadə edir, digərləri isə hələ “yarı-sərt” vəziyyətdədir.

Əsas backend problemləri:

- route-lar arasında validation standardı tam eyni deyil
- response contract-lar bərabər deyil
- data mutation və moderation flow-ları bəzən çox birbaşa işləyir
- high-risk route-lar üçün ikinci mərhələ verification azdır

### Senior Fullstack Baxışı

TravelAZ-də feature breadth çox yaxşıdır. Amma breadth artıq depth tələb edir. Bu mərhələdə ən vacib məsələ yeni feature əlavə etmək yox, mövcud feature-ları bir conversion system kimi bağlamaqdır.

Əsas fullstack problemləri:

- feature-lar var, amma journey orchestration zəifdir
- data coverage və UI expectation bəzən uyğun deyil
- platforma review/community ilə özünü müdafiə edəcək səviyyəyə çatmayıb

### Senior DevOps Baxışı

Layihə production-a yaxın davranır, amma production discipline tam yekunlaşmayıb. Ən əsas boşluq “deployment var” ilə “idarə olunan production sistemi var” arasındakı fərqdir.

Əsas devops problemləri:

- CSP və hardening hələ yumşaqdır
- observability planı görünmür
- cache/revalidate strategiyası daha sistemli optimizasiya tələb edir
- external dependency failure-ları üçün operational dashboards görünmür

### Senior Hacker / Security Baxışı

Ən ciddi siqnal tam klassikdir: authorization source consistency yoxdur və CSP yumşaqdır. Bu iki problem təkbaşına sistemin “security maturity” səviyyəsini aşağı salır.

Əsas security problemləri:

- admin role source inconsistency
- CSP `unsafe-*` istifadəsi
- bəzi user-generated axınlarda non-uniform müdafiə
- raw error handling və client error mapping bərabər deyil

## Yekun

TravelAZ-in problemi “pis məhsul” olması deyil. Əksinə, çox potensiallı və artıq real istifadəyə yaxın bir platformadır. Amma bu mərhələdə əsas yanlışlıq budur: məhsul genişlənib, lakin təhlükəsizlik, trust və consistency eyni sürətlə bərkidilməyib.

Yəni əsas sual “sayta daha nə əlavə edək?” deyil. Əsas sual budur:

“Bu qədər feature-i olan məhsulu necə etibarlı, yekcins və monetizasiya oluna bilən platformaya çevirək?”

Hazırkı prioritet buna cavab verməlidir.
