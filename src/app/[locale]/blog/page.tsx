'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@/types/supabase-helpers';
import { BlogCard } from '@/components/blog/blog-card';
import type { Blog } from '@/types/blog';
import { Plus, Search, TrendingUp, User , Eye} from 'lucide-react';

export default function BlogListPage() {
  const t = useTranslations('blog');
  const params = useParams();
  const locale = params?.locale as string;
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('');

  useEffect(() => {
    const supabase = createClient();
    const fetchBlogs = async () => {
      let query = supabase
        .from('blogs')
        .select(`
          *,
          author:profiles!blogs_author_id_fkey(name, avatar_url)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      const { data } = await query;
      if (data) {
        let filtered = data as Blog[];
        if (filterTag) {
          filtered = filtered.filter(blog =>
            blog.tags?.some(tag => tag.toLowerCase() === filterTag.toLowerCase())
          );
        }
        setBlogs(filtered);
      }
      setLoading(false);
    };
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchBlogs();
    getUser();
  }, [locale, search, filterTag]);

  const allTags = Array.from(
    new Set(blogs.flatMap(blog => blog.tags || []))
  ).slice(0, 10);

  const topAuthors = Array.from(
    new Map(
      blogs
        .filter(b => b.author?.name)
        .map(b => [b.author!.name, b.author!])
    ).values()
  ).slice(0, 5);

  const featuredBlog = blogs[0];
  const restBlogs = blogs.slice(1);

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero */}
        <div className="mb-12">
          <span className="text-primary text-sm uppercase tracking-[0.2em] font-semibold">{t('journal')}</span>
          <h1 className="text-4xl md:text-6xl font-bold text-txt tracking-tight leading-[1.1] mt-3 mb-4">
            {t('heroTitle')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-sky-300">
              {t('heroHighlight')}
            </span>{' '}
            {t('heroEnd')}
          </h1>
          <p className="text-txt-sec max-w-xl text-base md:text-lg leading-relaxed">
            {t('heroSubtitle')}
          </p>
        </div>

        {/* Featured Article */}
        {featuredBlog && !search && !filterTag && (
          <Link href={`/${locale}/blog/${featuredBlog.id}`} className="block mb-12">
            <div className="group relative rounded-2xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-[0_0_30px_rgba(14,165,233,0.2)] transition-all duration-500">
              <div className="h-64 md:h-96 relative overflow-hidden">
                {featuredBlog.cover_image ? (
                  <Image
                    src={featuredBlog.cover_image}
                    alt={featuredBlog.title}
                    fill
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-75 group-hover:brightness-100"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/40 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                  <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                    {t('featured')}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mt-3 leading-tight max-w-2xl">
                    {featuredBlog.title}
                  </h2>
                  <div className="flex items-center gap-3 text-white/80 text-sm mt-3">
                    {featuredBlog.author?.avatar_url ? (
                      <Image
                        src={featuredBlog.author.avatar_url}
                        alt={featuredBlog.author.name}
                        width={28}
                        height={28}
                        className="w-7 h-7 rounded-full border border-white/30"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary/30 flex items-center justify-center text-xs font-bold text-white">
                        {featuredBlog.author?.name?.[0] || t('anonymous')[0]}
                      </div>
                    )}
                    <span>{featuredBlog.author?.name || t('anonymous')}</span>
                    <span>·</span>
                    <Eye className="w-3.5 h-3.5" />
                    <span>{t('viewsCount', { count: featuredBlog.views })}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Feed */}
          <div className="lg:col-span-8">
            {/* Search + Filters */}
            <div className="glass-panel p-4 rounded-2xl mb-6">
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={t('searchPlaceholder')}
                    className="w-full bg-bg-surface/80 border-none rounded-xl pl-10 pr-4 py-3 text-sm text-txt placeholder:text-txt-muted focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                {user && (
                  <Link
                    href={`/${locale}/blog/new`}
                    className="flex items-center gap-2 bg-gradient-to-br from-primary to-sky-400 text-white px-5 py-3 rounded-full font-bold text-sm hover:shadow-[0_0_30px_rgba(14,165,233,0.4)] transition-all duration-300"
                  >
                    <Plus className="w-4 h-4" />
                    {t('newPost')}
                  </Link>
                )}
              </div>

              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    onClick={() => setFilterTag('')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                      !filterTag
                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                        : 'bg-bg-surface/80 text-txt-sec hover:bg-bg-surface-hover'
                    }`}
                  >
                    {t('allTags')}
                  </button>
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setFilterTag(tag)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                        filterTag === tag
                          ? 'bg-primary text-white shadow-lg shadow-primary/25'
                          : 'bg-bg-surface/80 text-txt-sec hover:bg-bg-surface-hover'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold text-txt mb-5">{t('latestPosts')}</h3>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse bg-bg-surface/50 rounded-2xl overflow-hidden">
                    <div className="h-48 bg-bg-surface/30" />
                    <div className="p-5">
                      <div className="h-5 bg-bg-surface/30 rounded w-3/4 mb-3" />
                      <div className="h-3 bg-bg-surface/30 rounded w-full mb-2" />
                      <div className="h-3 bg-bg-surface/30 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-txt-sec text-lg font-medium">{t('noPosts')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {(search || filterTag ? blogs : restBlogs).map((blog, i) => (
                  <BlogCard key={blog.id} blog={blog} index={i} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            {/* Trending Tags */}
            {allTags.length > 0 && (
              <div className="bg-bg-surface/50 rounded-2xl p-5 border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  <h4 className="text-base font-bold text-txt">{t('trendingTopics')}</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                        filterTag === tag
                          ? 'bg-primary/20 text-primary border-primary/30'
                          : 'bg-bg-surface text-txt-sec border-border hover:bg-primary/10 hover:text-primary'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Top Authors */}
            {topAuthors.length > 0 && (
              <div className="bg-bg-surface/50 rounded-2xl p-5 border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-primary" />
                  <h4 className="text-base font-bold text-txt">{t('authors')}</h4>
                </div>
                <div className="flex flex-col gap-3">
                  {topAuthors.map((author: { name: string; avatar_url?: string }) => (
                    <div key={author.name} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                      {author.avatar_url ? (
                        <Image
                          src={author.avatar_url}
                          alt={author.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full border-2 border-transparent hover:border-primary transition-all"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {author.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-txt">{author.name}</p>
                        <p className="text-xs text-txt-muted">{t('writer')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
