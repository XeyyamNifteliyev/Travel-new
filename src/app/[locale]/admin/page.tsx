'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@/types/supabase-helpers';
import { Shield, LogOut, User, Menu, X } from 'lucide-react';
import { ReviewModerationPanel } from '@/components/place/review-moderation-panel';

export default function AdminPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string;
  const supabase = createClient();
  const t = useTranslations('profile');
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`/${locale}`);
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
        `}>
          <div className="flex items-center gap-3 p-3 mb-4 border-b border-border pb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{t('moderation')}</p>
              <p className="text-sm text-txt-sec truncate">{user.email}</p>
            </div>
          </div>

          <nav className="space-y-1">
            <a
              href={`/${locale}/profile`}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-txt-sec hover:bg-bg-surface-hover/50 hover:text-txt transition-colors"
            >
              <User className="w-5 h-5" />
              {t('dashboard')}
            </a>
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
          <ReviewModerationPanel />
        </main>
      </div>
    </div>
  );
}
