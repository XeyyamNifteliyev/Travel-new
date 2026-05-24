'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search, MapPin, Users, Building2, ChevronLeft, ChevronRight, Compass } from 'lucide-react';
import { getUnsplashUrl, getCityCoverPhotoId } from '@/lib/unsplash';
import type { CitySummary } from '@/types/place';

interface CityGridProps {
  cities: CitySummary[];
  locale: string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export default function CityGrid({ cities, locale, currentPage, totalPages, totalCount }: CityGridProps) {
  const [search, setSearch] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('cities');

  const filtered = cities.filter((city) => {
    const name = (city.name || '').toLowerCase();
    const country = city.country?.name?.toLowerCase() || '';
    const region = (city.region || '').toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || country.includes(q) || region.includes(q);
  });

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) {
      params.set('page', String(page));
    } else {
      params.delete('page');
    }
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <section className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-6 text-white md:p-9">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-sky-200">
              <Compass className="h-3.5 w-3.5" />
              {t('eyebrow')}
            </div>
            <h1 className="max-w-3xl text-4xl font-black tracking-tight md:text-5xl">{t('title')}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">{t('subtitle')}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-[260px]">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-3xl font-black">{totalCount.toLocaleString(locale)}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/65">{t('resultsCount')}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-3xl font-black">{currentPage}/{totalPages}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/65">{t('page')}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-sec" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('search')}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <p className="text-sm text-txt-sec mb-6">
        {search ? filtered.length : totalCount} {t('resultsCount')}
        {!search && totalPages > 1 ? ` · ${currentPage} / ${totalPages}` : ''}
      </p>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((city) => {
            const photoId = getCityCoverPhotoId(city.slug, city.coverPhotoId) || null;
            return (
              <Link
                key={city.id}
                href={`/${locale}/cities/${city.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-border bg-bg-surface hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="relative h-44 overflow-hidden">
                  {photoId ? (
                    <Image
                      src={getUnsplashUrl(photoId, { w: 600, h: 400, q: 78 })}
                      alt={city.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center">
                      <Building2 className="w-12 h-12 text-primary/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-bold text-lg drop-shadow-lg">{city.name}</h3>
                    {city.country && (
                      <div className="flex items-center gap-1 text-white/80 text-xs mt-0.5">
                        {city.country.flagEmoji && <span>{city.country.flagEmoji}</span>}
                        <span>{city.country.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  {city.description && (
                    <p className="text-txt-sec text-sm line-clamp-2 mb-3">{city.description}</p>
                  )}

                  <div className="flex items-center justify-between gap-3 text-xs text-txt-sec">
                    {city.population ? (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {city.population.toLocaleString(locale === 'ru' ? 'ru' : locale === 'en' ? 'en' : 'az')} {t('population')}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="flex items-center gap-1 text-primary font-medium">
                      <MapPin className="w-3 h-3" />
                      {t('viewCity')}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <Building2 className="w-12 h-12 text-txt-muted mx-auto mb-4" />
          <p className="text-txt-sec text-lg">{t('noResults')}</p>
        </div>
      )}

      {!search && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border bg-bg-surface text-sm font-medium transition-all hover:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {pageNumbers.map((page, index) => {
            const previous = pageNumbers[index - 1];
            return (
              <span key={page} className="inline-flex items-center gap-1">
                {previous && page - previous > 1 ? <span className="px-2 text-sm text-txt-sec">...</span> : null}
                <button
                  onClick={() => handlePageChange(page)}
                  className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === page
                      ? 'bg-primary text-white'
                      : 'border border-border bg-bg-surface hover:border-primary/50'
                  }`}
                >
                  {page}
                </button>
              </span>
            );
          })}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border bg-bg-surface text-sm font-medium transition-all hover:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
