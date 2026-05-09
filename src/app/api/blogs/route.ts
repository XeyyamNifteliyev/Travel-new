import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MAX_TITLE_LENGTH = 180;
const MAX_CONTENT_LENGTH = 50000;
const MAX_COVER_LENGTH = 1000;

function optionalString(value: unknown, maxLength: number) {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return null;
  return trimmed;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const limit = Math.min(20, parseInt(searchParams.get('limit') || '10', 10) || 10);
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('blogs')
    .select('id, author_id, title, cover_image, language, tags, views, likes, status, created_at, updated_at', { count: 'exact' })
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Blogs query error:', error);
    return NextResponse.json({ error: 'Server xətası' }, { status: 500 });
  }

  return NextResponse.json({ blogs: data, page, limit, total: count || 0 });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Yanlış sorğu formatı' }, { status: 400 });
  }

  const bodyRecord = body as Record<string, unknown>;
  const title = optionalString(bodyRecord.title, MAX_TITLE_LENGTH);
  const content = optionalString(bodyRecord.content, MAX_CONTENT_LENGTH);
  const coverImage = optionalString(bodyRecord.cover_image_url ?? bodyRecord.cover_image, MAX_COVER_LENGTH);
  const language = ['az', 'en', 'ru'].includes(String(bodyRecord.language)) ? String(bodyRecord.language) : 'az';
  const tags = Array.isArray(bodyRecord.tags)
    ? bodyRecord.tags.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0).slice(0, 8)
    : [];

  if (!title || !content) {
    return NextResponse.json({ error: 'Başlıq və mətn tələb olunur' }, { status: 400 });
  }

  const { data, error } = await supabase.from('blogs').insert({
    title,
    content,
    cover_image: coverImage || null,
    language,
    tags,
    status: 'draft',
    author_id: user.id,
  }).select('id, title, content, cover_image, language, tags, views, likes, status, created_at, updated_at').single();

  if (error) {
    console.error('Blog create error:', error);
    return NextResponse.json({ error: 'Blog yaradıla bilmədi' }, { status: 500 });
  }

  return NextResponse.json(data);
}
