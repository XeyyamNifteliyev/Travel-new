#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const CURATED_DESCRIPTIONS = [
  {
    city: 'istanbul',
    names: ['Ayasofya', 'Hagia Sophia'],
    az: 'Ayasofya İstanbulun ən tanınmış tarixi abidələrindən biridir. Bizans dövründə kilsə kimi inşa olunmuş, Osmanlı dövründə məscidə çevrilmiş və bu gün şəhərin Sultanahmet bölgəsində ən çox ziyarət edilən məkanlardan biri kimi tanınır.',
    en: 'Hagia Sophia is one of Istanbul’s most recognizable historic landmarks. Built as a Byzantine church and later converted into an Ottoman mosque, it remains one of the most visited places in the Sultanahmet area.',
    ru: 'Айя-София — одна из самых известных исторических достопримечательностей Стамбула. Она была построена как византийский храм, позже стала османской мечетью и сегодня остается одним из самых посещаемых мест района Султанахмет.',
  },
  {
    city: 'istanbul',
    names: ['Topkapı Sarayı', 'Topkapi Palace'],
    az: 'Topkapı Sarayı Osmanlı sultanlarının əsrlər boyu əsas iqamətgahı və idarə mərkəzi olub. Saray kompleksi həyətləri, xəzinə bölmələri, müqəddəs əmanətləri və Boğaza açılan mənzərələri ilə İstanbul tarixini yaxından tanıdır.',
    en: 'Topkapi Palace served for centuries as the main residence and administrative center of the Ottoman sultans. Its courtyards, treasury rooms, sacred relics, and Bosphorus views make it one of Istanbul’s key historic sites.',
    ru: 'Дворец Топкапы на протяжении веков был главной резиденцией и административным центром османских султанов. Дворы, сокровищница, священные реликвии и виды на Босфор делают его одним из ключевых исторических мест Стамбула.',
  },
  {
    city: 'istanbul',
    names: ['Yerebatan Sarnıcı', 'Basilica Cistern'],
    az: 'Yerebatan Sarnıcı Bizans dövründən qalan yeraltı su anbarıdır. Sütunlu salonu, zəif işıqlandırması və Meduza başlıqları ilə Sultanahmet marşrutunda fərqli atmosfer yaradan məşhur tarixi məkandır.',
    en: 'The Basilica Cistern is an underground water reservoir from the Byzantine period. Its columned hall, low lighting, and Medusa heads make it one of the most atmospheric historic stops in Sultanahmet.',
    ru: 'Цистерна Базилика — подземное водохранилище византийского периода. Колонный зал, приглушенный свет и головы Медузы создают одну из самых необычных атмосфер в районе Султанахмет.',
  },
  {
    city: 'istanbul',
    names: ['Galata Kulesi', 'Galata Tower'],
    az: 'Galata Kulesi İstanbul siluetinin ən seçilən simvollarından biridir. Qüllənin ətrafındakı Galata küçələri, kafelər və panoramik şəhər mənzərəsi buranı həm foto, həm də gəzinti üçün populyar edir.',
    en: 'Galata Tower is one of the defining symbols of Istanbul’s skyline. The surrounding Galata streets, cafes, and panoramic city views make it a popular stop for photos and walks.',
    ru: 'Галатская башня — один из главных символов силуэта Стамбула. Улицы Галаты, кафе вокруг башни и панорамные виды на город делают это место популярным для прогулок и фотографий.',
  },
  {
    city: 'istanbul',
    names: ['Sultanahmet Camii', 'Blue Mosque'],
    az: 'Sultanahmet Camii mavi çiniləri, böyük günbəzi və altı minarəsi ilə İstanbulun ən məşhur dini abidələrindəndir. Ayasofya ilə üzbəüz yerləşdiyi üçün Sultanahmet meydanının əsas ziyarət nöqtələrindən biridir.',
    en: 'The Blue Mosque is one of Istanbul’s most famous religious landmarks, known for its blue tiles, large dome, and six minarets. Facing Hagia Sophia, it is a central stop around Sultanahmet Square.',
    ru: 'Голубая мечеть — одна из самых известных религиозных достопримечательностей Стамбула, узнаваемая по голубой плитке, большому куполу и шести минаретам. Она расположена напротив Айя-Софии и является центральной точкой площади Султанахмет.',
  },
  {
    city: 'istanbul',
    names: ['Kız Kulesi', 'Maiden’s Tower', "Maiden's Tower"],
    az: 'Kız Kulesi Boğazın Üsküdar sahilinə yaxın hissəsində yerləşən İstanbul simvollarından biridir. Qüllə tarixi əfsanələri, Boğaz mənzərəsi və şəhər panoraması ilə tanınır.',
    en: 'Maiden’s Tower is one of Istanbul’s symbols, standing near the Üsküdar shore of the Bosphorus. It is known for its legends, waterfront setting, and views across the city.',
    ru: 'Девичья башня — один из символов Стамбула, расположенный у берега Ускюдара на Босфоре. Она известна легендами, видом на пролив и панорамой города.',
  },
  {
    city: 'istanbul',
    names: ['Haseki Hürrem Hamamı', 'Haseki Hurrem Sultan Hamam'],
    az: 'Haseki Hürrem Hamamı XVI əsrdə Memar Sinan tərəfindən inşa edilmiş tarixi Osmanlı hamamıdır. Ayasofya və Sultanahmet Camii arasında yerləşdiyi üçün köhnə şəhər marşrutuna rahat əlavə olunur.',
    en: 'Haseki Hurrem Sultan Hamam is a 16th-century Ottoman bath designed by Mimar Sinan. Located between Hagia Sophia and the Blue Mosque, it fits naturally into an old-city itinerary.',
    ru: 'Хаммам Хасеки Хюррем — историческая османская баня XVI века, построенная архитектором Мимаром Синаном. Он расположен между Айя-Софией и Голубой мечетью, поэтому легко включается в маршрут по старому городу.',
  },
  {
    city: 'istanbul',
    names: ['Sultan Ahmet Türbesi', 'Tomb of Sultan Ahmed I'],
    az: 'Sultan Ahmet Türbesi Sultanahmet Camii yaxınlığında yerləşən Osmanlı dövrü məqbərəsidir. Məkan Sultan I Əhməd və ailə üzvləri ilə bağlı tarixi konteksti görmək üçün sakit və qısa dayanacaqdır.',
    en: 'The Tomb of Sultan Ahmed I is an Ottoman-era mausoleum near the Blue Mosque. It is a quiet short stop for understanding the historic context of Sultan Ahmed I and his family.',
    ru: 'Мавзолей султана Ахмеда I расположен рядом с Голубой мечетью. Это спокойная короткая остановка, помогающая понять исторический контекст султана Ахмеда I и его семьи.',
  },
  {
    city: 'istanbul',
    names: ['Karaköy Lokantası'],
    az: 'Karaköy Lokantası İstanbulun Karaköy bölgəsində tanınan restoran məkanlarından biridir. Şəhər gəzintisi zamanı yerli mətbəx, nahar və axşam yeməyi üçün mərkəzi mövqedə yerləşir.',
    en: 'Karaköy Lokantası is a well-known restaurant in Istanbul’s Karaköy area. Its central location makes it convenient for lunch or dinner during a city walk.',
    ru: 'Karaköy Lokantası — известный ресторан в районе Каракёй в Стамбуле. Центральное расположение делает его удобным вариантом для обеда или ужина во время прогулки по городу.',
  },
  {
    city: 'istanbul',
    names: ['Mavra Café', 'Mavra Cafe'],
    az: 'Mavra Café Karaköy ətrafında qısa fasilə, kofe və yüngül görüş üçün uyğun kafe məkanlarından biridir. Ətraf küçələr və sahil marşrutu ilə birlikdə planlamaq rahatdır.',
    en: 'Mavra Café is a convenient cafe stop around Karaköy for coffee, a short break, or a light meeting. It works well with nearby streets and the waterfront route.',
    ru: 'Mavra Café — удобное кафе в районе Каракёй для кофе, короткой паузы или легкой встречи. Его удобно сочетать с прогулкой по близлежащим улицам и набережной.',
  },
];

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([^#=]+)=(.*)$/);
    if (!match) continue;
    const key = match[1].trim();
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (!process.env[key]) process.env[key] = value;
  }
}

function parseArgs() {
  const opts = { apply: false, dryRun: true, city: 'istanbul' };
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const value = arg.includes('=') ? arg.split('=').slice(1).join('=') : args[i + 1];
    if (arg === '--city' || arg.startsWith('--city=')) {
      opts.city = value;
      if (!arg.includes('=')) i++;
    } else if (arg === '--apply') {
      opts.apply = true;
      opts.dryRun = false;
    } else if (arg === '--dry-run') {
      opts.apply = false;
      opts.dryRun = true;
    }
  }
  return opts;
}

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function matches(placeName, names) {
  const normalizedPlace = normalize(placeName);
  return names.some((name) => normalize(name) === normalizedPlace);
}

async function main() {
  loadEnvFile(path.join(__dirname, '..', '.env.local'));
  const opts = parseArgs();
  const supabase = createSupabaseClient();

  const { data: city, error: cityError } = await supabase.from('cities').select('id, slug').eq('slug', opts.city).maybeSingle();
  if (cityError) throw cityError;
  if (!city) throw new Error(`City not found: ${opts.city}`);

  const { data: places, error } = await supabase
    .from('places')
    .select('id, name, description_az, description_en, description_ru')
    .eq('city_id', city.id)
    .eq('status', 'active');
  if (error) throw error;

  let updated = 0;
  let skipped = 0;
  for (const item of CURATED_DESCRIPTIONS.filter((entry) => entry.city === city.slug)) {
    const place = (places || []).find((candidate) => matches(candidate.name, item.names));
    if (!place) {
      skipped += 1;
      console.log(`- missing in DB: ${item.names[0]}`);
      continue;
    }
    const payload = {
      description_az: place.description_az || item.az,
      description_en: place.description_en || item.en,
      description_ru: place.description_ru || item.ru,
      last_synced_at: new Date().toISOString(),
    };
    updated += 1;
    console.log(`+ ${place.name}`);
    if (!opts.dryRun) {
      const { error: updateError } = await supabase.from('places').update(payload).eq('id', place.id);
      if (updateError) throw updateError;
    }
  }

  console.log(`\nSummary: updated=${updated}, skipped=${skipped}, mode=${opts.dryRun ? 'dry-run' : 'apply'}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
