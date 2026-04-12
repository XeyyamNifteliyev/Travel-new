import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const { data, error } = await supabase
        .from('tours')
        .select(`
          *,
          company:tour_companies(company_name, logo_url, is_verified, rating, review_count, phone, whatsapp, telegram, email)
        `)
        .eq('status', 'active')
        .eq('slug', slug)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ tour: data });
    }

    const { data, error } = await supabase
      .from('tours')
      .select(`
        *,
        company:tour_companies(company_name, logo_url, is_verified, rating, review_count, phone, whatsapp, telegram, email)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tours: data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
