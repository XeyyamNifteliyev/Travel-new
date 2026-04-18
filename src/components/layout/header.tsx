'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { LanguageSwitcher } from './language-switcher';
import { ThemeToggle } from './theme-toggle';
import { MobileMenu } from './mobile-menu';
import { Plane, User, ChevronDown, PlaneTakeoff, Hotel, MapPin, Users, ShieldCheck, BookOpen, MessageSquareText, Sparkles, Globe, Newspaper } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { type LucideIcon } from 'lucide-react';

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  highlight?: boolean;
}

interface NavGroup {
  key: string;
  label: string;
  icon: LucideIcon;
  highlight?: boolean;
  children?: NavLink[];
  link?: NavLink;
}

export function Header() {
  const t = useTranslations('common');
  const locale = useLocale();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabase = createClient();
  const { unreadCount } = useUnreadMessages(userId);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      setUserId(user?.id ?? null);
    }
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (openGroup) {
        const allRefs = Object.values(groupRefs.current);
        if (!allRefs.some(ref => ref && ref.contains(e.target as Node))) {
          setOpenGroup(null);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openGroup]);

  function handleGroupEnter(key: string) {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpenGroup(key);
  }

  function handleGroupLeave() {
    timeoutRef.current = setTimeout(() => {
      setOpenGroup(null);
    }, 150);
  }

  const navGroups: NavGroup[] = [
    {
      key: 'reservation',
      label: t('reservation'),
      icon: PlaneTakeoff,
      children: [
        { href: `/${locale}/flights`, label: t('flights'), icon: PlaneTakeoff },
        { href: `/${locale}/hotels`, label: t('hotels'), icon: Hotel },
        { href: `/${locale}/tours`, label: t('tours'), icon: MapPin },
      ],
    },
    {
      key: 'explore',
      label: t('explore'),
      icon: Globe,
      children: [
        { href: `/${locale}/countries`, label: t('countries'), icon: Globe },
        { href: `/${locale}/ai-planner`, label: t('aiPlanner'), icon: Sparkles, highlight: true },
      ],
    },
    {
      key: 'services',
      label: t('services'),
      icon: Users,
      children: [
        { href: `/${locale}/companions`, label: t('companions'), icon: Users },
        { href: `/${locale}/visa`, label: t('visa'), icon: ShieldCheck },
      ],
    },
    {
      key: 'blog',
      label: t('blog'),
      icon: BookOpen,
      children: [
        { href: `/${locale}/blog`, label: t('blog'), icon: BookOpen },
        { href: `/${locale}/news`, label: t('news'), icon: Newspaper },
      ],
    },
  ];

  const chatLink: NavLink | null = isLoggedIn
    ? { href: `/${locale}/chat`, label: t('chat'), icon: MessageSquareText }
    : null;

  return (
    <header className="sticky top-0 z-50 bg-header-bg backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={`/${locale}`} className="flex items-center gap-2 text-primary font-bold text-xl">
            <Plane className="w-6 h-6" />
            <span>{t('appName')}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navGroups.map((group) => {
              const GroupIcon = group.icon;

              if (group.link) {
                return (
                  <Link
                    key={group.key}
                    href={group.link.href}
                    className="hover:text-primary transition-colors text-sm flex items-center gap-1.5 text-txt-sec px-2 py-1.5 rounded-md"
                  >
                    <GroupIcon className="w-3.5 h-3.5" />
                    {group.label}
                  </Link>
                );
              }

              return (
                <div
                  key={group.key}
                  ref={(el) => { groupRefs.current[group.key] = el; }}
                  className="relative"
                  onMouseEnter={() => handleGroupEnter(group.key)}
                  onMouseLeave={handleGroupLeave}
                >
                  <button
                    className={`hover:text-primary transition-colors text-sm flex items-center gap-1.5 text-txt-sec px-2 py-1.5 rounded-md ${
                      openGroup === group.key ? 'text-primary bg-bg-surface-hover' : ''
                    }`}
                    onClick={() => setOpenGroup(openGroup === group.key ? null : group.key)}
                  >
                    <GroupIcon className="w-3.5 h-3.5" />
                    {group.label}
                    <ChevronDown className={`w-3 h-3 transition-transform ${openGroup === group.key ? 'rotate-180' : ''}`} />
                  </button>

                  {openGroup === group.key && group.children && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-bg-base border border-border rounded-lg shadow-lg py-1 z-50">
                      {group.children.map((child) => {
                        const ChildIcon = child.icon;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setOpenGroup(null)}
                            className={`flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-bg-surface-hover transition-colors ${
                              child.highlight ? 'text-primary font-medium' : 'text-txt-sec'
                            }`}
                          >
                            <ChildIcon className="w-4 h-4" />
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isLoggedIn && (
              <Link href={`/${locale}/chat`} className="relative p-2 text-txt-sec hover:text-primary transition-colors">
                <MessageSquareText className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 leading-none">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            )}
            <LanguageSwitcher />
            <Link
              href={isLoggedIn ? `/${locale}/profile` : `/${locale}/auth/login`}
              className="hidden md:flex items-center gap-1 text-sm text-txt-sec hover:text-primary transition-colors"
            >
              <User className="w-4 h-4" />
              <span>{isLoggedIn ? t('profile') : t('login')}</span>
            </Link>
            <MobileMenu navGroups={navGroups} chatLink={chatLink} unreadCount={unreadCount} />
          </div>
        </div>
      </div>
    </header>
  );
}
