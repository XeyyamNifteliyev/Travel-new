const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const APPLY = process.argv.includes('--apply');
const SEED_EMAIL_DOMAIN = 'travelaz.local';
const PASSWORD = 'TravelAZ-demo-2026!';

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

function isoDate(offsetDays) {
  const date = new Date();
  date.setUTCHours(9, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function timestamp(daysAgo, hour = 9, minute = 20) {
  const date = new Date();
  date.setUTCHours(hour, minute, 0, 0);
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString();
}

const PEOPLE = [
  { key: 'leyla', name: 'Leyla Məmmədova', gender: 'female' },
  { key: 'murad', name: 'Murad Əliyev', gender: 'male' },
  { key: 'nigar', name: 'Nigar Həsənli', gender: 'female' },
  { key: 'ramin', name: 'Ramin Quliyev', gender: 'male' },
  { key: 'aydan', name: 'Aydan Kərimli', gender: 'female' },
  { key: 'elvin', name: 'Elvin Rzayev', gender: 'male' },
  { key: 'sabin', name: 'Sabina İsmayılova', gender: 'female' },
  { key: 'tural', name: 'Tural Abbasov', gender: 'male' },
  { key: 'gunel', name: 'Günel Orucova', gender: 'female' },
  { key: 'farid', name: 'Fərid Nəcəfov', gender: 'male' },
  { key: 'narmin', name: 'Nərmin Əliyeva', gender: 'female' },
  { key: 'orkhan', name: 'Orxan Səfərov', gender: 'male' },
  { key: 'zarifa', name: 'Zərifə Mustafayeva', gender: 'female' },
  { key: 'kamran', name: 'Kamran Vəliyev', gender: 'male' },
  { key: 'sevinc', name: 'Sevinc Hüseynova', gender: 'female' },
];

const COMPANIONS = [
  {
    person: 'leyla',
    destination_country: 'Türkiyə',
    destination_city: 'İstanbul',
    departure_date: isoDate(18),
    return_date: isoDate(23),
    gender_preference: 'female',
    age_min: 24,
    age_max: 34,
    interests: ['Tarix', 'Fotoqrafiya', 'Kafe', 'Muzey'],
    languages: ['az', 'tr', 'en'],
    description: 'İstanbulda 5 günlük sakit və dolu proqram planlayıram: Balat, Qalata, Kadıköy, muzeylər və axşam Boğaz gəzintisi. Foto çəkməyi sevən, vaxt planına hörmət edən səyahət yoldaşı axtarıram.',
    created_at: timestamp(1, 18, 35),
  },
  {
    person: 'murad',
    destination_country: 'Gürcüstan',
    destination_city: 'Tbilisi',
    departure_date: isoDate(10),
    return_date: isoDate(13),
    gender_preference: 'any',
    age_min: 22,
    age_max: 38,
    interests: ['Şəhər gəzintisi', 'Qastro', 'Şərab', 'Tarix'],
    languages: ['az', 'en', 'ru'],
    description: 'Tbilisiyə qısa həftəsonu səfəri edirəm. Köhnə şəhər, Mtatsminda, yerli yeməklər və bir günlük Mtsxeta planı var. Xərcləri paylaşmaq və rahat tempdə gəzmək istəyən biri qoşula bilər.',
    created_at: timestamp(3, 11, 10),
  },
  {
    person: 'nigar',
    destination_country: 'Fransa',
    destination_city: 'Paris',
    departure_date: isoDate(35),
    return_date: isoDate(42),
    gender_preference: 'female',
    age_min: 25,
    age_max: 40,
    interests: ['Muzey', 'Memarlıq', 'Moda', 'Kafe'],
    languages: ['az', 'en'],
    description: 'Paris səfərimdə Louvre, Orsay, Montmartre və Seine boyunca rahat gəzinti planlayıram. Əsas məqsəd tələsmədən şəhəri yaşamaqdır; muzey və kafe marşrutlarına maraqlı xanım yoldaş axtarıram.',
    created_at: timestamp(5, 20, 5),
  },
  {
    person: 'ramin',
    destination_country: 'İtaliya',
    destination_city: 'Roma',
    departure_date: isoDate(28),
    return_date: isoDate(34),
    gender_preference: 'any',
    age_min: 23,
    age_max: 37,
    interests: ['Tarix', 'Mətbəx', 'Gəzinti', 'Muzey'],
    languages: ['az', 'en', 'tr'],
    description: 'Roma üçün 6 günlük plan qurmuşam: Kolizey, Vatikan, Trastevere və bir gün Florensiya ehtimalı. Tarix və italyan mətbəxinə marağı olan, məsuliyyətli səyahət yoldaşı axtarıram.',
    created_at: timestamp(7, 9, 45),
  },
  {
    person: 'aydan',
    destination_country: 'BƏƏ',
    destination_city: 'Dubai',
    departure_date: isoDate(14),
    return_date: isoDate(19),
    gender_preference: 'female',
    age_min: 24,
    age_max: 35,
    interests: ['Shopping', 'Şəhər', 'Restoran', 'Fotoqrafiya'],
    languages: ['az', 'en', 'ru'],
    description: 'Dubaya 5 günlük səfər üçün yoldaş axtarıram. Marina, Downtown, Miracle Garden, desert safari və bir neçə yaxşı restoran planımdadır. Planlı, pozitiv və rahat ünsiyyətli biri olsa super olar.',
    created_at: timestamp(9, 16, 20),
  },
  {
    person: 'elvin',
    destination_country: 'Yaponiya',
    destination_city: 'Tokio',
    departure_date: isoDate(62),
    return_date: isoDate(73),
    gender_preference: 'any',
    age_min: 25,
    age_max: 42,
    interests: ['Texnologiya', 'Anime', 'Mədəniyyət', 'Küçə yeməkləri'],
    languages: ['az', 'en'],
    description: 'Tokio və Kyoto üçün 11 günlük marşrut hazırlayıram. Şibuya, Akihabara, Asakusa, Fushimi Inari və bir neçə yerli food spot planımdadır. Uzun uçuş və şəhər içi planı bölüşmək üçün yoldaş axtarıram.',
    created_at: timestamp(12, 10, 15),
  },
  {
    person: 'sabin',
    destination_country: 'Tailand',
    destination_city: 'Bangkok və Phuket',
    departure_date: isoDate(48),
    return_date: isoDate(58),
    gender_preference: 'female',
    age_min: 24,
    age_max: 39,
    interests: ['Dəniz', 'Spa', 'Qastro', 'Bazarlar'],
    languages: ['az', 'en', 'ru'],
    description: 'Bangkokda 3 gün, Phuketdə 7 gün qalmağı düşünürəm. Həm şəhər, həm dəniz istirahəti olsun istəyirəm. Təhlükəsiz, büdcəni əvvəlcədən danışan və sakit səyahət edən xanım yoldaş axtarıram.',
    created_at: timestamp(15, 13, 50),
  },
  {
    person: 'tural',
    destination_country: 'İspaniya',
    destination_city: 'Barselona',
    departure_date: isoDate(39),
    return_date: isoDate(45),
    gender_preference: 'any',
    age_min: 23,
    age_max: 36,
    interests: ['Memarlıq', 'Dəniz', 'Futbol', 'Tapas'],
    languages: ['az', 'en', 'tr'],
    description: 'Barselona üçün Gaudi marşrutu, Gothic Quarter, Camp Nou turu və bir gün Girona planı var. Aktiv gəzməyi sevən, səhər tezdən yola çıxmağa problem etməyən yoldaş axtarıram.',
    created_at: timestamp(18, 19, 25),
  },
  {
    person: 'gunel',
    destination_country: 'Çexiya',
    destination_city: 'Praqa',
    departure_date: isoDate(25),
    return_date: isoDate(30),
    gender_preference: 'female',
    age_min: 24,
    age_max: 36,
    interests: ['Tarix', 'Fotoqrafiya', 'Kafe', 'Memarlıq'],
    languages: ['az', 'en', 'ru'],
    description: 'Praqada 5 gün qalacağam. Charles Bridge, Old Town, qala kompleksi və sakit kafe marşrutları maraqlıdır. Foto və şəhər atmosferini sevən xanım yoldaş olsa, plan daha maraqlı alınar.',
    created_at: timestamp(21, 8, 30),
  },
  {
    person: 'farid',
    destination_country: 'Almaniya',
    destination_city: 'Berlin',
    departure_date: isoDate(31),
    return_date: isoDate(37),
    gender_preference: 'any',
    age_min: 25,
    age_max: 45,
    interests: ['Muzey', 'Tarix', 'Startup', 'Küçə sənəti'],
    languages: ['az', 'en'],
    description: 'Berlinə iş və səyahət qarışıq gedirəm. Günün bir hissəsi sərbəst olacaq: muzey adası, Kreuzberg, Berlin Wall memorial və yerli kafelər planımdadır. Sakit, müstəqil və planlı yoldaş axtarıram.',
    created_at: timestamp(26, 15, 5),
  },
  {
    person: 'narmin',
    destination_country: 'Macarıstan',
    destination_city: 'Budapeşt',
    departure_date: isoDate(20),
    return_date: isoDate(24),
    gender_preference: 'female',
    age_min: 22,
    age_max: 34,
    interests: ['Termal hamam', 'Şəhər', 'Fotoqrafiya', 'Qastro'],
    languages: ['az', 'en', 'ru'],
    description: 'Budapeştə 4 günlük ucuz və rahat səfər planlayıram. Parlament binası, Fisherman’s Bastion, termal hamam və Dunay sahili əsas marşrutdur. Xərcləri paylaşmaq istəyən xanım yoldaş axtarıram.',
    created_at: timestamp(31, 12, 40),
  },
  {
    person: 'orkhan',
    destination_country: 'Niderland',
    destination_city: 'Amsterdam',
    departure_date: isoDate(52),
    return_date: isoDate(57),
    gender_preference: 'any',
    age_min: 24,
    age_max: 39,
    interests: ['Muzey', 'Velosiped', 'Kanallar', 'Fotoqrafiya'],
    languages: ['az', 'en'],
    description: 'Amsterdamda kanallar, Van Gogh Museum, Rijksmuseum və Zaanse Schans üçün 5 günlük plan var. Velosipedlə şəhər gəzməyə maraqlı, vaxtında hərəkət edən səyahət yoldaşı axtarıram.',
    created_at: timestamp(38, 18, 10),
  },
  {
    person: 'zarifa',
    destination_country: 'Qatar',
    destination_city: 'Doha',
    departure_date: isoDate(16),
    return_date: isoDate(20),
    gender_preference: 'female',
    age_min: 24,
    age_max: 38,
    interests: ['Muzey', 'Memarlıq', 'Restoran', 'Shopping'],
    languages: ['az', 'en', 'ru'],
    description: 'Dohaya qısa səfər planlayıram: Souq Waqif, Museum of Islamic Art, West Bay və Lusail tərəfi. Səliqəli plan, rahat temp və təhlükəsiz səyahət mənim üçün önəmlidir.',
    created_at: timestamp(43, 9, 15),
  },
  {
    person: 'kamran',
    destination_country: 'Misir',
    destination_city: 'Qahirə',
    departure_date: isoDate(44),
    return_date: isoDate(50),
    gender_preference: 'any',
    age_min: 25,
    age_max: 45,
    interests: ['Tarix', 'Muzey', 'Fotoqrafiya', 'Ekskursiya'],
    languages: ['az', 'en', 'ru'],
    description: 'Qahirə və piramidalar üçün 6 günlük səfər planlayıram. Giza, Egyptian Museum və Nil kənarı gəzintisi əsasdır. Bələdçili turları bölüşmək və xərcləri azaltmaq üçün yoldaş axtarıram.',
    created_at: timestamp(50, 14, 0),
  },
  {
    person: 'sevinc',
    destination_country: 'Yunanıstan',
    destination_city: 'Afina və Santorini',
    departure_date: isoDate(68),
    return_date: isoDate(76),
    gender_preference: 'female',
    age_min: 25,
    age_max: 40,
    interests: ['Dəniz', 'Tarix', 'Fotoqrafiya', 'Ada'],
    languages: ['az', 'en', 'tr'],
    description: 'Afina və Santorini üçün 8 günlük yay planı qururam. Akropol, Plaka, ada gün batımı və rahat dəniz proqramı istəyirəm. Foto və sakit istirahəti sevən xanım yoldaş axtarıram.',
    created_at: timestamp(57, 17, 45),
  },
];

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL və SUPABASE_SERVICE_ROLE_KEY lazımdır.');
  process.exit(1);
}

async function findUserByEmail(supabase, email) {
  let page = 1;
  while (page < 20) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;
    const user = data.users.find((item) => item.email === email);
    if (user) return user;
    if (data.users.length < 100) return null;
    page += 1;
  }
  return null;
}

async function ensureSeedUser(supabase, person) {
  const email = `${person.key}@${SEED_EMAIL_DOMAIN}`;
  const existing = await findUserByEmail(supabase, email);
  const user = existing || (await supabase.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { name: person.name, seed: 'professional-companions' },
  })).data.user;

  if (!user?.id) throw new Error(`User yaratmaq mümkün olmadı: ${email}`);

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      name: person.name,
      avatar_url: null,
      bio: 'TravelAZ demo səyahətçi profili',
      updated_at: new Date().toISOString(),
    });

  if (error) throw error;
  return user.id;
}

async function main() {
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const peopleByKey = new Map();

  if (APPLY) {
    for (const person of PEOPLE) {
      const id = await ensureSeedUser(supabase, person);
      peopleByKey.set(person.key, { ...person, id });
    }

    const seedUserIds = [...peopleByKey.values()].map((person) => person.id);
    const { error: deleteError } = await supabase
      .from('companions')
      .delete()
      .in('user_id', seedUserIds);

    if (deleteError) throw deleteError;

    const { error: cleanupError } = await supabase
      .from('companions')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .or('destination_city.eq.Vebesita,destination_city.eq.Baki');

    if (cleanupError) throw cleanupError;

    const rows = COMPANIONS.map((item) => {
      const person = peopleByKey.get(item.person);
      return {
        user_id: person.id,
        destination_country: item.destination_country,
        destination_city: item.destination_city,
        departure_date: item.departure_date,
        return_date: item.return_date,
        gender_preference: item.gender_preference,
        gender: person.gender,
        age_min: item.age_min,
        age_max: item.age_max,
        interests: item.interests,
        languages: item.languages,
        description: item.description,
        status: 'open',
        created_at: item.created_at,
        updated_at: item.created_at,
      };
    });

    const { error: insertError } = await supabase.from('companions').insert(rows);
    if (insertError) throw insertError;
  }

  console.log(JSON.stringify({
    apply: APPLY,
    companions: COMPANIONS.length,
    dateRange: {
      newestCreatedAt: COMPANIONS[0].created_at,
      oldestCreatedAt: COMPANIONS[COMPANIONS.length - 1].created_at,
    },
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
