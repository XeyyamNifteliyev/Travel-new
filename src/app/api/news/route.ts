import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
  const offset = (page - 1) * limit;

  let query = supabase
    .from('news')
    .select('id, title_az, title_en, title_ru, category, image_url, is_published, created_at', { count: 'exact' })
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) query = query.eq('category', category);

  const { data, error, count } = await query;

  if (error) return NextResponse.json({ error: 'Server xetası' }, { status: 500 });
  return NextResponse.json({
    data,
    page,
    limit,
    total: count,
    totalPages: count ? Math.ceil(count / limit) : 0,
  });
}
