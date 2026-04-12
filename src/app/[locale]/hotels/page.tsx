'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { HotelSearch } from '@/components/search/hotel-search';
import { Star, MapPin, ArrowUpRight } from 'lucide-react';

const mockHotels = [
  { id: 1, name: 'Grand Hotel Istanbul', stars: 4, location: 'Sultanahmet', rating: 8.7, reviews: 2341, price: 120, amenities: ['Free cancel', 'Breakfast'] },
  { id: 2, name: 'Dubai Marina Hotel', stars: 5, location: 'Dubai Marina', rating: 9.1, reviews: 1892, price: 250, amenities: ['Pool', 'Spa', 'Beach'] },
  { id: 3, name: 'Tbilisi Boutique Hotel', stars: 3, location: 'Old Tbilisi', rating: 8.3, reviews: 567, price: 55, amenities: ['Free WiFi', 'Breakfast'] },
  { id: 4, name: 'Tokyo Bay Hotel', stars: 4, location: 'Odaiba', rating: 8.9, reviews: 3201, price: 180, amenities: ['City view', 'Restaurant'] },
];

export default function HotelsPage() {
  const t = useTranslations('common');
  const ts = useTranslations('search');
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    setSearched(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">🏨 {ts('findHotel')}</h1>
      <HotelSearch onSearch={handleSearch} />

      {searched && (
        <div className="mt-8 space-y-4">
          {mockHotels.map((hotel) => (
            <div key={hotel.id} className="bg-bg-surface rounded-xl p-6 border border-border flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-secondary/10 p-3 rounded-lg">
                  <Star className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold">{hotel.name}</h3>
                  <p className="text-txt-sec text-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {hotel.location}
                  </p>
                  <div className="flex gap-1 mt-1">
                    {Array.from({ length: hotel.stars }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">⭐ {hotel.rating}/10</div>
                <p className="text-txt-sec text-xs">({hotel.reviews.toLocaleString()} {t('reviews')})</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-secondary">{hotel.price} AZN</div>
                <p className="text-txt-sec text-xs">{t('perNight')}</p>
                <button className="text-sm text-primary hover:underline flex items-center gap-1 mt-1 justify-end">
                  {t('book')} <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!searched && (
        <p className="text-txt-sec text-center mt-8">
          {ts('searchHotelsPlaceholder')}
        </p>
      )}
    </div>
  );
}
