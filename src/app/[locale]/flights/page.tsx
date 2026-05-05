'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { FlightSearch } from '@/components/search/flight-search';
import { Plane, Shield, Headphones, ArrowRight, Filter, Loader2, AlertCircle } from 'lucide-react';
import type { FlightOffer } from '@/types/flight';

const FALLBACK_FLIGHTS: FlightOffer[] = [
  { id: 'mock-1', source: 'mock', airline: 'AZAL', airlineCode: 'GYD', from: 'Baku', fromCode: 'GYD', to: 'Istanbul', toCode: 'IST', depart: '06:30', arrive: '08:45', duration: '2s 15d', stops: 0, stopLabel: 'Direct', price: 245, currency: 'AZN', bestValue: true, segments: [], totalPrice: '245', totalCurrency: 'AZN' },
  { id: 'mock-2', source: 'mock', airline: 'Turkish Airlines', airlineCode: 'TK', from: 'Baku', fromCode: 'GYD', to: 'Istanbul', toCode: 'IST', depart: '10:00', arrive: '12:20', duration: '2s 20d', stops: 0, stopLabel: 'Direct', price: 280, currency: 'AZN', bestValue: false, segments: [], totalPrice: '280', totalCurrency: 'AZN' },
  { id: 'mock-3', source: 'mock', airline: 'Pegasus', airlineCode: 'PC', from: 'Baku', fromCode: 'GYD', to: 'Istanbul', toCode: 'IST', depart: '14:30', arrive: '16:50', duration: '2s 20d', stops: 0, stopLabel: 'Direct', price: 195, currency: 'AZN', bestValue: false, segments: [], totalPrice: '195', totalCurrency: 'AZN' },
  { id: 'mock-4', source: 'mock', airline: 'FlyDubai', airlineCode: 'FZ', from: 'Baku', fromCode: 'GYD', to: 'Dubai', toCode: 'DXB', depart: '08:00', arrive: '12:30', duration: '3s 30d', stops: 0, stopLabel: 'Direct', price: 420, currency: 'AZN', bestValue: false, segments: [], totalPrice: '420', totalCurrency: 'AZN' },
  { id: 'mock-5', source: 'mock', airline: 'AZAL', airlineCode: 'AZ', from: 'Baku', fromCode: 'GYD', to: 'Dubai', toCode: 'DXB', depart: '22:00', arrive: '02:30', duration: '3s 30d', stops: 1, stopLabel: '1 stop', price: 380, currency: 'AZN', bestValue: false, segments: [], totalPrice: '380', totalCurrency: 'AZN' },
];

function extractIATACode(input: string): string {
  const match = input.match(/\b([A-Z]{3})\b/);
  return match ? match[1] : input.trim().substring(0, 3).toUpperCase();
}

export default function FlightsPage() {
  const t = useTranslations('common');
  const tc = useTranslations('search');
  const [searched, setSearched] = useState(false);
  const [flights, setFlights] = useState<FlightOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configured, setConfigured] = useState(true);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [nonStopOnly, setNonStopOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'cheapest' | 'fastest'>('cheapest');

  const handleSearch = useCallback(async (params: { from: string; to: string; date: string; passengers: number; tripType: string }) => {
    setSearched(true);
    setLoading(true);
    setError(null);

    const originCode = extractIATACode(params.from);
    const destCode = extractIATACode(params.to);

    try {
      const sp = new URLSearchParams({
        origin: originCode,
        destination: destCode,
        departureDate: params.date,
        adults: String(params.passengers || 1),
        cabinClass: 'economy',
      });

      const res = await fetch(`/api/flights/search?${sp.toString()}`);
      const data = await res.json();

      if (!data.configured) {
        setConfigured(false);
        setFlights(FALLBACK_FLIGHTS);
      } else if (data.error) {
        setError(data.error);
        setFlights(FALLBACK_FLIGHTS);
      } else {
        setConfigured(true);
        setFlights(data.flights?.length ? data.flights : FALLBACK_FLIGHTS);
      }
    } catch {
      setError('Failed to search flights');
      setFlights(FALLBACK_FLIGHTS);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleAirline = (airline: string) => {
    setSelectedAirlines((prev) =>
      prev.includes(airline) ? prev.filter((a) => a !== airline) : [...prev, airline]
    );
  };

  const uniqueAirlines = [...new Set(flights.map((f) => f.airline))];
  const isFallback = flights.length > 0 && flights[0].source === 'mock';

  const filteredFlights = flights
    .filter((f) => selectedAirlines.length === 0 || selectedAirlines.includes(f.airline))
    .filter((f) => !nonStopOnly || f.stops === 0)
    .sort((a, b) => {
      if (sortBy === 'cheapest') return a.price - b.price;
      if (sortBy === 'fastest') return a.duration.localeCompare(b.duration);
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 pt-32">
      <section className="mb-12 relative">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 leading-tight">
          {tc('findTicket').split(' ').map((word, i) =>
            i === 0 ? word : <span key={i} className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-sky-400">{' ' + word}</span>
          )}
        </h1>
        <FlightSearch onSearch={handleSearch} />
      </section>

      {loading && (
        <div className="text-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-txt-sec">{t('loading') || 'Searching flights...'}</p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">{error}</p>
            {isFallback && <p className="text-txt-sec text-sm mt-1">Showing sample flights</p>}
          </div>
        </div>
      )}

      {!loading && !configured && !error && searched && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-primary text-sm">Flight search is not configured. Showing sample flights.</p>
        </div>
      )}

      {searched && !loading && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-bg-surface rounded-xl p-6 border border-border">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                {t('filter')}
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-txt-sec mb-4">{t('stops')}</p>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" checked={nonStopOnly} onChange={(e) => setNonStopOnly(e.target.checked)} className="rounded border-border bg-bg-surface text-primary focus:ring-primary accent-primary" />
                      <span className="text-sm group-hover:text-primary transition-colors">{t('nonStop')}</span>
                    </label>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-txt-sec mb-4">{t('airlines')}</p>
                  <div className="flex flex-wrap gap-2">
                    {uniqueAirlines.map((airline) => (
                      <button key={airline} onClick={() => toggleAirline(airline)} className={`px-3 py-1.5 text-xs rounded-full transition-all ${selectedAirlines.includes(airline) ? 'bg-primary/20 text-primary font-medium' : 'bg-white/5 text-txt-sec hover:bg-white/10'}`}>{airline}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-9 space-y-6">
            <div className="flex justify-between items-center px-1">
              <p className="text-txt-sec text-sm"><span className="text-txt font-bold">{filteredFlights.length}</span> {t('flightsFound')}</p>
              <div className="flex gap-2">
                <button onClick={() => setSortBy('cheapest')} className={`px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 transition-all ${sortBy === 'cheapest' ? 'bg-primary/20 text-primary' : 'bg-white/5 text-txt-sec hover:bg-white/10'}`}>{t('cheapest')}</button>
                <button onClick={() => setSortBy('fastest')} className={`px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 transition-all ${sortBy === 'fastest' ? 'bg-primary/20 text-primary' : 'bg-white/5 text-txt-sec hover:bg-white/10'}`}>{t('fastest')}</button>
              </div>
            </div>

            {filteredFlights.map((flight) => (
              <div key={flight.id} className="bg-bg-surface rounded-xl p-6 group hover:shadow-[0_20px_50px_rgba(14,165,233,0.05)] transition-all border border-border hover:border-primary/20 relative overflow-hidden">
                {flight.bestValue && (
                  <div className="absolute top-0 right-0 p-3">
                    <span className="bg-secondary/10 text-secondary text-[10px] font-bold px-2.5 py-1 rounded tracking-widest uppercase">{t('bestValue')}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-2 flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-2"><Plane className="w-5 h-5 text-slate-700" /></div>
                    <span className="text-[10px] text-txt-sec uppercase tracking-tighter text-center">{flight.airline}</span>
                  </div>
                  <div className="md:col-span-7 grid grid-cols-3 items-center text-center">
                    <div>
                      <p className="text-2xl font-bold">{flight.depart}</p>
                      <p className="text-[10px] text-txt-sec uppercase tracking-widest mt-1">{flight.fromCode}</p>
                    </div>
                    <div className="relative px-4">
                      <div className="h-px bg-border w-full relative"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-surface px-2"><Plane className="w-3.5 h-3.5 text-primary" /></div></div>
                      <p className="text-[10px] mt-3 text-txt-muted uppercase">{flight.duration} &bull; {flight.stopLabel}</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{flight.arrive}</p>
                      <p className="text-[10px] text-txt-sec uppercase tracking-widest mt-1">{flight.toCode}</p>
                    </div>
                  </div>
                  <div className="md:col-span-3 text-right space-y-2 border-t md:border-t-0 md:border-l border-border/30 pt-4 md:pt-0 md:pl-6">
                    <p className="text-[10px] text-txt-sec uppercase">{t('from')}</p>
                    <p className="text-3xl font-bold text-primary">{flight.price} {flight.currency}</p>
                    <button className="w-full py-2.5 bg-white/5 hover:bg-primary hover:text-white transition-all rounded-full font-bold text-sm flex items-center justify-center gap-1">{t('book')}<ArrowRight className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
              <div className="bg-bg-surface p-6 md:p-8 rounded-xl border border-border flex items-center gap-5">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0"><Shield className="w-7 h-7 text-primary" /></div>
                <div><h4 className="font-bold">{t('secureBooking')}</h4><p className="text-sm text-txt-sec mt-1">{t('secureBookingDesc')}</p></div>
              </div>
              <div className="bg-bg-surface p-6 md:p-8 rounded-xl border border-border flex items-center gap-5">
                <div className="w-14 h-14 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0"><Headphones className="w-7 h-7 text-secondary" /></div>
                <div><h4 className="font-bold">{t('support')}</h4><p className="text-sm text-txt-sec mt-1">{t('supportDesc')}</p></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {!searched && !loading && (
        <div className="text-center mt-16">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"><Plane className="w-10 h-10 text-primary" /></div>
          <p className="text-txt-sec text-lg">{tc('searchFlightsPlaceholder')}</p>
        </div>
      )}
    </div>
  );
}