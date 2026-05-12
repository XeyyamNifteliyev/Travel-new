import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getIpFromHeaders } from '@/lib/rate-limit';

const COMMENT_SELECT = 'id, blog_id, user_id, content, created_at, author:profiles!blog_comments_user_id_fkey(name, avatar_url)';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const { searchParams } = new URL(request.url);
    const blogId = searchParams.get('blogId');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10) || 50));
    const offset = (page - 1) * limit;

    let query = supabase
      .from('blog_comments')
      .select(COMMENT_SELECT, { count: 'exact' })
      .order('created_at', { ascending: true });

    if (blogId) {
      query = query.eq('blog_id', blogId);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: 'Server xetası ' }, { status: 500 });
    }

    return NextResponse.json({ comments: data, page, limit, total: count || 0 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getIpFromHeaders(request);
    const rl = checkRateLimit(ip, 'comment-create', 5, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { blogId, content } = body;

    if (!blogId || !content) {
      return NextResponse.json(
        { error: 'Blog ID and content are required' },
        { status: 400 }
      );
    }

    const trimmedContent = typeof content === 'string' ? content.trim() : '';
    if (trimmedContent.length < 2 || trimmedContent.length > 2000) {
      return NextResponse.json(
        { error: 'Şərh 2-2000 simvol arası olmalıdır' },
        { status: 400 }
      );
    }

    const { data: blog } = await supabase
      .from('blogs')
      .select('id')
      .eq('id', blogId)
      .single();
    if (!blog) {
      return NextResponse.json({ error: 'Blog tapılmadı' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('blog_comments')
      .insert({
        blog_id: blogId,
        user_id: user.id,
        content: trimmedContent,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Server xetası ' }, { status: 500 });
    }

    return NextResponse.json({ comment: data }, { status: 201 });
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
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('blog_comments')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: 'Server xetası ' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
