#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const DEFAULT_SLUGS = [
  'turkey',
  'dubai',
  'france',
  'italy',
  'georgia',
  'bali',
  'japan',
  'thailand',
  'greece',
  'maldives',
];

const FALLBACK_PHOTOS = {
  turkey: '1558005137-d9619a5c539f',
  dubai: '1512453979798-5ea266f8880c',
  france: '1502602915149-bb4f5dc63d43',
  italy: '1516483107680-cf12f4bb3a06',
  georgia: '1565008576549-57569a49371d',
  bali: '1537996194471-e657df975ab4',
  japan: '1493976040374-85c8e12f0c0e',
  thailand: '1528181304800-259b08848526',
  greece: '1570077188670-e3a8d69ac5ff',
  maldives: '1573843981267-be1999ff37cd',
};

const CURATED_HIGHLIGHTS = {
  turkey: [
    highlight('blue-mosque', 'Sultan Əhməd Məscidi', 'Blue Mosque', 'Голубая мечеть', 'İstanbulun ən tanınan Osmanlı memarlığı nümunələrindən biri.', 'landmark', 41.0054, 28.9768, '1524231757913-4be64b2825c7'),
    highlight('pamukkale', 'Pamukkale', 'Pamukkale', 'Памуккале', 'Ağ traverten terrasları və termal suları ilə məşhur təbiət möcüzəsi.', 'nature', 37.9137, 29.1187, '1551913902-b38fc67d8b4e'),
  ],
  dubai: [
    highlight('dubai-marina', 'Dubai Marina', 'Dubai Marina', 'Дубай Марина', 'Göydələnlər, promenad və axşam gəzintiləri üçün canlı sahil zonası.', 'landmark', 25.0800, 55.1400, '1512453979798-5ea266f8880c'),
    highlight('museum-of-the-future', 'Gələcək Muzeyi', 'Museum of the Future', 'Музей будущего', 'Texnologiya, dizayn və gələcək şəhər ideyalarını birləşdirən müasir məkan.', 'museum', 25.2191, 55.2819, '1568702846914-96b305d2aaeb'),
  ],
  france: [
    highlight('nice-cote-d-azur', 'Nitsa və Kot d’Azur', 'Nice and Côte d’Azur', 'Ницца и Лазурный берег', 'Aralıq dənizi sahili, promenadlar və Fransanın günəşli Riviera atmosferi.', 'beach', 43.7102, 7.2620, '1502602915149-bb4f5dc63d43'),
    highlight('versailles', 'Versal Sarayı', 'Palace of Versailles', 'Версаль', 'Fransa kral tarixi, bağlar və saray interyerləri üçün əsas dayanacaq.', 'historical', 48.8049, 2.1204, '1499856562261-6a300a60f98b'),
  ],
  italy: [
    highlight('florence-duomo', 'Florensiya Duomosu', 'Florence Duomo', 'Собор Флоренции', 'Renessans memarlığının simvolu və şəhərin ən güclü panoramik nöqtələrindən biri.', 'landmark', 43.7731, 11.2560, '1523906834-14422bf244af'),
    highlight('pisa-tower', 'Piza Qülləsi', 'Leaning Tower of Pisa', 'Пизанская башня', 'İtaliyanın ən tanınan memarlıq simvollarından biri və Toskana marşrutunun klassik dayanacağı.', 'landmark', 43.7230, 10.3966, '1516483107680-cf12f4bb3a06'),
  ],
  georgia: [
    highlight('mtskheta', 'Mtsxeta', 'Mtskheta', 'Мцхета', 'Gürcüstanın qədim paytaxtı və UNESCO irsi ilə zəngin dini mərkəz.', 'historical', 41.8451, 44.7188, '1565008576549-57569a49371d'),
    highlight('batumi-boulevard', 'Batumi Bulvarı', 'Batumi Boulevard', 'Батумский бульвар', 'Qara dəniz sahilində uzun gəzinti yolu, kafe və ailə istirahəti zonası.', 'landmark', 41.6500, 41.6360, '1558618042-1df3218d9671'),
  ],
  bali: [
    highlight('ubud-monkey-forest', 'Ubud Monkey Forest', 'Ubud Monkey Forest', 'Лес обезьян в Убуде', 'Tropik meşə, məbədlər və Ubudun mədəni atmosferini birləşdirən məşhur park.', 'nature', -8.5193, 115.2606, '1537996194471-e657df975ab4'),
    highlight('uluwatu-temple', 'Uluwatu Məbədi', 'Uluwatu Temple', 'Храм Улувату', 'Okean qayalıqları üzərində günbatımı və ənənəvi Kecak performansı ilə tanınır.', 'landmark', -8.8291, 115.0849, '1554073357-98e1d64da40f'),
  ],
  japan: [
    highlight('tokyo-shibuya', 'Şibuya Keçidi', 'Shibuya Crossing', 'Перекресток Сибуя', 'Tokyonun enerjisini ən yaxşı göstərən neonlu, izdihamlı şəhər simvolu.', 'landmark', 35.6595, 139.7005, '1493976040374-85c8e12f0c0e'),
    highlight('fushimi-inari', 'Fuşimi İnari', 'Fushimi Inari', 'Фусими Инари', 'Kyotoda minlərlə qırmızı torii qapısı ilə məşhur məbəd marşrutu.', 'historical', 34.9671, 135.7727, '1493976040374-85c8e12f0c0e'),
    highlight('mount-fuji', 'Fuci Dağı', 'Mount Fuji', 'Гора Фудзи', 'Yaponiyanın ən ikonik dağı, göllər və foto marşrutları üçün ideal istiqamət.', 'nature', 35.3606, 138.7274, '1493976040374-85c8e12f0c0e'),
    highlight('osaka-dotonbori', 'Dotonbori', 'Dotonbori', 'Дотонбори', 'Osakanın street food, neon reklamlar və gecə həyatı ilə tanınan mərkəzi.', 'landmark', 34.6687, 135.5012, '1493976040374-85c8e12f0c0e'),
  ],
  thailand: [
    highlight('grand-palace', 'Böyük Saray', 'Grand Palace', 'Большой дворец', 'Bangkokun kral tarixi, qızılı memarlığı və Zümrüd Budda məbədi ilə əsas məkanı.', 'historical', 13.7500, 100.4913, '1528181304800-259b08848526'),
    highlight('phi-phi-islands', 'Phi Phi Adaları', 'Phi Phi Islands', 'Острова Пхи-Пхи', 'Turkuaz su, qayıq turları və tropik çimərliklər üçün ən məşhur ada qrupu.', 'beach', 7.7407, 98.7784, '1528181304800-259b08848526'),
    highlight('chiang-mai-old-city', 'Chiang Mai Köhnə Şəhəri', 'Chiang Mai Old City', 'Старый город Чиангмая', 'Məbədlər, gecə bazarları və şimal Tayland mədəniyyəti üçün rahat baza.', 'historical', 18.7883, 98.9853, '1528181304800-259b08848526'),
    highlight('phuket', 'Phuket', 'Phuket', 'Пхукет', 'Çimərliklər, ada turları və ailə istirahəti üçün Taylandın populyar kurortu.', 'beach', 7.8804, 98.3923, '1528181304800-259b08848526'),
  ],
  greece: [
    highlight('acropolis', 'Akropol', 'Acropolis', 'Акрополь', 'Afinanın qədim simvolu və Yunan sivilizasiyasının ən güclü tarixi dayanacağı.', 'historical', 37.9715, 23.7257, '1570077188670-e3a8d69ac5ff'),
    highlight('santorini-oia', 'Santorini Oia', 'Santorini Oia', 'Санторини Ия', 'Ağ evlər, mavi günbəzlər və Egey dənizi günbatımı ilə məşhur ada kəndi.', 'landmark', 36.4618, 25.3753, '1570077188670-e3a8d69ac5ff'),
    highlight('meteora', 'Meteora', 'Meteora', 'Метеоры', 'Qaya sütunları üzərində monastırlar və Yunanıstanın ən fərqli mənzərələrindən biri.', 'nature', 39.7217, 21.6306, '1570077188670-e3a8d69ac5ff'),
    highlight('mykonos', 'Mikonos', 'Mykonos', 'Миконос', 'Çimərlik klubları, ağ küçələr və Egey adası atmosferi ilə məşhur istiqamət.', 'beach', 37.4467, 25.3289, '1570077188670-e3a8d69ac5ff'),
  ],
  maldives: [
    highlight('male', 'Male', 'Male', 'Мале', 'Maldivlərin paytaxtı, yerli bazarlar və dənizkənarı şəhər həyatı üçün başlanğıc nöqtəsi.', 'city', 4.1755, 73.5093, '1573843981267-be1999ff37cd'),
    highlight('baa-atoll', 'Baa Atoll', 'Baa Atoll', 'Атолл Баа', 'UNESCO biosfer zonası, manta ray müşahidəsi və sakit resort adaları ilə tanınır.', 'nature', 5.1036, 73.0713, '1573843981267-be1999ff37cd'),
    highlight('vaadhoo-island', 'Vaadhoo Adası', 'Vaadhoo Island', 'Остров Ваадху', 'Biolüminessent plankton parıltısı ilə “ulduzlu dəniz” təcrübəsi yaradan ada.', 'beach', 4.1940, 73.4042, '1573843981267-be1999ff37cd'),
    highlight('maafushi', 'Maafushi', 'Maafushi', 'Маафуши', 'Qonaq evləri, su idmanı və daha əlçatan Maldiv təcrübəsi üçün populyar ada.', 'beach', 3.9411, 73.4907, '1573843981267-be1999ff37cd'),
  ],
};

function highlight(slug, name, nameEn, nameRu, description, category, lat, lng, photoId) {
  return {
    slug,
    name,
    name_en: nameEn,
    name_ru: nameRu,
    description,
    category,
    lat,
    lng,
    photo_id: photoId,
  };
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separator = trimmed.indexOf('=');
    if (separator <= 0) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) process.env[key] = value;
  }
}

function readArgValue(args, index) {
  const current = args[index];
  const eqIndex = current.indexOf('=');
  if (eqIndex >= 0) {
    return { value: current.slice(eqIndex + 1), nextIndex: index };
  }
  return { value: args[index + 1], nextIndex: index + 1 };
}

function parseArgs(argv) {
  const args = {
    apply: false,
    dryRun: true,
    limit: 5,
    slugs: DEFAULT_SLUGS,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--apply') {
      args.apply = true;
      args.dryRun = false;
    } else if (arg === '--dry-run') {
      args.apply = false;
      args.dryRun = true;
    } else if (arg === '--limit' || arg.startsWith('--limit=')) {
      const parsed = readArgValue(argv, i);
      const limit = Number.parseInt(parsed.value, 10);
      if (Number.isFinite(limit) && limit > 0) args.limit = limit;
      i = parsed.nextIndex;
    } else if (arg === '--slugs' || arg.startsWith('--slugs=')) {
      const parsed = readArgValue(argv, i);
      args.slugs = parsed.value.split(',').map((slug) => slug.trim()).filter(Boolean);
      i = parsed.nextIndex;
    } else if (arg === '--help' || arg === '-h') {
      args.help = true;
    }
  }

  return args;
}

function printHelp() {
  console.log(`
Usage: node scripts/seed-country-highlights.js [options]

Options:
  --apply              Write highlights to Supabase. Default is dry-run.
  --dry-run            Preview only.
  --limit <n>          Max highlights per country. Default: 5.
  --slugs <list>       Comma-separated country slugs.

Examples:
  npm run seed:country-highlights
  npm run seed:country-highlights -- --apply
  npm run seed:country-highlights -- --slugs=turkey,dubai,japan --limit=4 --apply
`);
}

function normalizeSlug(value) {
  const replacements = {
    ə: 'e',
    Ə: 'e',
    ı: 'i',
    I: 'i',
    İ: 'i',
    ö: 'o',
    Ö: 'o',
    ü: 'u',
    Ü: 'u',
    ğ: 'g',
    Ğ: 'g',
    ç: 'c',
    Ç: 'c',
    ş: 's',
    Ş: 's',
  };

  return String(value)
    .split('')
    .map((char) => replacements[char] || char)
    .join('')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function placeToHighlight(place, country, rank) {
  const name = String(place.name || '').trim();
  if (!name) return null;

  return {
    country_id: country.id,
    slug: normalizeSlug(name),
    name,
    name_en: name,
    name_ru: name,
    description: String(place.desc || '').trim() || null,
    photo_id: place.photo_id || country.cover_photo_id || FALLBACK_PHOTOS[country.slug] || null,
    lat: typeof place.lat === 'number' ? place.lat : null,
    lng: typeof place.lng === 'number' ? place.lng : null,
    category: place.category || 'landmark',
    rank,
  };
}

function curatedToPayload(item, country, rank) {
  return {
    country_id: country.id,
    slug: item.slug,
    name: item.name,
    name_en: item.name_en,
    name_ru: item.name_ru,
    description: item.description,
    photo_id: item.photo_id || country.cover_photo_id || FALLBACK_PHOTOS[country.slug] || null,
    lat: item.lat,
    lng: item.lng,
    category: item.category || 'landmark',
    rank,
  };
}

function buildHighlights(country, limit) {
  const items = [];
  const seen = new Set();

  if (Array.isArray(country.top_places)) {
    for (const place of country.top_places) {
      const payload = placeToHighlight(place, country, items.length + 1);
      if (!payload || seen.has(payload.slug)) continue;
      seen.add(payload.slug);
      items.push(payload);
    }
  }

  for (const curated of CURATED_HIGHLIGHTS[country.slug] || []) {
    if (items.length >= limit) break;
    if (seen.has(curated.slug)) continue;
    seen.add(curated.slug);
    items.push(curatedToPayload(curated, country, items.length + 1));
  }

  return items.slice(0, limit).map((item, index) => ({ ...item, rank: index + 1 }));
}

function createSupabaseClient(requireServiceRole) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = requireServiceRole
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function insertImportLog(supabase, metadata) {
  const { data, error } = await supabase
    .from('external_import_logs')
    .insert({
      source: 'manual',
      entity_type: 'country_highlight',
      status: 'running',
      imported_count: 0,
      skipped_count: 0,
      metadata,
    })
    .select('id')
    .single();

  if (error) {
    console.warn(`Could not create import log: ${error.message}`);
    return null;
  }

  return data.id;
}

async function finishImportLog(supabase, id, status, importedCount, skippedCount, errorMessage) {
  if (!id) return;

  const { error } = await supabase
    .from('external_import_logs')
    .update({
      status,
      imported_count: importedCount,
      skipped_count: skippedCount,
      error: errorMessage,
      finished_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.warn(`Could not update import log: ${error.message}`);
  }
}

async function main() {
  loadEnvFile(path.join(__dirname, '..', '.env.local'));

  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const supabase = createSupabaseClient(args.apply);
  const { data: countries, error } = await supabase
    .from('countries')
    .select('id, slug, name_az, name_en, cover_photo_id, top_places')
    .in('slug', args.slugs);

  if (error) throw error;

  const bySlug = new Map((countries || []).map((country) => [country.slug, country]));
  const missing = args.slugs.filter((slug) => !bySlug.has(slug));
  const payloads = [];

  for (const slug of args.slugs) {
    const country = bySlug.get(slug);
    if (!country) continue;

    const highlights = buildHighlights(country, args.limit);
    payloads.push(...highlights);
    console.log(`${country.slug}: ${highlights.length} highlights prepared`);
    for (const item of highlights) {
      console.log(`  ${item.rank}. ${item.name} (${item.category})`);
    }
  }

  if (missing.length > 0) {
    console.warn(`Missing countries: ${missing.join(', ')}`);
  }

  console.log(`\nMode: ${args.apply ? 'apply' : 'dry-run'}`);
  console.log(`Total highlights: ${payloads.length}`);

  if (!args.apply) {
    console.log('\nRun with --apply to write these highlights to Supabase.');
    return;
  }

  const countryIds = countries.map((country) => country.id);
  const logId = await insertImportLog(supabase, {
    slugs: args.slugs,
    limit: args.limit,
    strategy: 'countries.top_places plus curated fallback',
  });

  try {
    const { error: deleteError } = await supabase
      .from('country_highlights')
      .delete()
      .in('country_id', countryIds);

    if (deleteError) throw deleteError;

    const { error: insertError } = await supabase
      .from('country_highlights')
      .insert(payloads);

    if (insertError) throw insertError;

    await finishImportLog(supabase, logId, 'success', payloads.length, 0, null);
    console.log(`\nInserted ${payloads.length} country highlights.`);
  } catch (error) {
    await finishImportLog(supabase, logId, 'failed', 0, payloads.length, error.message);
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
