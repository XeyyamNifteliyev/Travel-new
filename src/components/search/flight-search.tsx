'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plane, Calendar, Users, ArrowRight } from 'lucide-react';

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
    <div className="bg-card-bg backdrop-blur-sm rounded-xl p-6 border border-border">
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setTripType('round')}
          className={`text-sm px-3 py-1 rounded ${
            tripType === 'round' ? 'bg-primary text-white' : 'text-txt-sec'
          }`}
        >
          {t('roundTrip')}
        </button>
        <button
          onClick={() => setTripType('one')}
          className={`text-sm px-3 py-1 rounded ${
            tripType === 'one' ? 'bg-primary text-white' : 'text-txt-sec'
          }`}
        >
          {t('oneWay')}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative">
          <Plane className="absolute left-3 top-3 w-4 h-4 text-txt-sec" />
          <input
            type="text"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder={t('from')}
            className="w-full bg-bg-base/50 border border-border rounded-lg pl-10 pr-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div className="relative">
          <Plane className="absolute left-3 top-3 w-4 h-4 text-txt-sec" />
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder={t('to')}
            className="w-full bg-bg-base/50 border border-border rounded-lg pl-10 pr-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-3 w-4 h-4 text-txt-sec" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder={t('departDate')}
            className="w-full bg-bg-base/50 border border-border rounded-lg pl-10 pr-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div className="relative">
          <Users className="absolute left-3 top-3 w-4 h-4 text-txt-sec" />
          <input
            type="number"
            value={passengers}
            onChange={(e) => setPassengers(Number(e.target.value))}
            placeholder={t('passengers')}
            min={1}
            className="w-full bg-bg-base/50 border border-border rounded-lg pl-10 pr-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>
      </div>
      <button
        onClick={handleSearch}
        className="mt-4 w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {t('findTicket')}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
