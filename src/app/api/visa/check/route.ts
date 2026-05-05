import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSlugByISO } from '@/lib/unsplash';
import { normalizeVisaResponse, type VisaStatus } from '@/lib/visa/visalist-api';

const VISA_API_URL = process.env.VISA_API_URL || 'https://rough-sun-2523.fly.dev';

const SUPABASE_STATUS_MAP: Record<string, VisaStatus> = {
  not_required: 'visaFree',
  on_arrival: 'visaOnArrival',
  e_visa: 'eVisa',
  required: 'visaRequired',
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const passport = searchParams.get('passport');
  const destination = searchParams.get('destination');

  if (!passport || !destination) {
    return NextResponse.json({ error: 'passport and destination are required' }, { status: 400 });
  }

  // 1. Supabase visa_info fallback (AZ passport holders)
  if (passport.toUpperCase() === 'AZ') {
    try {
      const supabase = await createClient();
      const countrySlug = getSlugByISO(destination);

      if (countrySlug) {
        const { data: country } = await supabase
          .from('countries')
          .select('id')
          .eq('slug', countrySlug)
          .maybeSingle();

        if (country) {
          const { data: visaRow } = await supabase
            .from('visa_info')
            .select('requirement_type, notes_az, notes_en, processing_days_min, processing_days_max, max_stay_days, validity_days')
            .eq('country_id', country.id)
            .maybeSingle();

          if (visaRow) {
            return NextResponse.json({
              passport,
              destination,
              status: SUPABASE_STATUS_MAP[visaRow.requirement_type] || 'unknown',
              duration: visaRow.max_stay_days ? `${visaRow.max_stay_days} gün` : '',
              notes: visaRow.notes_az || visaRow.notes_en || '',
              raw: visaRow.requirement_type,
            });
          }
        }
      }
    } catch {
      // fall through to external API
    }
  }

  // 2. External API
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
