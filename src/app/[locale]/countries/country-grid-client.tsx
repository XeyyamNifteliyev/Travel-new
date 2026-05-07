'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { CountryCard } from '@/components/country/country-card';
import type { ExpandedCountry } from '@/types/country';

const CONTINENTS = ['all', 'europe', 'asia', 'americas', 'africa', 'oceania'] as const;

interface CountryGridProps {
  countries: ExpandedCountry[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  activeContinent: string;
}

export default function CountryGrid({
  countries,
  currentPage,
  totalPages,
  totalCount,
  activeContinent,
}: CountryGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const t = useTranslations('countries');

  const updateParams = (newPage: number, newContinent: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newContinent !== 'all') {
      params.set('continent', newContinent);
    } else {
      params.delete('continent');
    }
    if (newPage > 1) {
      params.set('page', String(newPage));
    } else {
      params.delete('page');
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleContinentChange = (continent: string) => {
    updateParams(1, continent);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      updateParams(page, activeContinent);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const filtered = countries.filter(c => {
    if (!search.trim()) return true;
    const name = (c.name_az || '') + (c.name_en || '') + (c.name_ru || '');
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const continentLabels: Record<string, string> = {
    all: t('filterAll'),
    europe: t('filterEurope'),
    asia: t('filterAsia'),
    americas: t('filterAmericas'),
    africa: t('filterAfrica'),
    oceania: t('filterOceania'),
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      
      if (currentPage > 3) pages.push('...');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) pages.push(i);
      }
      
      if (currentPage < totalPages - 2) pages.push('...');
      
      if (totalPages > 1) pages.push(totalPages);
    }
    
    return pages;
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
            onClick={() => handleContinentChange(c)}
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

      <p className="text-sm text-txt-sec mb-6">
        {totalCount} {t('resultsCount')}
        {totalPages > 1 && ` · ${t('page')} ${currentPage} / ${totalPages}`}
      </p>

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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border bg-bg-surface text-sm font-medium transition-all hover:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            {t('prev')}
          </button>

          <div className="flex gap-1">
            {getPageNumbers().map((page, idx) => (
              typeof page === 'string' ? (
                <span key={`ellipsis-${idx}`} className="px-3 py-2 text-sm text-txt-sec">
                  {page}
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === page
                      ? 'bg-primary text-white'
                      : 'border border-border bg-bg-surface hover:border-primary/50'
                  }`}
                >
                  {page}
                </button>
              )
            ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border bg-bg-surface text-sm font-medium transition-all hover:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t('next')}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
