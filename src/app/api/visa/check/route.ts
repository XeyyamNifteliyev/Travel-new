import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSlugByISO } from '@/lib/unsplash';
import { normalizeVisaResponse, type VisaStatus } from '@/lib/visa/visalist-api';

const VISA_API_URL = process.env.VISA_API_URL || 'https://rough-sun-2523.fly.dev';

const STATUS_MAP: Record<string, VisaStatus> = {
  not_required: 'visaFree',
  on_arrival: 'visaOnArrival',
  e_visa: 'eVisa',
  required: 'visaRequired',
};

const HARDCODED_VISA: Record<string, { status: VisaStatus; duration: string }> = {
  TR: { status: 'visaFree', duration: '90 gün' },
  GE: { status: 'visaFree', duration: '365 gün' },
  RU: { status: 'visaFree', duration: '90 gün' },
  AE: { status: 'visaOnArrival', duration: '30 gün' },
  IR: { status: 'visaFree', duration: '30 gün' },
  JP: { status: 'visaRequired', duration: '' },
  IT: { status: 'visaRequired', duration: '' },
};

function buildResponse(passport: string, destination: string, status: VisaStatus, duration: string, notes: string, raw: string) {
  return NextResponse.json({ passport, destination, status, duration, notes, raw });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const passport = searchParams.get('passport');
  const destination = searchParams.get('destination');

  if (!passport || !destination) {
    return NextResponse.json({ error: 'passport and destination are required' }, { status: 400 });
  }

  const destCode = destination.toUpperCase();

  if (passport.toUpperCase() === 'AZ') {
    // 1. Supabase visa_info — JOIN query (same pattern as /api/visa/[country])
    try {
      const countrySlug = getSlugByISO(destination);
      if (countrySlug) {
        const supabase = await createClient();

        const { data: visaRow } = await supabase
          .from('visa_info')
          .select('requirement_type, notes_az, notes_en, max_stay_days, countries!inner(slug)')
          .eq('countries.slug', countrySlug)
          .maybeSingle();

        if (visaRow) {
          return buildResponse(
            passport,
            destination,
            STATUS_MAP[visaRow.requirement_type] || 'unknown',
            visaRow.max_stay_days ? `${visaRow.max_stay_days} gün` : '',
            visaRow.notes_az || visaRow.notes_en || '',
            visaRow.requirement_type,
          );
        }
      }
    } catch {
      // fall through
    }

    // 2. Hardcoded map — fallback
    const hardcoded = HARDCODED_VISA[destCode];
    if (hardcoded) {
      return buildResponse(passport, destination, hardcoded.status, hardcoded.duration, '', '');
    }
  }

  // 3. External API — last resort
  try {
    const res = await fetch(
      `${VISA_API_URL}/${passport.toUpperCase()}/${destCode}`,
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
