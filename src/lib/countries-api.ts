export interface CountryInfo {
  code: string;
  name: string;
  officialName: string;
  capital: string[];
  region: string;
  subregion: string;
  population: number;
  area: number;
  latlng: [number, number];
  currencies: Record<string, { name: string; symbol: string }>;
  languages: Record<string, string>;
  flagEmoji: string;
  flagUrl: string;
}

export function normalizeCountryResponse(raw: {
  name?: { common: string; official: string };
  cca2?: string;
  capital?: string[];
  region?: string;
  subregion?: string;
  population?: number;
  area?: number;
  latlng?: number[];
  currencies?: Record<string, { name: string; symbol: string }>;
  languages?: Record<string, string>;
  flag?: string;
  flags?: { png: string; svg: string };
}): CountryInfo {
  return {
    code: raw.cca2 ?? '',
    name: raw.name?.common ?? '',
    officialName: raw.name?.official ?? '',
    capital: raw.capital ?? [],
    region: raw.region ?? '',
    subregion: raw.subregion ?? '',
    population: raw.population ?? 0,
    area: raw.area ?? 0,
    latlng: [raw.latlng?.[0] ?? 0, raw.latlng?.[1] ?? 0],
    currencies: raw.currencies ?? {},
    languages: raw.languages ?? {},
    flagEmoji: raw.flag ?? '',
    flagUrl: raw.flags?.png ?? '',
  };
}
