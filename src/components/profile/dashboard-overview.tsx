'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { FileText, Users, Video, Globe, TrendingUp } from 'lucide-react';

export function DashboardOverview() {
  const params = useParams();
  const locale = params?.locale as string;
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ blogs: 0, companions: 0, videos: 0, countries: 0, views: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      const [blogsRes, companionsRes, videosRes, countriesRes] = await Promise.all([
        supabase.from('blogs').select('id, views').eq('author_id', user.id).eq('status', 'published'),
        supabase.from('companions').select('id').eq('user_id', user.id),
        supabase.from('youtube_links').select('id').eq('user_id', user.id),
        supabase.from('user_countries').select('id').eq('user_id', user.id),
      ]);

      const totalViews = (blogsRes.data || []).reduce((sum, b) => sum + (b.views || 0), 0);

      setStats({
        blogs: blogsRes.data?.length || 0,
        companions: companionsRes.data?.length || 0,
        videos: videosRes.data?.length || 0,
        countries: countriesRes.data?.length || 0,
        views: totalViews,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-bg-surface rounded w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-bg-surface rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Bloglar', value: stats.blogs, icon: <FileText className="w-6 h-6 text-blue-400" />, color: 'bg-blue-500/10' },
    { label: 'Yoldaşlar', value: stats.companions, icon: <Users className="w-6 h-6 text-green-400" />, color: 'bg-green-500/10' },
    { label: 'Videolar', value: stats.videos, icon: <Video className="w-6 h-6 text-red-400" />, color: 'bg-red-500/10' },
    { label: 'Ölkələr', value: stats.countries, icon: <Globe className="w-6 h-6 text-yellow-400" />, color: 'bg-yellow-500/10' },
    { label: 'Baxışlar', value: stats.views, icon: <TrendingUp className="w-6 h-6 text-purple-400" />, color: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Xoş gəldin, {user?.user_metadata?.name || 'İstifadəçi'}!</h2>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-bg-surface rounded-xl p-4 border border-border">
            <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-txt-sec">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
