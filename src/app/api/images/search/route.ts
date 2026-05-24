import { NextRequest, NextResponse } from 'next/server';
import { searchUnsplashPhoto } from '@/lib/unsplash';
import { createClient } from '@/lib/supabase/server';
import { isAdminUser } from '@/lib/auth/admin';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!(await isAdminUser(supabase, user))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'q parameter is required' }, { status: 400 });
  }

  const orientation = (searchParams.get('orientation') as 'landscape' | 'portrait' | 'squarish') || 'landscape';
  const perPage = Math.min(parseInt(searchParams.get('per_page') || '5', 10), 30);

  const results = await searchUnsplashPhoto(query, { orientation, perPage });

  return NextResponse.json({
    query,
    results: results.map((r) => ({
      id: r.id,
      slug: r.slug,
      alt_description: r.alt_description,
      urls: r.urls,
      width: r.width,
      height: r.height,
    })),
  });
}
