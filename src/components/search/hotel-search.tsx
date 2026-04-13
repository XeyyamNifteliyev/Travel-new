'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Hotel, Calendar, Users, ArrowRight } from 'lucide-react';

interface HotelSearchProps {
  onSearch?: (params: { city: string; checkIn: string; checkOut: string; guests: number }) => void;
}

export function HotelSearch({ onSearch }: HotelSearchProps) {
  const t = useTranslations('search');
  const [city, setCity] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  const handleSearch = () => {
    if (onSearch) {
      onSearch({ city, checkIn, checkOut, guests });
    }
  };

  return (
    <div className="bg-card-bg backdrop-blur-sm rounded-xl p-6 border border-border">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative">
          <Hotel className="absolute left-3 top-3 w-4 h-4 text-txt-sec" />
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={t('cityOrHotel')}
            className="w-full bg-bg-base/50 border border-border rounded-lg pl-10 pr-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-3 w-4 h-4 text-txt-sec" />
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            placeholder={t('checkIn')}
            className="w-full bg-bg-base/50 border border-border rounded-lg pl-10 pr-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-3 w-4 h-4 text-txt-sec" />
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            placeholder={t('checkOut')}
            className="w-full bg-bg-base/50 border border-border rounded-lg pl-10 pr-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div className="relative">
          <Users className="absolute left-3 top-3 w-4 h-4 text-txt-sec" />
          <input
            type="number"
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            placeholder={t('guests')}
            min={1}
            className="w-full bg-bg-base/50 border border-border rounded-lg pl-10 pr-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>
      </div>
      <button
        onClick={handleSearch}
        className="mt-4 w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {t('findHotel')}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
