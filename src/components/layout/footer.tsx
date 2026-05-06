'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import {
  BookOpen,
  Building2,
  Globe,
  Hotel,
  Map,
  MapPin,
  Newspaper,
  Plane,
  PlaneTakeoff,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  UtensilsCrossed,
  Video,
} from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

interface FooterLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function Footer() {
  const t = useTranslations('common');
  const tc = useTranslations('community');
  const params = useParams();
  const locale = params?.locale as string;
  const linkClass = 'hover:text-primary transition-colors flex items-center gap-2';

  const reservationLinks: FooterLink[] = [
    { href: `/${locale}/flights`, label: t('flights'), icon: PlaneTakeoff },
    { href: `/${locale}/hotels`, label: t('hotels'), icon: Hotel },
    { href: `/${locale}/restaurants`, label: t('restaurants'), icon: UtensilsCrossed },
    { href: `/${locale}/tours`, label: tc('tours'), icon: Map },
  ];

  const exploreLinks: FooterLink[] = [
    { href: `/${locale}/countries`, label: t('countries'), icon: Globe },
    { href: `/${locale}/cities`, label: t('cities'), icon: MapPin },
    { href: `/${locale}/ai-planner`, label: t('aiPlanner'), icon: Sparkles },
    { href: `/${locale}/blog`, label: t('blog'), icon: BookOpen },
    { href: `/${locale}/news`, label: t('news'), icon: Newspaper },
  ];

  const serviceLinks: FooterLink[] = [
    { href: `/${locale}/companions`, label: tc('companions'), icon: Users },
    { href: `/${locale}/visa`, label: t('visa'), icon: ShieldCheck },
    { href: `/${locale}/company`, label: tc('services'), icon: Building2 },
    { href: `/${locale}/videos`, label: tc('videos'), icon: Video },
    { href: `/${locale}/leaderboard`, label: tc('leaderboard'), icon: Trophy },
  ];

  return (
    <footer className="bg-bg-surface border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-lg mb-3 font-heading">
              <Plane className="w-5 h-5" />
              <span>{t('appName')}</span>
            </div>
            <p className="text-txt-sec text-sm font-medium">{t('tagline')}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-txt">{t('reservation')}</h3>
            <ul className="space-y-2 text-sm text-txt-sec font-medium">
              {reservationLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link href={item.href} className={linkClass}>
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-txt">{t('explore')}</h3>
            <ul className="space-y-2 text-sm text-txt-sec font-medium">
              {exploreLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link href={item.href} className={linkClass}>
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-txt">{t('services')}</h3>
            <ul className="space-y-2 text-sm text-txt-sec font-medium">
              {serviceLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link href={item.href} className={linkClass}>
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-6 text-center text-sm text-txt-muted font-medium">
          &copy; {new Date().getFullYear()} {t('appName')}. {t('allRightsReserved')}
        </div>
      </div>
    </footer>
  );
}
