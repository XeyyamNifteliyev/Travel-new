'use client';

import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import type { BlogFormData } from '@/types/blog';

const BlogEditor = dynamic(() => import('@/components/blog/blog-editor').then((mod) => mod.BlogEditor), {
  ssr: false,
  loading: () => <div className="h-96 rounded-2xl border border-border bg-bg-surface animate-pulse" />,
});

export default function NewBlogPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string;

  const handleSave = async (data: BlogFormData) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('blogs').insert({
      ...data,
      author_id: user.id,
      views: 0,
      likes: 0,
    });

    if (!error) router.push(`/${locale}/blog`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <BlogEditor onSave={handleSave} />
    </div>
  );
}
