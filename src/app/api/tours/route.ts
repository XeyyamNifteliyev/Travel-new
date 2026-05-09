import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const TOUR_SELECT = 'id, company_id, title, slug, description, region, tour_type, price, currency, duration_days, duration_nights, group_min, group_max, transportation_included, hotel_included, hotel_stars, meals_included, languages, dates, itinerary, images, status, created_at, updated_at';
const VALID_TOUR_TYPES = new Set(['active', 'cultural', 'nature', 'city', 'adventure', 'food', 'wellness']);
const VALID_CURRENCIES = new Set(['AZN', 'USD', 'EUR', 'TRY', 'GEL']);

function cleanString(value: unknown, maxLength: number, required = false) {
  if (value === undefined || value === null) return required ? null : undefined;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return required ? null : undefined;
  return trimmed;
}

function cleanNumber(value: unknown, min: number, max: number, fallback?: number) {
  if (value === undefined || value === null || value === '') return fallback;
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) return null;
  return number;
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

function cleanImages(value: unknown) {
  return cleanStringArray(value, 8, 600).filter((url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:';
    } catch {
      return false;
    }
  });
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const tourType = searchParams.get('tourType');
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    const dateStart = searchParams.get('dateStart');
    const dateEnd = searchParams.get('dateEnd');
    const groupMin = searchParams.get('groupMin');
    const groupMax = searchParams.get('groupMax');
    const transportation = searchParams.get('transportation');
    const meals = searchParams.get('meals');
    const language = searchParams.get('language');
    const rating = searchParams.get('rating');
    const search = searchParams.get('search');

    let query = supabase
      .from('tours')
      .select(`
        ${TOUR_SELECT}, rating, review_count, views, bookings_count,
        company:tour_companies(company_name, logo_url, is_verified, rating, review_count)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (region) {
      query = query.eq('region', region);
    }
    if (tourType) {
      query = query.eq('tour_type', tourType);
    }
    if (priceMin) {
      query = query.gte('price', parseFloat(priceMin));
    }
    if (priceMax) {
      query = query.lte('price', parseFloat(priceMax));
    }
    if (dateStart) {
      query = query.contains('dates', [dateStart]);
    }
    if (dateEnd) {
      query = query.contains('dates', [dateEnd]);
    }
    if (groupMin) {
      query = query.gte('group_max', parseInt(groupMin));
    }
    if (groupMax) {
      query = query.lte('group_min', parseInt(groupMax));
    }
    if (transportation === 'true') {
      query = query.eq('transportation_included', true);
    }
    if (meals) {
      const mealsArray = meals.split(',');
      query = query.contains('meals_included', mealsArray);
    }
    if (language) {
      query = query.contains('languages', [language]);
    }
    if (rating) {
      query = query.gte('rating', parseFloat(rating));
    }
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'Server xetası ' }, { status: 500 });
    }

    return NextResponse.json({ tours: data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: company } = await supabase
      .from('tour_companies')
      .select('id, status, plan_type, plan_expires_at')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!company) {
      return NextResponse.json(
        { error: 'You must have an active company account to create tours' },
        { status: 403 }
      );
    }

    if (company.plan_expires_at && new Date(company.plan_expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Your company subscription has expired' },
        { status: 403 }
      );
    }

    const activeToursCount = await supabase
      .from('tours')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', company.id)
      .eq('status', 'active');

    const maxTours: Record<string, number> = { starter: 5, pro: 20, premium: 999 };
    const maxAllowed = maxTours[company.plan_type] || 5;

    if ((activeToursCount.count || 0) >= maxAllowed) {
      return NextResponse.json(
        { error: `You have reached the maximum number of active tours for your plan (${maxAllowed})` },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const record = body as Record<string, unknown>;
    const title = cleanString(record.title, 180, true);
    const slug = cleanString(record.slug, 220, true);
    const description = cleanString(record.description, 5000, true);
    const region = cleanString(record.region, 120, true);
    const tourType = typeof record.tourType === 'string' && VALID_TOUR_TYPES.has(record.tourType) ? record.tourType : 'active';
    const price = cleanNumber(record.price, 1, 100000);
    const currency = typeof record.currency === 'string' && VALID_CURRENCIES.has(record.currency) ? record.currency : 'AZN';
    const durationDays = cleanNumber(record.durationDays, 1, 90);
    const durationNights = cleanNumber(record.durationNights, 0, 90, 0);
    const groupMin = cleanNumber(record.groupMin, 1, 500, 1);
    const groupMax = cleanNumber(record.groupMax, 1, 500, 20);
    const hotelStars = cleanNumber(record.hotelStars, 1, 5);
    const mealsIncluded = cleanStringArray(record.mealsIncluded, 8, 40);
    const languages = cleanStringArray(record.languages, 8, 12);
    const dates = cleanStringArray(record.dates, 60, 20).filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date));
    const itinerary = Array.isArray(record.itinerary) ? record.itinerary.slice(0, 30) : record.itinerary ?? null;
    const images = cleanImages(record.images);

    if (!title || !slug || !/^[a-z0-9-]+$/.test(slug) || !description || !region || !price || !durationDays || durationNights === null || groupMin === null || groupMax === null || (hotelStars === null)) {
      return NextResponse.json(
        { error: 'Tour məlumatları yanlışdır' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('tours')
      .insert({
        company_id: company.id,
        title,
        slug,
        description,
        region,
        tour_type: tourType,
        price,
        currency,
        duration_days: durationDays,
        duration_nights: durationNights,
        group_min: groupMin,
        group_max: groupMax,
        transportation_included: record.transportationIncluded === true,
        hotel_included: record.hotelIncluded === true,
        hotel_stars: hotelStars,
        meals_included: mealsIncluded,
        languages: languages.length ? languages : ['az'],
        dates,
        itinerary,
        images,
      })
      .select(TOUR_SELECT)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Server xetası ' }, { status: 500 });
    }

    return NextResponse.json({ tour: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
