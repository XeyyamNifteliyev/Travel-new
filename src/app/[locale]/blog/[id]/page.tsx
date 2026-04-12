'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import type { Blog } from '@/types/blog';
import { Calendar, Eye, Heart, ArrowLeft, Share2, Tag } from 'lucide-react';
import Link from 'next/link';
import BlogComments from '@/components/blog/blog-comments';
import DOMPurify from 'dompurify';

export default function BlogDetailPage() {
  const params = useParams();
  const locale = params?.locale as string;
  const blogId = params?.id as string;
  const t = useTranslations('blog');
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [shareMsg, setShareMsg] = useState('');
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const fetchBlog = async () => {
      const { data } = await supabase
        .from('blogs')
        .select(`
          *,
          author:profiles!blogs_author_id_fkey(name, avatar_url, bio)
        `)
        .eq('id', blogId)
        .single();
      if (data) setBlog(data as Blog);
      setLoading(false);
    };
    fetchBlog();
  }, [blogId, supabase]);

  useEffect(() => {
    const checkLiked = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !blogId) return;
      const { data } = await supabase
        .from('blog_likes')
        .select('id')
        .eq('blog_id', blogId)
        .eq('user_id', user.id)
        .single();
      setLiked(!!data);
    };
    checkLiked();
  }, [blogId, supabase]);

  const handleLike = useCallback(async () => {
    if (!blog || likeLoading) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setLikeLoading(true);

    if (liked) {
      const { error } = await supabase
        .from('blog_likes')
        .delete()
        .eq('blog_id', blog.id)
        .eq('user_id', user.id);
      if (!error) {
        setLiked(false);
        setBlog(prev => prev ? { ...prev, likes: Math.max(0, prev.likes - 1) } as Blog : prev);
        await supabase.rpc('decrement_blog_likes', { blog_id: blog.id });
      }
    } else {
      const { error } = await supabase
        .from('blog_likes')
        .insert({ blog_id: blog.id, user_id: user.id });
      if (!error) {
        setLiked(true);
        setBlog(prev => prev ? { ...prev, likes: prev.likes + 1 } as Blog : prev);
        await supabase.rpc('increment_blog_likes', { blog_id: blog.id });
      }
    }
    setLikeLoading(false);
  }, [blog, liked, likeLoading, supabase]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: blog?.title, url });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setShareMsg(t('linkCopied') || 'Link kopyalandı!');
        setTimeout(() => setShareMsg(''), 2000);
      } catch {
        setShareMsg(t('shareFailed') || 'Paylaşmaq alınmadı');
        setTimeout(() => setShareMsg(''), 2000);
      }
    }
  }, [blog?.title, t]);

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse">{t('loading')}</div>;
  if (!blog) return <div className="max-w-3xl mx-auto px-4 py-12">{t('notFound')}</div>;

  const author = (blog as any).author;

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href={`/${locale}/blog`} className="flex items-center gap-2 text-txt-sec hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" />
          {t('backToBlogs')}
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold text-txt mb-4">{blog.title}</h1>

        <div className="flex items-center gap-4 text-txt-sec text-sm mb-8">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(blog.created_at).toLocaleDateString('az-AZ', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {blog.views} {t('views')}
          </span>
          <button onClick={handleLike} disabled={likeLoading} className={`flex items-center gap-1 transition-colors ${liked ? 'text-red-400' : 'hover:text-red-400'}`}>
            <Heart className={`w-4 h-4 ${liked ? 'fill-red-400' : ''}`} />
            {blog.likes} {t('likes')}
          </button>
          <button onClick={handleShare} className="flex items-center gap-1 hover:text-sky-400 transition-colors relative">
            <Share2 className="w-4 h-4" />
            Paylaş
            {shareMsg && <span className="absolute -top-8 left-0 text-xs bg-sky-500 text-white px-2 py-1 rounded whitespace-nowrap">{shareMsg}</span>}
          </button>
        </div>

        {blog.cover_image && (
          <img src={blog.cover_image} alt={blog.title} className="w-full rounded-xl mb-8" />
        )}

        {author && (
          <div className="flex items-center gap-3 mb-8 p-4 bg-card-bg rounded-xl border border-border">
            <div className="w-10 h-10 bg-sky-500/20 rounded-full flex items-center justify-center">
              <span className="text-sky-400 font-medium">{author.name?.[0] || 'A'}</span>
            </div>
            <div>
              <p className="text-txt font-medium">{author.name}</p>
              {author.bio && <p className="text-txt-sec text-sm">{author.bio}</p>}
            </div>
          </div>
        )}

        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {blog.tags.map((tag, i) => (
              <span key={i} className="flex items-center gap-1 px-3 py-1 bg-sky-500/10 text-sky-400 text-sm rounded-full">
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        <div
          className="prose prose-invert max-w-none text-txt-sec"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content, { ALLOWED_TAGS: ['h1','h2','h3','h4','h5','h6','p','br','strong','em','ul','ol','li','a','blockquote','code','pre','img','hr','table','thead','tbody','tr','th','td'], ALLOWED_ATTR: ['href','target','src','alt','class'] }) }}
        />

        <BlogComments blogId={blog.id} />
      </div>
    </div>
  );
}
