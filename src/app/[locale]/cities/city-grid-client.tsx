'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Search, MapPin, Users, Building2 } from 'lucide-react';
import { getUnsplashUrl, getCityCoverPhotoId } from '@/lib/unsplash';
import type { CitySummary } from '@/types/place';

interface CityGridProps {
  cities: CitySummary[];
  locale: string;
}

export default function CityGrid({ cities, locale }: CityGridProps) {
  const [search, setSearch] = useState('');
  const t = useTranslations('cities');

  const filtered = cities.filter((city) => {
    const name = (city.name || '').toLowerCase();
    const country = city.country?.name?.toLowerCase() || '';
    const region = (city.region || '').toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || country.includes(q) || region.includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">{t('title')}</h1>
      <p className="text-txt-sec text-lg mb-8">{t('subtitle')}</p>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-sec" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('search')}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <p className="text-sm text-txt-sec mb-6">{filtered.length} {t('resultsCount')}</p>

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
    </div>
  );
}