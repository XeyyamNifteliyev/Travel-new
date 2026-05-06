'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { X, Menu, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types/supabase-helpers';
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

interface MobileMenuProps {
  navGroups: NavGroup[];
  chatLink: NavLink | null;
  unreadCount?: number;
  isAdmin?: boolean;
}

export function MobileMenu({ navGroups, chatLink, unreadCount = 0, isAdmin = false }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [isLight, setIsLight] = useState(false);
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const supabase = createClient();
  const isMounted = useRef(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsLight(document.documentElement.classList.contains('light'));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => authSub.unsubscribe();
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    router.push(`/${locale}`);
  };

  const bg = '#FFFFFF';
  const text = '#0F172A';
  const textSec = '#334155';
  const border = 'rgba(15, 23, 42, 0.12)';
  const hover = '#E2E8F0';
  const overlay = 'rgba(15, 23, 42, 0.18)';
  const navItemBg = '#F8FAFC';
  const submenuBg = '#F1F5F9';
  const triggerBg = isLight ? 'rgba(255,255,255,0.96)' : 'rgba(15,23,42,0.96)';
  const triggerText = isLight ? '#0F172A' : '#F8FAFC';
  const triggerBorder = isLight ? 'rgba(15,23,42,0.12)' : 'rgba(248,250,252,0.18)';

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 rounded-xl border shadow-sm backdrop-blur transition-colors"
        style={{
          color: triggerText,
          backgroundColor: triggerBg,
          borderColor: triggerBorder,
          boxShadow: isLight ? '0 8px 24px rgba(15, 23, 42, 0.12)' : '0 8px 24px rgba(0, 0, 0, 0.28)',
        }}
        aria-label="Menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundColor: overlay }}
          onClick={() => setIsOpen(false)}
        />

        <div
          className={`absolute right-0 top-0 h-full w-72 transform transition-transform duration-300 ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{
            backgroundColor: bg,
            borderLeft: `1px solid ${border}`,
            boxShadow: '-24px 0 64px rgba(15, 23, 42, 0.18)',
          }}
        >
          <div className="flex items-center justify-between gap-4 p-4" style={{ borderBottom: `1px solid ${border}` }}>
            <span
              className="block min-w-0 max-w-37.5 truncate text-sm font-semibold font-heading leading-none"
              style={{ color: text }}
            >
              {t('appName')}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              onPointerDown={(event) => {
                event.stopPropagation();
                setIsOpen(false);
              }}
              className="relative z-20 shrink-0 p-3 rounded-xl border transition-colors pointer-events-auto"
              style={{
                color: text,
                backgroundColor: navItemBg,
                borderColor: border,
              }}
              aria-label="Close menu"
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = hover; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = navItemBg; }}
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          <nav className="flex flex-col p-4 gap-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
            {navGroups.map((group) => {
              const GroupIcon = group.icon;

              if (group.link) {
                return (
                  <Link
                    key={group.key}
                    href={group.link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-base font-medium"
                    style={{ color: text, backgroundColor: navItemBg }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = hover; e.currentTarget.style.color = '#0EA5E9'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = navItemBg; e.currentTarget.style.color = text; }}
                  >
                    <GroupIcon className="w-4 h-4" />
                    {group.label}
                  </Link>
                );
              }

              const isExpanded = expandedGroup === group.key;

              return (
                <div key={group.key}>
                  <button
                    onClick={() => setExpandedGroup(isExpanded ? null : group.key)}
                    className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors text-base font-medium"
                    style={{ color: text, backgroundColor: isExpanded ? hover : navItemBg }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = hover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isExpanded ? hover : navItemBg; }}
                  >
                    <span className="flex items-center gap-3">
                      <GroupIcon className="w-4 h-4" />
                      {group.label}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && group.children && (
                    <div
                      className="mt-2 ml-3 rounded-xl p-2"
                      style={{
                        backgroundColor: submenuBg,
                        border: `1px solid ${border}`,
                        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.75)',
                      }}
                    >
                      {group.children.map((child) => {
                        const ChildIcon = child.icon;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium"
                            style={{ color: child.highlight ? '#0EA5E9' : textSec }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = hover; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                          >
                            <ChildIcon className="w-3.5 h-3.5" />
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {chatLink && (
              <Link
                href={chatLink.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-base font-medium relative"
                style={{ color: text, backgroundColor: navItemBg }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = hover; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = navItemBg; }}
              >
                <chatLink.icon className="w-4 h-4" />
                {chatLink.label}
                {unreadCount > 0 && (
                  <span className="ml-auto min-w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 leading-none">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            )}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4" style={{ borderTop: `1px solid ${border}` }}>
            {user ? (
              <div className="flex flex-col gap-3">
                <Link
                  href={isAdmin ? `/${locale}/admin` : `/${locale}/profile`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium"
                  style={{ color: text }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = hover; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <UserIcon className="w-5 h-5" />
                  <span>{t('profile')}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full"
                  style={{ color: '#f87171' }}
                >
                  <LogOut className="w-5 h-5" />
                  <span>{t('logout')}</span>
                </button>
              </div>
            ) : (
              <Link
                href={`/${locale}/auth/login`}
                onClick={() => setIsOpen(false)}
                className="inline-flex w-fit items-center justify-start gap-2 px-3 py-2 bg-primary text-sm font-semibold rounded-lg transition-colors"
                style={{ color: '#0F172A' }}
              >
                <UserIcon className="w-4 h-4" />
                <span>{t('login')}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
