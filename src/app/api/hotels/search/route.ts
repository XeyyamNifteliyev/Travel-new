import { NextRequest, NextResponse } from 'next/server';
import { isDuffelConfigured, duffelHeaders, getDuffelBaseUrl } from '@/lib/duffel/auth';
import { mapDuffelStayResults } from '@/lib/duffel/stays';
import type { HotelOffer } from '@/types/hotel';

const FALLBACK_HOTELS: HotelOffer[] = [
  { id: 'mock-1', source: 'mock', name: 'Baku Palace & Spa', stars: 5, location: 'Baku, Azerbaijan', lat: 40.4093, lng: 49.8671, rating: 9.2, reviews: 2341, price: 240, currency: 'AZN', badge: 'premium', features: { pool: true, breakfast: true, spa: true, wifi: true }, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', phone: '' },
  { id: 'mock-2', source: 'mock', name: 'Mountain Retreat', stars: 4, location: 'Gabala, Azerbaijan', lat: 40.9876, lng: 47.8412, rating: 8.8, reviews: 1892, price: 185, currency: 'AZN', badge: 'bestSeller', features: { pool: false, breakfast: true, spa: true, wifi: true }, image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80', phone: '' },
  { id: 'mock-3', source: 'mock', name: 'Grand Hotel Istanbul', stars: 4, location: 'Sultanahmet, Istanbul', lat: 41.0054, lng: 28.9768, rating: 8.7, reviews: 2341, price: 120, currency: 'EUR', badge: null, features: { pool: false, breakfast: true, spa: false, wifi: true }, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80', phone: '' },
  { id: 'mock-4', source: 'mock', name: 'Dubai Marina Hotel', stars: 5, location: 'Dubai Marina, UAE', lat: 25.0805, lng: 55.1403, rating: 9.1, reviews: 1892, price: 250, currency: 'EUR', badge: 'premium', features: { pool: true, breakfast: false, spa: true, wifi: true }, image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80', phone: '' },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const latitude = parseFloat(searchParams.get('latitude') || '0');
  const longitude = parseFloat(searchParams.get('longitude') || '0');
  const checkInDate = searchParams.get('checkInDate');
  const checkOutDate = searchParams.get('checkOutDate');

  if (!checkInDate || !checkOutDate) {
    return NextResponse.json(
      { error: 'checkInDate and checkOutDate are required' },
      { status: 400 }
    );
  }

  if (!isDuffelConfigured()) {
    return NextResponse.json({
      error: 'Duffel API not configured',
      configured: false,
      hotels: FALLBACK_HOTELS,
    });
  }

  if (!latitude || !longitude) {
    return NextResponse.json({
      error: 'latitude and longitude are required for hotel search',
      configured: true,
      hotels: FALLBACK_HOTELS,
    });
  }

  try {
    const baseUrl = getDuffelBaseUrl();
    const body = {
      location: {
        radius: parseFloat(searchParams.get('radius') || '10'),
        geographic_coordinates: {
          latitude,
          longitude,
        },
      },
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      rooms: parseInt(searchParams.get('rooms') || '1', 10),
      guests: [{ type: 'adult' }],
    };

    const res = await fetch(`${baseUrl}/stays/search`, {
      method: 'POST',
      headers: duffelHeaders(),
      body: JSON.stringify({ data: body }),
    });

if (!res.ok) {
      const text = await res.text();
      if (res.status === 403) {
        return NextResponse.json({
          error: 'Duffel Stays not enabled for this account',
          configured: true,
          staysEnabled: false,
          hotels: FALLBACK_HOTELS,
        });
      }
      return NextResponse.json(
        { error: `Duffel API error (${res.status})`, hotels: [] as HotelOffer[] },
        { status: res.status }
      );
    }

    const data = await res.json();
    const hotels = mapDuffelStayResults(data);

    return NextResponse.json({ hotels, configured: true }, {
      headers: { 'Cache-Control': 's-maxage=600, stale-while-revalidate=1200' },
    });
  } catch (err) {
    console.error('Hotels search error:', err);
    return NextResponse.json(
      { error: 'Otellər yüklənə bilmədi', hotels: [] as HotelOffer[] },
      { status: 500 }
    );
  }
}
