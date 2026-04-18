import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Calendar, Eye, Heart } from 'lucide-react';
import type { Blog } from '@/types/blog';

const CARD_GRADIENTS = [
  'from-sky-600 via-blue-700 to-indigo-900',
  'from-emerald-600 via-teal-700 to-cyan-900',
  'from-violet-600 via-purple-700 to-indigo-900',
  'from-amber-600 via-orange-700 to-red-900',
  'from-rose-600 via-pink-700 to-fuchsia-900',
  'from-cyan-600 via-sky-700 to-blue-900',
];

const MONTHS_SHORT = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'İyn', 'İyl', 'Avq', 'Sen', 'Okt', 'Noy', 'Dek'];

function formatBlogDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

interface BlogCardProps {
  blog: Blog;
  index?: number;
}

export function BlogCard({ blog, index = 0 }: BlogCardProps) {
  const params = useParams();
  const locale = params?.locale as string;
  const author = (blog as any).author;
  const gradient = CARD_GRADIENTS[(index ?? 0) % CARD_GRADIENTS.length];
  const initial = author?.name?.[0]?.toUpperCase() || 'A';

  return (
    <Link href={`/${locale}/blog/${blog.id}`}>
      <article className="bg-bg-surface/50 rounded-2xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-[0_0_20px_rgba(14,165,233,0.15)] transition-all duration-300 group flex flex-col h-full">
        <div className="h-48 overflow-hidden relative">
          {blog.cover_image ? (
            <img
              src={blog.cover_image}
              alt={blog.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-75 group-hover:brightness-100"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradient} group-hover:scale-105 transition-transform duration-500`}>
              <div className="absolute inset-0 bg-black/10" />
            </div>
          )}
          {blog.tags && blog.tags.length > 0 && (
            <div className="absolute top-3 right-3">
              <span className="px-2.5 py-1 bg-bg-base/60 backdrop-blur-md text-primary text-xs rounded-full font-semibold border border-white/10">
                {blog.tags[0]}
              </span>
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col flex-grow">
          <div className="flex gap-2 mb-2">
            {blog.tags && blog.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[11px] text-primary uppercase tracking-widest font-semibold">
                {tag}
              </span>
            ))}
          </div>

          <h3 className="text-lg font-bold text-txt mb-2.5 group-hover:text-primary transition-colors leading-snug line-clamp-2">
            {blog.title}
          </h3>

          <p className="text-txt-sec text-sm font-medium line-clamp-2 mb-4 leading-snug flex-grow">
            {blog.excerpt || blog.title}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-border/10">
            <div className="flex items-center gap-2.5">
              {author?.avatar_url ? (
                <img
                  src={author.avatar_url}
                  alt={author.name}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {initial}
                </div>
              )}
              <span className="text-xs text-txt-sec font-medium">{author?.name || 'Anonim'}</span>
            </div>
            <div className="flex items-center gap-3 text-txt-muted">
              <span className="flex items-center gap-1 text-xs">
                <Calendar className="w-3 h-3" />
                {formatBlogDate(blog.created_at)}
              </span>
              <span className="flex items-center gap-1 text-xs">
                <Eye className="w-3 h-3" />
                {blog.views}
              </span>
              <span className="flex items-center gap-1 text-xs">
                <Heart className="w-3 h-3" />
                {blog.likes}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
