import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const city = searchParams.get('city');
    const departureDate = searchParams.get('departureDate');
    const genderPreference = searchParams.get('genderPreference');
    const ageMin = searchParams.get('ageMin');
    const ageMax = searchParams.get('ageMax');
    const interests = searchParams.get('interests');
    const languages = searchParams.get('languages');    let query = supabase
      .from('companions')
      .select(`
        *,
        author:profiles!companions_user_id_fkey(name, avatar_url)
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (country) {
      query = query.eq('destination_country', country);
    }
    if (city) {
      query = query.ilike('destination_city', `%${city}%`);
    }
    if (departureDate) {
      query = query.gte('departure_date', departureDate);
    }
    if (genderPreference && genderPreference !== 'any') {
      query = query.eq('gender', genderPreference);
    }
    if (ageMin) {
      const min = parseInt(ageMin);
      if (!isNaN(min)) {
        query = query.lte('age_min', min).gte('age_max', min);
      }
    }
    if (ageMax) {
      const max = parseInt(ageMax);
      if (!isNaN(max)) {
        query = query.lte('age_min', max).gte('age_max', max);
      }
    }
    if (interests) {
      const interestArray = interests.split(',');
      query = query.overlaps('interests', interestArray);
    }
    if (languages) {
      const languageArray = languages.split(',');
      query = query.overlaps('languages', languageArray);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ companions: data || [] });
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

    const body = await request.json();
    const {
      destinationCountry,
      destinationCity,
      departureDate,
      returnDate,
      genderPreference,
      ageMin,
      ageMax,
      interests,
      languages,
      description,
      gender,
    } = body;

    if (!destinationCountry || !departureDate) {
      return NextResponse.json(
        { error: 'Destination country and departure date are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('companions')
      .insert({
        user_id: user.id,
        destination_country: destinationCountry,
        destination_city: destinationCity,
        departure_date: departureDate,
        return_date: returnDate,
        gender_preference: genderPreference || 'any',
        gender: gender || null,
        age_min: ageMin || 18,
        age_max: ageMax || 99,
        interests: interests || [],
        languages: languages || [],
        description,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
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

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Companion ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('companions')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
