'use client';

import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BlogEditor } from '@/components/blog/blog-editor';
import type { BlogFormData } from '@/types/blog';

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
