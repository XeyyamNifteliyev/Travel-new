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
