'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plane, Calendar, Users, ArrowRight, Navigation, MapPin } from 'lucide-react';

interface FlightSearchProps {
  onSearch?: (params: { from: string; to: string; date: string; passengers: number; tripType: string }) => void;
}

export function FlightSearch({ onSearch }: FlightSearchProps) {
  const t = useTranslations('search');
  const [tripType, setTripType] = useState<'round' | 'one'>('round');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState(1);

  const handleSearch = () => {
    if (onSearch) {
      onSearch({ from, to, date, passengers, tripType });
    }
  };

  return (
    <div className="relative">
      <div className="glass-panel p-6 md:p-8 rounded-2xl border border-white/5 shadow-2xl">
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setTripType('round')}
            className={`text-sm px-5 py-2 rounded-full font-medium transition-all ${
              tripType === 'round'
                ? 'bg-primary text-on-primary font-bold shadow-[0_0_20px_rgba(14,165,233,0.3)]'
                : 'bg-white/5 text-txt-sec hover:text-txt hover:bg-white/10'
            }`}
          >
            {t('roundTrip')}
          </button>
          <button
            onClick={() => setTripType('one')}
            className={`text-sm px-5 py-2 rounded-full font-medium transition-all ${
              tripType === 'one'
                ? 'bg-primary text-on-primary font-bold shadow-[0_0_20px_rgba(14,165,233,0.3)]'
                : 'bg-white/5 text-txt-sec hover:text-txt hover:bg-white/10'
            }`}
          >
            {t('oneWay')}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-txt-sec ml-1">{t('from')}</label>
            <div className="relative">
              <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
              <input
                type="text"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Baku, GYD"
                className="w-full bg-white/5 border-none rounded-full py-3.5 pl-11 pr-4 text-txt placeholder:text-txt-muted focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-txt-sec ml-1">{t('to')}</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="London, LHR"
                className="w-full bg-white/5 border-none rounded-full py-3.5 pl-11 pr-4 text-txt placeholder:text-txt-muted focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-txt-sec ml-1">{t('departDate')}</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white/5 border-none rounded-full py-3.5 pl-11 pr-4 text-txt focus:ring-2 focus:ring-primary appearance-none transition-all"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full h-[50px] bg-gradient-to-br from-primary to-sky-400 text-white font-bold rounded-full hover:shadow-[0_0_30px_rgba(14,165,233,0.4)] transition-all flex items-center justify-center gap-2 group"
            >
              {t('findTicket')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
