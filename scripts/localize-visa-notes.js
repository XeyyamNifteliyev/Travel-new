const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const APPLY = process.argv.includes('--apply');

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

const NOTE_TRANSLATIONS = {
  albania: {
    az: 'Hər 180 günlük dövr ərzində 90 günədək qalmaq olar. Albaniya qanunvericiliyinə görə ölkəyə gəldikdən sonra 24 saat ərzində yerli polis orqanında qeydiyyat tələb oluna bilər.',
    ru: 'Можно находиться до 90 дней в течение любого 180-дневного периода. По законодательству Албании после прибытия может потребоваться регистрация в местной полиции в течение 24 часов.',
  },
  andorra: {
    az: 'Andorraya ayrıca viza tələbi olmasa da, ölkəyə çatmaq üçün keçilən Fransa və ya İspaniyanın müvafiq giriş qaydaları tətbiq olunur.',
    ru: 'Хотя у Андорры нет отдельного визового требования, применяются правила Франции или Испании, через которые необходимо следовать для въезда в Андорру.',
  },
  australia: {
    az: 'Online Visitor e600 vizasına internet üzərindən müraciət etmək mümkündür.',
    ru: 'Можно подать онлайн-заявку на визу Online Visitor e600.',
  },
  benin: {
    az: 'Beynəlxalq peyvənd sertifikatı tələb oluna bilər.',
    ru: 'Может потребоваться международный сертификат вакцинации.',
  },
  dubai: {
    az: 'Hər 180 günlük dövr ərzində 90 günədək qalmaq olar.',
    ru: 'Можно находиться до 90 дней в течение любого 180-дневного периода.',
  },
  'bosnia-and-herzegovina': {
    az: 'Hər 180 günlük dövr ərzində 90 günədək qalmaq olar. Bosniya və Herseqovina qanunvericiliyinə görə ölkəyə gəldikdən sonra 24 saat ərzində yerli polis orqanında qeydiyyat tələb oluna bilər.',
    ru: 'Можно находиться до 90 дней в течение любого 180-дневного периода. По законодательству Боснии и Герцеговины после прибытия может потребоваться регистрация в местной полиции в течение 24 часов.',
  },
  china: {
    az: 'Azərbaycan vətəndaşları hər səfərdə 30 günədək, 180 günlük dövrdə isə ümumilikdə 90 günədək vizasız səfər edə bilər. Bu güzəşt Honq Konq və Makao üçün tətbiq olunmur.',
    ru: 'Граждане Азербайджана могут путешествовать без визы до 30 дней за поездку и до 90 дней в течение 180-дневного периода. Это послабление не распространяется на Гонконг и Макао.',
  },
  ethiopia: {
    az: 'E-viza sahibləri ölkəyə Addis Ababa Bole Beynəlxalq Hava Limanı vasitəsilə daxil olmalıdır.',
    ru: 'Владельцы электронной визы должны въезжать через международный аэропорт Аддис-Абеба Боле.',
  },
  'equatorial-guinea': {
    az: 'Ziyarətçilər “Tourist - Own Itinerary” kateqoriyası üzrə online viza müraciəti edə bilərlər.',
    ru: 'Посетители могут подать онлайн-заявку на визу в категории “Tourist - Own Itinerary”.',
  },
  algeria: {
    az: 'Cənubi Əlcəzair şəhərlərinə turist kimi səfər edən və boarding authorization sənədi olan sərnişinlər maksimum 30 günlük gəlişdə viza ala bilərlər. Qayıdış və ya davam bileti, həmçinin hotel rezervasiya təsdiqi tələb olunur.',
    ru: 'Пассажиры с разрешением на посадку, путешествующие как туристы в города юга Алжира, могут получить визу по прибытии максимум на 30 дней. Требуются обратный/дальнейший билет и подтверждение бронирования отеля.',
  },
  philippines: {
    az: 'BƏƏ rezidentləri rəsmi Filippin eVisa saytı üzərindən e-vizaya müraciət edə bilərlər. Müraciət zamanı etibarlı Əmirlik rezident vizası təqdim edilməlidir.',
    ru: 'Резиденты ОАЭ могут оформить eVisa через официальный сайт электронной визы Филиппин. При подаче необходимо предъявить действующую резидентскую визу ОАЭ.',
  },
  georgia: {
    az: 'Abxaziya və ya Cənubi Osetiyadan giriş etmiş şəxslərin Gürcüstana buraxılmaması mümkündür.',
    ru: 'Лицам, въезжавшим через Абхазию или Южную Осетию, может быть отказано во въезде в Грузию.',
  },
  india: {
    az: 'E-viza sahibləri 32 müəyyən edilmiş hava limanı və ya 5 dəniz limanı vasitəsilə daxil olmalıdır. Hindistan e-Tourist vizası bir təqvim ilində yalnız iki dəfə alına bilər. Pakistan mənşəli və ya Pakistan pasportu olan şəxslər e-viza üçün uyğun sayılmır.',
    ru: 'Владельцы электронной визы должны въезжать через 32 определенных аэропорта или 5 морских портов. Индийскую e-Tourist визу можно получить только два раза в календарный год. Лица пакистанского происхождения или с паспортом Пакистана не имеют права на eVisa.',
  },
  kenya: {
    az: 'Müraciət səfərdən 90 gün əvvələdək verilə bilər və ən azı 3 gün əvvəl təqdim olunmalıdır. eTA rüsumu 32.50 ABŞ dollarıdır. Hotel rezervasiyası və bəzi hallarda sarı qızdırma peyvənd sertifikatı tələb oluna bilər.',
    ru: 'Заявку можно подать не ранее чем за 90 дней до поездки и минимум за 3 дня. Сбор eTA составляет 32,50 USD. Может потребоваться бронь отеля и, в отдельных случаях, сертификат вакцинации от желтой лихорадки.',
  },
  colombia: {
    az: 'Qalma müddəti 1 illik dövr ərzində 180 günədək uzadıla bilər.',
    ru: 'Срок пребывания может быть продлен до 180 дней в течение одного года.',
  },
  'c-te-d-ivoire': {
    az: 'E-viza sahibləri ölkəyə Port Bouet Hava Limanı vasitəsilə daxil olmalıdır.',
    ru: 'Владельцы электронной визы должны прибывать через аэропорт Port Bouet.',
  },
  cuba: {
    az: 'Qalma müddəti əlavə rüsumla 90 günədək uzadıla bilər.',
    ru: 'Срок пребывания может быть продлен до 90 дней за дополнительную плату.',
  },
  laos: {
    az: 'Bəzi sərhəd keçidləri yalnız adi viza sahibləri üçün açıqdır. E-viza Luang Prabang, Pakse və Vientiane beynəlxalq hava limanlarında, müəyyən Thai-Lao Friendship Bridge keçidlərində və Vientiane dəmir yolu məntəqəsində istifadə oluna bilər.',
    ru: 'Некоторые пограничные пункты открыты только для владельцев обычной визы. E-визу можно использовать в международных аэропортах Луангпхабанг, Паксе и Вьентьян, на отдельных мостах Thai-Lao Friendship Bridge и на железнодорожном пункте Вьентьяна.',
  },
  lebanon: {
    az: 'Gəlişdə verilən viza 1 ay müddətinədir və əlavə 2 ay uzadıla bilər. İsrail vizası və ya möhürü olmayan, telefon nömrəsi, Livanda ünvan və geri/davam bileti olan şəxslərə Beyrut hava limanında və digər giriş məntəqələrində pulsuz verilə bilər.',
    ru: 'Виза по прибытии выдается на 1 месяц и может быть продлена еще на 2 месяца. Может быть выдана бесплатно в аэропорту Бейрута или другом пункте въезда при отсутствии израильской визы/штампа, наличии телефона, адреса в Ливане и обратного/дальнейшего билета.',
  },
  mauritania: {
    az: 'Nouakchott-Oumtounsy Beynəlxalq Hava Limanında mümkündür.',
    ru: 'Доступно в международном аэропорту Nouakchott-Oumtounsy.',
  },
  morocco: {
    az: '28 avqust 2024 tarixindən etibarən hər 180 günlük dövr ərzində 90 günədək qalmaq olar.',
    ru: 'С 28 августа 2024 года можно находиться до 90 дней в течение любого 180-дневного периода.',
  },
  egypt: {
    az: 'Şarm əl-Şeyx, Saint Catherine və ya Taba hava limanlarına gələn və Sinay kurortlarında qalan turistlər 14 günədək vizadan azad ola bilərlər.',
    ru: 'Туристы, прибывающие в аэропорты Шарм-эль-Шейха, Saint Catherine или Табы и остающиеся на курортах Синая, могут быть освобождены от визы до 14 дней.',
  },
  moldova: {
    az: 'Hər 180 günlük dövr ərzində 90 günədək qalmaq olar.',
    ru: 'Можно находиться до 90 дней в течение любого 180-дневного периода.',
  },
  montenegro: {
    az: 'Monteneqro qanunvericiliyinə görə ölkəyə gəldikdən sonra 24 saat ərzində yerli polis orqanında qeydiyyat tələb oluna bilər.',
    ru: 'По законодательству Черногории после прибытия может потребоваться регистрация в местной полиции в течение 24 часов.',
  },
  oman: {
    az: 'ABŞ, Kanada, Avstraliya, Böyük Britaniya, Şengen ölkələri və ya Yaponiya üçün etibarlı giriş vizası olan şəxslər, eləcə də bəzi Körfəz Əməkdaşlıq Şurası rezidentləri 14 günədək vizasız daxil ola bilərlər.',
    ru: 'Лица с действующей въездной визой США, Канады, Австралии, Великобритании, стран Шенгена или Японии, а также некоторые резиденты стран ССАГПЗ могут въезжать без визы до 14 дней.',
  },
  gabon: {
    az: 'E-viza sahibləri ölkəyə Libreville Beynəlxalq Hava Limanı vasitəsilə daxil olmalıdır.',
    ru: 'Владельцы электронной визы должны прибывать через международный аэропорт Либревиля.',
  },
  grenada: {
    az: 'Pre-clearance məktubu olan şəxslər vizanı gəlişdə ala bilərlər.',
    ru: 'Владельцы письма pre-clearance могут получить визу по прибытии.',
  },
  russia: {
    az: 'Bir təqvim ili ərzində 90 günədək qalmaq olar. Rusiya qanunvericiliyinə görə yaşayış yerində 7 iş günü ərzində qeydiyyat tələb oluna bilər. Pasportla birlikdə miqrasiya kartı təqdim edilməlidir.',
    ru: 'Можно находиться до 90 дней в течение календарного года. По законодательству России может потребоваться регистрация по месту пребывания в течение 7 рабочих дней. Вместе с паспортом необходимо предъявить миграционную карту.',
  },
  serbia: {
    az: 'Hər 180 günlük dövr ərzində 90 günədək qalmaq olar. Serbiya qanunvericiliyinə görə ölkəyə gəldikdən sonra 24 saat ərzində yerli polis orqanında qeydiyyat tələb oluna bilər.',
    ru: 'Можно находиться до 90 дней в течение любого 180-дневного периода. По законодательству Сербии после прибытия может потребоваться регистрация в местной полиции в течение 24 часов.',
  },
  seychelles: {
    az: 'Müraciət səfərdən 30 gün əvvələdək verilə bilər. Hər ziyarətçi üçün qalacağı yerin rezervasiya təsdiqi yüklənməlidir. Sarı qızdırma riski olan ölkələrdən gələnlərdən peyvənd sertifikatı tələb oluna bilər. Rüsum kartla ödənilir və icazə yalnız bir səfər üçün keçərlidir.',
    ru: 'Заявку можно подать за 30 дней до поездки. Для каждого посетителя нужно загрузить подтверждение бронирования места проживания. При прибытии из стран риска желтой лихорадки может потребоваться сертификат вакцинации. Сбор оплачивается картой, разрешение действует только на одну поездку.',
  },
  somalia: {
    az: 'Bosaso, Galcaio və Mogadishu hava limanlarında mümkündür.',
    ru: 'Доступно в аэропортах Босасо, Галкайо и Могадишо.',
  },
  'sri-lanka': {
    az: 'Standart ziyarətçi vizası 6 aylıq dövr ərzində 60 gün qalmağa imkan verir. Standart ziyarətçi vizası üçün rüsum SAARC ölkələri üçün 35 ABŞ dolları, digər ölkələr üçün 75 ABŞ dollarıdır; e-viza xidmət rüsumu əlavə oluna bilər. Tranzit zamanı qısa müddətli istisnalar mümkündür.',
    ru: 'Стандартная гостевая виза позволяет находиться 60 дней в течение любого 6-месячного периода. Сбор: 35 USD для стран SAARC и 75 USD для остальных; может добавляться сервисный сбор eVisa. Для транзита возможны краткосрочные исключения.',
  },
  sudan: {
    az: 'Online əldə edilə bilər. Səfər zamanı çap edilmiş viza icazəsi təqdim olunmalıdır.',
    ru: 'Можно оформить онлайн. Во время поездки необходимо предъявить распечатанное визовое разрешение.',
  },
  suriname: {
    az: 'Gəlişdən əvvəl 50 ABŞ dolları və ya 50 avro giriş rüsumu online ödənilməlidir. Çoxgirişli e-viza da mövcuddur.',
    ru: 'До прибытия необходимо оплатить онлайн въездной сбор 50 USD или 50 EUR. Также доступна многократная eVisa.',
  },
  thailand: {
    az: 'Hava yolu ilə gəlmədikdə ildə maksimum 2 səfər mümkündür.',
    ru: 'Если въезд осуществляется не воздушным транспортом, допускается максимум 2 посещения в год.',
  },
  tunisia: {
    az: 'Turizm agentliyi tərəfindən təşkil edilən turist qrupları üçün viza tələb olunmur.',
    ru: 'Для туристических групп, организованных туристическим агентством, виза не требуется.',
  },
  turkey: {
    az: 'Şəxsiyyət vəsiqəsi ilə giriş mümkündür.',
    ru: 'Въезд возможен по удостоверению личности.',
  },
  ukraine: {
    az: 'Hər 180 günlük dövr ərzində 90 günədək qalmaq olar.',
    ru: 'Можно находиться до 90 дней в течение любого 180-дневного периода.',
  },
  venezuela: {
    az: 'Turist və biznes səfərləri üçün elektron viza sistemi tətbiq edilib.',
    ru: 'Для туристических и деловых поездок введена электронная визовая система.',
  },
  vietnam: {
    az: 'E-viza 90 gün müddətinə etibarlıdır və çoxgirişlidir.',
    ru: 'Электронная виза действительна 90 дней и позволяет многократный въезд.',
  },
  'new-zealand': {
    az: 'Azərbaycanda verilmiş keçmiş SSRİ simvollu diplomatik və xidməti pasportlar qəbul edilmir və onlara viza vurulmur. Avstraliya daimi rezident vizası və ya Resident Return Visa sahiblərinə, tələblərə uyğun olduqda və səfərdən əvvəl Electronic Travel Authority aldıqda, gəlişdə Yeni Zelandiya rezident vizası verilə bilər.',
    ru: 'Дипломатические и служебные паспорта с символикой бывшего СССР, выданные в Азербайджане, не принимаются, и визы в них не вклеиваются. Владельцам австралийской Permanent Resident Visa или Resident Return Visa при выполнении требований и получении Electronic Travel Authority до выезда может быть выдана резидентская виза Новой Зеландии по прибытии.',
  },
};

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL və SUPABASE_SERVICE_ROLE_KEY lazımdır.');
  process.exit(1);
}

async function main() {
  const supabase = createClient(supabaseUrl, serviceKey);
  const { data, error } = await supabase
    .from('visa_info')
    .select('id, notes_az, notes_en, notes_ru, countries!inner(slug, name_az)')
    .order('countries(name_az)');

  if (error) throw error;

  let changed = 0;
  let skipped = 0;

  for (const row of data || []) {
    const slug = row.countries.slug;
    const translation = NOTE_TRANSLATIONS[slug];
    if (!translation) {
      skipped += 1;
      continue;
    }

    const updates = {
      notes_az: translation.az,
      notes_ru: translation.ru,
      notes_en: row.notes_en || row.notes_az || '',
    };

    if (APPLY) {
      const { error: updateError } = await supabase
        .from('visa_info')
        .update(updates)
        .eq('id', row.id);
      if (updateError) throw updateError;
    }

    changed += 1;
    console.log(`${APPLY ? 'updated' : 'dry-run'} ${slug}: ${row.countries.name_az}`);
  }

  console.log(JSON.stringify({ apply: APPLY, changed, skipped }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
