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
  const params = new URLSearchParams({
    w: String(w),
    q: String(q),
    fit,
    auto: 'format',
    ...(h ? { h: String(h) } : {}),
  });
  return `https://images.unsplash.com/photo-${photoId}?${params}`;
}

const COUNTRY_COVER_PHOTOS: Record<string, string> = {
  turkey: '1558005137-d9619a5c539f',
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
  iran: '1576767279815-5d6f06a7293a',
  uk: '1513635269975-59663e0ac1ad',
  netherlands: '1512470876302-972faa2aa9a4',
  portugal: '1555881772637-7aedc0a7a35b',
  maldives: '1573843981267-be1999ff37cd',
  bali: '1537996194471-e657df975ab4',
  morocco: '1539020140153-e8c237112e53',
  canada: '1503614472-8c93d56cd587',
  australia: '1506973035872-a4ec16b8e8d9',
  brazil: '1483729558449-99ef09a8c325',
  india: '1548013146-72479768bada',
  'south-korea': '1538485399081-7c8ed74b73b8',
  china: '1508804185872-d7badc2832b8',
  singapore: '1525625293386-3f8f99389edd',
  switzerland: '1530122037265-a5f1f91d3b99',
  norway: '1520769669658-f07657f5a5f1',
  iceland: '1504829857797-ddff29c27927',
  mexico: '1518638150340-f706e86654de',
  'czech-republic': '1541849546-216549ae216d',
  austria: '1516550893923-42d28e5677af',
  'new-zealand': '1469854523086-cc02d5ab4582',
  indonesia: '1537996194471-e657df975ab4',
};

export function getCountryCoverPhotoId(slug: string, fallback?: string | null): string | undefined {
  return COUNTRY_COVER_PHOTOS[slug] || fallback || undefined;
}

const SLUG_TO_ISO: Record<string, string> = {
  turkey: 'tr', dubai: 'ae', uae: 'ae', france: 'fr', italy: 'it',
  spain: 'es', japan: 'jp', germany: 'de', thailand: 'th',
  greece: 'gr', georgia: 'ge', russia: 'ru', iran: 'ir', uk: 'gb',
  netherlands: 'nl', portugal: 'pt', maldives: 'mv', bali: 'id',
  morocco: 'ma', canada: 'ca', australia: 'au', brazil: 'br',
  india: 'in', 'south-korea': 'kr', china: 'cn', singapore: 'sg',
  switzerland: 'ch', norway: 'no', iceland: 'is', mexico: 'mx',
  'czech-republic': 'cz', austria: 'at', 'new-zealand': 'nz',
  indonesia: 'id',
};

export function getFlagUrl(slug: string, w: number = 640): string {
  const code = SLUG_TO_ISO[slug] || slug.substring(0, 2).toLowerCase();
  return `https://flagcdn.com/w${w}/${code}.png`;
}
