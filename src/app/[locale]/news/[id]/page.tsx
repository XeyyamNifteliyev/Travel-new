import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import NewsDetailClient from './news-detail-client';

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from('news')
    .select('id, title_az, title_en, title_ru, content_az, content_en, content_ru, category, image_url, is_published, created_at, updated_at')
    .eq('id', id)
    .eq('is_published', true)
    .maybeSingle();

  if (!data) notFound();

  return <NewsDetailClient news={data as Record<string, unknown>} locale={locale} />;
}
