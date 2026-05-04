'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, Users, Banknote, Globe, Languages, Ruler, Loader2 } from 'lucide-react';
import type { CountryInfo } from '@/lib/countries-api';

interface CountryInfoCardProps {
  code: string;
}

function formatPopulation(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

function formatArea(n: number): string {
  return `${n.toLocaleString()} km²`;
}

export function CountryInfoCard({ code }: CountryInfoCardProps) {
  const t = useTranslations('countryInfo');
  const [data, setData] = useState<CountryInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    fetch(`/api/countries/${code}`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed');
        return r.json();
      })
      .then((d: CountryInfo) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [code]);

  if (loading) {
    return (
      <div className="bg-bg-surface rounded-xl border border-border p-6 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
        <span className="text-txt-sec text-sm">{t('loading')}</span>
      </div>
    );
  }

  if (error || !data) return null;

  const currencyList = Object.values(data.currencies)
    .map((c) => `${c.name} (${c.symbol})`)
    .join(', ');
  const languageList = Object.values(data.languages).join(', ');

  return (
    <div className="bg-bg-surface rounded-2xl border border-border p-6">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-3xl">{data.flagEmoji}</span>
        <div>
          <h3 className="text-lg font-bold">{data.name}</h3>
          <p className="text-xs text-txt-sec">{data.officialName}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {data.capital.length > 0 && (
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-txt-sec uppercase tracking-widest">{t('capital')}</p>
              <p className="text-sm font-medium">{data.capital.join(', ')}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <Users className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-txt-sec uppercase tracking-widest">{t('population')}</p>
            <p className="text-sm font-medium">{formatPopulation(data.population)}</p>
          </div>
        </div>

        {currencyList && (
          <div className="flex items-start gap-3">
            <Banknote className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-txt-sec uppercase tracking-widest">{t('currency')}</p>
              <p className="text-sm font-medium">{currencyList}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <Globe className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-txt-sec uppercase tracking-widest">{t('region')}</p>
            <p className="text-sm font-medium">{data.region}{data.subregion ? ` — ${data.subregion}` : ''}</p>
          </div>
        </div>

        {languageList && (
          <div className="flex items-start gap-3">
            <Languages className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-txt-sec uppercase tracking-widest">{t('languages')}</p>
              <p className="text-sm font-medium">{languageList}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <Ruler className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-txt-sec uppercase tracking-widest">{t('area')}</p>
            <p className="text-sm font-medium">{formatArea(data.area)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
