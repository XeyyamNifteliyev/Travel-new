'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Send, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@/lib/supabase/client';

interface PlaceReviewFormProps {
  placeId: string;
  locale: string;
}

export default function PlaceReviewForm({ placeId, locale }: PlaceReviewFormProps) {
  const t = useTranslations('places');
  const router = useRouter();
  const supabase = createBrowserClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visitDate, setVisitDate] = useState('');

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUserId(data.user?.id || null);
      setCheckingAuth(false);
    });

    return () => {
      mounted = false;
    };
  }, [supabase]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId || !content.trim()) return;

    setSubmitting(true);
    const { error } = await supabase.from('place_reviews').insert({
      place_id: placeId,
      user_id: userId,
      rating,
      title: title.trim() || null,
      content: content.trim(),
      visit_date: visitDate || null,
      status: 'published',
    });

    setSubmitting(false);

    if (error) {
      if (error.code === '23505') {
        toast.error(t('duplicateReview'));
      } else {
        toast.error(t('reviewSubmitError'));
      }
      return;
    }

    toast.success(t('reviewSubmitted'));
    setRating(5);
    setTitle('');
    setContent('');
    setVisitDate('');
    router.refresh();
  }

  if (checkingAuth) {
    return (
      <div className="rounded-2xl border border-border bg-bg-surface p-5">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="rounded-2xl border border-border bg-bg-surface p-5">
        <h2 className="font-bold text-xl mb-2">{t('writeReview')}</h2>
        <p className="text-sm text-txt-sec mb-4">{t('loginToReview')}</p>
        <Link href={`/${locale}/auth/login`} className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
          {t('login')}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-bg-surface p-5">
      <h2 className="font-bold text-xl mb-4">{t('writeReview')}</h2>

      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            className="p-1 text-amber-500 hover:scale-110 transition-transform"
            aria-label={`${value} ${t('stars')}`}
          >
            <Star className={`w-6 h-6 ${value <= rating ? 'fill-current' : ''}`} />
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={t('reviewTitlePlaceholder')}
          className="w-full rounded-xl border border-border bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
        <input
          type="date"
          value={visitDate}
          onChange={(event) => setVisitDate(event.target.value)}
          className="w-full rounded-xl border border-border bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
      </div>

      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder={t('reviewContentPlaceholder')}
        rows={4}
        className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm outline-none focus:border-primary resize-none"
        required
      />

      <button
        type="submit"
        disabled={submitting || !content.trim()}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {t('submitReview')}
      </button>
    </form>
  );
}
