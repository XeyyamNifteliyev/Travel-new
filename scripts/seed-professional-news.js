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
  return { apply: process.argv.includes('--apply') };
}

function item({ titleAz, titleEn, titleRu, category, image, az, en, ru }) {
  return {
    title_az: titleAz,
    title_en: titleEn,
    title_ru: titleRu,
    category,
    image_url: image,
    content_az: `${az}\n\nMənbə qeydi: viza və sərhəd qaydaları sürətlə dəyişə bilər. Rezervasiya etməzdən əvvəl rəsmi dövlət mənbələrini, səfirlikləri və TravelAZ viza səhifəsini yenidən yoxlayın.`,
    content_en: `${en}\n\nSource note: visa and border rules can change quickly. Before booking, re-check official government sources, embassies, and the TravelAZ visa page.`,
    content_ru: `${ru}\n\nПримечание об источниках: визовые и пограничные правила могут быстро меняться. Перед бронированием проверьте официальные государственные источники, посольства и визовую страницу TravelAZ.`,
  };
}

const NEWS = [
  item({
    titleAz: 'Azərbaycan və Çin arasında adi pasportlar üçün vizasız rejim qüvvədədir',
    titleEn: 'Azerbaijan and China ordinary passports are covered by visa-free travel',
    titleRu: 'Между Азербайджаном и Китаем действует безвизовый режим для обычных паспортов',
    category: 'visa_change',
    image: 'https://images.pexels.com/photos/2846074/pexels-photo-2846074.jpeg?auto=compress&cs=tinysrgb&w=1400',
    az: 'Azərbaycan Xarici İşlər Nazirliyinin məlumatına görə, Azərbaycan və Çin arasında adi pasport sahibləri üçün qarşılıqlı viza azadlığı razılaşması qüvvəyə minib. Qaydaya əsasən, hər səfərdə 30 günədək, 180 gün ərzində ümumilikdə 90 günədək qalma limiti tətbiq olunur.',
    en: 'According to Azerbaijan’s Ministry of Foreign Affairs, the mutual visa exemption agreement between Azerbaijan and China for ordinary passport holders has entered into force. The stay limit is up to 30 days per visit and up to 90 days within any 180-day period.',
    ru: 'По данным МИД Азербайджана, соглашение о взаимной отмене виз между Азербайджаном и Китаем для владельцев обычных паспортов вступило в силу. Лимит пребывания: до 30 дней за одну поездку и до 90 дней в течение 180 дней.',
  }),
  item({
    titleAz: 'Türkiyə Azərbaycan vətəndaşları üçün ən rahat vizasız istiqamətlərdən biridir',
    titleEn: 'Turkey remains one of the easiest visa-free destinations for Azerbaijani citizens',
    titleRu: 'Турция остаётся одним из самых удобных безвизовых направлений для граждан Азербайджана',
    category: 'visa_change',
    image: 'https://images.pexels.com/photos/1549326/pexels-photo-1549326.jpeg?auto=compress&cs=tinysrgb&w=1400',
    az: 'Türkiyə qısa şəhər səfəri, ailə istirahəti və bağlantılı uçuşlar üçün Azərbaycan pasportu ilə ən çox seçilən vizasız istiqamətlərdəndir. Səfərdən əvvəl pasport müddəti, qalma limiti və aviaşirkət tələblərini yoxlamaq tövsiyə olunur.',
    en: 'Turkey remains one of the most popular visa-free choices for Azerbaijani passport holders, especially for short city breaks, family trips, and connecting flights. Travelers should still check passport validity, stay limits, and airline requirements.',
    ru: 'Турция остаётся одним из самых популярных безвизовых направлений для владельцев азербайджанского паспорта — для коротких поездок, семейного отдыха и пересадок. Перед вылетом стоит проверить срок паспорта, лимит пребывания и требования авиакомпании.',
  }),
  item({
    titleAz: 'Gürcüstan vizasız yaxın səfərlər üçün aktual seçim olaraq qalır',
    titleEn: 'Georgia remains a practical nearby visa-free option',
    titleRu: 'Грузия остаётся практичным близким безвизовым направлением',
    category: 'visa_change',
    image: 'https://images.pexels.com/photos/5998445/pexels-photo-5998445.jpeg?auto=compress&cs=tinysrgb&w=1400',
    az: 'Tbilisi, Batumi və dağ marşrutları sayəsində Gürcüstan Bakıdan qısa səfər planlayanlar üçün rahat seçimdir. Vizasız olsa da, sərhəd keçidi və pasport tələbləri səfərdən əvvəl yoxlanmalıdır.',
    en: 'With Tbilisi, Batumi, and mountain routes, Georgia is a convenient option for short trips from Baku. Even where travel is visa-free, border and passport rules should be checked before departure.',
    ru: 'Тбилиси, Батуми и горные маршруты делают Грузию удобным вариантом для коротких поездок из Баку. Даже при безвизовом режиме перед поездкой нужно проверить пограничные и паспортные требования.',
  }),
  item({
    titleAz: 'İran səfəri üçün viza statusu ilə yanaşı təhlükəsizlik qeydlərini də yoxlayın',
    titleEn: 'For Iran trips, check both visa status and safety notes',
    titleRu: 'Для поездки в Иран проверяйте не только визу, но и предупреждения безопасности',
    category: 'travel_tip',
    image: 'https://images.pexels.com/photos/3889855/pexels-photo-3889855.jpeg?auto=compress&cs=tinysrgb&w=1400',
    az: 'İran region üzrə yaxın istiqamətlərdən biridir, amma səfər planı qurarkən yalnız viza rejiminə baxmaq kifayət deyil. Sərhəd keçidi, təhlükəsizlik tövsiyələri və yerli qaydalar ayrıca yoxlanmalıdır.',
    en: 'Iran is a nearby regional destination, but checking visa status alone is not enough. Border crossing rules, safety notes, and local regulations should be reviewed separately.',
    ru: 'Иран — близкое региональное направление, но одного визового статуса недостаточно. Нужно отдельно проверить правила границы, рекомендации безопасности и местные нормы.',
  }),
  item({
    titleAz: 'BƏƏ səfəri planlayanlar Dubai və Abu Dabi üçün giriş tələblərini ayrıca yoxlamalıdır',
    titleEn: 'UAE travelers should check entry requirements for Dubai and Abu Dhabi before booking',
    titleRu: 'Путешественникам в ОАЭ стоит отдельно проверить требования въезда для Дубая и Абу-Даби',
    category: 'visa_change',
    image: 'https://images.pexels.com/photos/3787839/pexels-photo-3787839.jpeg?auto=compress&cs=tinysrgb&w=1400',
    az: 'BƏƏ populyar istiqamət olsa da, turist vizası, tranzit və rezident statusuna görə qaydalar fərqlənə bilər. Uçuş və otel almadan əvvəl rəsmi giriş tələblərini yoxlamaq daha təhlükəsizdir.',
    en: 'The UAE is popular, but tourist visa, transit, and residence-based rules can differ. Before buying flights and hotels, travelers should verify official entry requirements.',
    ru: 'ОАЭ популярны, но правила для туристической визы, транзита и резидентского статуса могут отличаться. Перед покупкой билетов и отеля лучше проверить официальные требования въезда.',
  }),
  item({
    titleAz: 'Avropa səfərlərində Şengen sənəd uyğunluğu əsas risk nöqtəsidir',
    titleEn: 'Schengen document consistency is a key risk point for Europe trips',
    titleRu: 'Для поездок в Шенген важна согласованность документов',
    category: 'visa_change',
    image: 'https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=1400',
    az: 'Fransa, İtaliya, Çexiya, Macarıstan və digər Şengen istiqamətləri üçün uçuş, otel, sığorta və iş arayışı tarixləri bir-birini dəstəkləməlidir. Uyğunsuz tarixlər müraciəti zəiflədə bilər.',
    en: 'For France, Italy, Czechia, Hungary, and other Schengen destinations, flight, hotel, insurance, and employment documents should support the same travel dates. Inconsistency can weaken an application.',
    ru: 'Для Франции, Италии, Чехии, Венгрии и других стран Шенгена билеты, отель, страховка и справки должны подтверждать одни даты поездки. Несоответствия могут ослабить заявку.',
  }),
  item({
    titleAz: 'Yaponiya səfəri üçün viza sənədləri əvvəlcədən planlanmalıdır',
    titleEn: 'Japan trips require early visa document planning',
    titleRu: 'Для поездки в Японию документы на визу лучше готовить заранее',
    category: 'visa_change',
    image: 'https://images.pexels.com/photos/208701/pexels-photo-208701.jpeg?auto=compress&cs=tinysrgb&w=1400',
    az: 'Tokyo və Kyoto marşrutu populyarlaşsa da, Yaponiya səfəri üçün viza və sənəd planı əvvəlcədən hazırlanmalıdır. Bank çıxarışı, iş arayışı, otel və uçuş tarixləri uyğun saxlanmalıdır.',
    en: 'Tokyo and Kyoto routes are popular, but Japan trips need early visa and document planning. Bank statements, employment proof, hotel bookings, and flight dates should be aligned.',
    ru: 'Маршруты Токио и Киото популярны, но для поездки в Японию документы на визу нужно готовить заранее. Выписка из банка, справка с работы, отель и даты перелёта должны совпадать.',
  }),
  item({
    titleAz: 'Cənubi Koreya səfəri üçün elektron icazə və viza statusunu qarışdırmayın',
    titleEn: 'Do not confuse electronic travel authorization with visa status for South Korea',
    titleRu: 'Для Южной Кореи не путайте электронное разрешение и визовый статус',
    category: 'visa_change',
    image: 'https://images.pexels.com/photos/237211/pexels-photo-237211.jpeg?auto=compress&cs=tinysrgb&w=1400',
    az: 'Seul səfəri planlayanlar viza, elektron icazə və aviaşirkət sənəd tələblərini ayrıca yoxlamalıdır. Qaydalar pasport ölkəsinə, səfər məqsədinə və qalma müddətinə görə dəyişə bilər.',
    en: 'Travelers planning Seoul should check visa rules, electronic authorization, and airline document requirements separately. Rules can vary by passport, purpose, and length of stay.',
    ru: 'Планируя Сеул, отдельно проверьте визу, электронное разрешение и требования авиакомпании. Правила зависят от паспорта, цели поездки и срока пребывания.',
  }),
  item({
    titleAz: 'Bali və İndoneziya üçün e-viza və giriş rüsumu qaydaları əvvəlcədən yoxlanmalıdır',
    titleEn: 'Bali and Indonesia travelers should check e-visa and entry fee rules in advance',
    titleRu: 'Для Бали и Индонезии заранее проверяйте e-visa и въездные сборы',
    category: 'visa_change',
    image: 'https://images.pexels.com/photos/2474690/pexels-photo-2474690.jpeg?auto=compress&cs=tinysrgb&w=1400',
    az: 'Bali səyahətində viza, e-viza, giriş rüsumu və qalma müddəti eyni anda yoxlanmalıdır. Xüsusilə uzun qalma və regionlararası uçuş planı olanlar rəsmi qaydalara baxmalıdır.',
    en: 'For Bali trips, visa, e-visa, entry fees, and stay limits should be checked together. This is especially important for longer stays and multi-region itineraries.',
    ru: 'Для Бали нужно вместе проверять визу, e-visa, въездные сборы и лимит пребывания. Это особенно важно для долгих поездок и маршрутов по нескольким регионам.',
  }),
  item({
    titleAz: 'Tailand səfəri üçün pasport müddəti və giriş kartı qaydaları aktual saxlanmalıdır',
    titleEn: 'Thailand travelers should keep passport validity and entry-card rules updated',
    titleRu: 'Для Таиланда важно проверять срок паспорта и правила въездной карты',
    category: 'travel_tip',
    image: 'https://images.pexels.com/photos/1031659/pexels-photo-1031659.jpeg?auto=compress&cs=tinysrgb&w=1400',
    az: 'Bangkok və Phuket kimi istiqamətlərdə viza rejimi ilə yanaşı pasportun qüvvədə qalma müddəti, dönüş bileti və mümkün elektron giriş formaları da önəmlidir.',
    en: 'For Bangkok, Phuket, and other Thai destinations, passport validity, return tickets, and possible electronic entry forms matter alongside visa status.',
    ru: 'Для Бангкока, Пхукета и других направлений Таиланда важны срок паспорта, обратный билет и возможные электронные формы въезда наряду с визовым статусом.',
  }),
  item({
    titleAz: 'Qətər və Doha səfərlərində tranzit və turist giriş qaydalarını ayrı yoxlayın',
    titleEn: 'For Qatar and Doha, check transit and tourist entry rules separately',
    titleRu: 'Для Катара и Дохи отдельно проверяйте транзитные и туристические правила',
    category: 'visa_change',
    image: 'https://images.pexels.com/photos/15164130/pexels-photo-15164130.jpeg?auto=compress&cs=tinysrgb&w=1400',
    az: 'Doha çox vaxt tranzit və qısa şəhər stopover üçün seçilir. Tranzit qaydaları ilə ölkəyə giriş qaydaları eyni olmaya bilər, buna görə bileti almadan əvvəl fərqi yoxlamaq lazımdır.',
    en: 'Doha is often used for transit and short stopovers. Transit rules and tourist entry rules may differ, so travelers should check the difference before booking.',
    ru: 'Доху часто выбирают для транзита и короткого stopover. Транзитные правила и правила въезда в страну могут отличаться, поэтому их нужно проверить до покупки билета.',
  }),
  item({
    titleAz: 'Misir səfəri üçün viza, otel ünvanı və dönüş bileti bir yerdə hazırlanmalıdır',
    titleEn: 'Egypt trips should be planned with visa, hotel address, and return ticket together',
    titleRu: 'Для Египта заранее готовьте визу, адрес отеля и обратный билет',
    category: 'visa_change',
    image: 'https://images.pexels.com/photos/262780/pexels-photo-262780.jpeg?auto=compress&cs=tinysrgb&w=1400',
    az: 'Qahirə və kurort bölgələrinə səfər zamanı viza statusu, otel ünvanı, dönüş bileti və sığorta sənədləri bir paket kimi hazırlanmalıdır.',
    en: 'For Cairo and resort areas, visa status, hotel address, return ticket, and insurance documents should be prepared as one package.',
    ru: 'Для Каира и курортных зон визу, адрес отеля, обратный билет и страховку лучше готовить одним пакетом.',
  }),
  item({
    titleAz: 'Böyük Britaniya səfəri üçün viza müraciəti daha erkən planlanmalıdır',
    titleEn: 'UK trips require earlier visa application planning',
    titleRu: 'Для Великобритании визу лучше планировать заранее',
    category: 'visa_change',
    image: 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=1400',
    az: 'London səfəri planlayanlar viza görüşü, biometrik prosedur və sənəd yığımı üçün daha geniş vaxt saxlamalıdır. Qısa tarixlərdə uçuş almaq riskli ola bilər.',
    en: 'Travelers planning London should leave more time for visa appointment, biometrics, and document preparation. Buying flights for tight dates can be risky.',
    ru: 'Планируя Лондон, закладывайте больше времени на визовую запись, биометрию и подготовку документов. Покупка билетов на близкие даты может быть рискованной.',
  }),
  item({
    titleAz: 'ABŞ səfəri üçün viza görüş tarixləri səyahət planından əvvəl yoxlanmalıdır',
    titleEn: 'US visa appointment availability should be checked before trip planning',
    titleRu: 'Для США сначала проверяйте доступность визовой записи',
    category: 'visa_change',
    image: 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=1400',
    az: 'ABŞ səfərində viza görüş tarixləri planın ən vacib hissəsidir. Otel və uçuş almadan əvvəl müraciət prosesi, müsahibə tarixi və pasport qaytarılma müddəti nəzərə alınmalıdır.',
    en: 'For US trips, visa appointment availability is one of the most important planning points. Before booking flights and hotels, consider the application process, interview date, and passport return time.',
    ru: 'Для поездки в США доступность визовой записи — один из ключевых пунктов. До покупки билетов и отеля учитывайте процесс подачи, дату интервью и срок возврата паспорта.',
  }),
  item({
    titleAz: 'Sərhəd keçidində pasport müddəti viza qədər vacib ola bilər',
    titleEn: 'Passport validity can matter as much as visa status at the border',
    titleRu: 'На границе срок паспорта может быть так же важен, как и виза',
    category: 'travel_tip',
    image: 'https://images.pexels.com/photos/7235897/pexels-photo-7235897.jpeg?auto=compress&cs=tinysrgb&w=1400',
    az: 'Bir çox ölkə pasportun səfərdən sonra müəyyən müddət qüvvədə qalmasını tələb edir. Vizasız ölkəyə gedərkən belə bu detal sərhəddə problem yarada bilər.',
    en: 'Many countries require passports to remain valid for a period after the trip. Even when the destination is visa-free, this detail can create problems at the border.',
    ru: 'Многие страны требуют, чтобы паспорт действовал ещё некоторое время после поездки. Даже при безвизовом направлении эта деталь может создать проблему на границе.',
  }),
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
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name')
    .order('created_at', { ascending: true })
    .limit(20);
  const author = profiles?.find((profile) => /xeyyam/i.test(profile.name || '')) || profiles?.[0] || null;

  const titles = NEWS.map((news) => news.title_az);
  const { data: existing, error: existingError } = await supabase
    .from('news')
    .select('id, title_az')
    .in('title_az', titles);
  if (existingError) throw existingError;

  const existingByTitle = new Map((existing || []).map((news) => [news.title_az, news.id]));
  const { data: published, error: publishedError } = await supabase
    .from('news')
    .select('id, title_az')
    .eq('is_published', true);
  if (publishedError) throw publishedError;

  const archiveIds = (published || [])
    .filter((news) => !titles.includes(news.title_az))
    .map((news) => news.id);

  console.log(`Professional news seed - ${opts.apply ? 'APPLY' : 'DRY RUN'}`);
  console.log(`Archive old published news: ${archiveIds.length}`);
  console.log(`Upsert professional news: ${NEWS.length}`);

  if (!opts.apply) {
    for (const news of NEWS) {
      console.log(`  ${existingByTitle.has(news.title_az) ? 'update' : 'insert'}: ${news.title_az}`);
    }
    return;
  }

  if (archiveIds.length > 0) {
    const { error } = await supabase
      .from('news')
      .update({ is_published: false, updated_at: new Date().toISOString() })
      .in('id', archiveIds);
    if (error) throw error;
  }

  const now = Date.now();
  for (const [index, news] of NEWS.entries()) {
    const payload = {
      ...news,
      author_id: author?.id || null,
      is_published: true,
      created_at: new Date(now - index * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    };
    const existingId = existingByTitle.get(news.title_az);

    if (existingId) {
      const { error } = await supabase.from('news').update(payload).eq('id', existingId);
      if (error) throw error;
      console.log(`updated: ${news.title_az}`);
    } else {
      const { error } = await supabase.from('news').insert(payload);
      if (error) throw error;
      console.log(`inserted: ${news.title_az}`);
    }
  }

  console.log('Done.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
