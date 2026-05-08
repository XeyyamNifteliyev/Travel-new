#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
}

loadEnvFile(path.join(__dirname, '..', '.env.local'));

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const isDryRun = !process.argv.includes('--apply');

const EUROPEAN_CITIES = {
  albania: [
    { name_en: 'Tirana', name_az: 'Tirana', name_ru: 'Тирана', lat: 41.3275, lng: 19.8187, population: 420000 },
    { name_en: 'Saranda', name_az: 'Saranda', name_ru: 'Саранда', lat: 39.8763, lng: 20.0053, population: 42000 },
    { name_en: 'Berat', name_az: 'Berat', name_ru: 'Берат', lat: 40.7086, lng: 19.9436, population: 36000 },
  ],
  andorra: [
    { name_en: 'Andorra la Vella', name_az: 'Andorra la Vella', name_ru: 'Андорра-ла-Велья', lat: 42.5078, lng: 1.5211, population: 23000 },
    { name_en: 'Escaldes-Engordany', name_az: 'Escaldes-Engordany', name_ru: 'Эскальдес-Энгордань', lat: 42.5075, lng: 1.5344, population: 14000 },
    { name_en: 'Encamp', name_az: 'Encamp', name_ru: 'Энкам', lat: 42.5367, lng: 1.5831, population: 12000 },
  ],
  austria: [
    { name_en: 'Salzburg', name_az: 'Salzburg', name_ru: 'Зальцбург', lat: 47.8095, lng: 13.0550, population: 156000 },
    { name_en: 'Innsbruck', name_az: 'Innsbruck', name_ru: 'Инсбрук', lat: 47.2692, lng: 11.4041, population: 132000 },
    { name_en: 'Graz', name_az: 'Graz', name_ru: 'Грац', lat: 47.0707, lng: 15.4395, population: 290000 },
  ],
  belarus: [
    { name_en: 'Minsk', name_az: 'Minsk', name_ru: 'Минск', lat: 53.9006, lng: 27.5590, population: 1975000 },
    { name_en: 'Brest', name_az: 'Brest', name_ru: 'Брест', lat: 52.0976, lng: 23.7341, population: 350000 },
    { name_en: 'Grodno', name_az: 'Qrodno', name_ru: 'Гродно', lat: 53.6688, lng: 23.8217, population: 373000 },
  ],
  belgium: [
    { name_en: 'Brussels', name_az: 'Brüssel', name_ru: 'Брюссель', lat: 50.8503, lng: 4.3517, population: 1215000 },
    { name_en: 'Bruges', name_az: 'Brügge', name_ru: 'Брюгге', lat: 51.2093, lng: 3.2247, population: 118000 },
    { name_en: 'Antwerp', name_az: 'Antverpen', name_ru: 'Антверпен', lat: 51.2194, lng: 4.4025, population: 530000 },
  ],
  'bosnia-and-herzegovina': [
    { name_en: 'Sarajevo', name_az: 'Sarayevo', name_ru: 'Сараево', lat: 43.8563, lng: 18.4131, population: 275000 },
    { name_en: 'Mostar', name_az: 'Mostar', name_ru: 'Мостар', lat: 43.3438, lng: 17.8078, population: 105000 },
    { name_en: 'Banja Luka', name_az: 'Banya Luka', name_ru: 'Баня-Лука', lat: 44.7664, lng: 17.1916, population: 138000 },
  ],
  bulgaria: [
    { name_en: 'Sofia', name_az: 'Sofiya', name_ru: 'София', lat: 42.6977, lng: 23.3219, population: 1242000 },
    { name_en: 'Plovdiv', name_az: 'Plovdiv', name_ru: 'Пловдив', lat: 42.6977, lng: 23.3219, population: 346000 },
    { name_en: 'Varna', name_az: 'Varna', name_ru: 'Варна', lat: 43.2141, lng: 27.9147, population: 335000 },
  ],
  croatia: [
    { name_en: 'Zagreb', name_az: 'Zaqreb', name_ru: 'Загреб', lat: 45.8150, lng: 15.9819, population: 804000 },
    { name_en: 'Split', name_az: 'Split', name_ru: 'Сплит', lat: 43.5081, lng: 16.4402, population: 178000 },
  ],
  cyprus: [
    { name_en: 'Nicosia', name_az: 'Nikosiya', name_ru: 'Никосия', lat: 35.1856, lng: 33.3823, population: 330000 },
    { name_en: 'Limassol', name_az: 'Limassol', name_ru: 'Лимасол', lat: 34.6841, lng: 33.0431, population: 235000 },
    { name_en: 'Larnaca', name_az: 'Larnaka', name_ru: 'Ларнака', lat: 34.9229, lng: 33.6233, population: 145000 },
  ],
  'czech-republic': [
    { name_en: 'Brno', name_az: 'Brno', name_ru: 'Брно', lat: 49.1951, lng: 16.6068, population: 380000 },
    { name_en: 'Ostrava', name_az: 'Ostrava', name_ru: 'Острава', lat: 49.8348, lng: 18.2820, population: 290000 },
  ],
  denmark: [
    { name_en: 'Copenhagen', name_az: 'Kopenhagen', name_ru: 'Копенгаген', lat: 55.6761, lng: 12.5683, population: 794000 },
    { name_en: 'Aarhus', name_az: 'Orhus', name_ru: 'Орхус', lat: 56.1629, lng: 10.2039, population: 336000 },
    { name_en: 'Odense', name_az: 'Odense', name_ru: 'Оденсе', lat: 55.4038, lng: 10.4024, population: 205000 },
  ],
  estonia: [
    { name_en: 'Tallinn', name_az: 'Tallin', name_ru: 'Таллин', lat: 59.4370, lng: 24.7536, population: 450000 },
    { name_en: 'Tartu', name_az: 'Tartu', name_ru: 'Тарту', lat: 58.3780, lng: 26.7290, population: 97000 },
    { name_en: 'Parnu', name_az: 'Pärnu', name_ru: 'Пярну', lat: 58.3859, lng: 24.4971, population: 40000 },
  ],
  finland: [
    { name_en: 'Helsinki', name_az: 'Helsinki', name_ru: 'Хельсинки', lat: 60.1699, lng: 24.9384, population: 656000 },
    { name_en: 'Tampere', name_az: 'Tampere', name_ru: 'Тампере', lat: 61.4978, lng: 23.7610, population: 244000 },
    { name_en: 'Turku', name_az: 'Turku', name_ru: 'Турку', lat: 60.4518, lng: 22.2666, population: 195000 },
  ],
  france: [
    { name_en: 'Nice', name_az: 'Nitsa', name_ru: 'Ницца', lat: 43.7102, lng: 7.2620, population: 342000 },
    { name_en: 'Lyon', name_az: 'Lion', name_ru: 'Лион', lat: 45.7640, lng: 4.8357, population: 516000 },
    { name_en: 'Marseille', name_az: 'Marsel', name_ru: 'Марсель', lat: 43.2965, lng: 5.3698, population: 861000 },
  ],
  germany: [
    { name_en: 'Munich', name_az: 'Münhen', name_ru: 'Мюнхен', lat: 48.1351, lng: 11.5820, population: 1472000 },
    { name_en: 'Hamburg', name_az: 'Hamburg', name_ru: 'Гамбург', lat: 53.5511, lng: 9.9937, population: 1899000 },
    { name_en: 'Frankfurt', name_az: 'Frankfurt', name_ru: 'Франкфурт', lat: 50.1109, lng: 8.6821, population: 753000 },
  ],
  greece: [
    { name_en: 'Thessaloniki', name_az: 'Saloniki', name_ru: 'Салоники', lat: 40.6401, lng: 22.9444, population: 316000 },
    { name_en: 'Heraklion', name_az: 'Iraklion', name_ru: 'Ираклион', lat: 35.3387, lng: 25.1442, population: 177000 },
    { name_en: 'Santorini', name_az: 'Santorini', name_ru: 'Санторини', lat: 36.3932, lng: 25.4615, population: 15000 },
  ],
  hungary: [
    { name_en: 'Debrecen', name_az: 'Debretsen', name_ru: 'Дебрецен', lat: 47.5316, lng: 21.6273, population: 202000 },
    { name_en: 'Szeged', name_az: 'Seqed', name_ru: 'Сегед', lat: 46.2530, lng: 20.1414, population: 160000 },
  ],
  iceland: [
    { name_en: 'Reykjavik', name_az: 'Reykjavik', name_ru: 'Рейкьявик', lat: 64.1466, lng: -21.9426, population: 138000 },
    { name_en: 'Akureyri', name_az: 'Akureyri', name_ru: 'Акюрейри', lat: 65.6835, lng: -18.0878, population: 19000 },
    { name_en: 'Keflavik', name_az: 'Keflavik', name_ru: 'Кефлавик', lat: 63.9997, lng: -22.5558, population: 15000 },
  ],
  ireland: [
    { name_en: 'Dublin', name_az: 'Dublin', name_ru: 'Дублин', lat: 53.3498, lng: -6.2603, population: 554000 },
    { name_en: 'Cork', name_az: 'Kork', name_ru: 'Корк', lat: 51.8985, lng: -8.4756, population: 210000 },
    { name_en: 'Galway', name_az: 'Qolvey', name_ru: 'Голуэй', lat: 53.2707, lng: -9.0568, population: 83000 },
  ],
  italy: [
    { name_en: 'Milan', name_az: 'Milan', name_ru: 'Милан', lat: 45.4642, lng: 9.1900, population: 1378000 },
    { name_en: 'Venice', name_az: 'Venesiya', name_ru: 'Венеция', lat: 45.4408, lng: 12.3155, population: 260000 },
    { name_en: 'Florence', name_az: 'Florensiya', name_ru: 'Флоренция', lat: 43.7696, lng: 11.2558, population: 382000 },
  ],
  latvia: [
    { name_en: 'Riga', name_az: 'Riqa', name_ru: 'Рига', lat: 56.9496, lng: 24.1052, population: 605000 },
    { name_en: 'Jurmala', name_az: 'Yurmala', name_ru: 'Юрмала', lat: 56.9714, lng: 23.7891, population: 51000 },
    { name_en: 'Liepaja', name_az: 'Liyepaya', name_ru: 'Лиепая', lat: 56.5114, lng: 21.0147, population: 68000 },
  ],
  liechtenstein: [
    { name_en: 'Vaduz', name_az: 'Vaduz', name_ru: 'Вадуц', lat: 47.1410, lng: 9.5215, population: 5700 },
    { name_en: 'Schaan', name_az: 'Şaan', name_ru: 'Шан', lat: 47.1650, lng: 9.5111, population: 6000 },
    { name_en: 'Triesen', name_az: 'Trizen', name_ru: 'Тризен', lat: 47.1149, lng: 9.5253, population: 5200 },
  ],
  lithuania: [
    { name_en: 'Vilnius', name_az: 'Vilnyus', name_ru: 'Вильнюс', lat: 54.6872, lng: 25.2797, population: 587000 },
    { name_en: 'Kaunas', name_az: 'Kaunas', name_ru: 'Каунас', lat: 54.8985, lng: 23.9036, population: 289000 },
    { name_en: 'Klaipeda', name_az: 'Klaypeda', name_ru: 'Клайпеда', lat: 55.7033, lng: 21.1443, population: 152000 },
  ],
  luxembourg: [
    { name_en: 'Luxembourg City', name_az: 'Lüksemburg', name_ru: 'Люксембург', lat: 49.6117, lng: 6.1300, population: 124000 },
    { name_en: 'Esch-sur-Alzette', name_az: 'Eş-sur-Alzet', name_ru: 'Эш-сюр-Альзетт', lat: 49.4965, lng: 5.9866, population: 37000 },
    { name_en: 'Differdange', name_az: 'Differdanj', name_ru: 'Дифферданж', lat: 49.5226, lng: 5.8865, population: 28000 },
  ],
  malta: [
    { name_en: 'Valletta', name_az: 'Valetta', name_ru: 'Валлетта', lat: 35.8989, lng: 14.5146, population: 6400 },
    { name_en: 'Sliema', name_az: 'Sliema', name_ru: 'Слима', lat: 35.9120, lng: 14.5016, population: 26000 },
    { name_en: 'St. Julian', name_az: 'Sent-Culyen', name_ru: 'Сент-Джулианс', lat: 35.9254, lng: 14.4893, population: 12000 },
  ],
  moldova: [
    { name_en: 'Chisinau', name_az: 'Kişinyov', name_ru: 'Кишинёв', lat: 47.0105, lng: 28.8638, population: 535000 },
    { name_en: 'Balti', name_az: 'Beltsı', name_ru: 'Бельцы', lat: 47.7644, lng: 27.9241, population: 103000 },
    { name_en: 'Tiraspol', name_az: 'Tiraspol', name_ru: 'Тирасполь', lat: 46.8443, lng: 29.6248, population: 130000 },
  ],
  monaco: [
    { name_en: 'Monte Carlo', name_az: 'Monte Karlo', name_ru: 'Монте-Карло', lat: 43.7398, lng: 7.4273, population: 15000 },
    { name_en: 'La Condamine', name_az: 'La Kondamin', name_ru: 'Ла-Кондамин', lat: 43.7343, lng: 7.4214, population: 12000 },
    { name_en: 'Fontvieille', name_az: 'Fontviyel', name_ru: 'Фонвьей', lat: 43.7261, lng: 7.4156, population: 4000 },
  ],
  montenegro: [
    { name_en: 'Podgorica', name_az: 'Podqoritsa', name_ru: 'Подгорица', lat: 42.4304, lng: 19.2594, population: 150000 },
    { name_en: 'Kotor', name_az: 'Kotor', name_ru: 'Котор', lat: 42.4244, lng: 18.7712, population: 13000 },
    { name_en: 'Budva', name_az: 'Budva', name_ru: 'Будва', lat: 42.2868, lng: 18.8403, population: 19000 },
  ],
  netherlands: [
    { name_en: 'Rotterdam', name_az: 'Rotterdam', name_ru: 'Роттердам', lat: 51.9244, lng: 4.4777, population: 655000 },
    { name_en: 'The Hague', name_az: 'Haaqa', name_ru: 'Гаага', lat: 52.0705, lng: 4.3007, population: 548000 },
    { name_en: 'Utrecht', name_az: 'Utrext', name_ru: 'Утрехт', lat: 52.0907, lng: 5.1214, population: 361000 },
  ],
  'north-macedonia': [
    { name_en: 'Skopje', name_az: 'Skopye', name_ru: 'Скопье', lat: 41.9973, lng: 21.4280, population: 544000 },
    { name_en: 'Ohrid', name_az: 'Oxrid', name_ru: 'Охрид', lat: 41.1172, lng: 20.8019, population: 42000 },
    { name_en: 'Bitola', name_az: 'Bitola', name_ru: 'Битола', lat: 41.0309, lng: 21.3313, population: 74000 },
  ],
  norway: [
    { name_en: 'Oslo', name_az: 'Oslo', name_ru: 'Осло', lat: 59.9139, lng: 10.7522, population: 694000 },
    { name_en: 'Bergen', name_az: 'Berqen', name_ru: 'Берген', lat: 60.3913, lng: 5.3221, population: 284000 },
    { name_en: 'Tromso', name_az: 'Tromso', name_ru: 'Тромсё', lat: 69.6496, lng: 18.9560, population: 77000 },
  ],
  poland: [
    { name_en: 'Warsaw', name_az: 'Varşava', name_ru: 'Варшава', lat: 52.2297, lng: 21.0122, population: 1794000 },
    { name_en: 'Krakow', name_az: 'Krakov', name_ru: 'Краков', lat: 50.0647, lng: 19.9450, population: 804000 },
    { name_en: 'Gdansk', name_az: 'Qdansk', name_ru: 'Гданьск', lat: 54.3520, lng: 18.6466, population: 470000 },
  ],
  portugal: [
    { name_en: 'Porto', name_az: 'Porto', name_ru: 'Порту', lat: 41.1579, lng: -8.6291, population: 215000 },
    { name_en: 'Faro', name_az: 'Faru', name_ru: 'Фару', lat: 37.0179, lng: -7.9307, population: 65000 },
    { name_en: 'Funchal', name_az: 'Funşal', name_ru: 'Фуншал', lat: 32.6669, lng: -16.9241, population: 112000 },
  ],
  romania: [
    { name_en: 'Bucharest', name_az: 'Buxarest', name_ru: 'Бухарест', lat: 44.4268, lng: 26.1025, population: 1836000 },
    { name_en: 'Cluj-Napoca', name_az: 'Kluj-Napoka', name_ru: 'Клуж-Напока', lat: 46.7712, lng: 23.6236, population: 325000 },
    { name_en: 'Sibiu', name_az: 'Sibiu', name_ru: 'Сибиу', lat: 45.7983, lng: 24.1256, population: 147000 },
  ],
  russia: [
    { name_en: 'Saint Petersburg', name_az: 'Sankt-Peterburq', name_ru: 'Санкт-Петербург', lat: 59.9343, lng: 30.3351, population: 5384000 },
    { name_en: 'Kazan', name_az: 'Kazan', name_ru: 'Казань', lat: 55.7887, lng: 49.1221, population: 1257000 },
    { name_en: 'Sochi', name_az: 'Soçi', name_ru: 'Сочи', lat: 43.6028, lng: 39.7342, population: 443000 },
  ],
  'san-marino': [
    { name_en: 'San Marino', name_az: 'San-Marino', name_ru: 'Сан-Марино', lat: 43.9424, lng: 12.4578, population: 4000 },
    { name_en: 'Serravalle', name_az: 'Serravalle', name_ru: 'Серравалле', lat: 43.9724, lng: 12.4771, population: 11000 },
    { name_en: 'Borgo Maggiore', name_az: 'Borqo-Maccore', name_ru: 'Борго-Маджоре', lat: 43.9491, lng: 12.4480, population: 6600 },
  ],
  serbia: [
    { name_en: 'Belgrade', name_az: 'Belqrad', name_ru: 'Белград', lat: 44.7866, lng: 20.4489, population: 1375000 },
    { name_en: 'Novi Sad', name_az: 'Novi Sad', name_ru: 'Нови-Сад', lat: 45.2671, lng: 19.8335, population: 250000 },
    { name_en: 'Nis', name_az: 'Niş', name_ru: 'Ниш', lat: 43.3209, lng: 21.8954, population: 183000 },
  ],
  slovakia: [
    { name_en: 'Bratislava', name_az: 'Bratislava', name_ru: 'Братислава', lat: 48.1486, lng: 17.1077, population: 432000 },
    { name_en: 'Kosice', name_az: 'Koşitse', name_ru: 'Кошице', lat: 48.7164, lng: 21.2611, population: 239000 },
    { name_en: 'Zilina', name_az: 'Jilina', name_ru: 'Жилина', lat: 49.2232, lng: 18.7394, population: 81000 },
  ],
  slovenia: [
    { name_en: 'Ljubljana', name_az: 'Lyublyana', name_ru: 'Любляна', lat: 46.0569, lng: 14.5058, population: 296000 },
    { name_en: 'Bled', name_az: 'Bled', name_ru: 'Блед', lat: 46.3625, lng: 14.0939, population: 5200 },
    { name_en: 'Maribor', name_az: 'Maribor', name_ru: 'Марибор', lat: 46.5547, lng: 15.6459, population: 95000 },
  ],
  spain: [
    { name_en: 'Madrid', name_az: 'Madrid', name_ru: 'Мадрид', lat: 40.4168, lng: -3.7038, population: 3224000 },
    { name_en: 'Seville', name_az: 'Sevilya', name_ru: 'Севилья', lat: 37.3891, lng: -5.9845, population: 688000 },
    { name_en: 'Valencia', name_az: 'Valensiya', name_ru: 'Валенсия', lat: 39.4699, lng: -0.3763, population: 791000 },
  ],
  sweden: [
    { name_en: 'Stockholm', name_az: 'Stokholm', name_ru: 'Стокгольм', lat: 59.3293, lng: 18.0686, population: 975000 },
    { name_en: 'Gothenburg', name_az: 'Qoteborq', name_ru: 'Гётеборг', lat: 57.7089, lng: 11.9746, population: 583000 },
    { name_en: 'Malmo', name_az: 'Malmo', name_ru: 'Мальмё', lat: 55.6050, lng: 13.0038, population: 347000 },
  ],
  switzerland: [
    { name_en: 'Zurich', name_az: 'Sürix', name_ru: 'Цюрих', lat: 47.3769, lng: 8.5417, population: 435000 },
    { name_en: 'Geneva', name_az: 'Cenevrə', name_ru: 'Женева', lat: 46.2044, lng: 6.1432, population: 201000 },
    { name_en: 'Lucerne', name_az: 'Lüsern', name_ru: 'Люцерн', lat: 47.0502, lng: 8.3093, population: 82000 },
  ],
  turkey: [
    { name_en: 'Ankara', name_az: 'Ankara', name_ru: 'Анкара', lat: 39.9334, lng: 32.8597, population: 5663000 },
    { name_en: 'Izmir', name_az: 'İzmir', name_ru: 'Измир', lat: 38.4237, lng: 27.1428, population: 2948000 },
  ],
  ukraine: [
    { name_en: 'Kyiv', name_az: 'Kiyev', name_ru: 'Киев', lat: 50.4501, lng: 30.5234, population: 2962000 },
    { name_en: 'Lviv', name_az: 'Lvov', name_ru: 'Львов', lat: 49.8397, lng: 24.0297, population: 721000 },
    { name_en: 'Odesa', name_az: 'Odessa', name_ru: 'Одесса', lat: 46.4825, lng: 30.7233, population: 1011000 },
  ],
  uk: [
    { name_en: 'Edinburgh', name_az: 'Edinburq', name_ru: 'Эдинбург', lat: 55.9533, lng: -3.1883, population: 518000 },
    { name_en: 'Manchester', name_az: 'Mançester', name_ru: 'Манчестер', lat: 53.4808, lng: -2.2426, population: 547000 },
    { name_en: 'Liverpool', name_az: 'Liverpul', name_ru: 'Ливерпуль', lat: 53.4084, lng: -2.9916, population: 494000 },
  ],
  'vatican-city': [
    { name_en: 'Vatican City', name_az: 'Vatikan', name_ru: 'Ватикан', lat: 41.9029, lng: 12.4534, population: 800 },
  ],
};

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function main() {
  console.log(`\nEuropean Cities Seed - ${isDryRun ? 'DRY-RUN' : 'APPLY'} mode\n`);

  const { data: countries } = await supabase
    .from('countries')
    .select('id, slug, name_en')
    .eq('continent', 'europe')
    .order('name_en');

  const countryMap = {};
  countries?.forEach(c => { countryMap[c.slug] = c; });

  const { data: existingCities } = await supabase
    .from('cities')
    .select('slug, country_id');

  const existingSlugs = new Set(existingCities?.map(c => c.slug));

  let totalNew = 0;
  let totalSkipped = 0;
  const newCitySlugs = [];

  for (const [countrySlug, cities] of Object.entries(EUROPEAN_CITIES)) {
    const country = countryMap[countrySlug];
    if (!country) {
      console.log(`  SKIP ${countrySlug} - not found in DB`);
      continue;
    }

    for (const city of cities) {
      const slug = slugify(city.name_en);
      if (existingSlugs.has(slug)) {
        console.log(`  SKIP ${slug} - already exists`);
        totalSkipped++;
        continue;
      }

      totalNew++;
      newCitySlugs.push(slug);

      if (isDryRun) {
        console.log(`  [NEW] ${slug} - ${city.name_en} (${country.name_en})`);
      } else {
        const { error } = await supabase.from('cities').insert({
          slug,
          name_en: city.name_en,
          name_az: city.name_az || city.name_en,
          name_ru: city.name_ru || city.name_en,
          country_id: country.id,
          lat: city.lat,
          lng: city.lng,
          population: city.population,
          popular_rank: 999,
          is_featured: false,
        }, { ignoreDuplicates: true });

        if (error) {
          console.log(`  ERROR ${slug}: ${error.message}`);
        } else {
          console.log(`  INSERTED ${slug} - ${city.name_en} (${country.name_en})`);
        }
      }
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`  Mode: ${isDryRun ? 'DRY-RUN' : 'APPLY'}`);
  console.log(`  New cities: ${totalNew}`);
  console.log(`  Skipped (exist): ${totalSkipped}`);

  if (!isDryRun && newCitySlugs.length > 0) {
    console.log(`\nNew city slugs for food import:`);
    console.log(newCitySlugs.join(','));
  }
}

main().catch(console.error);
