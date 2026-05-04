'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { BedDouble, Bot, CalendarDays, MapPin, Plane, Search, Stamp } from 'lucide-react';

type SearchMode = 'flights' | 'hotels' | 'visa' | 'planner';

const MODES: { key: SearchMode; icon: typeof Plane; href: string }[] = [
  { key: 'flights', icon: Plane, href: '/flights' },
  { key: 'hotels', icon: BedDouble, href: '/hotels' },
  { key: 'visa', icon: Stamp, href: '/visa' },
  { key: 'planner', icon: Bot, href: '/ai-planner' },
];

export function HomeSearchPanel() {
  const t = useTranslations('home');
  const locale = useLocale();
  const [mode, setMode] = useState<SearchMode>('planner');

  const active = MODES.find((item) => item.key === mode) ?? MODES[0];

  return (
    <div className="glass-panel border border-white/10 rounded-2xl p-3 md:p-4 shadow-2xl">
      <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
        {MODES.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === mode;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setMode(item.key)}
              className={`flex min-w-max items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-txt text-bg-base shadow-lg'
                  : 'bg-white/5 text-txt-sec hover:bg-white/10 hover:text-txt'
              }`}
            >
              <Icon className="h-4 w-4" />
              {t(`search.${item.key}`)}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1.2fr_1fr_0.8fr_auto]">
        <div className="rounded-xl bg-bg-base/60 border border-border px-4 py-3">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-txt-muted">
            <MapPin className="h-4 w-4 text-primary" />
            {t('search.destination')}
          </div>
          <p className="mt-1 text-sm font-semibold text-txt">{t(`search.${mode}Hint`)}</p>
        </div>
        <div className="rounded-xl bg-bg-base/60 border border-border px-4 py-3">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-txt-muted">
            <CalendarDays className="h-4 w-4 text-secondary" />
            {t('search.when')}
          </div>
          <p className="mt-1 text-sm font-semibold text-txt">{t('search.flexible')}</p>
        </div>
        <div className="rounded-xl bg-bg-base/60 border border-border px-4 py-3">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-txt-muted">
            <Search className="h-4 w-4 text-accent" />
            {t('search.mode')}
          </div>
          <p className="mt-1 text-sm font-semibold text-txt">{t(`search.${mode}Action`)}</p>
        </div>
        <Link
          href={`/${locale}${active.href}`}
          className="flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-sky-400 px-6 py-4 text-sm font-bold text-white shadow-[0_18px_45px_rgba(14,165,233,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(14,165,233,0.36)]"
        >
          {t('search.go')}
        </Link>
      </div>
    </div>
  );
}
