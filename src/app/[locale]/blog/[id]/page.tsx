'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import type { Blog } from '@/types/blog';
import {
  Calendar, Eye, Heart, ArrowLeft, Share2, Tag,
  Send, MessageCircle, Copy, Check
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import BlogComments from '@/components/blog/blog-comments';
import DOMPurify from 'dompurify';

const MONTHS_AZ = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_RU = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

function getMonths(locale: string) {
  if (locale === 'en') return MONTHS_EN;
  if (locale === 'ru') return MONTHS_RU;
  return MONTHS_AZ;
}

function formatDate(dateStr: string, locale: string) {
  const d = new Date(dateStr);
  return `${d.getDate()} ${getMonths(locale)[d.getMonth()]} ${d.getFullYear()}`;
}

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
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const recordView = async () => {
      if (!blogId) return;
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: existing } = await supabase
          .from('blog_views')
          .select('id')
          .eq('blog_id', blogId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (!existing) {
          await supabase.from('blog_views').insert({ blog_id: blogId, user_id: user.id });
          await supabase.rpc('increment_blog_views', { blog_id: blogId });
          setBlog(prev => prev ? { ...prev, views: prev.views + 1 } as Blog : prev);
        }
      } else {
        const viewed = localStorage.getItem(`blog_viewed_${blogId}`);
        if (!viewed) {
          localStorage.setItem(`blog_viewed_${blogId}`, '1');
          await supabase.rpc('increment_blog_views', { blog_id: blogId });
          setBlog(prev => prev ? { ...prev, views: prev.views + 1 } as Blog : prev);
        }
      }
    };
    recordView();
  }, [blogId, supabase]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShowShare(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

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

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = blog?.title || '';

  const shareLinks = [
    { name: 'Telegram', icon: Send, url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, color: 'text-sky-400' },
    { name: 'WhatsApp', icon: MessageCircle, url: `https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`, color: 'text-emerald-400' },
    { name: 'Facebook', icon: Share2, url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, color: 'text-blue-400' },
    { name: 'X (Twitter)', icon: Share2, url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`, color: 'text-txt' },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setShareMsg(t('linkCopied'));
      setTimeout(() => { setCopied(false); setShareMsg(''); }, 2000);
    } catch {}
  };

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse">{t('loading')}</div>;
  if (!blog) return <div className="max-w-3xl mx-auto px-4 py-12">{t('notFound')}</div>;

  const author = (blog as any).author;

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        <Link href={`/${locale}/blog`} className="flex items-center gap-2 text-txt-sec hover:text-primary mb-8 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          {t('backToBlogs')}
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold text-txt mb-6 leading-tight">{blog.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-txt-sec mb-8">
          <span className="flex items-center gap-1.5 font-medium">
            <Calendar className="w-4 h-4" />
            {formatDate(blog.created_at, locale)}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            {t('viewsCount', { count: blog.views })}
          </span>
          <button onClick={handleLike} disabled={likeLoading} className={`flex items-center gap-1.5 transition-colors font-medium ${liked ? 'text-red-400' : 'hover:text-red-400'}`}>
            <Heart className={`w-4 h-4 ${liked ? 'fill-red-400' : ''}`} />
            {blog.likes}
          </button>

          {/* Share dropdown */}
          <div className="relative" ref={shareRef}>
            <button
              onClick={() => setShowShare(!showShare)}
              className="flex items-center gap-1.5 hover:text-primary transition-colors font-medium"
            >
              <Share2 className="w-4 h-4" />
              {t('share')}
            </button>

            {showShare && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-bg-surface border border-border rounded-2xl shadow-2xl py-2 z-50">
                {shareLinks.map(link => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowShare(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm ${link.color} hover:bg-white/5 transition-colors`}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.name}
                  </a>
                ))}
                <div className="border-t border-border my-1" />
                <button
                  onClick={copyLink}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-txt-sec hover:bg-white/5 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? t('copied') : t('copyLink')}
                </button>
                {shareMsg && (
                  <div className="px-4 py-1.5 text-xs text-emerald-400">{shareMsg}</div>
                )}
              </div>
            )}
          </div>
        </div>

        {blog.cover_image && (
          <Image src={blog.cover_image} alt={blog.title} width={1200} height={600} className="w-full rounded-2xl mb-8 shadow-lg" />
        )}

        {author && (
          <div className="flex items-center gap-4 mb-8 p-4 bg-bg-surface/50 rounded-2xl border border-border">
            {author.avatar_url ? (
              <Image src={author.avatar_url} alt={author.name} width={48} height={48} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                {author.name?.[0] || 'A'}
              </div>
            )}
            <div>
              <p className="text-txt font-bold">{author.name}</p>
              {author.bio && <p className="text-txt-sec text-sm">{author.bio}</p>}
            </div>
          </div>
        )}

        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {blog.tags.map((tag, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs rounded-full font-semibold">
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        <div
          className="prose prose-invert max-w-none text-txt-sec leading-relaxed"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content, { ALLOWED_TAGS: ['h1','h2','h3','h4','h5','h6','p','br','strong','em','ul','ol','li','a','blockquote','code','pre','img','hr','table','thead','tbody','tr','th','td'], ALLOWED_ATTR: ['href','target','src','alt','class'] }) }}
        />

        <BlogComments blogId={blog.id} />
      </div>
    </div>
  );
}
