import { createClient } from '@/lib/supabase/server';
import NewsListClient from './news-list-client';

export const revalidate = 3600;

export default async function NewsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('news')
    .select('id, title_az, title_en, title_ru, category, image_url, is_published, created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  return <NewsListClient news={data || []} />;
}
