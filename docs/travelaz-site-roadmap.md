# TravelAZ Prioritet Roadmap

Bu sənəd TravelAZ üçün yaxın 12 həftəlik prioritet inkişaf istiqamətlərini göstərir. Məqsəd ideya toplamaq deyil; real istifadəçi dəyəri yaradan, məhsul riskini azaldan və gələcək monetizasiya üçün zəmin quran işləri sıralamaqdır.

## Prinsip

Növbəti mərhələdə əsas fokus yeni feature bolluğu olmamalıdır. Fokus bunlar olmalıdır:

- təhlükəsizlik
- trust
- məhsul completeness
- conversion journey
- monetization hazırlığı

## 0-2 Həftə: Təhlükəsizlik və Trust Fix-ləri

### 1. Vahid authorization modeli

**Məqsəd**

Admin və privileged flow-larda bir source of truth yaratmaq.

**İstifadəçiyə dəyər**

Admin funksiyalar daha stabil və təhlükəsiz işləyəcək. İcazə davranışı predict edilən olacaq.

**Texniki iş**

- `middleware` və admin-only API-lər üçün ortaq role helper yaratmaq
- `app_metadata.role` və `profiles.role` arasında bir model seçmək
- bütün admin route-ları həmin helper-ə keçirmək

**Uğur meyarı**

- bütün admin route-lar eyni authorization modelindən istifadə edir
- test zamanı “panelə girir, API-dən düşür” tipli uyğunsuzluq qalmır

### 2. CSP və production hardening sprint-i

**Məqsəd**

Browser-level müdafiəni sərtləşdirmək.

**İstifadəçiyə dəyər**

Platforma daha etibarlı olur, gələcək XSS risklərinin təsiri azalır.

**Texniki iş**

- `unsafe-inline` və `unsafe-eval` istifadəsini audit etmək
- mümkün olan yerlərdə nonce/hash modelinə keçmək
- `production-hardening.md` içində qeyd olunan açıq maddələri bağlamaq

**Uğur meyarı**

- CSP policy daha sərt olur
- high-risk security açıq maddələri ayrıca checklist ilə bağlanır

### 3. Public API protection standardization

**Məqsəd**

Bütün public create/update route-ları eyni səviyyədə qorumaq.

**İstifadəçiyə dəyər**

Spam, abuse və keyfiyyətsiz content azalır. Məhsul daha peşəkar görünür.

**Texniki iş**

- comments, companions, companies, tours və oxşar route-lar üçün vahid validation checklist
- rate-limit coverage genişləndirmək
- generic error response standartını tətbiq etmək
- geniş `.select()` və qeyri-minimal response-ları bağlamaq

**Uğur meyarı**

- bütün public mutation route-larında auth, validation və rate-limit pattern-i bərabər olur
- raw backend error-ların clientə düşməsi aradan qalxır

### 4. AI-generated canonical data üçün review gate

**Məqsəd**

AI ilə yaradılan visa və digər yüksək riskli datanı birbaşa production truth etməmək.

**İstifadəçiyə dəyər**

Səhv məlumat riski azalır, xüsusən visa kimi həssas mövzuda etibar artır.

**Texniki iş**

- AI generate route-lar üçün draft/staging axını
- official link verification addımı
- admin review olmadan canonical publish-i bloklamaq

**Uğur meyarı**

- AI-generated data birbaşa live canonical data olmur
- verification mərhələsi olmadan publish mümkün deyil

## 2-6 Həftə: Product Completeness və Review Activation

### 5. Review sistemini canlandırmaq

**Məqsəd**

TravelAZ-i sadəcə məlumat saytı yox, etibarlı travel platformaya çevirmək.

**İstifadəçiyə dəyər**

İstifadəçi real insan təcrübəsi görür və qərar verməsi asanlaşır.

**Texniki iş**

- place detail-də review CTA-ları gücləndirmək
- first review yazan user üçün daha yaxşı empty state və incentive flow
- moderation turnaround və admin panel visibility yaxşılaşdırmaq
- review helpful, verified, recent kimi trust siqnalları əlavə etmək

**Uğur meyarı**

- ilk aktiv review bazası yaranır
- featured places üçün review density artmağa başlayır

### 6. Place/City/Country surface parity

**Məqsəd**

Ən çox görünən travel surface-lərin eyni keyfiyyət səviyyəsinə çatması.

**İstifadəçiyə dəyər**

İstifadəçi sayt daxilində “bəzən hazır, bəzən yarımçıq” hissini yaşamır.

**Texniki iş**

- city, place və country səhifələrində trust, metadata və CTA qatını standartlaşdırmaq
- şəkilsiz və zəif kartları minimuma endirmək
- top traffic destinations üçün curated completeness checklist tətbiq etmək

**Uğur meyarı**

- top destinations üçün səhifə keyfiyyəti daha bərabər olur
- fallback hissi azalmağa başlayır

### 7. Destination journey birləşdirilməsi

**Məqsəd**

Feature-ları vahid səyahət qərar axınına çevirmək.

**İstifadəçiyə dəyər**

İstifadəçi bir səhifədən o birinə səbəbsiz keçmir; məhsul onu yönləndirir.

**Texniki iş**

- countries -> visa -> planner -> flights/hotels -> places -> companions axınını bağlamaq
- cross-linking və contextual CTA-ları sistemli etmək
- itinerary intent-ə uyğun daxili keçidlər əlavə etmək

**Uğur meyarı**

- istifadəçi sessiyalarında multi-page journey dərinliyi artır
- əsas səhifələr arası keçidlər daha məqsədli olur

### 8. Booking-prep mərhələsi

**Məqsəd**

Tam payment gəlməzdən əvvəl booking intent üçün texniki baza hazırlamaq.

**İstifadəçiyə dəyər**

Platforma “sadəcə baxmaq” yox, “əməliyyata keçmək” istiqamətində inkişaf edir.

**Texniki iş**

- tour inquiry / booking intent modeli
- provider handoff və confirmation UX eskizi
- cancellation/refund content skeleton-u

**Uğur meyarı**

- booking flow üçün domain modeli və UX skeleton hazır olur
- sonrakı payment mərhələsi daha risksiz başlayır

## 6-12 Həftə: Monetization, Community və Advanced SEO

### 9. Tour companies və tours üçün monetization layer

**Məqsəd**

TravelAZ-in ilk real gəlir kanallarından birini hazırlamaq.

**İstifadəçiyə dəyər**

İstifadəçi daha keyfiyyətli verified təkliflər görür, şirkətlər isə platformada dəyər tapır.

**Texniki iş**

- company verification badge və trust layer
- premium placement modeli
- plan limits və conversion copy polish

**Uğur meyarı**

- companies üçün pullu və ya yarı-pullu dəyər təklifi formalaşır
- B2B onboarding axını daha ciddi görünür

### 10. Community loop-un gücləndirilməsi

**Məqsəd**

Companions, comments və reviews səthlərini ayrıq feature yox, community loop-a çevirmək.

**İstifadəçiyə dəyər**

Platforma “living product” kimi hiss olunur.

**Texniki iş**

- companions və reviews arasında trust siqnalları
- istifadəçi profil credibility elementləri
- təhlükəsiz interaction qaydaları və moderation visibility

**Uğur meyarı**

- community interaction artmağa başlayır
- user-generated content keyfiyyəti yüksəlir

### 11. Advanced SEO və content engine

**Məqsəd**

Open data + curated content + community layer ilə davamlı orqanik trafik yaratmaq.

**İstifadəçiyə dəyər**

İstifadəçi daha zəngin, real və faydalı destination content tapır.

**Texniki iş**

- high-intent landing page klasterləri
- destination + visa + seasonal guide content map
- structured data coverage genişləndirilməsi
- internal linking və topical authority planı

**Uğur meyarı**

- orqanik giriş üçün daha çox SEO target səhifə yaranır
- content sadəcə doldurma yox, axtarış niyyətinə uyğun olur

### 12. Observability və ops maturity

**Məqsəd**

Məhsulu reaktiv deyil, idarə olunan şəkildə işlətmək.

**İstifadəçiyə dəyər**

Xətalar daha tez aşkarlanır və platforma daha stabil olur.

**Texniki iş**

- error tracking
- endpoint latency dashboards
- AI failure və rate-limit deny metrics
- image/content enrichment success-failure hesabatları

**Uğur meyarı**

- əsas incident-lər monitorinqsiz qalmır
- debug və response vaxtı azalır

## İkinci Sıra, Amma Vacib İşlər

Bu işlər əsas roadmap bitmədən tam fokus olmamalıdır, amma backlog-da görünməlidir:

- restaurant/kafe coverage genişlənməsi
- visa official link coverage tamamlanması
- country highlights 30+ coverage
- blog/news content governance və editorial workflow dərinləşməsi
- visual QA və Core Web Vitals polish

## Nələri İndi Etməmək Daha Düzgündür

- yeni böyük feature xətti açmaq
- payment sisteminə tələsmək
- AI ilə daha çox canonical məlumatı tam avtomatik yazdırmaq
- trust layer zəif ikən ağır marketing spend etmək

## Yekun Prioritet

TravelAZ üçün növbəti düzgün mərhələ belə görünür:

1. əvvəl sistemi təhlükəsiz və yekcins et
2. sonra trust və review qatını canlı et
3. sonra user journey-ni bağla
4. sonra monetization və SEO scale et

Bu ardıcıllıq qorunsa, platforma həm texniki, həm məhsul, həm də biznes baxımından daha sağlam böyüyəcək.
