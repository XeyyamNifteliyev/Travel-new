'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { X, Menu, User, LogOut, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
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
}

export function MobileMenu({ navGroups, chatLink }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const supabase = createClient();
  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;

    supabase.auth.getUser().then(({ data: { user } }: { data: { user: any } }) => {
      setUser(user);
    });

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
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

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 text-txt-sec hover:text-primary transition-colors"
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
          className="absolute inset-0 bg-black/60"
          onClick={() => setIsOpen(false)}
        />

        <div
          className={`absolute right-0 top-0 h-full w-72 bg-bg-base border-l border-surface transform transition-transform duration-300 ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <span className="text-primary font-bold text-lg">{t('appName')}</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-txt-sec hover:text-primary transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
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
                    className="flex items-center gap-3 px-4 py-3 text-txt-sec hover:text-primary hover:bg-bg-surface-hover rounded-lg transition-colors text-base"
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
                    className="flex items-center justify-between w-full px-4 py-3 text-txt-sec hover:text-primary hover:bg-bg-surface-hover rounded-lg transition-colors text-base"
                  >
                    <span className="flex items-center gap-3">
                      <GroupIcon className="w-4 h-4" />
                      {group.label}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && group.children && (
                    <div className="ml-4 pl-3 border-l border-border">
                      {group.children.map((child) => {
                        const ChildIcon = child.icon;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2.5 hover:text-primary hover:bg-bg-surface-hover rounded-lg transition-colors text-sm ${
                              child.highlight ? 'text-primary font-medium' : 'text-txt-sec'
                            }`}
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
                className="flex items-center gap-3 px-4 py-3 text-txt-sec hover:text-primary hover:bg-bg-surface-hover rounded-lg transition-colors text-base"
              >
                <chatLink.icon className="w-4 h-4" />
                {chatLink.label}
              </Link>
            )}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
            {user ? (
              <div className="flex flex-col gap-3">
                <Link
                  href={`/${locale}/profile`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-txt-sec hover:text-primary hover:bg-bg-surface-hover rounded-lg transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>{t('profile')}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-surface/50 rounded-lg transition-colors w-full"
                >
                  <LogOut className="w-5 h-5" />
                  <span>{t('logout')}</span>
                </button>
              </div>
            ) : (
              <Link
                href={`/${locale}/auth/login`}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-dark font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                <User className="w-5 h-5" />
                <span>{t('login')}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
