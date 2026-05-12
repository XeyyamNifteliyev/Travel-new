import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const COMPANION_SELECT = `
  id,
  user_id,
  destination_country,
  destination_city,
  departure_date,
  return_date,
  gender_preference,
  gender,
  age_min,
  age_max,
  interests,
  languages,
  description,
  status,
  created_at,
  updated_at,
  author:profiles!companions_user_id_fkey(name, avatar_url)
`;

const VALID_GENDERS = new Set(['any', 'male', 'female']);
const VALID_STATUSES = new Set(['open', 'filled', 'cancelled']);

function cleanString(value: unknown, maxLength: number, required = false) {
  if (value === undefined || value === null) return required ? null : undefined;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return required ? null : undefined;
  return trimmed;
}

function cleanStringArray(value: unknown, maxItems: number, maxLength: number) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maxItems)
    .map((item) => item.slice(0, maxLength));
}

function cleanAge(value: unknown, fallback: number) {
  const number = Number(value);
  if (!Number.isInteger(number)) return fallback;
  return Math.min(99, Math.max(18, number));
}

function isIsoDate(value: string | undefined | null) {
  return !value || /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20));
    const offset = (page - 1) * limit;
    const country = cleanString(searchParams.get('country'), 120);
    const city = cleanString(searchParams.get('city'), 120);
    const departureDate = cleanString(searchParams.get('departureDate'), 20);
    const genderPreference = searchParams.get('genderPreference');
    const ageMin = searchParams.get('ageMin');
    const ageMax = searchParams.get('ageMax');
    const interests = searchParams.get('interests');
    const languages = searchParams.get('languages');

    let query = supabase
      .from('companions')
      .select(COMPANION_SELECT, { count: 'exact' })
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (country) query = query.eq('destination_country', country);
    if (city) query = query.ilike('destination_city', `%${city}%`);
    if (departureDate && isIsoDate(departureDate)) query = query.gte('departure_date', departureDate);
    if (genderPreference && genderPreference !== 'any' && VALID_GENDERS.has(genderPreference)) query = query.eq('gender', genderPreference);
    if (ageMin) {
      const min = parseInt(ageMin);
      if (!isNaN(min)) query = query.lte('age_min', min).gte('age_max', min);
    }
    if (ageMax) {
      const max = parseInt(ageMax);
      if (!isNaN(max)) query = query.lte('age_min', max).gte('age_max', max);
    }
    if (interests) query = query.overlaps('interests', interests.split(',').filter(Boolean).slice(0, 10));
    if (languages) query = query.overlaps('languages', languages.split(',').filter(Boolean).slice(0, 10));

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error('Companions query error:', error);
      return NextResponse.json({ error: 'Sorğu xətası' }, { status: 500 });
    }

    return NextResponse.json({ companions: data || [], page, limit, total: count || 0, totalPages: count ? Math.ceil(count / limit) : 0 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized - please login' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Yanlış sorğu formatı' }, { status: 400 });
    }

    const record = body as Record<string, unknown>;
    const destinationCountry = cleanString(record.destinationCountry, 120, true);
    const destinationCity = cleanString(record.destinationCity, 120);
    const departureDate = cleanString(record.departureDate, 20, true);
    const returnDate = cleanString(record.returnDate, 20);
    const genderPreference = typeof record.genderPreference === 'string' && VALID_GENDERS.has(record.genderPreference) ? record.genderPreference : 'any';
    const gender = typeof record.gender === 'string' && VALID_GENDERS.has(record.gender) && record.gender !== 'any' ? record.gender : null;
    const ageMin = cleanAge(record.ageMin, 18);
    const ageMax = cleanAge(record.ageMax, 99);
    const interests = cleanStringArray(record.interests, 10, 40);
    const languages = cleanStringArray(record.languages, 8, 12);
    const description = cleanString(record.description, 1200);

    if (
      !destinationCountry ||
      !departureDate ||
      [destinationCity, returnDate, description].some((value) => value === null) ||
      !isIsoDate(departureDate) ||
      !isIsoDate(returnDate) ||
      ageMin > ageMax
    ) {
      return NextResponse.json({ error: 'Elan məlumatları yanlışdır' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('companions')
      .insert({
        user_id: user.id,
        destination_country: destinationCountry,
        destination_city: destinationCity,
        departure_date: departureDate,
        return_date: returnDate,
        gender_preference: genderPreference,
        gender,
        age_min: ageMin,
        age_max: ageMax,
        interests,
        languages,
        description,
      })
      .select(COMPANION_SELECT)
      .single();

    if (error) {
      console.error('Companion create error:', error);
      return NextResponse.json({ error: 'Elan yaradıla bilmədi' }, { status: 500 });
    }

    return NextResponse.json({ companion: data }, { status: 201 });
  } catch (err) {
    console.error('POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Yanlış sorğu formatı' }, { status: 400 });
    }

    const record = body as Record<string, unknown>;
    const id = cleanString(record.id, 80, true);
    if (!id) {
      return NextResponse.json({ error: 'Companion ID is required' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    const destinationCountry = cleanString(record.destinationCountry, 120);
    const destinationCity = cleanString(record.destinationCity, 120);
    const departureDate = cleanString(record.departureDate, 20);
    const returnDate = cleanString(record.returnDate, 20);
    const description = cleanString(record.description, 1200);
    const ageMin = record.ageMin !== undefined ? cleanAge(record.ageMin, 18) : undefined;
    const ageMax = record.ageMax !== undefined ? cleanAge(record.ageMax, 99) : undefined;

    if ([destinationCountry, destinationCity, departureDate, returnDate, description].some((value) => value === null)) {
      return NextResponse.json({ error: 'Elan məlumatları yanlışdır' }, { status: 400 });
    }

    if (departureDate && !isIsoDate(departureDate)) return NextResponse.json({ error: 'Elan məlumatları yanlışdır' }, { status: 400 });
    if (returnDate && !isIsoDate(returnDate)) return NextResponse.json({ error: 'Elan məlumatları yanlışdır' }, { status: 400 });
    if (ageMin !== undefined && ageMax !== undefined && ageMin > ageMax) return NextResponse.json({ error: 'Elan məlumatları yanlışdır' }, { status: 400 });

    if (destinationCountry !== undefined) updates.destination_country = destinationCountry;
    if (destinationCity !== undefined) updates.destination_city = destinationCity;
    if (departureDate !== undefined) updates.departure_date = departureDate;
    if (returnDate !== undefined) updates.return_date = returnDate;
    if (typeof record.genderPreference === 'string' && VALID_GENDERS.has(record.genderPreference)) updates.gender_preference = record.genderPreference;
    if (typeof record.gender === 'string' && VALID_GENDERS.has(record.gender) && record.gender !== 'any') updates.gender = record.gender;
    if (ageMin !== undefined) updates.age_min = ageMin;
    if (ageMax !== undefined) updates.age_max = ageMax;
    if (record.interests !== undefined) updates.interests = cleanStringArray(record.interests, 10, 40);
    if (record.languages !== undefined) updates.languages = cleanStringArray(record.languages, 8, 12);
    if (description !== undefined) updates.description = description;
    if (typeof record.status === 'string' && VALID_STATUSES.has(record.status)) updates.status = record.status;

    const { data, error } = await supabase
      .from('companions')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select(COMPANION_SELECT)
      .single();

    if (error) {
      console.error('Companion update error:', error);
      return NextResponse.json({ error: 'Server xətası' }, { status: 500 });
    }

    return NextResponse.json({ companion: data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Companion ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('companions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Companion delete error:', error);
      return NextResponse.json({ error: 'Server xətası' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
