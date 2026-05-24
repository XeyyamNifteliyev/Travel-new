import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { blogPostJsonLd } from '@/lib/jsonld';
import type { Metadata } from 'next';
import type { Locale } from '@/i18n/routing';
import type { Blog } from '@/types/blog';
import BlogDetailClient from './blog-detail-client';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://travelaz.az';

export async function generateMetadata({ params }: { params: Promise<{ id: string; locale: string }> }): Promise<Metadata> {
  const { id, locale } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('blogs')
    .select('id, title, cover_image, created_at')
    .eq('id', id)
    .eq('status', 'published')
    .maybeSingle();

  if (!data) return { title: 'Blog - TravelAZ' };

  return {
    title: `${data.title} - TravelAZ`,
    openGraph: {
      title: data.title,
      type: 'article',
      publishedTime: data.created_at,
      images: data.cover_image ? [{ url: data.cover_image, width: 1200, height: 630 }] : undefined,
      locale: locale === 'az' ? 'az_AZ' : locale === 'ru' ? 'ru_RU' : 'en_US',
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}/blog/${id}`,
    },
  };
}

export const revalidate = 1800;

export default async function BlogDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  const currentLocale = locale as Locale;
  const supabase = await createClient();

  const { data } = await supabase
    .from('blogs')
    .select('id, author_id, title, content, cover_image, language, tags, views, likes, status, created_at, updated_at, author:profiles!blogs_author_id_fkey(name, avatar_url, bio)')
    .eq('id', id)
    .eq('status', 'published')
    .single();

  if (!data) notFound();

  const blog = data as unknown as Blog;
  const jsonLd = blogPostJsonLd({
    title: blog.title,
    id: blog.id,
    coverImage: blog.cover_image,
    createdAt: blog.created_at,
    authorName: blog.author?.name,
    locale: currentLocale,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <BlogDetailClient blog={blog} locale={currentLocale} />
    </>
  );
}
