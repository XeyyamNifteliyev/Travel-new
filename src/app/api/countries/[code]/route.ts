import { NextRequest, NextResponse } from 'next/server';
import { normalizeCountryResponse } from '@/lib/countries-api';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  if (!code || code.length !== 2) {
    return NextResponse.json({ error: 'Valid 2-letter country code required' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://restcountries.com/v3.1/alpha/${code.toUpperCase()}?fields=name,cca2,capital,region,subregion,population,area,latlng,currencies,languages,flag,flags`,
      { next: { revalidate: 86400 } }
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'Country not found' }, { status: 404 });
    }

    const data = await res.json();
    const normalized = normalizeCountryResponse(data);

    return NextResponse.json(normalized, {
      headers: { 'Cache-Control': 's-maxage=86400, stale-while-revalidate=172800' },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch country data' }, { status: 500 });
  }
}
