'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { CountryCard } from '@/components/country/country-card';
import type { ExpandedCountry } from '@/types/country';

const CONTINENTS = ['all', 'europe', 'asia', 'americas', 'africa', 'oceania'] as const;

interface CountryGridProps {
  countries: ExpandedCountry[];
}

export default function CountryGrid({ countries }: CountryGridProps) {
  const [activeContinent, setActiveContinent] = useState<string>('all');
  const [search, setSearch] = useState('');
  const t = useTranslations('countries');

  const filtered = countries.filter(c => {
    const matchContinent = activeContinent === 'all' || c.continent === activeContinent;
    const name = (c.name_az || '') + (c.name_en || '') + (c.name_ru || '');
    const matchSearch = name.toLowerCase().includes(search.toLowerCase());
    return matchContinent && matchSearch;
  });

  const continentLabels: Record<string, string> = {
    all: t('filterAll'),
    europe: t('filterEurope'),
    asia: t('filterAsia'),
    americas: t('filterAmericas'),
    africa: t('filterAfrica'),
    oceania: t('filterOceania'),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">{t('title')}</h1>
      <p className="text-txt-sec text-lg mb-8">{t('subtitle')}</p>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-sec" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('search')}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {CONTINENTS.map(c => (
          <button
            key={c}
            onClick={() => setActiveContinent(c)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeContinent === c
                ? 'bg-primary text-white shadow-md shadow-primary/25'
                : 'bg-bg-surface border border-border text-txt-sec hover:border-primary/50'
            }`}
          >
            {continentLabels[c]}
          </button>
        ))}
      </div>

      <p className="text-sm text-txt-sec mb-6">{filtered.length} {t('resultsCount')}</p>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(country => (
            <CountryCard key={country.id} country={country} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-txt-sec text-lg">{t('noResults')}</p>
        </div>
      )}
    </div>
  );
}
