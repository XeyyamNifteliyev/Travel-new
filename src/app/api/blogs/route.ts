import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'Server xetası ' }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { title, content, cover_image_url, status } = body;
  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

  const { data, error } = await supabase.from('blogs').insert({
    title,
    content,
    cover_image_url,
    status: status === 'published' ? 'published' : 'draft',
    author_id: user.id,
  }).select().single();

  if (error) return NextResponse.json({ error: 'Blog yaradıla bilmədi' }, { status: 500 });
  return NextResponse.json(data);
}
