import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const TOUR_DETAIL_SELECT = `
  id, company_id, title, slug, description, region, tour_type, price, currency,
  duration_days, duration_nights, group_min, group_max, transportation_included,
  hotel_included, hotel_stars, meals_included, languages, dates, itinerary, images,
  status, rating, review_count, views, bookings_count, created_at, updated_at,
  company:tour_companies(company_name, logo_url, is_verified, rating, review_count, phone, whatsapp, telegram, email)
`;

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const { data, error } = await supabase
        .from('tours')
        .select(TOUR_DETAIL_SELECT)
        .eq('status', 'active')
        .eq('slug', slug)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Server xetası ' }, { status: 500 });
      }

      return NextResponse.json({ tour: data });
    }

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20));
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
        .from('tours')
        .select(TOUR_DETAIL_SELECT, { count: 'exact' })
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: 'Server xetası ' }, { status: 500 });
    }

    return NextResponse.json({ tours: data, page, limit, total: count || 0, totalPages: count ? Math.ceil(count / limit) : 0 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
