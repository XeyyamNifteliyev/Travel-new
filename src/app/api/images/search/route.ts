import { NextRequest, NextResponse } from 'next/server';
import { searchUnsplashPhoto } from '@/lib/unsplash';

export async function GET(request: NextRequest) {
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