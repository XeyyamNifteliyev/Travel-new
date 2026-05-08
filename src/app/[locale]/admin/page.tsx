'use client';

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@/types/supabase-helpers';
import {
  BarChart3, CheckCircle2, FileText, LayoutDashboard, LogOut, Map, Menu,
  MessageSquareText, Settings, Shield, Users, Video, X
} from 'lucide-react';
import Link from 'next/link';
import { ReviewModerationPanel } from '@/components/place/review-moderation-panel';
import { DashboardOverview } from '@/components/profile/dashboard-overview';
import { MyBlogs } from '@/components/profile/my-blogs';
import { MyCompanions } from '@/components/profile/my-companions';
import { MyVideos } from '@/components/profile/my-videos';
import { MyMap } from '@/components/profile/my-map';
import { ProfileSettings } from '@/components/profile/profile-settings';

type AdminTab = 'dashboard' | 'blogs' | 'companions' | 'videos' | 'map' | 'settings' | 'reviews';

interface AdminStats {
  pendingReviews: number;
  publishedReviews: number;
  places: number;
  countries: number;
}

export default function AdminPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string;
  const supabase = createClient();
  const t = useTranslations('profile');
  const placesT = useTranslations('places');
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState<AdminStats>({
    pendingReviews: 0,
    publishedReviews: 0,
    places: 0,
    countries: 0,
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/${locale}/auth/login`);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push(`/${locale}/profile`);
        return;
      }

      setUser(user);
      setLoading(false);
    };
    getUser();
  }, [locale, router, supabase]);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      setStatsLoading(true);
      const [pendingReviews, publishedReviews, places, countries] = await Promise.all([
        supabase.from('place_reviews').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('place_reviews').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('places').select('id', { count: 'exact', head: true }),
        supabase.from('countries').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        pendingReviews: pendingReviews.count || 0,
        publishedReviews: publishedReviews.count || 0,
        places: places.count || 0,
        countries: countries.count || 0,
      });
      setStatsLoading(false);
    };

    fetchStats();
  }, [supabase, user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`/${locale}`);
  };

  const selectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const profileNavItems: { id: AdminTab; label: string; icon: ReactNode }[] = [
    { id: 'dashboard', label: t('dashboard'), icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'blogs', label: t('blogs'), icon: <FileText className="w-5 h-5" /> },
    { id: 'companions', label: t('companions'), icon: <Users className="w-5 h-5" /> },
    { id: 'videos', label: t('videos'), icon: <Video className="w-5 h-5" /> },
    { id: 'map', label: t('map'), icon: <Map className="w-5 h-5" /> },
    { id: 'settings', label: t('settings'), icon: <Settings className="w-5 h-5" /> },
  ];

  const adminNavItems: { id: AdminTab; label: string; icon: ReactNode; badge?: number }[] = [
    { id: 'reviews', label: placesT('pendingReviews'), icon: <MessageSquareText className="w-5 h-5" />, badge: stats.pendingReviews },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">{t('adminPanel')}</p>
              <h1 className="text-3xl font-bold">{t('adminOverview')}</h1>
              <p className="text-txt-sec mt-2">{t('adminOverviewSub')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <AdminStatCard
                title={placesT('pendingReviews')}
                value={stats.pendingReviews}
                loading={statsLoading}
                icon={<MessageSquareText className="w-5 h-5 text-amber-400" />}
                onClick={() => selectTab('reviews')}
              />
              <AdminStatCard
                title={t('publishedReviews')}
                value={stats.publishedReviews}
                loading={statsLoading}
                icon={<CheckCircle2 className="w-5 h-5 text-green-400" />}
              />
              <AdminStatCard
                title={t('placesCount')}
                value={stats.places}
                loading={statsLoading}
                icon={<BarChart3 className="w-5 h-5 text-primary" />}
              />
              <AdminStatCard
                title={t('countriesCount')}
                value={stats.countries}
                loading={statsLoading}
                icon={<Shield className="w-5 h-5 text-secondary" />}
              />
            </div>

            <div className="rounded-2xl border border-border bg-bg-surface p-6">
              <h2 className="font-bold text-xl mb-2">{placesT('pendingReviews')}</h2>
              <p className="text-sm text-txt-sec mb-4">{t('pendingReviewsHint')}</p>
              <button
                type="button"
                onClick={() => selectTab('reviews')}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <MessageSquareText className="w-4 h-4" />
                {t('openPendingReviews')}
              </button>
            </div>

            <DashboardOverview />
          </div>
        );
      case 'blogs': return <MyBlogs />;
      case 'companions': return <MyCompanions />;
      case 'videos': return <MyVideos />;
      case 'map': return <MyMap />;
      case 'settings': return <ProfileSettings />;
      case 'reviews': return <ReviewModerationPanel />;
      default: return <DashboardOverview />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-bg-surface rounded w-48" />
          <div className="h-4 bg-bg-surface rounded w-64" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-bg-surface rounded-lg border border-border"
        aria-label={sidebarOpen ? 'Close admin menu' : 'Open admin menu'}
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex gap-6">
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 w-72 bg-bg-surface rounded-xl border border-border p-4
          transform transition-transform duration-200 lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-y-auto
        `}>
          <div className="flex items-center gap-3 p-3 mb-4 border-b border-border pb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{t('adminPanel')}</p>
              <p className="text-sm text-txt-sec truncate">{user.email}</p>
            </div>
          </div>

          <nav className="space-y-1">
            <p className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-txt-sec">{t('profile')}</p>
            {profileNavItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-txt-sec hover:bg-bg-surface-hover/50 hover:text-txt'
                }`}
              >
                {item.icon}
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            ))}

            <div className="border-t border-border my-3" />

            <p className="px-3 pt-1 pb-1 text-xs font-semibold uppercase tracking-wider text-txt-sec">{t('adminPanel')}</p>
            {adminNavItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-txt-sec hover:bg-bg-surface-hover/50 hover:text-txt'
                }`}
              >
                {item.icon}
                <span className="flex-1 text-left">{item.label}</span>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className={`min-w-6 rounded-full px-2 py-0.5 text-xs text-center ${
                    activeTab === item.id ? 'bg-primary/20 text-primary' : 'bg-amber-500/20 text-amber-500'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 mt-4 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {t('logout')}
          </button>
        </aside>

        <main className="flex-1 min-w-0">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function AdminStatCard({
  title,
  value,
  loading,
  icon,
  onClick,
}: {
  title: string;
  value: number;
  loading: boolean;
  icon: ReactNode;
  onClick?: () => void;
}) {
  const content = (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="rounded-xl bg-bg-base p-2">{icon}</div>
      </div>
      <p className="text-sm text-txt-sec">{title}</p>
      <p className="text-3xl font-bold mt-1">{loading ? '...' : value.toLocaleString()}</p>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="rounded-2xl border border-border bg-bg-surface p-5 text-left hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-bg-surface p-5">
      {content}
    </div>
  );
}
