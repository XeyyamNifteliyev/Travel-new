'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import type { User, BlogListItem } from '@/types/supabase-helpers';
import { Plus, Trash2, ExternalLink, Calendar, Eye, Heart } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { confirmDialog } from '@/components/ui/confirm-dialog';

export function MyBlogs() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale as string;
  const supabase = createClient();
  const t = useTranslations('profile');
  const tc = useTranslations('common');
  const [blogs, setBlogs] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      const { data } = await supabase
        .from('blogs')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setBlogs(data as BlogListItem[]);
      setLoading(false);
    };
    fetchBlogs();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDialog({
      title: t('deleteBlogTitle'),
      message: t('deleteBlogMsg'),
      confirmText: tc('cancel'),
      cancelText: tc('cancel'),
    });
    if (!confirmed) return;
    setDeleting(id);
    const { error } = await supabase.from('blogs').delete().eq('id', id).eq('author_id', user?.id);
    if (error) {
      toast.error(t('deleteFailed'));
    } else {
      setBlogs((prev) => prev.filter((b) => b.id !== id));
      toast.success(t('deleteBlogSuccess'));
    }
    setDeleting(null);
  };

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-16 bg-bg-surface rounded-xl" /><div className="h-16 bg-bg-surface rounded-xl" /><div className="h-16 bg-bg-surface rounded-xl" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('blogsTitle')}</h2>
        <Link
          href={`/${locale}/blog/new`}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('newBlog')}
        </Link>
      </div>

      {blogs.length === 0 ? (
        <div className="bg-bg-surface rounded-xl p-8 border border-border text-center">
          <p className="text-txt-sec mb-4">{t('noBlogs')}</p>
          <Link
            href={`/${locale}/blog/new`}
            className="text-primary hover:underline"
          >
            {t('writeFirstBlog')}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {blogs.map((blog) => (
            <div key={blog.id} className="bg-bg-surface rounded-xl p-4 border border-border flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    blog.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {blog.status === 'published' ? t('statusPublished') : t('statusDraft')}
                  </span>
                  <span className="text-xs text-txt-muted">{blog.language?.toUpperCase()}</span>
                </div>
                <h3 className="font-semibold truncate">{blog.title}</h3>
                <div className="flex items-center gap-4 text-sm text-txt-sec mt-1">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(blog.created_at).toLocaleDateString('az-AZ')}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{blog.views || 0}</span>
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{blog.likes || 0}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/${locale}/blog/${blog.id}`}
                  className="p-2 text-txt-sec hover:text-primary transition-colors"
                  title={t('viewBtn')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(blog.id)}
                  disabled={deleting === blog.id}
                  className="p-2 text-txt-sec hover:text-red-400 transition-colors disabled:opacity-50"
                  title={t('deleteBtn')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
