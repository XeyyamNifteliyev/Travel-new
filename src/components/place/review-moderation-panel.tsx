'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, X, Trash2, AlertTriangle, Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface Review {
  id: string;
  place_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  content: string;
  status: string;
  created_at: string;
  flagged?: boolean;
  profiles?: {
    id: string;
    name?: string | null;
    display_name?: string | null;
    avatar_url?: string | null;
  } | null;
}

export function ReviewModerationPanel() {
  const t = useTranslations('places');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function fetchReviews() {
    setLoading(true);
    try {
      const res = await fetch('/api/reviews/moderate?status=pending&limit=20');
      const data = await res.json();
      if (res.ok) {
        setReviews(data.reviews || []);
        setCount(data.count || 0);
      }
    } catch {
      toast.error('Failed to load reviews');
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchReviews();
  }, []);

  async function handleStatusChange(reviewId: string, status: string) {
    setActionLoading(reviewId);
    try {
      const res = await fetch('/api/reviews/moderate', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, status }),
      });
      if (res.ok) {
        toast.success(status === 'published' ? t('reviewApproved') : t('reviewRejected'));
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        setCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      toast.error('Action failed');
    }
    setActionLoading(null);
  }

  async function handleDelete(reviewId: string) {
    setActionLoading(reviewId);
    try {
      const res = await fetch(`/api/reviews/moderate?reviewId=${reviewId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Review deleted');
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        setCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      toast.error('Delete failed');
    }
    setActionLoading(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{t('moderation')}</h2>
        <span className="text-sm text-txt-sec">{t('pendingReviews')}: {count}</span>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-txt-sec">
          {t('noPendingReviews')}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-2xl border border-border bg-bg-surface p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {review.profiles?.avatar_url ? (
                      <Image src={review.profiles.avatar_url} alt="" width={40} height={40} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-semibold text-primary">
                        {(review.profiles?.display_name || review.profiles?.name || '?')[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{review.profiles?.display_name || review.profiles?.name || t('anonymous')}</p>
                    <p className="text-xs text-txt-sec">{new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500 fill-current" />
                  <span className="text-sm font-semibold">{review.rating}</span>
                </div>
              </div>

              {review.flagged && (
                <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {t('flaggedContent')}
                </div>
              )}

              {review.title && <h3 className="font-semibold mt-3">{review.title}</h3>}
              <p className="text-sm text-txt-sec mt-2 leading-6">{review.content}</p>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                <button
                  onClick={() => handleStatusChange(review.id, 'published')}
                  disabled={actionLoading === review.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500/10 text-green-600 hover:bg-green-500/20 disabled:opacity-60 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  {t('approve')}
                </button>
                <button
                  onClick={() => handleStatusChange(review.id, 'rejected')}
                  disabled={actionLoading === review.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-600 hover:bg-red-500/20 disabled:opacity-60 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  {t('reject')}
                </button>
                <button
                  onClick={() => handleDelete(review.id)}
                  disabled={actionLoading === review.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-txt-sec hover:bg-bg-surface disabled:opacity-60 transition-colors ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
