'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Star, UtensilsCrossed, Coffee, Search, MapPin } from 'lucide-react';
import type { PlaceSummary } from '@/types/place';

interface CityOption {
  id: string;
  slug: string;
  name: string;
  count: number;
}

interface RestaurantGridClientProps {
  restaurants: PlaceSummary[];
  cities: CityOption[];
  locale: string;
  countrySlug?: string | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  restaurant: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  cafe: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
};

const CATEGORY_ICONS: Record<string, typeof UtensilsCrossed> = {
  restaurant: UtensilsCrossed,
  cafe: Coffee,
};

export function RestaurantGridClient({ restaurants, cities, locale, countrySlug }: RestaurantGridClientProps) {
  const t = useTranslations('restaurants');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'restaurant' | 'cafe'>('all');
  const [selectedCity, setSelectedCity] = useState<string>(countrySlug ? 'all' : 'all');

  const filteredRestaurants = restaurants.filter((r) => {
    const matchesCategory = activeFilter === 'all' || r.category === activeFilter;
    const matchesCity = selectedCity === 'all' || r.city?.slug === selectedCity;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery
      || r.name.toLowerCase().includes(q)
      || (r.address && r.address.toLowerCase().includes(q))
      || (r.city?.name && r.city.name.toLowerCase().includes(q));
    return matchesCategory && matchesCity && matchesSearch;
  });

  const categoryLabel = (category: string) => {
    if (category === 'restaurant') return t('categoryRestaurant');
    if (category === 'cafe') return t('categoryCafe');
    return category;
  };

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-sec" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search')}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveFilter('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === 'all'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-bg-surface border border-border text-txt-sec hover:border-primary/40 hover:text-primary'
              }`}
            >
              {t('filterAll')}
            </button>
            <button
              onClick={() => setActiveFilter('restaurant')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === 'restaurant'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-bg-surface border border-border text-txt-sec hover:border-primary/40 hover:text-primary'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              {t('restaurants')}
            </button>
            <button
              onClick={() => setActiveFilter('cafe')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === 'cafe'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-bg-surface border border-border text-txt-sec hover:border-primary/40 hover:text-primary'
              }`}
            >
              <Coffee className="w-4 h-4" />
              {t('cafes')}
            </button>
          </div>

          {cities.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor="restaurant-city-filter">{t('cityFilterLabel')}</label>
              <select
                id="restaurant-city-filter"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-3 py-2 rounded-full border border-border bg-bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="all">{t('allCities')} ({restaurants.length})</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.slug}>{city.name} ({city.count})</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {filteredRestaurants.length > 0 ? (
        <>
          <p className="text-sm text-txt-sec mb-4">{t('resultCount', { count: filteredRestaurants.length })}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRestaurants.map((place) => {
              const Icon = CATEGORY_ICONS[place.category] || UtensilsCrossed;
              const colorClass = CATEGORY_COLORS[place.category] || CATEGORY_COLORS.restaurant;
              return (
                 <Link
                   key={place.id}
                   href={`/${locale}/places/${place.id}`}
                   className="rounded-2xl border border-border bg-bg-surface overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all group"
                 >
                   {place.coverPhotoUrl ? (
                     <div className="relative h-40 overflow-hidden">
                       <Image
                         src={place.coverPhotoUrl}
                         alt={place.name}
                         fill
                         className="object-cover group-hover:scale-105 transition-transform duration-300"
                         sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                         loading="lazy"
                       />
                       <span className={`absolute top-2 left-2 inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full font-semibold backdrop-blur-sm ${colorClass}`}>
                         <Icon className="w-3 h-3" />
                         {categoryLabel(place.category)}
                       </span>
                       {place.ratingSummary > 0 && (
                         <span className="absolute top-2 right-2 inline-flex items-center gap-1 text-xs font-semibold text-white bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
                           <Star className="w-3 h-3 fill-current" />
                           {place.ratingSummary.toFixed(1)}
                         </span>
                       )}
                     </div>
                   ) : (
                     <div className="p-4">
                       <div className="flex items-start justify-between gap-3">
                         <span className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full font-semibold ${colorClass}`}>
                           <Icon className="w-3 h-3" />
                           {categoryLabel(place.category)}
                         </span>
                         {place.ratingSummary > 0 && (
                           <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-300">
                             <Star className="w-3 h-3 fill-current" />
                             {place.ratingSummary.toFixed(1)}
                           </span>
                         )}
                       </div>
                     </div>
                   )}
                   <div className="p-4 pt-2">
                     <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">{place.name}</h3>
                     {place.address && (
                       <p className="text-xs text-txt-sec mt-2 line-clamp-2 flex items-start gap-1">
                         <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                         {place.address}
                       </p>
                     )}
                     {place.city && (
                       <p className="text-xs text-txt-sec mt-2">
                         {t('inCity', { city: place.city.name })}
                       </p>
                     )}
                   </div>
                 </Link>
              );
            })}
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-bg-surface p-12 text-center">
          <UtensilsCrossed className="w-12 h-12 text-txt-sec/40 mx-auto mb-4" />
          <p className="text-txt-sec font-medium">{t('noResults')}</p>
          <p className="text-sm text-txt-sec/60 mt-2">{t('emptyState')}</p>
        </div>
      )}
    </div>
  );
}
