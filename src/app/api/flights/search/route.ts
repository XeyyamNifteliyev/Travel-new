import { NextRequest, NextResponse } from 'next/server';
import { isDuffelConfigured, duffelHeaders, getDuffelBaseUrl } from '@/lib/duffel/auth';
import { mapDuffelOffers, buildDuffelOfferRequestBody } from '@/lib/duffel/flights';
import { checkRateLimit, getIpFromHeaders } from '@/lib/rate-limit';
import type { FlightOffer } from '@/types/flight';

const FALLBACK_FLIGHTS: FlightOffer[] = [
  { id: 'mock-1', source: 'mock', airline: 'AZAL', airlineCode: 'GYD', from: 'Baku', fromCode: 'GYD', to: 'Istanbul', toCode: 'IST', depart: '06:30', arrive: '08:45', duration: '2s 15d', stops: 0, stopLabel: 'Direct', price: 245, currency: 'AZN', bestValue: true, segments: [], totalPrice: '245', totalCurrency: 'AZN' },
  { id: 'mock-2', source: 'mock', airline: 'Turkish Airlines', airlineCode: 'TK', from: 'Baku', fromCode: 'GYD', to: 'Istanbul', toCode: 'IST', depart: '10:00', arrive: '12:20', duration: '2s 20d', stops: 0, stopLabel: 'Direct', price: 280, currency: 'AZN', bestValue: false, segments: [], totalPrice: '280', totalCurrency: 'AZN' },
  { id: 'mock-3', source: 'mock', airline: 'Pegasus', airlineCode: 'PC', from: 'Baku', fromCode: 'GYD', to: 'Istanbul', toCode: 'IST', depart: '14:30', arrive: '16:50', duration: '2s 20d', stops: 0, stopLabel: 'Direct', price: 195, currency: 'AZN', bestValue: false, segments: [], totalPrice: '195', totalCurrency: 'AZN' },
  { id: 'mock-4', source: 'mock', airline: 'FlyDubai', airlineCode: 'FZ', from: 'Baku', fromCode: 'GYD', to: 'Dubai', toCode: 'DXB', depart: '08:00', arrive: '12:30', duration: '3s 30d', stops: 0, stopLabel: 'Direct', price: 420, currency: 'AZN', bestValue: false, segments: [], totalPrice: '420', totalCurrency: 'AZN' },
  { id: 'mock-5', source: 'mock', airline: 'AZAL', airlineCode: 'AZ', from: 'Baku', fromCode: 'GYD', to: 'Dubai', toCode: 'DXB', depart: '22:00', arrive: '02:30', duration: '3s 30d', stops: 1, stopLabel: '1 stop', price: 380, currency: 'AZN', bestValue: false, segments: [], totalPrice: '380', totalCurrency: 'AZN' },
];

export async function GET(req: NextRequest) {
  const ip = getIpFromHeaders(req);
  const rl = checkRateLimit(ip, 'flights-search', 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const departureDate = searchParams.get('departureDate');

  if (!origin || !destination || !departureDate) {
    return NextResponse.json(
      { error: 'origin, destination, and departureDate are required' },
      { status: 400 }
    );
  }

  if (!isDuffelConfigured()) {
    return NextResponse.json({
      error: 'Duffel API not configured',
      configured: false,
      flights: FALLBACK_FLIGHTS,
    });
  }

  try {
    const baseUrl = getDuffelBaseUrl();
    const body = buildDuffelOfferRequestBody({
      origin,
      destination,
      departureDate,
      returnDate: searchParams.get('returnDate') || undefined,
      adults: parseInt(searchParams.get('adults') || '1', 10) || 1,
      cabinClass: (searchParams.get('cabinClass') as 'first' | 'business' | 'premium_economy' | 'economy') || undefined,
    });

    const res = await fetch(`${baseUrl}/air/offer_requests?return_offers=true`, {
      method: 'POST',
      headers: duffelHeaders(),
      body: JSON.stringify({ data: body }),
    });

if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({
        error: `Duffel API error (${res.status})`,
        flights: FALLBACK_FLIGHTS,
      });
    }

    const data = await res.json();
    const flights = mapDuffelOffers(data);

    return NextResponse.json({ flights, configured: true }, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' },
    });
  } catch (err) {
    console.error('Flights search error:', err);
    return NextResponse.json(
      { error: 'Uçuşlar yüklənə bilmədi', flights: [] as FlightOffer[] },
      { status: 500 }
    );
  }
}
