'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { LanguageSwitcher } from './language-switcher';
import { ThemeToggle } from './theme-toggle';
import { MobileMenu } from './mobile-menu';
import { Plane, User, MessageCircle, Sparkles, PlaneTakeoff, Hotel, MapPin, Users, ShieldCheck, BookOpen, MessageSquareText } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { type LucideIcon } from 'lucide-react';

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  highlight?: boolean;
}

export function Header() {
  const t = useTranslations('common');
  const locale = useLocale();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    }
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navLinks: NavLink[] = [
    { href: `/${locale}/flights`, label: t('flights'), icon: PlaneTakeoff },
    { href: `/${locale}/hotels`, label: t('hotels'), icon: Hotel },
    { href: `/${locale}/tours`, label: t('tours'), icon: MapPin },
    { href: `/${locale}/countries`, label: t('countries'), icon: MapPin },
    { href: `/${locale}/companions`, label: t('companions'), icon: Users },
    { href: `/${locale}/visa`, label: t('visa'), icon: ShieldCheck },
    { href: `/${locale}/blog`, label: t('blog'), icon: BookOpen },
    { href: `/${locale}/ai-planner`, label: t('aiPlanner'), icon: Sparkles, highlight: true },
  ];

  const isLoggedInNavLinks: NavLink[] = isLoggedIn
    ? [...navLinks, { href: `/${locale}/chat`, label: t('chat'), icon: MessageSquareText }]
    : navLinks;

  return (
    <header className="sticky top-0 z-50 bg-header-bg backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={`/${locale}`} className="flex items-center gap-2 text-primary font-bold text-xl">
            <Plane className="w-6 h-6" />
            <span>{t('appName')}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-4">
            {isLoggedInNavLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`hover:text-primary transition-colors text-sm flex items-center gap-1.5 text-txt-sec ${
                    link.highlight ? 'text-primary font-medium' : ''
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageSwitcher />
            <Link
              href={isLoggedIn ? `/${locale}/profile` : `/${locale}/auth/login`}
              className="hidden md:flex items-center gap-1 text-sm text-txt-sec hover:text-primary transition-colors"
            >
              <User className="w-4 h-4" />
              <span>{isLoggedIn ? t('profile') : t('login')}</span>
            </Link>
            <MobileMenu navLinks={isLoggedInNavLinks} />
          </div>
        </div>
      </div>
    </header>
  );
}