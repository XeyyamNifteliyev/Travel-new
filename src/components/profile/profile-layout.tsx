'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard, FileText, Users, Video, Map, Settings, LogOut, User, Menu, X
} from 'lucide-react';

type Section = 'dashboard' | 'blogs' | 'companions' | 'videos' | 'map' | 'settings';

interface ProfileLayoutProps {
  children: (section: Section) => React.ReactNode;
}

export function ProfileLayout({ children }: ProfileLayoutProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string;
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/${locale}/auth/login`);
      } else {
        setUser(user);
      }
      setLoading(false);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`/${locale}`);
  };

  const menuItems: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Ana Panel', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'blogs', label: 'Bloglarım', icon: <FileText className="w-5 h-5" /> },
    { id: 'companions', label: 'Yoldaş Tap', icon: <Users className="w-5 h-5" /> },
    { id: 'videos', label: 'Videolarım', icon: <Video className="w-5 h-5" /> },
    { id: 'map', label: 'Xəritəm', icon: <Map className="w-5 h-5" /> },
    { id: 'settings', label: 'Tənzimləmələr', icon: <Settings className="w-5 h-5" /> },
  ];

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
      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-bg-surface rounded-lg border border-border"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 w-72 bg-bg-surface rounded-xl border border-border p-4
          transform transition-transform duration-200 lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* User info */}
          <div className="flex items-center gap-3 p-3 mb-4 border-b border-border pb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{user.user_metadata?.name || 'İstifadəçi'}</p>
              <p className="text-sm text-txt-sec truncate">{user.email}</p>
            </div>
          </div>

          {/* Menu items */}
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === item.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-txt-sec hover:bg-bg-surface-hover/50 hover:text-txt'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 mt-4 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Çıxış
          </button>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {children(activeSection)}
        </main>
      </div>
    </div>
  );
}
