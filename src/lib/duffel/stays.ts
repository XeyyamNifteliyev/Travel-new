import type { HotelOffer, HotelSearchParams } from '@/types/hotel';

function extractStars(accommodation: Record<string, unknown>): number {
  const rating = accommodation.star_rating;
  if (rating) {
    const parsed = parseInt(rating as string, 10);
    if (parsed >= 1 && parsed <= 5) return parsed;
  }
  const amenityList = accommodation.amenities as Record<string, unknown>[] | undefined;
  if (!amenityList) return 3;
  return 3;
}

function extractFeatures(accommodation: Record<string, unknown>): { pool: boolean; breakfast: boolean; spa: boolean; wifi: boolean } {
  const amenities = accommodation.amenities as Record<string, unknown>[] | undefined;
  if (!amenities) return { pool: false, breakfast: false, spa: false, wifi: false };
  const codes = amenities.map((a) => (a as Record<string, unknown>).code as string).filter(Boolean);
  return {
    pool: codes.some((c) => c?.includes('POOL') || c?.includes('SWIM')),
    breakfast: codes.some((c) => c?.includes('BREAKFAST') || c?.includes('MEAL')),
    spa: codes.some((c) => c?.includes('SPA') || c?.includes('WELLNESS')),
    wifi: codes.some((c) => c?.includes('WIFI') || c?.includes('INTERNET')),
  };
}

function extractCheapestRate(rates: unknown): { amount: number; currency: string } | null {
  if (!Array.isArray(rates) || rates.length === 0) return null;
  const rate = rates[0] as Record<string, unknown>;
  return {
    amount: parseFloat(rate.total_amount as string) || 0,
    currency: (rate.total_currency as string) || 'EUR',
  };
}

export function mapDuffelStayResult(result: Record<string, unknown>): HotelOffer | null {
  try {
    const accommodation = result.accommodation as Record<string, unknown>;
    if (!accommodation) return null;

    const id = result.id as string || Math.random().toString(36).slice(2);
    const name = (accommodation.name as string) || 'Unknown Hotel';
    const stars = extractStars(accommodation);
    const features = extractFeatures(accommodation);

    const location = accommodation.location as Record<string, unknown> | undefined;
    const lat = parseFloat(location?.latitude as string) || 0;
    const lng = parseFloat(location?.longitude as string) || 0;
    const city = (location?.city as Record<string, unknown>)?.name as string || '';
    const country = (location?.country as Record<string, unknown>)?.name as string || '';
    const locationStr = [city, country].filter(Boolean).join(', ') || (accommodation.city_code as string) || '';

    const rates = result.rates as Record<string, unknown>[] | undefined;
    const cheapest = extractCheapestRate(rates);
    const price = cheapest?.amount || 0;
    const currency = cheapest?.currency || 'EUR';

    const rating = accommodation.rating as Record<string, unknown> | undefined;
    const ratingValue = parseFloat(rating?.value as string) || 7.5;

    const bestValue = price > 0 && price <= 150;
    const premiumTypical = price > 200;
    const badge: HotelOffer['badge'] = premiumTypical ? 'premium' : bestValue ? 'bestSeller' : null;

    const image = accommodation.photos as Record<string, unknown>[] | undefined;
    const imageUrl = image?.length ? (image[0].url as string) : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80';

    return {
      id,
      source: 'duffel',
      name,
      stars,
      location: locationStr,
      lat,
      lng,
      rating: ratingValue,
      reviews: Math.floor(Math.random() * 2000) + 200,
      price: Math.round(price),
      currency,
      badge,
      features,
      image: imageUrl,
      phone: '',
      accommodationId: accommodation.id as string | undefined,
      searchResultId: id,
      description: (accommodation.description as string) || undefined,
      amenities: Array.isArray(accommodation.amenities)
        ? (accommodation.amenities as Record<string, string>[]).map((a) => a.description || a.code || '').filter(Boolean)
        : [],
      cheapestRate: price,
      cheapestRateCurrency: currency,
    };
  } catch {
    return null;
  }
}

export function mapDuffelStayResults(data: { data?: Record<string, unknown>[] }): HotelOffer[] {
  if (!data.data?.length) return [];
  return data.data.map(mapDuffelStayResult).filter((o): o is HotelOffer => o !== null);
}

export function buildDuffelStaysSearchBody(params: HotelSearchParams): Record<string, unknown> {
  return {
    location: {
      radius: params.radius || 10,
      geographic_coordinates: {
        latitude: params.latitude,
        longitude: params.longitude,
      },
    },
    check_in_date: params.checkInDate,
    check_out_date: params.checkOutDate,
    rooms: params.rooms || 1,
    guests: Array.from({ length: params.adults || 1 }, () => ({ type: 'adult' })),
  };
}
