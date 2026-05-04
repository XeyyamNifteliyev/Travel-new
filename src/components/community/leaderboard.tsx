'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@/lib/supabase/client';
import { Trophy, Eye, Share2, Heart, FileText, Loader2, Crown, Medal } from 'lucide-react';

interface LeaderboardEntry {
  userId: string;
  userName: string;
  avatarUrl?: string;
  totalViews: number;
  totalShares: number;
  totalLikes: number;
  blogCount: number;
  profileVisits: number;
}

export default function LeaderboardPage() {
  const t = useTranslations('community');
  const supabase = createBrowserClient();

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'month' | 'all'>('month');

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  async function fetchLeaderboard() {
    setLoading(true);

    const now = new Date();
    let query = supabase
      .from('blogs')
      .select(`
        author_id,
        views,
        likes,
        author:profiles!blogs_author_id_fkey(name, avatar_url)
      `)
      .eq('status', 'published');

    if (timeframe === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      query = query.gte('created_at', startOfMonth);
    }

    const { data, error } = await query;

    if (!error && data) {
      const aggregated: Record<string, LeaderboardEntry> = {};

      data.forEach((blog: { author_id: string; views: number; likes: number; author: { name: string | null; avatar_url: string | null }[] | null }) => {
        const authorId = blog.author_id;
        const authorEntry = Array.isArray(blog.author) ? blog.author[0] : null;
        if (!aggregated[authorId]) {
          aggregated[authorId] = {
            userId: authorId,
            userName: authorEntry?.name || 'Anonim',
            avatarUrl: authorEntry?.avatar_url ?? undefined,
            totalViews: 0,
            totalShares: 0,
            totalLikes: 0,
            blogCount: 0,
            profileVisits: 0,
          };
        }
        aggregated[authorId].totalViews += blog.views || 0;
        aggregated[authorId].totalLikes += blog.likes || 0;
        aggregated[authorId].blogCount += 1;
      });

      const sorted = Object.values(aggregated).sort((a, b) => b.totalViews - a.totalViews);
      setEntries(sorted);
    }

    setLoading(false);
  }

  function getRankIcon(index: number) {
    if (index === 0) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (index === 1) return <Medal className="w-6 h-6 text-txt-sec" />;
    if (index === 2) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-txt-muted text-sm font-bold">{index + 1}</span>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-base via-bg-surface to-bg-base">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-txt flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              {t('topWriters')}
            </h1>
            <p className="text-txt-sec mt-1">{t('leaderboard')}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeframe('month')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                timeframe === 'month'
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-bg-surface text-txt-sec hover:bg-bg-surface-hover'
              }`}
            >
              {t('thisMonth')}
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                timeframe === 'all'
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-bg-surface text-txt-sec hover:bg-bg-surface-hover'
              }`}
            >
              Hamısı
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-txt-muted mx-auto mb-4" />
            <p className="text-txt-sec text-lg">Hələ məlumat yoxdur</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, index) => (
              <div
                key={entry.userId}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors ${
                  index === 0
                    ? 'bg-yellow-500/5 border-yellow-500/30'
                    : index === 1
                    ? 'bg-bg-surface/30 border-border/30'
                    : index === 2
                    ? 'bg-amber-500/5 border-amber-500/20'
                    : 'bg-card-bg border-border/50'
                }`}
              >
                {/* Rank */}
                <div className="flex-shrink-0">
                  {getRankIcon(index)}
                </div>

                {/* Avatar & Name */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    index === 0 ? 'bg-yellow-500/20' : index === 1 ? 'bg-txt-muted/20' : 'bg-sky-500/20'
                  }`}>
                    <span className="text-txt font-medium">
                      {entry.userName?.[0] || 'A'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-txt font-medium truncate">{entry.userName}</p>
                    <p className="text-txt-sec text-sm">{entry.blogCount} blog</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-txt-sec">
                    <Eye className="w-4 h-4 text-txt-muted" />
                    <span>{entry.totalViews.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-txt-sec">
                    <Heart className="w-4 h-4 text-txt-muted" />
                    <span>{entry.totalLikes.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
