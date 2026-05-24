import { NextRequest, NextResponse } from 'next/server';
import { isDuffelConfigured, duffelHeaders, getDuffelBaseUrl } from '@/lib/duffel/auth';
import { mapDuffelStayResults } from '@/lib/duffel/stays';
import { checkRateLimit, getIpFromHeaders } from '@/lib/rate-limit';
import type { HotelOffer } from '@/types/hotel';

export async function GET(req: NextRequest) {
  const ip = getIpFromHeaders(req);
  const rl = await checkRateLimit(ip, 'hotels-search', 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

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
      hotels: [] as HotelOffer[],
    });
  }

  if (!latitude || !longitude) {
    return NextResponse.json({
      error: 'latitude and longitude are required for hotel search',
      configured: true,
      hotels: [] as HotelOffer[],
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
      if (res.status === 403) {
        return NextResponse.json({
          error: 'Duffel Stays not enabled for this account',
          configured: true,
          staysEnabled: false,
          hotels: [] as HotelOffer[],
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
