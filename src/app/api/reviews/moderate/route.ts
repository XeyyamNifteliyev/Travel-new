import { createClient } from '@/lib/supabase/server';
import { isFlaggedContent } from '@/lib/content-filter';
import { isAdminUser } from '@/lib/auth/admin';
import { NextRequest, NextResponse } from 'next/server';

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  if (!(await isAdminUser(supabase, user))) return null;
  return user;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await verifyAdmin(supabase);
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 20));
    const offset = (page - 1) * limit;

    const [reviewsResult, countResult] = await Promise.all([
      supabase
        .from('place_reviews')
        .select('*, profiles(id, name, display_name, avatar_url)')
        .eq('status', status)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1),
      supabase
        .from('place_reviews')
        .select('id', { count: 'exact', head: true })
        .eq('status', status),
    ]);

    if (reviewsResult.error) {
      return NextResponse.json({ error: 'Rəylər yüklənə bilmədi' }, { status: 500 });
    }

    const reviews = (reviewsResult.data || []).map((review: Record<string, unknown>) => ({
      ...review,
      flagged: isFlaggedContent((review.content as string) || '') || isFlaggedContent((review.title as string) || ''),
    }));

    return NextResponse.json({
      reviews,
      count: countResult.count || 0,
      page,
      limit,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await verifyAdmin(supabase);
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { reviewId, status } = body;

    if (!reviewId || !status || !['published', 'rejected', 'hidden'].includes(status)) {
      return NextResponse.json({ error: 'reviewId and valid status required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('place_reviews')
      .update({ status })
      .eq('id', reviewId);

    if (error) {
      return NextResponse.json({ error: 'Server xetası ' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await verifyAdmin(supabase);
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json({ error: 'reviewId required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('place_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      return NextResponse.json({ error: 'Server xetası ' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
