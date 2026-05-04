'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@/lib/supabase/client';

interface PlaceHelpfulButtonProps {
  reviewId: string;
  initialCount: number;
  locale: string;
}

export default function PlaceHelpfulButton({ reviewId, initialCount, locale }: PlaceHelpfulButtonProps) {
  const t = useTranslations('places');
  const supabase = useMemo(() => createBrowserClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadState() {
      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = userData.user?.id || null;
      if (!mounted) return;

      setUserId(currentUserId);

      if (currentUserId) {
        const { data } = await supabase
          .from('place_review_helpful_votes')
          .select('id')
          .eq('review_id', reviewId)
          .eq('user_id', currentUserId)
          .maybeSingle();

        if (!mounted) return;
        setVoted(!!data);
      }

      setChecking(false);
    }

    loadState();

    return () => {
      mounted = false;
    };
  }, [reviewId, supabase]);

  async function handleToggle() {
    if (!userId || loading) return;

    setLoading(true);

    if (voted) {
      const { error } = await supabase
        .from('place_review_helpful_votes')
        .delete()
        .eq('review_id', reviewId)
        .eq('user_id', userId);

      setLoading(false);

      if (error) {
        toast.error(t('helpfulError'));
        return;
      }

      setVoted(false);
      setCount((value) => Math.max(0, value - 1));
      return;
    }

    const { error } = await supabase
      .from('place_review_helpful_votes')
      .insert({ review_id: reviewId, user_id: userId });

    setLoading(false);

    if (error) {
      if (error.code !== '23505') {
        toast.error(t('helpfulError'));
      }
      return;
    }

    setVoted(true);
    setCount((value) => value + 1);
  }

  if (checking) {
    return <span className="text-xs text-txt-sec">{count} {t('helpful')}</span>;
  }

  if (!userId) {
    return (
      <Link href={`/${locale}/auth/login`} className="inline-flex items-center gap-1 text-xs text-txt-sec hover:text-primary">
        <ThumbsUp className="w-3 h-3" />
        {count} {t('helpful')}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1 text-xs transition-colors disabled:opacity-60 ${
        voted ? 'text-primary font-semibold' : 'text-txt-sec hover:text-primary'
      }`}
    >
      <ThumbsUp className={`w-3 h-3 ${voted ? 'fill-current' : ''}`} />
      {count} {t('helpful')}
    </button>
  );
}
