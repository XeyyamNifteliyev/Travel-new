import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getIpFromHeaders, rateLimitResponse } from '@/lib/rate-limit';

const YOUTUBE_SELECT = 'id, user_id, youtube_url, title, description, thumbnail_url, destination_country, destination_city, language, status, created_at, updated_at';

function cleanString(value: unknown, maxLength: number, required = false) {
  if (value === undefined || value === null) return required ? null : undefined;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return required ? null : undefined;
  return trimmed;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20));
    const offset = (page - 1) * limit;
    const userId = searchParams.get('userId');
    const country = searchParams.get('country');
    const language = searchParams.get('language');

    let query = supabase
      .from('youtube_links')
      .select(`
        ${YOUTUBE_SELECT},
        author:profiles!youtube_links_user_id_fkey(name, avatar_url)
      `, { count: 'exact' })
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (country) {
      query = query.eq('destination_country', country);
    }
    if (language) {
      query = query.eq('language', language);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: 'Server xetası ' }, { status: 500 });
    }

    return NextResponse.json({ videos: data, page, limit, total: count || 0, totalPages: count ? Math.ceil(count / limit) : 0 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getIpFromHeaders(request);
    const rl = await checkRateLimit(ip, 'youtube-submit', 5, 3_600_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, ...rateLimitResponse(rl.remaining, rl.resetAt) }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const record = body as Record<string, unknown>;
    const youtubeUrl = cleanString(record.youtubeUrl, 500, true);
    const title = cleanString(record.title, 180, true);
    const description = cleanString(record.description, 2000);
    const destinationCountry = cleanString(record.destinationCountry, 120);
    const destinationCity = cleanString(record.destinationCity, 120);
    const language = ['az', 'en', 'ru'].includes(String(record.language)) ? String(record.language) : 'az';

    if (!youtubeUrl || !title) {
      return NextResponse.json(
        { error: 'YouTube URL and title are required' },
        { status: 400 }
      );
    }

    const videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    const { data, error } = await supabase
      .from('youtube_links')
      .insert({
        user_id: user.id,
        youtube_url: youtubeUrl,
        title,
        description,
        thumbnail_url: thumbnailUrl,
        destination_country: destinationCountry,
        destination_city: destinationCity,
        language,
      })
      .select(YOUTUBE_SELECT)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Server xetası ' }, { status: 500 });
    }

    return NextResponse.json({ video: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const ip = getIpFromHeaders(request);
    const rl = await checkRateLimit(ip, 'youtube-delete', 20, 3_600_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, ...rateLimitResponse(rl.remaining, rl.resetAt) }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('youtube_links')
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
