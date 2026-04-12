import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Calendar, Eye, Heart } from 'lucide-react';
import type { Blog } from '@/types/blog';

interface BlogCardProps {
  blog: Blog;
}

export function BlogCard({ blog }: BlogCardProps) {
  const params = useParams();
  const locale = params?.locale as string;

  return (
    <Link href={`/${locale}/blog/${blog.id}`}>
      <article className="bg-bg-surface rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-colors">
        {blog.cover_image && (
          <img
            src={blog.cover_image}
            alt={blog.title}
            className="w-full h-48 object-cover"
          />
        )}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{blog.title}</h3>
          <div className="flex items-center gap-4 text-txt-sec text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(blog.created_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {blog.views}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {blog.likes}
            </span>
          </div>
          {blog.tags.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {blog.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
