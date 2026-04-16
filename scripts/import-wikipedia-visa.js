const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const COUNTRY_NAMES = {
  'Afghanistan': { az: 'Əfqanıstan', ru: 'Афганистан', flag: '🇦🇫' },
  'Albania': { az: 'Albaniya', ru: 'Албания', flag: '🇦🇱' },
  'Algeria': { az: 'Əlcəzair', ru: 'Алжир', flag: '🇩🇿' },
  'Andorra': { az: 'Andorra', ru: 'Андорра', flag: '🇦🇩' },
  'Angola': { az: 'Anqola', ru: 'Ангола', flag: '🇦🇴' },
  'Antigua and Barbuda': { az: 'Antiqua və Barbuda', ru: 'Антигуа и Барбуда', flag: '🇦🇬' },
  'Argentina': { az: 'Argentina', ru: 'Аргентина', flag: '🇦🇷' },
  'Armenia': { az: 'Ermənistan', ru: 'Армения', flag: '🇦🇲' },
  'Australia': { az: 'Avstraliya', ru: 'Австралия', flag: '🇦🇺' },
  'Austria': { az: 'Avstriya', ru: 'Австрия', flag: '🇦🇹' },
  'Bahamas': { az: 'Baham adaları', ru: 'Багамские острова', flag: '🇧🇸' },
  'Bahrain': { az: 'Bəhreyn', ru: 'Бахрейн', flag: '🇧🇭' },
  'Bangladesh': { az: 'Banqladeş', ru: 'Бангладеш', flag: '🇧🇩' },
  'Barbados': { az: 'Barbados', ru: 'Барбадос', flag: '🇧🇧' },
  'Belarus': { az: 'Belarus', ru: 'Беларусь', flag: '🇧🇾' },
  'Belgium': { az: 'Belçika', ru: 'Бельгия', flag: '🇧🇪' },
  'Belize': { az: 'Beliz', ru: 'Белиз', flag: '🇧🇿' },
  'Benin': { az: 'Benin', ru: 'Бенин', flag: '🇧🇯' },
  'Bhutan': { az: 'Butan', ru: 'Бутан', flag: '🇧🇹' },
  'Bolivia': { az: 'Boliviya', ru: 'Боливия', flag: '🇧🇴' },
  'Bosnia and Herzegovina': { az: 'Bosniya və Herseqovina', ru: 'Босния и Герцеговина', flag: '🇧🇦' },
  'Botswana': { az: 'Botsvana', ru: 'Ботсвана', flag: '🇧🇼' },
  'Brazil': { az: 'Braziliya', ru: 'Бразилия', flag: '🇧🇷' },
  'Brunei': { az: 'Bruney', ru: 'Бруней', flag: '🇧🇳' },
  'Bulgaria': { az: 'Bolqarıstan', ru: 'Болгария', flag: '🇧🇬' },
  'Burkina Faso': { az: 'Burkina Faso', ru: 'Буркина-Фасо', flag: '🇧🇫' },
  'Burundi': { az: 'Burundi', ru: 'Бурунди', flag: '🇧🇮' },
  'Cambodia': { az: 'Kamboca', ru: 'Камбоджа', flag: '🇰🇭' },
  'Cameroon': { az: 'Kamerun', ru: 'Камерун', flag: '🇨🇲' },
  'Canada': { az: 'Kanada', ru: 'Канада', flag: '🇨🇦' },
  'Cape Verde': { az: 'Kabo-Verde', ru: 'Кабо-Верде', flag: '🇨🇻' },
  'Central African Republic': { az: 'Mərkəzi Afrika Respublikası', ru: 'ЦАР', flag: '🇨🇫' },
  'Chad': { az: 'Çad', ru: 'Чад', flag: '🇹🇩' },
  'Chile': { az: 'Çili', ru: 'Чили', flag: '🇨🇱' },
  'China': { az: 'Çin', ru: 'Китай', flag: '🇨🇳' },
  'Colombia': { az: 'Kolumbiya', ru: 'Колумбия', flag: '🇨🇴' },
  'Comoros': { az: 'Komor adaları', ru: 'Коморские острова', flag: '🇰🇲' },
  'Republic of the Congo': { az: 'Konqo Respublikası', ru: 'Конго', flag: '🇨🇬' },
  'Democratic Republic of the Congo': { az: 'Konqo DR', ru: 'ДР Конго', flag: '🇨🇩' },
  'Costa Rica': { az: 'Kosta Rika', ru: 'Коста-Рика', flag: '🇨🇷' },
  'Croatia': { az: 'Xorvatiya', ru: 'Хорватия', flag: '🇭🇷' },
  'Cuba': { az: 'Kuba', ru: 'Куба', flag: '🇨🇺' },
  'Cyprus': { az: 'Kipr', ru: 'Кипр', flag: '🇨🇾' },
  'Czech Republic': { az: 'Çexiya', ru: 'Чехия', flag: '🇨🇿' },
  'Denmark': { az: 'Danimarka', ru: 'Дания', flag: '🇩🇰' },
  'Djibouti': { az: 'Cibuti', ru: 'Джибути', flag: '🇩🇯' },
  'Dominica': { az: 'Dominika', ru: 'Доминика', flag: '🇩🇲' },
  'Dominican Republic': { az: 'Dominikan Respublikası', ru: 'Доминиканская Республика', flag: '🇩🇴' },
  'Ecuador': { az: 'Ekvador', ru: 'Эквадор', flag: '🇪🇨' },
  'Egypt': { az: 'Misir', ru: 'Египет', flag: '🇪🇬' },
  'El Salvador': { az: 'Salvador', ru: 'Сальвадор', flag: '🇸🇻' },
  'Equatorial Guinea': { az: 'Ekvatorial Qvineya', ru: 'Экваториальная Гвинея', flag: '🇬🇶' },
  'Eritrea': { az: 'Eritreya', ru: 'Эритрея', flag: '🇪🇷' },
  'Estonia': { az: 'Estoniya', ru: 'Эстония', flag: '🇪🇪' },
  'Eswatini': { az: 'Esvatini', ru: 'Эсватини', flag: '🇸🇿' },
  'Ethiopia': { az: 'Efiopiya', ru: 'Эфиопия', flag: '🇪🇹' },
  'Fiji': { az: 'Fici', ru: 'Фиджи', flag: '🇫🇯' },
  'Finland': { az: 'Finlandiya', ru: 'Финляндия', flag: '🇫🇮' },
  'France': { az: 'Fransa', ru: 'Франция', flag: '🇫🇷' },
  'Gabon': { az: 'Qabon', ru: 'Габон', flag: '🇬🇦' },
  'Gambia': { az: 'Qambiya', ru: 'Гамбия', flag: '🇬🇲' },
  'Georgia': { az: 'Gürcüstan', ru: 'Грузия', flag: '🇬🇪' },
  'Germany': { az: 'Almaniya', ru: 'Германия', flag: '🇩🇪' },
  'Ghana': { az: 'Qana', ru: 'Гана', flag: '🇬🇭' },
  'Greece': { az: 'Yunanıstan', ru: 'Греция', flag: '🇬🇷' },
  'Grenada': { az: 'Qrenada', ru: 'Гренада', flag: '🇬🇩' },
  'Guatemala': { az: 'Qvatemala', ru: 'Гватемала', flag: '🇬🇹' },
  'Guinea': { az: 'Qvineya', ru: 'Гвинея', flag: '🇬🇳' },
  'Guinea-Bissau': { az: 'Qvineya-Bisau', ru: 'Гвинея-Бисау', flag: '🇬🇼' },
  'Guyana': { az: 'Qayana', ru: 'Гайана', flag: '🇬🇾' },
  'Haiti': { az: 'Haiti', ru: 'Гаити', flag: '🇭🇹' },
  'Honduras': { az: 'Honduras', ru: 'Гондурас', flag: '🇭🇳' },
  'Hungary': { az: 'Macarıstan', ru: 'Венгрия', flag: '🇭🇺' },
  'Iceland': { az: 'İslandiya', ru: 'Исландия', flag: '🇮🇸' },
  'India': { az: 'Hindistan', ru: 'Индия', flag: '🇮🇳' },
  'Indonesia': { az: 'İndoneziya', ru: 'Индонезия', flag: '🇮🇩' },
  'Iran': { az: 'İran', ru: 'Иран', flag: '🇮🇷' },
  'Iraq': { az: 'İraq', ru: 'Ирак', flag: '🇮🇶' },
  'Ireland': { az: 'İrlandiya', ru: 'Ирландия', flag: '🇮🇪' },
  'Israel': { az: 'İsrail', ru: 'Израиль', flag: '🇮🇱' },
  'Italy': { az: 'İtaliya', ru: 'Италия', flag: '🇮🇹' },
  'Jamaica': { az: 'Yamayka', ru: 'Ямайка', flag: '🇯🇲' },
  'Japan': { az: 'Yaponiya', ru: 'Япония', flag: '🇯🇵' },
  'Jordan': { az: 'İordaniya', ru: 'Иордания', flag: '🇯🇴' },
  'Kazakhstan': { az: 'Qazaxıstan', ru: 'Казахстан', flag: '🇰🇿' },
  'Kenya': { az: 'Keniya', ru: 'Кения', flag: '🇰🇪' },
  'Kiribati': { az: 'Kiribati', ru: 'Кирибати', flag: '🇰🇮' },
  'North Korea': { az: 'Şimali Koreya', ru: 'Северная Корея', flag: '🇰🇵' },
  'South Korea': { az: 'Cənubi Koreya', ru: 'Южная Корея', flag: '🇰🇷' },
  'Kuwait': { az: 'Küveyt', ru: 'Кувейт', flag: '🇰🇼' },
  'Kyrgyzstan': { az: 'Qırğızıstan', ru: 'Кыргызстан', flag: '🇰🇬' },
  'Laos': { az: 'Laos', ru: 'Лаос', flag: '🇱🇦' },
  'Latvia': { az: 'Latviya', ru: 'Латвия', flag: '🇱🇻' },
  'Lebanon': { az: 'Livan', ru: 'Ливан', flag: '🇱🇧' },
  'Lesotho': { az: 'Lesoto', ru: 'Лесото', flag: '🇱🇸' },
  'Liberia': { az: 'Liberiya', ru: 'Либерия', flag: '🇱🇷' },
  'Libya': { az: 'Liviya', ru: 'Ливия', flag: '🇱🇾' },
  'Liechtenstein': { az: 'Lixtenşteyn', ru: 'Лихтенштейн', flag: '🇱🇮' },
  'Lithuania': { az: 'Litva', ru: 'Литва', flag: '🇱🇹' },
  'Luxembourg': { az: 'Lüksemburq', ru: 'Люксембург', flag: '🇱🇺' },
  'Madagascar': { az: 'Madaqaskar', ru: 'Мадагаскар', flag: '🇲🇬' },
  'Malawi': { az: 'Malavi', ru: 'Малави', flag: '🇲🇼' },
  'Malaysia': { az: 'Malayziya', ru: 'Малайзия', flag: '🇲🇾' },
  'Maldives': { az: 'Maldiv adaları', ru: 'Мальдивские острова', flag: '🇲🇻' },
  'Mali': { az: 'Mali', ru: 'Мали', flag: '🇲🇱' },
  'Malta': { az: 'Malta', ru: 'Мальта', flag: '🇲🇹' },
  'Marshall Islands': { az: 'Marşal adaları', ru: 'Маршалловы острова', flag: '🇲🇭' },
  'Mauritania': { az: 'Mavritaniya', ru: 'Мавритания', flag: '🇲🇷' },
  'Mauritius': { az: 'Mavriki', ru: 'Маврикий', flag: '🇲🇺' },
  'Mexico': { az: 'Meksika', ru: 'Мексика', flag: '🇲🇽' },
  'Micronesia': { az: 'Mikroneziya', ru: 'Микронезия', flag: '🇫🇲' },
  'Moldova': { az: 'Moldova', ru: 'Молдова', flag: '🇲🇩' },
  'Monaco': { az: 'Monako', ru: 'Монако', flag: '🇲🇨' },
  'Mongolia': { az: 'Monqolustan', ru: 'Монголия', flag: '🇲🇳' },
  'Montenegro': { az: 'Monteneqro', ru: 'Черногория', flag: '🇲🇪' },
  'Morocco': { az: 'Mərakeş', ru: 'Марокко', flag: '🇲🇦' },
  'Mozambique': { az: 'Mozambik', ru: 'Мозамбик', flag: '🇲🇿' },
  'Myanmar': { az: 'Myanmar', ru: 'Мьянма', flag: '🇲🇲' },
  'Namibia': { az: 'Namibiya', ru: 'Намибия', flag: '🇳🇦' },
  'Nauru': { az: 'Nauru', ru: 'Науру', flag: '🇳🇷' },
  'Nepal': { az: 'Nepal', ru: 'Непал', flag: '🇳🇵' },
  'Netherlands': { az: 'Hollandiya', ru: 'Нидерланды', flag: '🇳🇱' },
  'New Zealand': { az: 'Yeni Zelandiya', ru: 'Новая Зеландия', flag: '🇳🇿' },
  'Nicaragua': { az: 'Nikaraqua', ru: 'Никарагуа', flag: '🇳🇮' },
  'Niger': { az: 'Niger', ru: 'Нигер', flag: '🇳🇪' },
  'Nigeria': { az: 'Nigeriya', ru: 'Нигерия', flag: '🇳🇬' },
  'North Macedonia': { az: 'Şimali Makedoniya', ru: 'Северная Македония', flag: '🇲🇰' },
  'Norway': { az: 'Norveç', ru: 'Норвегия', flag: '🇳🇴' },
  'Oman': { az: 'Oman', ru: 'Оман', flag: '🇴🇲' },
  'Pakistan': { az: 'Pakistan', ru: 'Пакистан', flag: '🇵🇰' },
  'Palau': { az: 'Palau', ru: 'Палау', flag: '🇵🇼' },
  'Palestine': { az: 'Fələstin', ru: 'Палестина', flag: '🇵🇸' },
  'Panama': { az: 'Panama', ru: 'Панама', flag: '🇵🇦' },
  'Papua New Guinea': { az: 'Papua-Yeni Qvineya', ru: 'Папуа-Новая Гвинея', flag: '🇵🇬' },
  'Paraguay': { az: 'Paraqvay', ru: 'Парагвай', flag: '🇵🇾' },
  'Peru': { az: 'Peru', ru: 'Перу', flag: '🇵🇪' },
  'Philippines': { az: 'Filippin', ru: 'Филиппины', flag: '🇵🇭' },
  'Poland': { az: 'Polşa', ru: 'Польша', flag: '🇵🇱' },
  'Portugal': { az: 'Portuqaliya', ru: 'Португалия', flag: '🇵🇹' },
  'Qatar': { az: 'Qətər', ru: 'Катар', flag: '🇶🇦' },
  'Romania': { az: 'Rumıniya', ru: 'Румыния', flag: '🇷🇴' },
  'Russia': { az: 'Rusiya', ru: 'Россия', flag: '🇷🇺' },
  'Rwanda': { az: 'Ruanda', ru: 'Руанда', flag: '🇷🇼' },
  'Saint Kitts and Nevis': { az: 'Sent-Kits və Nevis', ru: 'Сент-Китс и Невис', flag: '🇰🇳' },
  'Saint Lucia': { az: 'Sent-Lusiya', ru: 'Сент-Люсия', flag: '🇱🇨' },
  'Saint Vincent and the Grenadines': { az: 'Sent-Vinsent', ru: 'Сент-Винсент', flag: '🇻🇨' },
  'Samoa': { az: 'Samoa', ru: 'Самоа', flag: '🇼🇸' },
  'San Marino': { az: 'San-Marino', ru: 'Сан-Марино', flag: '🇸🇲' },
  'Sao Tome and Principe': { az: 'San-Tome və Prinsipi', ru: 'Сан-Томе и Принсипи', flag: '🇸🇹' },
  'Saudi Arabia': { az: 'Səudiyyə Ərəbistanı', ru: 'Саудовская Аравия', flag: '🇸🇦' },
  'Senegal': { az: 'Seneqal', ru: 'Сенегал', flag: '🇸🇳' },
  'Serbia': { az: 'Serbiya', ru: 'Сербия', flag: '🇷🇸' },
  'Seychelles': { az: 'Seyşel adaları', ru: 'Сейшельские острова', flag: '🇸🇨' },
  'Sierra Leone': { az: 'Syerra-Leone', ru: 'Сьерра-Леоне', flag: '🇸🇱' },
  'Singapore': { az: 'Sinqapur', ru: 'Сингапур', flag: '🇸🇬' },
  'Slovakia': { az: 'Slovakiya', ru: 'Словакия', flag: '🇸🇰' },
  'Slovenia': { az: 'Sloveniya', ru: 'Словения', flag: '🇸🇮' },
  'Solomon Islands': { az: 'Solomon adaları', ru: 'Соломоновы острова', flag: '🇸🇧' },
  'Somalia': { az: 'Somali', ru: 'Сомали', flag: '🇸🇴' },
  'South Africa': { az: 'Cənubi Afrika', ru: 'ЮАР', flag: '🇿🇦' },
  'South Sudan': { az: 'Cənubi Sudan', ru: 'Южный Судан', flag: '🇸🇸' },
  'Spain': { az: 'İspaniya', ru: 'Испания', flag: '🇪🇸' },
  'Sri Lanka': { az: 'Şri-Lanka', ru: 'Шри-Ланка', flag: '🇱🇰' },
  'Sudan': { az: 'Sudan', ru: 'Судан', flag: '🇸🇩' },
  'Suriname': { az: 'Surinam', ru: 'Суринам', flag: '🇸🇷' },
  'Sweden': { az: 'İsveç', ru: 'Швеция', flag: '🇸🇪' },
  'Switzerland': { az: 'İsveçrə', ru: 'Швейцария', flag: '🇨🇭' },
  'Syria': { az: 'Suriya', ru: 'Сирия', flag: '🇸🇾' },
  'Taiwan': { az: 'Tayvan', ru: 'Тайвань', flag: '🇹🇼' },
  'Tajikistan': { az: 'Tacikistan', ru: 'Таджикистан', flag: '🇹🇯' },
  'Tanzania': { az: 'Tanzaniya', ru: 'Танзания', flag: '🇹🇿' },
  'Thailand': { az: 'Tailand', ru: 'Таиланд', flag: '🇹🇭' },
  'Timor-Leste': { az: 'Timor-Leste', ru: 'Тимор-Лесте', flag: '🇹🇱' },
  'Togo': { az: 'Toqo', ru: 'Того', flag: '🇹🇬' },
  'Tonga': { az: 'Tonqa', ru: 'Тонга', flag: '🇹🇴' },
  'Trinidad and Tobago': { az: 'Trinidad və Tobaqo', ru: 'Тринидад и Тобаго', flag: '🇹🇹' },
  'Tunisia': { az: 'Tunis', ru: 'Тунис', flag: '🇹🇳' },
  'Turkey': { az: 'Türkiyə', ru: 'Турция', flag: '🇹🇷' },
  'Turkmenistan': { az: 'Türkmənistan', ru: 'Туркменистан', flag: '🇹🇲' },
  'Tuvalu': { az: 'Tuvalu', ru: 'Тувалу', flag: '🇹🇻' },
  'Uganda': { az: 'Uqanda', ru: 'Уганда', flag: '🇺🇬' },
  'Ukraine': { az: 'Ukrayna', ru: 'Украина', flag: '🇺🇦' },
  'United Arab Emirates': { az: 'BƏƏ', ru: 'ОАЭ', flag: '🇦🇪' },
  'United Kingdom': { az: 'Birləşmiş Krallıq', ru: 'Великобритания', flag: '🇬🇧' },
  'United States': { az: 'ABŞ', ru: 'США', flag: '🇺🇸' },
  'Uruguay': { az: 'Uruqvay', ru: 'Уругвай', flag: '🇺🇾' },
  'Uzbekistan': { az: 'Özbəkistan', ru: 'Узбекистан', flag: '🇺🇿' },
  'Vanuatu': { az: 'Vanuatu', ru: 'Вануату', flag: '🇻🇺' },
  'Vatican City': { az: 'Vatikan', ru: 'Ватикан', flag: '🇻🇦' },
  'Venezuela': { az: 'Venesuela', ru: 'Венесуэла', flag: '🇻🇪' },
  'Vietnam': { az: 'Vyetnam', ru: 'Вьетнам', flag: '🇻🇳' },
  'Yemen': { az: 'Yəmən', ru: 'Йемен', flag: '🇾🇪' },
  'Zambia': { az: 'Zambiya', ru: 'Замбия', flag: '🇿🇲' },
  'Zimbabwe': { az: 'Zimbabve', ru: 'Зимбабве', flag: '🇿🇼' },
  'Côte d\'Ivoire': { az: 'Kot-d\'İvuar', ru: 'Кот-д\'Ивуар', flag: '🇨🇮' },
  'Turkey': { az: 'Türkiyə', ru: 'Турция', flag: '🇹🇷' },
};

const EXISTING_SLUGS = {
  'Turkey': 'turkey',
  'Georgia': 'georgia',
  'United Arab Emirates': 'dubai',
  'Russia': 'russia',
  'Japan': 'japan',
  'Thailand': 'thailand',
  'Italy': 'italy',
  'France': 'france',
  'Iran': 'iran',
  'United Kingdom': 'uk',
};

function slugify(name) {
  if (EXISTING_SLUGS[name]) return EXISTING_SLUGS[name];
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function parseStayDays(text) {
  if (!text) return null;
  const match = text.match(/(\d+)\s*(?:days?|ay|дней|gün)/i);
  if (match) return parseInt(match[1]);
  if (/1 year|1 il|365/i.test(text)) return 365;
  if (/3 months?|3 ay|3 мес/i.test(text)) return 90;
  if (/6 months?|6 ay|6 мес/i.test(text)) return 180;
  if (/180/i.test(text)) return 180;
  if (/28/i.test(text)) return 28;
  if (/21/i.test(text)) return 21;
  if (/14/i.test(text)) return 14;
  if (/45/i.test(text)) return 45;
  if (/60/i.test(text)) return 60;
  return null;
}

function classifyVisa(requirementText) {
  if (!requirementText) return 'required';
  const t = requirementText.toLowerCase();
  if (/visa not required|visa-free|vizasız|без визы/i.test(t)) return 'not_required';
  if (/free visa on arrival/i.test(t)) return 'on_arrival';
  if (/evisa.*visa on arrival|visa on arrival.*evisa|e-voa/i.test(t)) return 'e_visa';
  if (/visa on arrival/i.test(t)) return 'on_arrival';
  if (/evisa|e-visa|electronic/i.test(t)) return 'e_visa';
  if (/electronic travel authorisation/i.test(t)) return 'e_visa';
  if (/online visa/i.test(t)) return 'e_visa';
  if (/special permit/i.test(t)) return 'required';
  if (/visa required/i.test(t)) return 'required';
  return 'required';
}

function escapeSql(str) {
  if (!str) return '';
  return str.replace(/'/g, "''").replace(/\n/g, ' ').trim();
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'TravelAZ/1.0 (travelaz.bot@gmail.com)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function lookupCountry(rawName) {
  if (COUNTRY_NAMES[rawName]) return { ...COUNTRY_NAMES[rawName], name_en: rawName };
  for (const [key, val] of Object.entries(COUNTRY_NAMES)) {
    if (key.includes(rawName) || rawName.includes(key.split(' ').pop())) {
      return { ...val, name_en: key };
    }
  }
  const fuzzyMap = {
    'and Barbuda': 'Antigua and Barbuda',
    'and Herzegovina': 'Bosnia and Herzegovina',
    'Faso': 'Burkina Faso',
    'Verde': 'Cape Verde',
    'African Republic': 'Central African Republic',
    'of the Congo': 'Republic of the Congo',
    'Rica': 'Costa Rica',
    "d'Ivoire": "Côte d'Ivoire",
    'Republic': 'Dominican Republic',
    'Salvador': 'El Salvador',
    'Korea': null,
    'Islands': null,
    'Zealand': 'New Zealand',
    'Macedonia': 'North Macedonia',
    'New Guinea': 'Papua New Guinea',
    'Kitts and Nevis': 'Saint Kitts and Nevis',
    'Lucia': 'Saint Lucia',
    'Vincent and the Grenadines': 'Saint Vincent and the Grenadines',
    'Marino': 'San Marino',
    'Tomé and Príncipe': 'Sao Tome and Principe',
    'Arabia': 'Saudi Arabia',
    'Leone': 'Sierra Leone',
    'Africa': 'South Africa',
    'Lanka': 'Sri Lanka',
    'and Tobago': 'Trinidad and Tobago',
    'Arab Emirates': 'United Arab Emirates',
    'Kingdom': 'United Kingdom',
    'States': 'United States',
    'City': 'Vatican City',
  };
  const mapped = fuzzyMap[rawName];
  if (mapped && COUNTRY_NAMES[mapped]) return { ...COUNTRY_NAMES[mapped], name_en: mapped };
  return null;
}

function parseWikipediaTable(html) {
  const countries = [];
  const seen = new Set();

  const tableMatch = html.match(/<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>([\s\S]*?)<\/table>/);
  if (!tableMatch) {
    console.log('Could not find wikitable.');
    return countries;
  }

  const tableHtml = tableMatch[0];
  const rowRegex = /<tr>\s*([\s\S]*?)<\/tr>/g;
  let rowMatch;

  while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
    const rowHtml = rowMatch[1];

    const cells = [];
    const cellRegex = /<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g;
    let cellMatch;
    while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
      let cellText = cellMatch[1]
        .replace(/<sup[^>]*>[\s\S]*?<\/sup>/g, '')
        .replace(/<span[^>]*>[\s\S]*?<\/span>/g, '')
        .replace(/<a[^>]*>([\s\S]*?)<\/a>/g, '$1')
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&#\d+;/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/\[note \d+\]/g, '')
        .replace(/\[\d+\]/g, '')
        .trim();
      cells.push(cellText);
    }

    if (cells.length < 2) continue;

    const countryName = cells[0].replace(/^\s*\S+\s+/, '').trim();

    if (!countryName || countryName === 'Country' || countryName === 'Territory') continue;

    const requirementText = cells[1] || '';
    const stayText = cells.length > 2 ? cells[2] : '';
    const notesText = cells.length > 3 ? cells[3] : '';

    let names = COUNTRY_NAMES[countryName];
    let resolvedName = countryName;
    if (!names) {
      const fuzzy = lookupCountry(countryName);
      if (fuzzy) {
        names = fuzzy;
        resolvedName = fuzzy.name_en;
      } else {
        console.log(`  SKIP (no mapping): ${countryName}`);
        continue;
      }
    }

    if (seen.has(resolvedName)) continue;
    seen.add(resolvedName);

    const visaType = classifyVisa(requirementText);
    const maxStay = parseStayDays(stayText);

    countries.push({
      name_en: resolvedName,
      name_az: names.az,
      name_ru: names.ru,
      flag: names.flag,
      slug: slugify(resolvedName),
      visaType,
      maxStay,
      notes_en: escapeSql(notesText.substring(0, 500)),
      requirementRaw: requirementText.trim(),
    });
  }

  return countries;
}

async function main() {
  console.log('Fetching Wikipedia page...');
  const url = 'https://en.wikipedia.org/wiki/Visa_requirements_for_Azerbaijani_citizens';
  const html = await fetchUrl(url);

  console.log(`Fetched ${html.length} bytes. Parsing...`);
  const countries = parseWikipediaTable(html);

  console.log(`Parsed ${countries.length} countries`);

  const counts = {};
  countries.forEach(c => { counts[c.visaType] = (counts[c.visaType] || 0) + 1; });
  console.log('By type:', counts);

  let sql = `-- Wikipedia Viza Məlumatları (Auto-generated)\n`;
  sql += `-- Mənbə: https://en.wikipedia.org/wiki/Visa_requirements_for_Azerbaijani_citizens\n`;
  sql += `-- Tarix: ${new Date().toISOString().split('T')[0]}\n`;
  sql += `-- Ölkə sayı: ${countries.length}\n\n`;

  sql += `-- Əvvəlki data-nı silməyin! Yalnız yeni ölkələr əlavə olunur.\n`;
  sql += `-- countries cədvəlinə yeni ölkələr əlavə et (mövcud olanları skip)\n\n`;

  const existingSlugs = new Set(Object.values(EXISTING_SLUGS));

  sql += `-- ===== COUNTRIES =====\n`;
  sql += `INSERT INTO countries (slug, name_az, name_ru, name_en, flag_emoji, description, best_time, avg_costs, popular_places)\n`;
  sql += `VALUES\n`;

  const newCountries = countries.filter(c => !existingSlugs.has(c.slug));
  const countryValues = newCountries.map(c => {
    const desc = c.name_en;
    return `  ('${c.slug}', '${escapeSql(c.name_az)}', '${escapeSql(c.name_ru)}', '${escapeSql(c.name_en)}', '${c.flag}', '${escapeSql(desc)}', '', '{"flight":"","hotel":"","daily":""}', '{}')`;
  });
  sql += countryValues.join(',\n');
  sql += `\nON CONFLICT (slug) DO NOTHING;\n\n`;

  sql += `-- ===== VISA INFO =====\n`;

  countries.forEach(c => {
    const notesAz = escapeSql(c.notes_en);
    const notesEn = c.notes_en;
    const notesRu = '';

    sql += `INSERT INTO visa_info (country_id, requirement_type, processing_time, documents, notes_az, notes_en, notes_ru, fee_usd, fee_azn, processing_days_min, processing_days_max, validity_days, max_stay_days, is_evisa, official_url, last_verified_at, data_confidence)\n`;
    sql += `SELECT id, '${c.visaType}', '-', '{}', '${notesAz}', '${escapeSql(notesEn)}', '${escapeSql(notesRu)}', NULL, NULL, NULL, NULL, NULL, ${c.maxStay || 'NULL'}, ${c.visaType === 'e_visa' ? 'true' : 'false'}, 'https://en.wikipedia.org/wiki/Visa_requirements_for_Azerbaijani_citizens', NOW(), 70\n`;
    sql += `FROM countries WHERE slug = '${c.slug}'\n`;
    sql += `ON CONFLICT DO NOTHING;\n\n`;
  });

  const outPath = path.join(__dirname, '..', 'supabase', 'migrations', '011_wikipedia_visa_seed.sql');
  fs.writeFileSync(outPath, sql, 'utf8');
  console.log(`\nSQL written to: ${outPath}`);
  console.log(`Total countries: ${countries.length} (new: ${newCountries.length}, existing: ${countries.length - newCountries.length})`);

  const summaryPath = path.join(__dirname, '..', 'supabase', 'migrations', '011_summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify({ total: countries.length, newCountries: newCountries.length, byType: counts, countries: countries.map(c => ({ slug: c.slug, name: c.name_en, visa: c.visaType, stay: c.maxStay })) }, null, 2), 'utf8');
  console.log(`Summary written to: ${summaryPath}`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
