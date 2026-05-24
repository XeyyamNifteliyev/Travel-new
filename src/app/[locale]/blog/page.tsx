import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import type { Locale } from '@/i18n/routing';
import type { Blog } from '@/types/blog';
import BlogListClient from './blog-list-client';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://travelaz.az';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });

  return {
    title: `${t('heroTitle')} - TravelAZ`,
    description: t('heroSubtitle'),
    openGraph: {
      title: `${t('heroTitle')} - TravelAZ`,
      description: t('heroSubtitle'),
      type: 'website',
      locale: locale === 'az' ? 'az_AZ' : locale === 'ru' ? 'ru_RU' : 'en_US',
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}/blog`,
    },
  };
}

export const revalidate = 1800;

export default async function BlogListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const currentLocale = locale as Locale;
  const supabase = await createClient();

  const { data } = await supabase
    .from('blogs')
    .select('id, author_id, title, excerpt, content, cover_image, language, tags, views, likes, status, created_at, updated_at, author:profiles!blogs_author_id_fkey(name, avatar_url)')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  const blogs = (data || []) as unknown as Blog[];

  const allTags = Array.from(
    new Set(blogs.flatMap((blog) => blog.tags || []))
  ).slice(0, 10);

  const topAuthors = Array.from(
    new Map(
      blogs
        .filter((b) => b.author?.name)
        .map((b) => [b.author!.name, b.author!])
    ).values()
  ).slice(0, 5);

  return (
    <BlogListClient
      blogs={blogs}
      allTags={allTags}
      topAuthors={topAuthors}
      locale={currentLocale}
    />
  );
}
