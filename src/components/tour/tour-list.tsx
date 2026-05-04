'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Tour } from '@/types/tour';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import {
  Search, MapPin, Calendar, Clock, Users, Star,
  Loader2, Bus, Hotel, Utensils, Eye, ChevronRight
} from 'lucide-react';

const REGIONS = [
  'Quba', 'Şəki', 'Lənkəran', 'Naxçıvan', 'Qarabağ',
  'Bakı', 'Gəncə', 'Zaqatala', 'İsmayıllı', 'Şamaxı',
  'Xaçmaz', 'Qəbələ', 'Tərtər', 'Laçın', 'Ağdam'
];

const TOUR_TYPES = ['active', 'cultural', 'gastronomy', 'family', 'solo', 'nature', 'historical'];

export default function ToursPage() {
  const t = useTranslations('tours');
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string;

  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    region: '',
    tourType: '',
    transportation: false,
    rating: '',
    search: '',
  });

  useEffect(() => {
    fetchTours();
  }, [filters]);

  async function fetchTours() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.region) params.set('region', filters.region);
    if (filters.tourType) params.set('tourType', filters.tourType);
    if (filters.transportation) params.set('transportation', 'true');
    if (filters.rating) params.set('rating', filters.rating);
    if (filters.search) params.set('search', filters.search);

    const res = await fetch(`/api/tours?${params}`);
    const data = await res.json();
    setTours(data.tours || []);
    setLoading(false);
  }

  function getTourTypeLabel(type: string) {
    const key = `type${type.charAt(0).toUpperCase() + type.slice(1)}`;
    return t(key) || type;
  }

  function formatPrice(price: number) {
    return `${price.toLocaleString('az-AZ')} AZN`;
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-txt flex items-center gap-3">
            <MapPin className="w-8 h-8 text-emerald-400" />
            {t('title')}
          </h1>
          <p className="text-txt-sec mt-1">{t('subtitle')}</p>
        </div>

        {/* Filters */}
        <div className="bg-card-bg backdrop-blur-sm border border-border rounded-2xl p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-sec" />
              <input
                type="text"
                value={filters.search}
                onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder={t('searchPlaceholder')}
                className="w-full bg-bg-input border border-border rounded-xl pl-10 pr-4 py-2.5 text-txt placeholder-txt-muted"
              />
            </div>
            <select
              value={filters.region}
              onChange={e => setFilters(prev => ({ ...prev, region: e.target.value }))}
              className="bg-bg-input border border-border rounded-xl px-4 py-2.5 text-txt"
            >
              <option value="">{t('allRegions')}</option>
              {REGIONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <select
              value={filters.tourType}
              onChange={e => setFilters(prev => ({ ...prev, tourType: e.target.value }))}
              className="bg-bg-input border border-border rounded-xl px-4 py-2.5 text-txt"
            >
              <option value="">{t('allTypes')}</option>
              {TOUR_TYPES.map(type => (
                <option key={type} value={type}>{getTourTypeLabel(type)}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-4 mt-3">
            <label className="flex items-center gap-2 text-txt-sec cursor-pointer">
              <input
                type="checkbox"
                checked={filters.transportation}
                onChange={e => setFilters(prev => ({ ...prev, transportation: e.target.checked }))}
                className="w-4 h-4 rounded border-border bg-bg-input text-sky-500"
              />
              <Bus className="w-4 h-4" />
              {t('transportation')}
            </label>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
          </div>
        ) : tours.length === 0 ? (
          <div className="text-center py-20">
            <MapPin className="w-16 h-16 text-txt-muted mx-auto mb-4" />
            <p className="text-txt-sec text-lg">{t('noTours')}</p>
            <p className="text-txt-muted text-sm mt-1">{t('noToursSub')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map(tour => (
              <div
                key={tour.id}
                onClick={() => router.push(`/${locale}/tours/${tour.slug}`)}
                className="bg-card-bg backdrop-blur-sm border border-border rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all cursor-pointer group"
              >
                {/* Image */}
                <div className="relative h-48 bg-bg-input overflow-hidden">
                  {tour.images?.[0] ? (
                    <Image
                      src={tour.images[0]}
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      fill
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MapPin className="w-12 h-12 text-txt-muted" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-3 py-1 bg-emerald-500/90 text-white text-xs font-medium rounded-full">
                      {getTourTypeLabel(tour.tourType)}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-bg-base/80 text-txt text-xs font-medium rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      {tour.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-txt font-semibold text-lg mb-2 group-hover:text-emerald-400 transition-colors">
                    {tour.title}
                  </h3>

                  <div className="flex items-center gap-1 text-txt-sec text-sm mb-3">
                    <MapPin className="w-4 h-4" />
                    {tour.region}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-txt-sec mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-txt-muted" />
                      {tour.durationDays} {t('days')} / {tour.durationNights} {t('nights')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-txt-muted" />
                      {tour.groupMin}–{tour.groupMax}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-txt-muted" />
                      {tour.views}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    {tour.transportationIncluded && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-sky-500/10 text-sky-400 text-xs rounded-full">
                        <Bus className="w-3 h-3" />
                        {t('included')}
                      </span>
                    )}
                    {tour.hotelIncluded && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-full">
                        <Hotel className="w-3 h-3" />
                        {tour.hotelStars ? `${tour.hotelStars}★` : t('included')}
                      </span>
                    )}
                    {tour.mealsIncluded?.length > 0 && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-full">
                        <Utensils className="w-3 h-3" />
                        {tour.mealsIncluded.length}
                      </span>
                    )}
                  </div>

                  {/* Company */}
                  {tour.company && (
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                      <div className="w-6 h-6 bg-bg-surface-hover rounded-full flex items-center justify-center text-xs text-txt">
                        {tour.company.companyName?.[0] || 'T'}
                       </div>
                       <span className="text-txt-sec text-sm">{tour.company.companyName}</span>
                       {tour.company.isVerified && (
                        <span className="text-emerald-400 text-xs">✓</span>
                      )}
                    </div>
                  )}

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-emerald-400 font-bold text-xl">{formatPrice(tour.price)}</span>
                       <span className="text-txt-muted text-sm"> {t('perPerson')}</span>
                    </div>
                    <button className="flex items-center gap-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors">
                      {t('bookNow')}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
