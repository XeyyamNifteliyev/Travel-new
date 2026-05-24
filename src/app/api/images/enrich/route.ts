import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { searchUnsplashPhoto } from '@/lib/unsplash';
import { isAdminUser } from '@/lib/auth/admin';

const RATE_LIMIT_DELAY = 1100;
const UNSAFE_IMAGE_TERMS = [
  'animal',
  'donkey',
  'horse',
  'mountain',
  'beach',
  'sea',
  'forest',
  'desert',
  'rice',
  'field',
  'farm',
  'landscape',
  'rural',
  'wildlife',
];

type ImageRow = {
  id: string;
  slug: string;
  name_az: string | null;
  name_en?: string | null;
  capital?: string | null;
  cover_photo_id: string | null;
  countries?: { name_az?: string | null; name_en?: string | null } | null;
};

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function imageTextIsSafe(text: string): boolean {
  const normalized = text.toLowerCase();
  return !UNSAFE_IMAGE_TERMS.some((term) => normalized.includes(term));
}

function buildQueries(table: 'countries' | 'cities', row: ImageRow): string[] {
  const name = row.name_en || row.name_az || row.slug;
  if (table === 'countries') {
    const capital = row.capital || name;
    return [
      `${capital} ${name} city skyline`,
      `${capital} ${name} architecture`,
      `${capital} ${name} downtown`,
      `${capital} ${name} landmark`,
      `${name} capital city`,
    ];
  }

  const country = row.countries?.name_en || row.countries?.name_az || '';
  return [
    `${name} ${country} city skyline`,
    `${name} ${country} architecture`,
    `${name} downtown`,
    `${name} landmark city`,
  ];
}

async function findSafePhotoUrl(queries: string[], usedPhotoRefs: Set<string>) {
  for (const query of queries) {
    const results = await searchUnsplashPhoto(query, { orientation: 'landscape', perPage: 5 });
    for (const result of results) {
      const text = `${result.alt_description || ''} ${result.slug || ''}`;
      const photoUrl = result.urls.raw || result.urls.regular;
      if (!photoUrl || usedPhotoRefs.has(photoUrl) || !imageTextIsSafe(text)) continue;
      return { photoUrl, query };
    }
    await sleep(RATE_LIMIT_DELAY);
  }
  return null;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await isAdminUser(supabase, user))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const type = body.type === 'cities' ? 'cities' : body.type === 'all' ? 'all' : 'countries';
  const limit = Math.min(parseInt(body.limit || '10', 10), 30);
  const dryRun = body.dryRun !== false;

  const enriched: Array<{ table: string; id: string; slug: string; photoId: string; query: string }> = [];
  const errors: Array<{ table: string; id: string; error: string }> = [];
  const usedPhotoRefs = new Set<string>();

  for (const table of ['countries', 'cities'] as const) {
    const { data } = await supabase.from(table).select('cover_photo_id').not('cover_photo_id', 'is', null);
    (data || []).forEach((row) => {
      if (row.cover_photo_id) usedPhotoRefs.add(row.cover_photo_id);
    });
  }

  async function enrichTable(table: 'countries' | 'cities') {
    const selectFields = table === 'countries'
      ? 'id, slug, name_az, name_en, capital, cover_photo_id'
      : 'id, slug, name_az, name_en, cover_photo_id, countries(name_az, name_en)';

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

    for (const row of ((rows || []) as ImageRow[])) {
      const match = await findSafePhotoUrl(buildQueries(table, row), usedPhotoRefs);

      if (!match) {
        errors.push({ table, id: row.id, error: 'No safe city image found' });
        continue;
      }

      usedPhotoRefs.add(match.photoUrl);
      enriched.push({ table, id: row.id, slug: row.slug, photoId: match.photoUrl, query: match.query });

      if (!dryRun) {
        const updateField = { cover_photo_id: match.photoUrl };
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
