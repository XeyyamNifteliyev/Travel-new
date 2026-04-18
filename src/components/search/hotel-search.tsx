'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, Calendar, Users, Search } from 'lucide-react';

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
    <div className="glass-panel p-3 md:p-4 rounded-full flex flex-col md:flex-row items-center gap-3 md:gap-4 shadow-2xl">
      <div className="flex items-center gap-3 flex-1 w-full px-5 py-3.5 bg-white/5 rounded-full">
        <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] uppercase tracking-widest text-txt-sec font-bold">{t('where')}</span>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={t('cityOrHotelPlaceholder')}
            className="bg-transparent border-none p-0 focus:ring-0 text-txt placeholder:text-txt-muted text-sm w-full"
          />
        </div>
      </div>
      <div className="flex items-center gap-3 flex-1 w-full px-5 py-3.5 bg-white/5 rounded-full">
        <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] uppercase tracking-widest text-txt-sec font-bold">{t('when')}</span>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="bg-transparent border-none p-0 focus:ring-0 text-txt text-sm w-full"
          />
        </div>
      </div>
      <div className="flex items-center gap-3 flex-1 w-full px-5 py-3.5 bg-white/5 rounded-full">
        <Users className="w-5 h-5 text-primary flex-shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] uppercase tracking-widest text-txt-sec font-bold">{t('guestsLabel')}</span>
          <input
            type="number"
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            placeholder={t('guestsPlaceholder')}
            min={1}
            className="bg-transparent border-none p-0 focus:ring-0 text-txt placeholder:text-txt-muted text-sm w-full"
          />
        </div>
      </div>
      <button
        onClick={handleSearch}
        className="bg-gradient-to-br from-primary to-sky-400 text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:shadow-[0_0_30px_rgba(14,165,233,0.4)] transition-all w-full md:w-auto justify-center"
      >
        <Search className="w-5 h-5" />
        {t('findHotel')}
      </button>
    </div>
  );
}
