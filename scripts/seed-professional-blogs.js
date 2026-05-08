const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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

function parseArgs() {
  return {
    apply: process.argv.includes('--apply'),
  };
}

const BLOGS = [
  {
    title: 'Bakıdan ilk Avropa səfəri: büdcə, viza və marşrut planı',
    cover_image: 'https://images.pexels.com/photos/586687/pexels-photo-586687.jpeg?auto=compress&cs=tinysrgb&w=1400',
    tags: ['Avropa', 'Büdcə', 'Viza'],
    views: 248,
    likes: 34,
    content: `
      <p>İlk Avropa səfərində ən böyük fərq düzgün ardıcıllıqdır: əvvəl viza ehtimalını yoxlamaq, sonra uçuş tarixlərini müqayisə etmək, daha sonra otel və şəhərdaxili nəqliyyatı planlamaq lazımdır.</p>
      <h2>Başlamaq üçün ən rahat istiqamətlər</h2>
      <p>Bakıdan Avropaya ilk səfər üçün Praqa, Budapeşt, Roma, Vyana və İstanbul üzərindən bağlantılı marşrutlar daha rahat seçim ola bilər. Bu şəhərlərdə həm klassik görməli yerlər çoxdur, həm də 3-5 günlük qısa səyahət planı qurmaq asandır.</p>
      <h2>Büdcəni necə bölmək olar?</h2>
      <p>Ümumi büdcəni üç hissəyə ayır: uçuş və otel, gündəlik xərclər, ehtiyat fond. Restoran, muzey biletləri və şəhərdaxili nəqliyyat üçün ayrıca limit yazmaq səfər zamanı qərarları xeyli yüngülləşdirir.</p>
      <h2>TravelAZ ilə plan</h2>
      <p>Ölkə səhifələrində viza statusunu, şəhər səhifələrində görməli yerləri, AI planlaşdırıcıda isə gün-gün marşrut ideyasını yoxla. Beləliklə səyahət sadəcə ilham yox, icra edilə bilən plana çevrilir.</p>
    `,
  },
  {
    title: 'İstanbulda 3 gün: tarixi yarımada, Boğaz və yerli dadlar',
    cover_image: 'https://images.pexels.com/photos/1549326/pexels-photo-1549326.jpeg?auto=compress&cs=tinysrgb&w=1400',
    tags: ['İstanbul', 'Şəhər bələdçisi', 'Görməli yerlər'],
    views: 421,
    likes: 58,
    content: `
      <p>İstanbul qısa səfər üçün ən güclü istiqamətlərdən biridir: bir tərəfdə Aya Sofya, Sultanahmet və Topkapı, digər tərəfdə Qalata, Karaköy və Boğaz mənzərələri.</p>
      <h2>1-ci gün: klassik marşrut</h2>
      <p>Səfərə Sultanahmet meydanından başla. Aya Sofya, Sultanahmet məscidi, Yerebatan sarnıcı və Topkapı sarayı bir-birinə yaxın yerləşdiyi üçün ilk günü piyada planlamaq mümkündür.</p>
      <h2>2-ci gün: Qalata və Boğaz</h2>
      <p>Qalata qülləsi, Karaköy kafeləri və Boğaz gəzintisi şəhərin daha müasir ritmini göstərir. Axşam saatlarında sahil xətti və körpülər foto üçün ən yaxşı vaxtlardan biridir.</p>
      <h2>3-cü gün: bazarlar və dadlar</h2>
      <p>Qrand Bazar, Misir bazarı, lokal restoranlar və çay məkanları səfərə daha yerli hiss qatır. TravelAZ şəhər səhifəsində restoran və görməli yer kartlarını əvvəlcədən seçib marşrutu qısalda bilərsən.</p>
    `,
  },
  {
    title: 'Viza tələb edən ölkələrə səyahət: sənədləri səhvsiz hazırlamaq',
    cover_image: 'https://images.pexels.com/photos/7235894/pexels-photo-7235894.jpeg?auto=compress&cs=tinysrgb&w=1400',
    tags: ['Viza', 'Sənədlər', 'Planlama'],
    views: 312,
    likes: 41,
    content: `
      <p>Viza müraciətində ən çox problem sənəd siyahısının natamam olması, tarixlərin bir-birinə uyğun gəlməməsi və maliyyə sübutlarının zəif təqdim edilməsidir.</p>
      <h2>Əvvəl uyğunluğu yoxla</h2>
      <p>Ölkə seçməzdən əvvəl viza statusunu yoxla. Səfərin məqsədi, qalma müddəti və əvvəlki səyahət tarixçəsi sənəd paketinin formasına təsir edir.</p>
      <h2>Əsas sənədlər</h2>
      <p>Pasport, foto, bank çıxarışı, iş arayışı, otel rezervasiyası, uçuş bronu və səyahət sığortası çox vaxt əsas paketə daxildir. Amma hər ölkənin tələbi fərqli ola bilər.</p>
      <h2>Kiçik, amma vacib detal</h2>
      <p>Uçuş, otel və sığorta tarixləri eyni səyahət aralığını göstərməlidir. Uyğunsuz tarixlər müraciətin zəif görünməsinə səbəb olur.</p>
    `,
  },
  {
    title: 'Parisə ilk dəfə gedənlər üçün sakit və ağıllı marşrut',
    cover_image: 'https://images.pexels.com/photos/532826/pexels-photo-532826.jpeg?auto=compress&cs=tinysrgb&w=1400',
    tags: ['Paris', 'Fransa', 'Marşrut'],
    views: 286,
    likes: 37,
    content: `
      <p>Parisə ilk səfərdə hər şeyi bir gündə görməyə çalışmaq şəhərin zövqünü azaldır. Daha yaxşı yanaşma əsas simvolları seçmək və arada gəzinti üçün boş zaman saxlamaqdır.</p>
      <h2>Əsas dayanacaqlar</h2>
      <p>Eyfel qülləsi, Luvr, Notre-Dame ətrafı, Monmartr və Sena sahili ilk səfər üçün kifayət qədər güclü marşrut yaradır. Muzeylər üçün bileti əvvəlcədən almaq vaxt itkisini azaldır.</p>
      <h2>Harada qalmaq daha rahatdır?</h2>
      <p>Metroya yaxın qalmaq Parisdə böyük üstünlükdür. Mərkəzdən bir az kənarda, amma metro xəttinə yaxın otel seçmək büdcəni daha balanslı saxlayır.</p>
      <h2>TravelAZ tövsiyəsi</h2>
      <p>Şəhər səhifəsində görməli yerləri xəritə ilə aç, sonra AI planlaşdırıcıda günləri maraqlarına görə böl: muzey, foto nöqtələri, restoranlar və axşam gəzintisi.</p>
    `,
  },
  {
    title: 'Tək səyahət edənlər üçün təhlükəsiz və rahat planlama qaydaları',
    cover_image: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=1400',
    tags: ['Solo səyahət', 'Təhlükəsizlik', 'Praktik məsləhət'],
    views: 198,
    likes: 29,
    content: `
      <p>Tək səyahət azadlıq verir, amma planın daha səliqəli olmasını tələb edir. Əsas prinsip sadədir: harada qalacağını, necə hərəkət edəcəyini və fövqəladə halda kimlə əlaqə saxlayacağını əvvəlcədən bil.</p>
      <h2>Otel və rayon seçimi</h2>
      <p>Gec saatlarda qayıdış üçün nəqliyyata yaxın, yaxşı qiymətləndirilən rayonları seç. Çox ucuz, amma mərkəzdən və nəqliyyatdan uzaq yerlər bəzən real qənaət sayılmır.</p>
      <h2>Sənədlərin surəti</h2>
      <p>Pasport, viza, sığorta və rezervasiya sənədlərinin rəqəmsal surətini ayrıca saxla. Telefon itərsə belə email və cloud backup kömək edir.</p>
      <h2>Marşrutu paylaş</h2>
      <p>Gündəlik planı yaxın bir nəfərlə paylaşmaq sadə, amma faydalı təhlükəsizlik vərdişidir. TravelAZ planını link və ya qeyd formasında saxlamaq bu işi asanlaşdırır.</p>
    `,
  },
  {
    title: 'Restoran və kafeləri necə seçək: turist tələsindən lokal təcrübəyə',
    cover_image: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1400',
    tags: ['Restoranlar', 'Kafelər', 'Şəhər təcrübəsi'],
    views: 173,
    likes: 22,
    content: `
      <p>Səyahətdə yaxşı restoran seçimi şəhər təcrübəsinin yarısıdır. Sadəcə mərkəzdəki ən parlaq məkanı seçməkdənsə, lokasiya, menyu, iş saatı və real ziyarətçi rəylərinə birlikdə baxmaq daha doğru nəticə verir.</p>
      <h2>Lokasiya vacibdir</h2>
      <p>Görməli yerin düz yanında olan restoranlar rahatdır, amma hər zaman ən yaxşı qiymət-keyfiyyət balansını vermir. Bir neçə küçə kənara çıxmaq daha lokal seçimlər aça bilər.</p>
      <h2>Menyu və iş saatı</h2>
      <p>Əvvəlcədən menyuya, mətbəx tipinə və açılış saatına bax. Xüsusilə Avropa şəhərlərində bəzi restoranlar günorta ilə axşam arasında bağlı ola bilər.</p>
      <h2>TravelAZ food xəritəsi</h2>
      <p>Restoran və kafe kartlarında ünvan, xəritə, rəsmi sayt və icma rəyləri birlikdə böyüdükcə seçim etmək daha rahat olacaq. Məqsəd sadəcə siyahı yox, praktik qərar köməkçisi yaratmaqdır.</p>
    `,
  },
  {
    title: 'Tbilisi həftəsonu: köhnə şəhər, kükürd hamamları və dadlı marşrut',
    cover_image: 'https://images.pexels.com/photos/17593640/pexels-photo-17593640.jpeg?auto=compress&cs=tinysrgb&w=1400',
    tags: ['Tbilisi', 'Gürcüstan', 'Həftəsonu'],
    views: 216,
    likes: 31,
    content: `
      <p>Tbilisi Bakıdan qısa və rahat səfər üçün ən praktik istiqamətlərdən biridir. Köhnə şəhər, Narikala qalası, kükürd hamamları və lokal mətbəx 2-3 günlük plan üçün kifayət qədər dolğun təcrübə yaradır.</p>
      <h2>Marşrutu necə qurmaq olar?</h2>
      <p>İlk günü köhnə şəhər, Sülh körpüsü və Narikala ətrafına ayır. İkinci gün Rustaveli prospekti, muzeylər və Mtatsminda tərəfi daha rahat seçimdir.</p>
      <h2>Nə yeməli?</h2>
      <p>Xinkali, xaçapuri və gürcü şərabları səfərin əsas dad xəttidir. Restoran seçərkən mərkəzdən bir az kənardakı lokal məkanlara da baxmaq yaxşı nəticə verir.</p>
    `,
  },
  {
    title: 'Dubai səfəri: şəhər, səhra və büdcəni balanslamaq',
    cover_image: 'https://images.pexels.com/photos/3787839/pexels-photo-3787839.jpeg?auto=compress&cs=tinysrgb&w=1400',
    tags: ['Dubai', 'BƏƏ', 'Büdcə'],
    views: 354,
    likes: 46,
    content: `
      <p>Dubai lüks istiqamət kimi tanınır, amma düzgün planla həm şəhər mərkəzini, həm də səhra təcrübəsini daha balanslı büdcə ilə görmək mümkündür.</p>
      <h2>Əsas dayanacaqlar</h2>
      <p>Burj Khalifa, Dubai Mall, Marina, köhnə Deira bazarları və səhra turu ilk səfər üçün yaxşı başlanğıcdır. Hər hissəni ayrı günə bölmək yorğunluğu azaldır.</p>
      <h2>Büdcə qeydi</h2>
      <p>Otel seçərkən metroya yaxınlıq vacibdir. Taksi rahatdır, amma gündəlik xərci sürətlə artırır. Aktivlik biletlərini əvvəlcədən müqayisə etmək də qənaət yaradır.</p>
    `,
  },
  {
    title: 'Roma ilk səfər bələdçisi: Kolizeumdan Trastevereyə',
    cover_image: 'https://images.pexels.com/photos/532263/pexels-photo-532263.jpeg?auto=compress&cs=tinysrgb&w=1400',
    tags: ['Roma', 'İtaliya', 'Tarix'],
    views: 301,
    likes: 39,
    content: `
      <p>Roma açıq hava muzeyi kimidir: Kolizeum, Forum, Panteon, Trevi fəvvarəsi və Vatikan bir səfərdə çox güclü marşrut yaradır.</p>
      <h2>Vaxtı necə bölmək olar?</h2>
      <p>Kolizeum və Forum üçün ayrıca yarım gün ayır. Vatikan muzeyləri və Müqəddəs Pyotr bazilikası isə başqa gün daha rahat gəzilir.</p>
      <h2>Axşam marşrutu</h2>
      <p>Trastevere axşam yeməyi və sakit gəzinti üçün ən xoş rayonlardan biridir. Mərkəzə yaxın qalmaq piyada marşrutları asanlaşdırır.</p>
    `,
  },
  {
    title: 'Yaponiyaya səyahət: Tokyo və Kyoto arasında ilk plan',
    cover_image: 'https://images.pexels.com/photos/208701/pexels-photo-208701.jpeg?auto=compress&cs=tinysrgb&w=1400',
    tags: ['Yaponiya', 'Tokyo', 'Kyoto'],
    views: 267,
    likes: 35,
    content: `
      <p>Yaponiya ilk baxışda mürəkkəb görünə bilər, amma Tokyo və Kyoto xətti səyahəti aydınlaşdırır: biri müasir ritm, digəri ənənə və məbədlər.</p>
      <h2>Tokyo üçün əsas seçimlər</h2>
      <p>Shibuya, Shinjuku, Asakusa və Tokyo Station ətrafı ilk səfərdə şəhərin fərqli üzlərini göstərir. Metro xəritəsini əvvəlcədən öyrənmək vacibdir.</p>
      <h2>Kyoto üçün temp</h2>
      <p>Fushimi Inari, Arashiyama və Gion üçün tələsməyən plan qur. Kyoto daha çox piyada və sakit marşrut istəyən şəhərdir.</p>
    `,
  },
  {
    title: 'Bali planı: Denpasar, Ubud və sahil bölgələrini düzgün seçmək',
    cover_image: 'https://images.pexels.com/photos/2474690/pexels-photo-2474690.jpeg?auto=compress&cs=tinysrgb&w=1400',
    tags: ['Bali', 'İndoneziya', 'Tropik səfər'],
    views: 229,
    likes: 33,
    content: `
      <p>Bali tək bir məkan deyil, fərqli səfər tiplərinin qarışığıdır. Ubud daha çox təbiət və mədəniyyət, Canggu və Seminyak isə kafe, sahil və sosial mühit üçün seçilir.</p>
      <h2>Harada qalmaq?</h2>
      <p>İlk səfərdə bütün adanı bir oteldən gəzmək çətin ola bilər. Planı 2 bölgəyə bölmək yolda vaxt itkisinin qarşısını alır.</p>
      <h2>Nəyə diqqət etməli?</h2>
      <p>Mövsüm, nəqliyyat və məsafələr Balidə çox vacibdir. Görməli yerləri xəritədə qruplaşdırmaq səfəri daha rahat edir.</p>
    `,
  },
  {
    title: 'London səfərində klassik marşrut: Westminster, Soho və muzeylər',
    cover_image: 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=1400',
    tags: ['London', 'İngiltərə', 'Şəhər marşrutu'],
    views: 244,
    likes: 28,
    content: `
      <p>London böyük şəhərdir və ilk səfərdə rayonları düzgün bölmək lazımdır. Westminster, South Bank, Soho və British Museum ətrafı yaxşı başlanğıc xəttidir.</p>
      <h2>Birinci gün</h2>
      <p>Big Ben, Westminster Abbey, London Eye və Thames sahili eyni marşrutda rahat birləşir. Axşam Soho və Covent Garden daha canlı atmosfer verir.</p>
      <h2>Praktik məsləhət</h2>
      <p>Oyster və ya contactless kartla metro istifadəsi səyahəti asanlaşdırır. Muzeylərin çoxu pulsuzdur, amma vaxt slotlarını əvvəlcədən yoxlamaq yaxşıdır.</p>
    `,
  },
  {
    title: 'Bangkokda ilk günlər: məbədlər, bazarlar və küçə yeməkləri',
    cover_image: 'https://images.pexels.com/photos/1031659/pexels-photo-1031659.jpeg?auto=compress&cs=tinysrgb&w=1400',
    tags: ['Bangkok', 'Tailand', 'Food'],
    views: 221,
    likes: 30,
    content: `
      <p>Bangkok dinamik, səsli və rəngli şəhərdir. İlk səfərdə məbədlər, çay marşrutu, bazarlar və küçə yeməklərini balanslı planlamaq lazımdır.</p>
      <h2>Görməli yerlər</h2>
      <p>Grand Palace, Wat Pho və Wat Arun bir-birinə yaxın əsas dayanacaqlardır. Günün isti saatlarını nəzərə alıb səhər başlamaq daha rahatdır.</p>
      <h2>Yemək təcrübəsi</h2>
      <p>Street food Bangkok təcrübəsinin ayrılmaz hissəsidir. Sıx, dövriyyəsi yüksək yerlər adətən daha təhlükəsiz və dadlı seçim olur.</p>
    `,
  },
  {
    title: 'Praqa bələdçisi: köhnə şəhər, körpülər və sakit büdcə planı',
    cover_image: 'https://images.pexels.com/photos/126292/pexels-photo-126292.jpeg?auto=compress&cs=tinysrgb&w=1400',
    tags: ['Praqa', 'Çexiya', 'Avropa'],
    views: 205,
    likes: 27,
    content: `
      <p>Praqa Avropada həm romantik, həm də nisbətən büdcə dostu istiqamətlərdən biridir. Köhnə şəhər meydanı, Karl körpüsü və qala kompleksi ilk səfər üçün əsas xəttdir.</p>
      <h2>Gəzinti ritmi</h2>
      <p>Şəhərin mərkəzi piyada gəzmək üçün uyğundur. Səhər saatlarında Karl körpüsü daha sakit olur və foto üçün daha yaxşı görünür.</p>
      <h2>Büdcə qeydi</h2>
      <p>Mərkəzdəki əsas meydanlardan bir az uzaq restoranlar qiymət-keyfiyyət baxımından daha sərfəli ola bilər.</p>
    `,
  },
  {
    title: 'Budapeşt səfəri: Dunay sahili, termal hamamlar və gecə mənzərəsi',
    cover_image: 'https://images.pexels.com/photos/2350351/pexels-photo-2350351.jpeg?auto=compress&cs=tinysrgb&w=1400',
    tags: ['Budapeşt', 'Macarıstan', 'Avropa'],
    views: 214,
    likes: 26,
    content: `
      <p>Budapeşt Dunay sahili, parlament binası, qala bölgəsi və termal hamamları ilə qısa Avropa səfəri üçün çox dolğun şəhərdir.</p>
      <h2>Gündüz marşrutu</h2>
      <p>Buda qalası, Fisherman's Bastion və Parlament binası şəhərin ən güclü vizual nöqtələridir. Körpülər arasında piyada gəzinti də marşruta əlavə edilə bilər.</p>
      <h2>Axşam planı</h2>
      <p>Dunay sahili axşam işıqları ilə daha təsirli görünür. Termal hamamları isə yorğunluğu azaltmaq üçün ayrıca yarım günə salmaq yaxşıdır.</p>
    `,
  },
  {
    title: 'Seul səyahəti: saraylar, müasir məhəllələr və K-culture ritmi',
    cover_image: 'https://images.pexels.com/photos/237211/pexels-photo-237211.jpeg?auto=compress&cs=tinysrgb&w=1400',
    tags: ['Seul', 'Cənubi Koreya', 'K-culture'],
    views: 236,
    likes: 32,
    content: `
      <p>Seul ənənəvi saraylarla müasir məhəllələri eyni səfərdə birləşdirir. Gyeongbokgung, Bukchon Hanok Village, Hongdae və Gangnam fərqli atmosferlər təqdim edir.</p>
      <h2>İlk səfər üçün plan</h2>
      <p>Saraylar və ənənəvi məhəllələr üçün bir gün, alış-veriş və kafe rayonları üçün başqa gün ayırmaq daha rahatdır.</p>
      <h2>Nəqliyyat</h2>
      <p>Metro sistemi geniş və effektivdir. Qalacağın yeri metro xəttinə yaxın seçmək şəhəri daha rahat kəşf etməyə kömək edir.</p>
    `,
  },
];

async function main() {
  loadEnv();
  const opts = parseArgs();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL və SUPABASE_SERVICE_ROLE_KEY .env.local içində olmalıdır.');
  }

  const supabase = createClient(url, serviceKey);
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, name')
    .order('created_at', { ascending: true })
    .limit(20);

  if (profileError) throw profileError;
  const author = profiles?.find((profile) => /xeyyam/i.test(profile.name || '')) || profiles?.[0];
  if (!author) throw new Error('Blog author üçün profiles cədvəlində istifadəçi tapılmadı.');

  console.log(`Professional blog seed - ${opts.apply ? 'APPLY' : 'DRY RUN'}`);
  console.log(`Author: ${author.name || author.id}`);

  const titles = BLOGS.map((blog) => blog.title);
  const { data: existing, error: existingError } = await supabase
    .from('blogs')
    .select('id, title, status')
    .in('title', titles);
  if (existingError) throw existingError;

  const existingByTitle = new Map((existing || []).map((blog) => [blog.title, blog]));

  const { data: publishedBlogs, error: publishedError } = await supabase
    .from('blogs')
    .select('id, title')
    .eq('status', 'published');
  if (publishedError) throw publishedError;

  const archiveIds = (publishedBlogs || [])
    .filter((blog) => !titles.includes(blog.title))
    .map((blog) => blog.id);

  console.log(`Archive old published blogs: ${archiveIds.length}`);
  console.log(`Upsert professional blogs: ${BLOGS.length}`);

  if (!opts.apply) {
    for (const blog of BLOGS) console.log(`  ${existingByTitle.has(blog.title) ? 'update' : 'insert'}: ${blog.title}`);
    return;
  }

  if (archiveIds.length > 0) {
    const { error } = await supabase
      .from('blogs')
      .update({ status: 'draft', updated_at: new Date().toISOString() })
      .in('id', archiveIds);
    if (error) throw error;
  }

  for (const blog of BLOGS) {
    const payload = {
      author_id: author.id,
      title: blog.title,
      content: blog.content.replace(/\n\s+/g, '\n').trim(),
      cover_image: blog.cover_image,
      language: 'az',
      tags: blog.tags,
      views: blog.views,
      likes: blog.likes,
      status: 'published',
      updated_at: new Date().toISOString(),
    };

    const found = existingByTitle.get(blog.title);
    if (found) {
      const { error } = await supabase.from('blogs').update(payload).eq('id', found.id);
      if (error) throw error;
      console.log(`updated: ${blog.title}`);
    } else {
      const { error } = await supabase.from('blogs').insert(payload);
      if (error) throw error;
      console.log(`inserted: ${blog.title}`);
    }
  }

  console.log('Done.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
