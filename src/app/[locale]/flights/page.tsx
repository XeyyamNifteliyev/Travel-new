'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { FlightSearch } from '@/components/search/flight-search';
import { Plane, Clock, ArrowUpRight } from 'lucide-react';

const mockFlights = [
  { id: 1, airline: 'AZAL', from: 'Baku', to: 'Istanbul', depart: '06:30', arrive: '08:45', duration: '2s 15d', price: 245 },
  { id: 2, airline: 'Turkish Airlines', from: 'Baku', to: 'Istanbul', depart: '10:00', arrive: '12:20', duration: '2s 20d', price: 280 },
  { id: 3, airline: 'Pegasus', from: 'Baku', to: 'Istanbul', depart: '14:30', arrive: '16:50', duration: '2s 20d', price: 195 },
  { id: 4, airline: 'FlyDubai', from: 'Baku', to: 'Dubai', depart: '08:00', arrive: '12:30', duration: '3s 30d', price: 420 },
  { id: 5, airline: 'AZAL', from: 'Baku', to: 'Dubai', depart: '22:00', arrive: '02:30', duration: '3s 30d', price: 380 },
];

export default function FlightsPage() {
  const t = useTranslations('common');
  const tc = useTranslations('search');
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    setSearched(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">✈️ {tc('findTicket')}</h1>
      <FlightSearch onSearch={handleSearch} />

      {searched && (
        <div className="mt-8 space-y-4">
          {mockFlights.map((flight) => (
            <div key={flight.id} className="bg-bg-surface rounded-xl p-6 border border-border flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Plane className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{flight.airline}</h3>
                  <p className="text-txt-sec text-sm">{flight.from} → {flight.to}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-txt-sec">
                <span>{flight.depart} → {flight.arrive}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {flight.duration}
                </span>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-primary">{flight.price} AZN</div>
                <button className="text-sm text-secondary hover:underline flex items-center gap-1 mt-1">
                  {t('book')} <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!searched && (
        <p className="text-txt-sec text-center mt-8">
          {tc('searchFlightsPlaceholder')}
        </p>
      )}
    </div>
  );
}
