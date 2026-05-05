'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { HotelSearch } from '@/components/search/hotel-search';
import { Star, MapPin, X, Check, Filter, Phone, Wifi, Waves, UtensilsCrossed, Sparkles, Maximize2, Loader2, AlertCircle } from 'lucide-react';
import type { HotelOffer } from '@/types/hotel';

const HotelMap = dynamic(() => import('@/components/map/hotel-map'), { ssr: false });

const FEATURE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  pool: Waves,
  breakfast: UtensilsCrossed,
  spa: Sparkles,
  wifi: Wifi,
};

const FALLBACK_HOTELS: HotelOffer[] = [
  { id: 'mock-1', source: 'mock', name: 'Baku Palace & Spa', stars: 5, location: 'Baku, Azerbaijan', lat: 40.4093, lng: 49.8671, rating: 9.2, reviews: 2341, price: 240, currency: 'AZN', badge: 'premium', features: { pool: true, breakfast: true, spa: true, wifi: true }, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', phone: '' },
  { id: 'mock-2', source: 'mock', name: 'Mountain Retreat', stars: 4, location: 'Gabala, Azerbaijan', lat: 40.9876, lng: 47.8412, rating: 8.8, reviews: 1892, price: 185, currency: 'AZN', badge: 'bestSeller', features: { pool: false, breakfast: true, spa: true, wifi: true }, image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80', phone: '' },
  { id: 'mock-3', source: 'mock', name: 'Grand Hotel Istanbul', stars: 4, location: 'Sultanahmet, Istanbul', lat: 41.0054, lng: 28.9768, rating: 8.7, reviews: 2341, price: 120, currency: 'EUR', badge: null, features: { pool: false, breakfast: true, spa: false, wifi: true }, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80', phone: '' },
  { id: 'mock-4', source: 'mock', name: 'Dubai Marina Hotel', stars: 5, location: 'Dubai Marina, UAE', lat: 25.0805, lng: 55.1403, rating: 9.1, reviews: 1892, price: 250, currency: 'EUR', badge: 'premium', features: { pool: true, breakfast: false, spa: true, wifi: true }, image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80', phone: '' },
];

const STAR_OPTIONS = [3, 4, 5];

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  baku: { lat: 40.4093, lng: 49.8671 },
  istanbul: { lat: 41.0082, lng: 28.9784 },
  dubai: { lat: 25.2048, lng: 55.2708 },
  london: { lat: 51.5074, lng: -0.1278 },
  paris: { lat: 48.8566, lng: 2.3522 },
  moscow: { lat: 55.7558, lng: 37.6173 },
  rome: { lat: 41.9028, lng: 12.4964 },
  berlin: { lat: 52.52, lng: 13.405 },
  barcelona: { lat: 41.3874, lng: 2.1686 },
  tbilisi: { lat: 41.7151, lng: 44.8271 },
};

function resolveCityCoords(input: string): { lat: number; lng: number } {
  const lower = input.toLowerCase().trim();
  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    if (lower.includes(key)) return coords;
  }
  return { lat: 40.4093, lng: 49.8671 };
}

export default function HotelsPage() {
  const t = useTranslations('common');
  const th = useTranslations('hotels');
  const ts = useTranslations('search');
  const [searched, setSearched] = useState(false);
  const [hotels, setHotels] = useState<HotelOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configured, setConfigured] = useState(true);
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [selectedHotel, setSelectedHotel] = useState<HotelOffer | null>(null);
  const [showFullMap, setShowFullMap] = useState(false);

  const handleSearch = useCallback(async (params: { city: string; checkIn: string; checkOut: string; guests: number }) => {
    setSearched(true);
    setLoading(true);
    setError(null);

    const coords = resolveCityCoords(params.city);

    try {
      const sp = new URLSearchParams({
        latitude: String(coords.lat),
        longitude: String(coords.lng),
        checkInDate: params.checkIn,
        checkOutDate: params.checkOut,
        adults: String(params.guests || 1),
        rooms: '1',
        radius: '10',
      });

      const res = await fetch(`/api/hotels/search?${sp.toString()}`);
      const data = await res.json();

      if (!data.configured) {
        setConfigured(false);
        setHotels(FALLBACK_HOTELS);
      } else if (data.error) {
        setError(data.error);
        setHotels(FALLBACK_HOTELS);
      } else {
        setConfigured(true);
        setHotels(data.hotels?.length ? data.hotels : FALLBACK_HOTELS);
      }
    } catch {
      setError('Failed to search hotels');
      setHotels(FALLBACK_HOTELS);
    } finally {
      setLoading(false);
    }
  }, []);

  const isFallback = hotels.length > 0 && hotels[0].source === 'mock';

  const filteredHotels = hotels
    .filter((h) => !starFilter || h.stars === starFilter)
    .filter((h) => {
      const active = Object.entries(features).filter(([, v]) => v).map(([k]) => k);
      if (active.length === 0) return true;
      return active.every((f) => h.features[f as keyof typeof h.features]);
    });

  const mapMarkers = filteredHotels.map((h) => ({
    lat: h.lat,
    lng: h.lng,
    name: h.name,
    price: h.price,
  }));

  const handleMarkerClick = useCallback((index: number) => {
    setSelectedHotel(filteredHotels[index]);
  }, [filteredHotels]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 pt-32 pb-20">
      <header className="mb-12 md:mb-16">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-txt tracking-tight leading-[1.1] mb-4">
          {th('heroTitle')} <span className="text-primary italic">{th('heroHighlight')}</span>
          <br />
          {th('heroLine2')}
        </h1>
        <p className="text-txt-sec max-w-xl text-base md:text-lg leading-relaxed mb-10">{th('heroSubtitle')}</p>
        <HotelSearch onSearch={handleSearch} />
      </header>

      {loading && (
        <div className="text-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-txt-sec">{t('loading') || 'Searching hotels...'}</p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">{error}</p>
            {isFallback && <p className="text-txt-sec text-sm mt-1">Showing sample hotels</p>}
          </div>
        </div>
      )}

      {!loading && !configured && !error && searched && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-primary text-sm">Hotel search is not configured. Showing sample hotels.</p>
        </div>
      )}

      {searched && !loading && (
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8 space-y-10">
            <div className="flex justify-between items-end">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{th('popularDestinations')}</h2>
              <p className="text-txt-sec text-sm"><span className="text-txt font-bold">{filteredHotels.length}</span> {t('hotels')}</p>
            </div>

            {filteredHotels.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-bg-surface/50 flex items-center justify-center"><MapPin className="w-10 h-10 text-txt-muted/40" /></div>
                <p className="text-txt-sec text-lg font-medium">{th('noResults')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {filteredHotels.map((hotel) => (
                  <div key={hotel.id} onClick={() => setSelectedHotel(hotel)} className="group relative overflow-hidden rounded-2xl aspect-[4/5] bg-bg-surface shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border border-border/30 hover:border-primary/30 hover:shadow-[0_20px_50px_rgba(14,165,233,0.15)]">
                    <Image alt={hotel.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={hotel.image} fill />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/30 to-transparent" />
                    <div className="absolute bottom-0 p-5 md:p-7 w-full">
                      <div className="flex justify-between items-end">
                        <div>
                          {hotel.badge && (<span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 inline-block ${hotel.badge === 'premium' ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'}`}>{hotel.badge === 'premium' ? th('premium') : th('bestSeller')}</span>)}
                          <h3 className="text-xl md:text-2xl font-bold mb-1">{hotel.name}</h3>
                          <p className="text-txt-sec text-sm flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {hotel.location}</p>
                          <div className="flex gap-0.5 mt-2">{Array.from({ length: hotel.stars }).map((_, i) => (<Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />))}</div>
                        </div>
                        <div className="text-right">
                          <p className="text-primary text-xl md:text-2xl font-bold">{hotel.price} {hotel.currency}</p>
                          <p className="text-[10px] uppercase text-txt-sec tracking-wide">{th('perNight')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="md:col-span-4 space-y-6">
            <div className="glass-panel p-6 md:p-8 rounded-xl border border-border/30">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Filter className="w-5 h-5 text-secondary" />{th('filters')}</h3>
              <div className="space-y-7">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-txt-sec font-bold block mb-4">{th('starRating')}</label>
                  <div className="flex flex-wrap gap-2">
                    {STAR_OPTIONS.map((s) => (<button key={s} onClick={() => setStarFilter(starFilter === s ? null : s)} className={`px-4 py-2 rounded-full text-sm transition-all ${starFilter === s ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-white/5 hover:bg-primary/10 hover:text-primary'}`}>{s}&#9733;</button>))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-txt-sec font-bold block mb-4">{th('features')}</label>
                  <div className="space-y-3">
                    {[{ key: 'pool', label: th('pool') }, { key: 'breakfast', label: th('breakfast') }, { key: 'spa', label: th('spaWellness') }, { key: 'wifi', label: th('freeWifi') }].map((item) => (
                      <button key={item.key} onClick={() => setFeatures((prev) => ({ ...prev, [item.key]: !prev[item.key] }))} className={`w-full flex items-center gap-3 text-sm transition-all rounded-xl px-3 py-2.5 -mx-3 ${features[item.key] ? 'bg-primary/10 text-primary' : 'text-txt-sec hover:bg-white/5 hover:text-txt'}`}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${features[item.key] ? 'border-primary bg-primary/20' : 'border-border'}`}>{features[item.key] && <Check className="w-3 h-3 text-primary" />}</div>
                        {(() => { const Icon = FEATURE_ICONS[item.key]; return Icon ? <Icon className="w-4 h-4 flex-shrink-0" /> : null; })()}
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden shadow-2xl border border-border/30 relative h-72">
              <HotelMap markers={mapMarkers} center={[40.4, 49.8]} zoom={3} height="100%" onMarkerClick={handleMarkerClick} />
              <button onClick={() => setShowFullMap(true)} className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-primary transition-all z-[1000]"><Maximize2 className="w-4 h-4" /></button>
            </div>
          </aside>
        </section>
      )}

      {!searched && !loading && (
        <div className="text-center mt-16">
          <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6"><Star className="w-10 h-10 text-secondary" /></div>
          <p className="text-txt-sec text-lg">{ts('searchHotelsPlaceholder')}</p>
        </div>
      )}

      {selectedHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedHotel(null)}>
          <div className="w-full max-w-2xl bg-bg-base border border-border rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-56 md:h-72 flex-shrink-0">
              <Image src={selectedHotel.image} alt={selectedHotel.name} className="w-full h-full object-cover" fill />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-transparent to-transparent" />
              <button onClick={() => setSelectedHotel(null)} className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-black/60 transition-colors"><X className="w-5 h-5" /></button>
              {selectedHotel.badge && (<span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${selectedHotel.badge === 'premium' ? 'bg-secondary/20 text-secondary backdrop-blur-sm' : 'bg-primary/20 text-primary backdrop-blur-sm'}`}>{selectedHotel.badge === 'premium' ? th('premium') : th('bestSeller')}</span>)}
            </div>
            <div className="flex-1 overflow-y-auto min-h-0 p-6 md:p-8 -mt-10 relative">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-txt tracking-tight">{selectedHotel.name}</h2>
                  <p className="text-txt-sec text-sm flex items-center gap-1.5 mt-1"><MapPin className="w-4 h-4 text-primary" /> {selectedHotel.location}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl md:text-3xl font-bold text-primary">{selectedHotel.price} {selectedHotel.currency}</p>
                  <p className="text-[10px] uppercase text-txt-sec tracking-widest">{th('perNight')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex gap-0.5">{Array.from({ length: selectedHotel.stars }).map((_, i) => (<Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />))}</div>
                <span className="text-sm font-bold text-txt">{selectedHotel.rating}/10</span>
                <span className="text-xs text-txt-sec">({selectedHotel.reviews.toLocaleString()} {t('reviews')})</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[{ key: 'pool', label: th('pool') }, { key: 'breakfast', label: th('breakfast') }, { key: 'spa', label: th('spaWellness') }, { key: 'wifi', label: th('freeWifi') }].map((item) => {
                  const Icon = FEATURE_ICONS[item.key];
                  const active = selectedHotel.features[item.key as keyof typeof selectedHotel.features];
                  return (<div key={item.key} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border transition-colors ${active ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-bg-surface/50 border-border/30 text-txt-muted'}`}>{Icon && <Icon className="w-4 h-4 flex-shrink-0" />}<span className="text-sm font-medium">{item.label}</span>{active ? <Check className="w-4 h-4 ml-auto" /> : <X className="w-3.5 h-3.5 ml-auto" />}</div>);
                })}
              </div>
              <a href={`tel:${selectedHotel.phone}`} className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-gradient-to-br from-primary to-sky-400 text-white font-bold text-sm hover:shadow-[0_0_30px_rgba(14,165,233,0.4)] transition-all"><Phone className="w-4 h-4" />{t('book')}</a>
            </div>
          </div>
        </div>
      )}

      {showFullMap && (
        <div className="fixed inset-0 z-50 bg-bg-base" onClick={() => setShowFullMap(false)}>
          <div className="w-full h-full relative" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-4 right-4 z-[1001] flex items-center gap-3">
              <span className="bg-bg-base/90 backdrop-blur-sm border border-border px-4 py-2 rounded-full text-sm font-bold">{filteredHotels.length} {t('hotels')}</span>
              <button onClick={() => setShowFullMap(false)} className="w-10 h-10 flex items-center justify-center bg-bg-base/90 backdrop-blur-sm border border-border rounded-full hover:bg-primary hover:text-white hover:border-primary transition-all"><X className="w-5 h-5" /></button>
            </div>
            <HotelMap markers={mapMarkers} center={[40.4, 49.8]} zoom={4} height="100%" onMarkerClick={(index) => { setShowFullMap(false); setSelectedHotel(filteredHotels[index]); }} />
          </div>
        </div>
      )}
    </div>
  );
}