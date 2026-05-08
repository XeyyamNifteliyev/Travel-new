'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { Star, LayoutGrid, Compass, UtensilsCrossed, BedDouble, Music, ShoppingBag, ExternalLink, MapPin } from 'lucide-react';
import { getUnsplashUrl } from '@/lib/unsplash';
import type { PlaceCategory } from '@/types/place';
import type { PlaceSummary } from '@/types/place';

const CATEGORY_TABS = [
  { key: 'all', icon: LayoutGrid },
  { key: 'attractions', icon: Compass },
  { key: 'restaurants', icon: UtensilsCrossed },
  { key: 'hotels', icon: BedDouble },
  { key: 'nightlife', icon: Music },
  { key: 'shopping', icon: ShoppingBag },
] as const;

export type CategoryTabKey = typeof CATEGORY_TABS[number]['key'];

const CATEGORY_GROUPS: Record<string, PlaceCategory[]> = {
  all: [],
  attractions: ['attraction', 'museum', 'landmark', 'viewpoint', 'historic', 'park', 'beach'],
  restaurants: ['restaurant', 'cafe'],
  hotels: ['hotel'],
  nightlife: ['nightlife'],
  shopping: ['shopping'],
};

const CATEGORY_COLORS: Record<string, string> = {
  all: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  attraction: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  museum: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  landmark: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  viewpoint: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  historic: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  park: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  beach: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  restaurant: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  cafe: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  hotel: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  nightlife: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300',
  shopping: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  transport: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

interface CategoryTabsProps {
  places: PlaceSummary[];
  locale: string;
  fallbackImageUrl?: string;
}

export function CategoryTabs({ places, locale, fallbackImageUrl }: CategoryTabsProps) {
  const t = useTranslations('places');
  const [activeCategory, setActiveCategory] = useState<CategoryTabKey>('all');

  const filteredPlaces = activeCategory === 'all'
    ? places
    : places.filter((p) => CATEGORY_GROUPS[activeCategory]?.includes(p.category));

  const categoryLabel = (category: string) => {
    if (category === 'restaurant') return t('categoryRestaurant');
    if (category === 'cafe') return t('categoryCafe');
    if (category === 'hotel') return t('categoryHotel');
    if (category === 'museum') return t('categoryMuseum');
    if (category === 'landmark') return t('categoryLandmark');
    if (category === 'attraction') return t('categoryAttraction');
    if (category === 'viewpoint') return t('categoryViewpoint');
    if (category === 'historic') return t('categoryHistoric');
    if (category === 'park') return t('categoryPark');
    if (category === 'beach') return t('categoryBeach');
    if (category === 'shopping') return t('categoryShopping');
    if (category === 'nightlife') return t('categoryNightlife');
    if (category === 'transport') return t('categoryTransport');
    if (category === 'other') return t('categoryOther');
    return category;
  };

  const placeImageUrl = (place: PlaceSummary) => {
    if (place.coverPhotoUrl) return place.coverPhotoUrl;
    if (place.coverPhotoId) return getUnsplashUrl(place.coverPhotoId, { w: 720, h: 420 });
    return getUnsplashUrl(`${place.slug}-${place.category || fallbackImageUrl || 'travel'}`, { w: 720, h: 420 });
  };

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {CATEGORY_TABS.map(({ key, icon: Icon }) => {
          const isActive = activeCategory === key;
          const count = key === 'all'
            ? places.length
            : places.filter((p) => CATEGORY_GROUPS[key]?.includes(p.category)).length;
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-bg-surface border border-border text-txt-sec hover:border-primary/40 hover:text-primary'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t(key)}
              <span className={`text-xs ${isActive ? 'text-white/70' : 'text-txt-sec/60'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {filteredPlaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredPlaces.map((place) => (
            <article
              key={place.id}
              className="overflow-hidden rounded-2xl border border-border bg-bg-surface hover:border-primary/30 hover:shadow-lg transition-all"
            >
              <Link href={`/${locale}/places/${place.id}`} className="group block">
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={placeImageUrl(place)}
                    alt={place.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <span className={`absolute left-3 top-3 text-[10px] px-2 py-1 rounded-full font-semibold capitalize shadow-sm ${CATEGORY_COLORS[place.category] || CATEGORY_COLORS.other}`}>
                    {categoryLabel(place.category)}
                  </span>
                  {place.ratingSummary > 0 && (
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      <Star className="w-3 h-3 fill-current text-amber-400" />
                      {place.ratingSummary.toFixed(1)}
                    </span>
                  )}
                  <h3 className="absolute bottom-3 left-3 right-3 text-white font-bold drop-shadow line-clamp-2">{place.name}</h3>
                </div>
                <div className="p-4">
                  {place.address ? (
                    <p className="flex items-start gap-1.5 text-xs text-txt-sec line-clamp-2">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      {place.address}
                    </p>
                  ) : place.city?.name ? (
                    <p className="flex items-center gap-1.5 text-xs text-txt-sec">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      {place.city.name}
                    </p>
                  ) : null}
                  {place.description && <p className="mt-3 text-sm text-txt-sec line-clamp-2">{place.description}</p>}
                </div>
              </Link>
              <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 text-xs">
                <Link href={`/${locale}/places/${place.id}`} className="font-semibold text-primary hover:underline">
                  {t('viewDetails')}
                </Link>
                {place.website && (
                  <a href={place.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-txt-sec hover:text-primary">
                    {t('officialWebsite')} <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-bg-surface p-8 text-center text-txt-sec">
          {t('emptyCategory')}
        </div>
      )}
    </div>
  );
}
