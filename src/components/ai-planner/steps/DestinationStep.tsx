'use client';

import { useTranslations } from 'next-intl';
import { MapPin, Search } from 'lucide-react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  destinations: { slug: string; name: string; flag: string }[];
}

export function DestinationStep({ value, onChange, destinations }: Props) {
  const t = useTranslations('aiPlanner');

  return (
    <div>
      <h2 className="text-xl font-bold text-txt mb-2 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-primary" />
        {t('whereTo')}
      </h2>
      <p className="text-txt-sec text-sm mb-6">{t('whereToDesc')}</p>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-sec" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('destinationPlaceholder')}
          className="w-full bg-bg-input border border-border rounded-xl pl-10 pr-4 py-3 text-txt placeholder-txt-muted focus:border-primary focus:outline-none transition-colors"
        />
      </div>

      <p className="text-txt-sec text-xs mb-3">{t('popular')}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {destinations.map((dest) => (
          <button
            key={dest.slug}
            onClick={() => onChange(dest.name)}
            className={`p-3 rounded-xl border text-left transition-all ${
              value === dest.name
                ? 'border-primary bg-primary/10'
                : 'border-border bg-bg-surface hover:border-primary/50'
            }`}
          >
            <div className="text-2xl mb-1">{dest.flag}</div>
            <div className="text-txt text-sm font-medium">{dest.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
