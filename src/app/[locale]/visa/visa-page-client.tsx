'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import VisaCountryGrid from '@/components/visa/visa-country-grid';
import VisaSearchBar from '@/components/visa/visa-search-bar';
import { VisaCheckWidget } from '@/components/visa/visa-check-widget';
import type { VisaCountryData } from '@/types/country';

export function VisaPageClient({ countries }: { countries: VisaCountryData[] }) {
  const t = useTranslations('visa');
  const [search, setSearch] = useState('');

  const filtered = search
    ? countries.filter(({ country }) => {
        const q = search.toLowerCase();
        return (
          country.name_az.toLowerCase().includes(q) ||
          country.name_en.toLowerCase().includes(q) ||
          country.name_ru.toLowerCase().includes(q) ||
          country.slug.includes(q)
        );
      })
    : countries;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
      <p className="text-txt-sec mb-8">{t('subtitle')}</p>
      <div className="mb-8">
        <VisaCheckWidget />
      </div>
      <VisaSearchBar value={search} onChange={setSearch} />
      <VisaCountryGrid countries={filtered} />
    </div>
  );
}
