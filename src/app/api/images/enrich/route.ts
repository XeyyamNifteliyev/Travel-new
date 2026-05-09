import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { searchUnsplashPhoto } from '@/lib/unsplash';

const RATE_LIMIT_DELAY = 1100;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const type = body.type === 'cities' ? 'cities' : body.type === 'all' ? 'all' : 'countries';
  const limit = Math.min(parseInt(body.limit || '10', 10), 30);
  const dryRun = body.dryRun !== false;

  const enriched: Array<{ table: string; id: string; slug: string; photoId: string; query: string }> = [];
  const errors: Array<{ table: string; id: string; error: string }> = [];

  async function enrichTable(table: 'countries' | 'cities') {
    const selectFields = table === 'countries'
      ? 'id, slug, name_az, cover_photo_id'
      : 'id, slug, name_az, cover_photo_id';

    const { data: rows, error: fetchError } = await supabase
      .from(table)
      .select(selectFields)
      .is('cover_photo_id', null)
      .limit(limit);

    if (fetchError) {
      console.error('Image enrich fetch error:', { table, error: fetchError });
      errors.push({ table, id: '-', error: 'Data oxuna bilmədi' });
      return;
    }

    for (const row of (rows || [])) {
      const query = `${row.name_az} travel landscape`;
      const results = await searchUnsplashPhoto(query, { orientation: 'landscape', perPage: 1 });

      if (results.length === 0) {
        errors.push({ table, id: row.id, error: 'No results from Unsplash' });
        await sleep(RATE_LIMIT_DELAY);
        continue;
      }

      const photoId = results[0].id;
      enriched.push({ table, id: row.id, slug: row.slug, photoId, query });

      if (!dryRun) {
        const updateField = { cover_photo_id: photoId };
        const { error: updateError } = await supabase
          .from(table)
          .update(updateField)
          .eq('id', row.id);

        if (updateError) {
          console.error('Image enrich update error:', { table, id: row.id, error: updateError });
          errors.push({ table, id: row.id, error: 'Şəkil yenilənə bilmədi' });
        }
      }

      await sleep(RATE_LIMIT_DELAY);
    }
  }

  if (type === 'countries' || type === 'all') {
    await enrichTable('countries');
  }
  if (type === 'cities' || type === 'all') {
    await enrichTable('cities');
  }

  return NextResponse.json({
    mode: dryRun ? 'dry-run' : 'apply',
    type,
    enriched,
    enrichedCount: enriched.length,
    errors,
    errorCount: errors.length,
  });
}
