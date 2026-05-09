export function getUnsplashUrl(
  photoId: string,
  options: {
    w?: number;
    h?: number;
    q?: number;
    fit?: string;
  } = {}
): string {
  const { w = 800, h, q = 75, fit = 'crop' } = options;
  const safePhotoId = isUsableUnsplashPhotoRef(photoId) ? photoId : getDeterministicTravelPhotoId(photoId || 'travel');
  const params = new URLSearchParams({
    w: String(w),
    q: String(q),
    fit,
    auto: 'format',
    ...(h ? { h: String(h) } : {}),
  });

  if (safePhotoId.startsWith('https://upload.wikimedia.org/')) {
    return safePhotoId;
  }

  if (safePhotoId.startsWith('https://images.pexels.com/')) {
    const url = new URL(safePhotoId);
    url.searchParams.set('auto', 'compress');
    url.searchParams.set('cs', 'tinysrgb');
    url.searchParams.set('w', String(w));
    if (h) url.searchParams.set('h', String(h));
    return url.toString();
  }

  if (safePhotoId.startsWith('https://images.unsplash.com/')) {
    const url = new URL(safePhotoId);
    for (const [key, value] of params.entries()) {
      url.searchParams.set(key, value);
    }
    return url.toString();
  }

  return `https://images.unsplash.com/photo-${safePhotoId}?${params}`;
}

const COUNTRY_COVER_PHOTOS: Record<string, string> = {
  turkey: '1524231757912-21f4fe3a7200',
  dubai: '1512453979798-5ea266f8880c',
  uae: '1512453979798-5ea266f8880c',
  france: '1502602898657-3e91760cbb34',
  italy: '1529156069898-49953e39b3ac',
  spain: '1583422409516-2895a77efded',
  japan: '1493976040374-85c8e12f0c0e',
  germany: '1467269204594-9661b134dd2b',
  thailand: '1528181304800-259b08848526',
  greece: '1570077188670-e3a8d69ac5ff',
  georgia: '1565008576549-57569a49371d',
  russia: '1513326738677-b964603b136d',
  iran: 'https://images.unsplash.com/photo-1771090848226-d135eff12bff',
  uk: '1513635269975-59663e0ac1ad',
  netherlands: '1512470876302-972faa2aa9a4',
  portugal: 'https://images.pexels.com/photos/10870570/pexels-photo-10870570.jpeg',
  maldives: '1573843981267-be1999ff37cd',
  bali: '1537996194471-e657df975ab4',
  morocco: '1539020140153-e8c237112e53',
  canada: '1503614472-8c93d56cd587',
  australia: '1506973035872-a4ec16b8e8d9',
  brazil: '1483729558449-99ef09a8c325',
  india: '1548013146-72479768bada',
  'south-korea': 'https://images.unsplash.com/photo-1759476890696-a5f2d9c9c4d0',
  china: '1508804185872-d7badc2832b8',
  singapore: '1525625293386-3f8f99389edd',
  switzerland: '1530122037265-a5f1f91d3b99',
  norway: '1520769669658-f07657f5a5f1',
  iceland: '1504829857797-ddff29c27927',
  mexico: '1518638150340-f706e86654de',
  'czech-republic': '1541849546-216549ae216d',
  austria: '1516550893923-42d28e5677af',
  'new-zealand': 'https://images.unsplash.com/photo-1764092181201-8b5f0ad7f5cb',
  indonesia: '1537996194471-e657df975ab4',
  azerbaijan: 'https://images.unsplash.com/photo-1746731628578-06cd8f286ab9',
  croatia: '1500530855697-b586d89ba3ee',
  egypt: '1503177119275-0aa32b3a9368',
  malaysia: '1508964942454-1a56651d54ac',
  'united-states': '1485738422979-f5c462d49f74',
  hungary: '1565426873118-a17ed65d74b9',
  belgium: '1491557345352-5929e343eb89',
  denmark: '1513622470522-26c3c8a854bc',
  finland: '1536246779975-97c4f8f8f1f5',
  poland: '1519197924294-4ba991a11128',
  qatar: '1558959356-2f0855c4f2a4',
  'saudi-arabia': '1584551246679-0daf3d275d0f',
};

const TRAVEL_FALLBACK_PHOTOS = [
  '1500530855697-b586d89ba3ee',
  '1506905925346-21bda4d32df4',
  '1507525428034-b723cf961d3e',
  '1501785888041-af3ef285b470',
  '1516483638261-f4dbaf036963',
  '1526772662000-3f88f10405ff',
  '1476514525535-07fb3b4ae5f1',
  '1500534314209-a25ddb2bd429',
  '1488646953014-85cb44e25828',
  '1470770841072-f978cf4d019e',
  '1493246507139-91e8fad9978e',
];

const GENERIC_TRAVEL_PHOTO = TRAVEL_FALLBACK_PHOTOS[0];

const KNOWN_BAD_UNSPLASH_REFS = new Set([
  '1524231757913-4be64b2825c7',
  '1502602915149-bb4f5dc63d43',
  '1499856562261-6a300a60f98b',
  '1516483107680-cf12f4bb3a06',
  '1517154421193-b0a7ca31be6f',
  '1498655324562-7815a786a20b',
  '1534430476280-2e5af087efd2',
  '1469854523086-cc02d5ab4582',
  '1555881772637-7aedc0a7a35b',
  'https://images.unsplash.com/photo-1753133661886-7e8a93e2d64e',
]);

function isUsableUnsplashPhotoRef(photoId?: string | null): photoId is string {
  if (!photoId) return false;
  if (KNOWN_BAD_UNSPLASH_REFS.has(photoId)) return false;
  if (photoId.startsWith('https://upload.wikimedia.org/')) return true;
  if (photoId.startsWith('https://images.unsplash.com/photo-')) return true;
  if (photoId.startsWith('https://images.pexels.com/photos/')) return true;
  // Standard Unsplash IDs: photo-TIMESTAMP-PHOTOID (e.g. photo-1502602898657-3e91760cbb34)
  return /^\d{8,}-[a-zA-Z0-9_-]+$/.test(photoId);
}

function getDeterministicTravelPhotoId(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return TRAVEL_FALLBACK_PHOTOS[hash % TRAVEL_FALLBACK_PHOTOS.length];
}

export function getCountryCoverPhotoId(slug: string, fallback?: string | null): string {
  if (isUsableUnsplashPhotoRef(fallback)) return fallback;
  if (isUsableUnsplashPhotoRef(COUNTRY_COVER_PHOTOS[slug])) return COUNTRY_COVER_PHOTOS[slug];
  return getDeterministicTravelPhotoId(slug);
}

const CITY_COVER_PHOTOS: Record<string, string> = {
  istanbul: '1524231757912-21f4fe3a7200',
  dubai: '1512453979798-5ea266f8880c',
  tbilisi: '1565008576549-57569a49371d',
  tokyo: '1493976040374-85c8e12f0c0e',
  paris: '1502602898657-3e91760cbb34',
  rome: '1529156069898-49953e39b3ac',
  baku: 'https://images.unsplash.com/photo-1746731628578-06cd8f286ab9',
  london: '1513635269975-59663e0ac1ad',
  barcelona: '1583422409516-2895a77efded',
  berlin: '1467269204594-9661b134dd2b',
  amsterdam: '1512470876302-972faa2aa9a4',
  vienna: '1516550893923-42d28e5677af',
  prague: '1541849546-216549ae216d',
  budapest: '1565426873118-a17ed65d74b9',
  singapore: '1525625293386-3f8f99389edd',
  seoul: 'https://images.unsplash.com/photo-1759476890696-a5f2d9c9c4d0',
  'kuala-lumpur': '1508964942454-1a56651d54ac',
  cairo: '1503177119275-0aa32b3a9368',
  'new-york': '1485738422979-f5c462d49f74',
  athens: '1570077188670-e3a8d69ac5ff',
  lisbon: 'https://images.pexels.com/photos/10870570/pexels-photo-10870570.jpeg',
  antalya: 'https://images.pexels.com/photos/25538213/pexels-photo-25538213.jpeg',
  dubrovnik: '1500530855697-b586d89ba3ee',
  bangkok: '1528181304800-259b08848526',
  tehran: 'https://images.unsplash.com/photo-1771090848226-d135eff12bff',
  moscow: '1513326738677-b964603b136d',
};

export function getCityCoverPhotoId(slug: string, fallback?: string | null): string {
  if (isUsableUnsplashPhotoRef(fallback)) return fallback;
  if (isUsableUnsplashPhotoRef(CITY_COVER_PHOTOS[slug])) return CITY_COVER_PHOTOS[slug];
  return getDeterministicTravelPhotoId(slug);
}

const SLUG_TO_ISO: Record<string, string> = {
  afghanistan: 'af', albania: 'al', algeria: 'dz', andorra: 'ad', angola: 'ao',
  'antigua-and-barbuda': 'ag', argentina: 'ar', armenia: 'am', australia: 'au',
  austria: 'at', azerbaijan: 'az', bahamas: 'bs', bahrain: 'bh', bangladesh: 'bd',
  barbados: 'bb', belarus: 'by', belgium: 'be', belize: 'bz', benin: 'bj',
  bhutan: 'bt', bolivia: 'bo', 'bosnia-and-herzegovina': 'ba', botswana: 'bw',
  brazil: 'br', brunei: 'bn', bulgaria: 'bg', 'burkina-faso': 'bf', burundi: 'bi',
  cambodia: 'kh', cameroon: 'cm', canada: 'ca', 'cape-verde': 'cv',
  'central-african-republic': 'cf', chad: 'td', chile: 'cl', china: 'cn',
  colombia: 'co', comoros: 'km', 'republic-of-the-congo': 'cg',
  'costa-rica': 'cr', 'c-te-d-ivoire': 'ci', croatia: 'hr', cuba: 'cu', cyprus: 'cy',
  'czech-republic': 'cz', denmark: 'dk', djibouti: 'dj', dominica: 'dm',
  'dominican-republic': 'do', ecuador: 'ec', egypt: 'eg', 'el-salvador': 'sv',
  'equatorial-guinea': 'gq', eritrea: 'er', estonia: 'ee', eswatini: 'sz',
  ethiopia: 'et', fiji: 'fj', finland: 'fi', france: 'fr', gabon: 'ga', gambia: 'gm',
  georgia: 'ge', germany: 'de', ghana: 'gh', greece: 'gr', grenada: 'gd',
  guatemala: 'gt', guinea: 'gn', 'guinea-bissau': 'gw', guyana: 'gy', haiti: 'ht',
  honduras: 'hn', hungary: 'hu', iceland: 'is', india: 'in', indonesia: 'id',
  iran: 'ir', iraq: 'iq', ireland: 'ie', israel: 'il', italy: 'it', jamaica: 'jm',
  japan: 'jp', jordan: 'jo', kazakhstan: 'kz', kenya: 'ke', kiribati: 'ki',
  kuwait: 'kw', kyrgyzstan: 'kg', laos: 'la', latvia: 'lv', lebanon: 'lb',
  lesotho: 'ls', liberia: 'lr', libya: 'ly', liechtenstein: 'li', lithuania: 'lt',
  luxembourg: 'lu', madagascar: 'mg', malawi: 'mw', malaysia: 'my', mali: 'ml',
  malta: 'mt', 'marshall-islands': 'mh', mauritania: 'mr', mauritius: 'mu', mexico: 'mx',
  micronesia: 'fm', moldova: 'md', monaco: 'mc', montenegro: 'me', morocco: 'ma',
  mozambique: 'mz', myanmar: 'mm', namibia: 'na', nauru: 'nr', nepal: 'np',
  netherlands: 'nl', 'new-zealand': 'nz', nicaragua: 'ni', niger: 'ne', nigeria: 'ng',
  'north-korea': 'kp', 'north-macedonia': 'mk', norway: 'no', oman: 'om', pakistan: 'pk',
  palau: 'pw', panama: 'pa', paraguay: 'py', peru: 'pe', philippines: 'ph', poland: 'pl',
  portugal: 'pt', qatar: 'qa', romania: 'ro', russia: 'ru', rwanda: 'rw',
  'saint-kitts-and-nevis': 'kn', 'saint-lucia': 'lc',
  'saint-vincent-and-the-grenadines': 'vc', samoa: 'ws', 'san-marino': 'sm',
  'sao-tome-and-principe': 'st', 'saudi-arabia': 'sa', senegal: 'sn', serbia: 'rs',
  seychelles: 'sc', 'sierra-leone': 'sl', singapore: 'sg', slovakia: 'sk',
  slovenia: 'si', somalia: 'so', 'south-africa': 'za', 'south-korea': 'kr',
  'south-sudan': 'ss', spain: 'es', 'sri-lanka': 'lk', sudan: 'sd', suriname: 'sr',
  sweden: 'se', switzerland: 'ch', syria: 'sy', taiwan: 'tw', tajikistan: 'tj',
  tanzania: 'tz', thailand: 'th', 'timor-leste': 'tl', togo: 'tg', tonga: 'to',
  'trinidad-and-tobago': 'tt', tunisia: 'tn', turkey: 'tr', turkmenistan: 'tm',
  tuvalu: 'tv', uganda: 'ug', ukraine: 'ua', 'united-arab-emirates': 'ae',
  'united-kingdom': 'gb', 'united-states': 'us', uruguay: 'uy', uzbekistan: 'uz',
  vanuatu: 'vu', 'vatican-city': 'va', venezuela: 've', vietnam: 'vn', yemen: 'ye',
  zambia: 'zm', zimbabwe: 'zw',
  dubai: 'ae', bali: 'id', maldives: 'mv',
};

export function getFlagUrl(slug: string, w: number = 640, cca2?: string): string {
  const code = cca2 || SLUG_TO_ISO[slug] || '';
  if (!code) return '';
  return `https://flagcdn.com/w${w}/${code.toLowerCase()}.png`;
}

const ISO_TO_SLUG = Object.entries(SLUG_TO_ISO).reduce<Record<string, string>>((acc, [slug, code]) => {
  if (!acc[code]) acc[code] = slug;
  return acc;
}, {});

export function getSlugByISO(code: string): string | undefined {
  return ISO_TO_SLUG[code.toLowerCase()];
}

export interface UnsplashSearchResult {
  id: string;
  slug: string;
  alt_description: string | null;
  urls: {
    raw: string;
    regular: string;
    small: string;
  };
  width: number;
  height: number;
}

export interface UnsplashPhotoResult {
  id: string;
  alt_description: string | null;
  urls: {
    raw: string;
    regular: string;
    small: string;
  };
}

export async function searchUnsplashPhoto(
  query: string,
  options: {
    orientation?: 'landscape' | 'portrait' | 'squarish';
    perPage?: number;
  } = {}
): Promise<UnsplashSearchResult[]> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return [];

  const { orientation = 'landscape', perPage = 5 } = options;

  const params = new URLSearchParams({
    query,
    per_page: String(perPage),
    orientation,
    client_id: accessKey,
  });

  try {
    const res = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
      headers: { 'Accept-Version': 'v1' },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      console.error(`[unsplash] search failed: ${res.status} ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    return (data.results || []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      slug: r.slug as string,
      alt_description: (r.alt_description as string) || null,
      urls: {
        raw: (r.urls as Record<string, string>).raw,
        regular: (r.urls as Record<string, string>).regular,
        small: (r.urls as Record<string, string>).small,
      },
      width: r.width as number,
      height: r.height as number,
    }));
  } catch (error) {
    console.error('[unsplash] search error:', error);
    return [];
  }
}

export async function getUnsplashPhotoById(photoId: string): Promise<UnsplashPhotoResult | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return null;

  try {
    const res = await fetch(`https://api.unsplash.com/photos/${photoId}?client_id=${accessKey}`, {
      headers: { 'Accept-Version': 'v1' },
      next: { revalidate: 86400 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return {
      id: data.id,
      alt_description: data.alt_description || null,
      urls: {
        raw: data.urls.raw,
        regular: data.urls.regular,
        small: data.urls.small,
      },
    };
  } catch {
    return null;
  }
}

export function extractPhotoIdFromUrl(url: string): string | undefined {
  const match = url.match(/photo-(\d[\d-]+)/);
  return match ? match[1] : undefined;
}
