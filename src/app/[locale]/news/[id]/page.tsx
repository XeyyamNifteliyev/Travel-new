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
    .select('id, title_az, title_en, title_ru, summary_az, summary_en, summary_ru, content_az, content_en, content_ru, category, source_name, source_url, image_url, published_at, is_published, created_at, updated_at')
    .eq('id', id)
    .eq('is_published', true)
    .single();

  if (!data) notFound();

  return <NewsDetailClient news={data as Record<string, unknown>} locale={locale} />;
}
