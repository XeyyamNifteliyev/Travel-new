import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

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
        *,
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
      return NextResponse.json({ error: error.message }, { status: 500 });
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

    const body = await request.json();
    const {
      title,
      slug,
      description,
      region,
      tourType,
      price,
      currency,
      durationDays,
      durationNights,
      groupMin,
      groupMax,
      transportationIncluded,
      hotelIncluded,
      hotelStars,
      mealsIncluded,
      languages,
      dates,
      itinerary,
      images,
    } = body;

    if (!title || !slug || !description || !region || !price || !durationDays) {
      return NextResponse.json(
        { error: 'Title, slug, description, region, price, and duration are required' },
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
        tour_type: tourType || 'active',
        price,
        currency: currency || 'AZN',
        duration_days: durationDays,
        duration_nights: durationNights || 0,
        group_min: groupMin || 1,
        group_max: groupMax || 20,
        transportation_included: transportationIncluded || false,
        hotel_included: hotelIncluded || false,
        hotel_stars: hotelStars,
        meals_included: mealsIncluded || [],
        languages: languages || ['az'],
        dates: dates || [],
        itinerary,
        images: images || [],
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tour: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
