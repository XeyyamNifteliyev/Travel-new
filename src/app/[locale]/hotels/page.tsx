'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { HotelSearch } from '@/components/search/hotel-search';
import { Star, MapPin, ArrowUpRight, Map, Filter, Check } from 'lucide-react';

const mockHotels = [
  { id: 1, name: 'Baku Palace & Spa', stars: 5, location: 'Bakı, Azərbaycan', rating: 9.2, reviews: 2341, price: 240, badge: 'premium', amenities: ['Pool', 'Spa', 'Breakfast'], image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80' },
  { id: 2, name: 'Mountain Retreat', stars: 4, location: 'Qəbələ, Azərbaycan', rating: 8.8, reviews: 1892, price: 185, badge: 'bestSeller', amenities: ['Nature', 'Spa', 'Restaurant'], image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80' },
  { id: 3, name: 'Grand Hotel Istanbul', stars: 4, location: 'Sultanahmet, İstanbul', rating: 8.7, reviews: 2341, price: 120, badge: null, amenities: ['Free cancel', 'Breakfast'], image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80' },
  { id: 4, name: 'Dubai Marina Hotel', stars: 5, location: 'Dubai Marina', rating: 9.1, reviews: 1892, price: 250, badge: 'premium', amenities: ['Pool', 'Spa', 'Beach'], image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80' },
];

const STAR_OPTIONS = [3, 4, 5];

export default function HotelsPage() {
  const t = useTranslations('common');
  const th = useTranslations('hotels');
  const ts = useTranslations('search');
  const [searched, setSearched] = useState(false);
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [features, setFeatures] = useState<Record<string, boolean>>({});

  const toggleFeature = (key: string) => {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSearch = () => {
    setSearched(true);
  };

  const filteredHotels = mockHotels
    .filter((h) => !starFilter || h.stars === starFilter)
    .filter((h) => {
      const activeFeatures = Object.entries(features).filter(([, v]) => v).map(([k]) => k);
      if (activeFeatures.length === 0) return true;
      return activeFeatures.every((f) => h.amenities.some((a) => a.toLowerCase().includes(f)));
    });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 pt-32 pb-20">
      <header className="mb-12 md:mb-16">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-txt tracking-tight leading-[1.1] mb-4">
          {th('heroTitle')} <span className="text-primary italic">{th('heroHighlight')}</span>
          <br />
          {th('heroLine2')}
        </h1>
        <p className="text-txt-sec max-w-xl text-base md:text-lg leading-relaxed mb-10">
          {th('heroSubtitle')}
        </p>
        <HotelSearch onSearch={handleSearch} />
      </header>

      {searched && (
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8 space-y-10">
            <div className="flex justify-between items-end">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{th('popularDestinations')}</h2>
              <p className="text-txt-sec text-sm">
                <span className="text-txt font-bold">{filteredHotels.length}</span> {t('hotels')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {filteredHotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="group relative overflow-hidden rounded-2xl aspect-[4/5] bg-bg-surface shadow-xl transition-transform hover:-translate-y-2 cursor-pointer border border-border/30"
                >
                  <img
                    alt={hotel.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    src={hotel.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/30 to-transparent" />
                  <div className="absolute bottom-0 p-5 md:p-7 w-full">
                    <div className="flex justify-between items-end">
                      <div>
                        {hotel.badge && (
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 inline-block ${
                            hotel.badge === 'premium'
                              ? 'bg-secondary/20 text-secondary'
                              : 'bg-primary/20 text-primary'
                          }`}>
                            {hotel.badge === 'premium' ? th('premium') : th('bestSeller')}
                          </span>
                        )}
                        <h3 className="text-xl md:text-2xl font-bold mb-1">{hotel.name}</h3>
                        <p className="text-txt-sec text-sm flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {hotel.location}
                        </p>
                        <div className="flex gap-0.5 mt-2">
                          {Array.from({ length: hotel.stars }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-primary text-xl md:text-2xl font-bold">{hotel.price} AZN</p>
                        <p className="text-[10px] uppercase text-txt-sec tracking-wide">{th('perNight')}</p>
                        <button className="mt-2 text-sm text-primary hover:underline flex items-center gap-1 ml-auto">
                          {t('book')} <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="md:col-span-4 space-y-6">
            <div className="glass-panel p-6 md:p-8 rounded-xl border border-border/30">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Filter className="w-5 h-5 text-secondary" />
                {th('filters')}
              </h3>
              <div className="space-y-7">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-txt-sec font-bold block mb-4">
                    {th('priceRange')}
                  </label>
                  <div className="flex justify-between text-xs font-medium text-txt-muted">
                    <span>50 AZN</span>
                    <span>500+ AZN</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-txt-sec font-bold block mb-4">
                    {th('starRating')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {STAR_OPTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setStarFilter(starFilter === s ? null : s)}
                        className={`px-4 py-2 rounded-full text-sm transition-all ${
                          starFilter === s
                            ? 'bg-primary/20 text-primary border border-primary/20'
                            : 'bg-white/5 hover:bg-primary/10 hover:text-primary'
                        }`}
                      >
                        {s}★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-txt-sec font-bold block mb-4">
                    {th('features')}
                  </label>
                  <div className="space-y-3">
                    {[
                      { key: 'pool', label: th('pool') },
                      { key: 'breakfast', label: th('breakfast') },
                      { key: 'spa', label: th('spaWellness') },
                      { key: 'wifi', label: th('freeWifi') },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-3 text-sm cursor-pointer group">
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                            features[item.key]
                              ? 'border-primary bg-primary/20'
                              : 'border-border group-hover:border-primary'
                          }`}
                        >
                          {features[item.key] && <Check className="w-3 h-3 text-primary" />}
                        </div>
                        <span className="text-txt-sec group-hover:text-txt transition-colors">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden h-64 shadow-2xl border border-border/30">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-sky-900/40" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <Map className="w-10 h-10 text-primary mb-3" />
                <h4 className="font-bold text-lg mb-2">{th('viewOnMap')}</h4>
                <p className="text-xs text-txt-sec mb-4">{th('mapDesc')}</p>
                <button className="bg-txt text-bg-base px-6 py-2 rounded-full text-sm font-bold hover:shadow-lg transition-all">
                  {th('openMap')}
                </button>
              </div>
            </div>
          </aside>
        </section>
      )}

      {!searched && (
        <div className="text-center mt-16">
          <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Star className="w-10 h-10 text-secondary" />
          </div>
          <p className="text-txt-sec text-lg">{ts('searchHotelsPlaceholder')}</p>
        </div>
      )}
    </div>
  );
}
