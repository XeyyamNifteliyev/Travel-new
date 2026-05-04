import { NextRequest, NextResponse } from 'next/server';
import { normalizeVisaResponse } from '@/lib/visa/visalist-api';

const VISA_API_URL = process.env.VISA_API_URL || 'https://rough-sun-2523.fly.dev';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const passport = searchParams.get('passport');
  const destination = searchParams.get('destination');

  if (!passport || !destination) {
    return NextResponse.json({ error: 'passport and destination are required' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${VISA_API_URL}/${passport.toUpperCase()}/${destination.toUpperCase()}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'Visa data not found' }, { status: 404 });
    }

    const data = await res.json();
    const normalized = normalizeVisaResponse(data);

    if (!normalized) {
      return NextResponse.json({ error: 'Could not parse visa data' }, { status: 422 });
    }

    return NextResponse.json(normalized, {
      headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=7200' },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch visa data' }, { status: 500 });
  }
}
