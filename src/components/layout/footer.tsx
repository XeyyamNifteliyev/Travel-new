'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Plane, Map, Users, Video, Trophy, Building2 } from 'lucide-react';

export function Footer() {
  const t = useTranslations('common');
  const tc = useTranslations('community');
  const params = useParams();
  const locale = params?.locale as string;

  return (
    <footer className="bg-bg-surface border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-lg mb-3">
              <Plane className="w-5 h-5" />
              <span>{t('appName')}</span>
            </div>
            <p className="text-txt-sec text-sm">{t('tagline')}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-txt">{t('reservation')}</h3>
            <ul className="space-y-2 text-sm text-txt-sec">
              <li><Link href={`/${locale}/flights`} className="hover:text-primary transition-colors">{t('flights')}</Link></li>
              <li><Link href={`/${locale}/hotels`} className="hover:text-primary transition-colors">{t('hotels')}</Link></li>
              <li><Link href={`/${locale}/tours`} className="hover:text-primary transition-colors flex items-center gap-1"><Map className="w-3 h-3" />{tc('tours')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-txt">{t('explore')}</h3>
            <ul className="space-y-2 text-sm text-txt-sec">
              <li><Link href={`/${locale}/countries`} className="hover:text-primary transition-colors">{t('countries')}</Link></li>
              <li><Link href={`/${locale}/ai-planner`} className="hover:text-primary transition-colors">{t('aiPlanner')}</Link></li>
              <li><Link href={`/${locale}/blog`} className="hover:text-primary transition-colors">{t('blog')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-txt">{t('services')}</h3>
            <ul className="space-y-2 text-sm text-txt-sec">
              <li><Link href={`/${locale}/companions`} className="hover:text-primary transition-colors flex items-center gap-1"><Users className="w-3 h-3" />{tc('companions')}</Link></li>
              <li><Link href={`/${locale}/visa`} className="hover:text-primary transition-colors">{t('visa')}</Link></li>
              <li><Link href={`/${locale}/company`} className="hover:text-primary transition-colors flex items-center gap-1"><Building2 className="w-3 h-3" />{tc('services')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-6 text-center text-sm text-txt-muted">
          &copy; {new Date().getFullYear()} {t('appName')}. {t('allRightsReserved')}
        </div>
      </div>
    </footer>
  );
}
