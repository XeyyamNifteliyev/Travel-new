'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Thermometer, Wind, Droplets, Loader2 } from 'lucide-react';
import { getWeatherIcon } from './weather-icon';
import type { WeatherResponse, WeatherDaily } from '@/lib/weather';
import { getWeatherLabel } from '@/lib/weather';

interface WeatherWidgetProps {
  lat: number;
  lon: number;
  compact?: boolean;
}

const DAY_NAMES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export function WeatherWidget({ lat, lon, compact }: WeatherWidgetProps) {
  const t = useTranslations('weather');
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    fetch(`/api/weather?lat=${lat}&lon=${lon}`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed');
        return r.json();
      })
      .then((d: WeatherResponse) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [lat, lon]);

  if (loading) {
    return (
      <div className="bg-bg-surface rounded-xl border border-border p-6 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
        <span className="text-txt-sec text-sm">{t('loading')}</span>
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  const currentIcon = getWeatherIcon(data.current.weathercode);
  const CurrentIcon = currentIcon.icon;

  const formatDay = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const dayIdx = d.getDay();
    return t(DAY_NAMES[dayIdx]);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-bg-surface/50 rounded-xl px-4 py-3 border border-border/50">
        <CurrentIcon className={`w-6 h-6 ${currentIcon.color}`} />
        <div>
          <p className="text-lg font-bold">{Math.round(data.current.temperature)}°C</p>
          <p className="text-[10px] text-txt-sec uppercase tracking-widest">
            {t(getWeatherLabel(data.current.weathercode))}
          </p>
        </div>
        <div className="ml-3 flex items-center gap-3 text-txt-sec text-xs">
          <span className="flex items-center gap-1"><Wind className="w-3 h-3" />{Math.round(data.current.windspeed)} km/s</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-surface rounded-2xl border border-border overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-bold mb-4">{t('currentWeather')}</h3>
        <div className="flex items-center gap-6 mb-6">
          <CurrentIcon className={`w-14 h-14 ${currentIcon.color}`} />
          <div>
            <p className="text-4xl font-bold">{Math.round(data.current.temperature)}°C</p>
            <p className="text-sm text-txt-sec capitalize">{t(getWeatherLabel(data.current.weathercode))}</p>
          </div>
          <div className="ml-auto space-y-2 text-sm text-txt-sec">
            <p className="flex items-center gap-2"><Thermometer className="w-4 h-4" />{t('feelsLike')}</p>
            <p className="flex items-center gap-2"><Wind className="w-4 h-4" />{Math.round(data.current.windspeed)} km/s</p>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {data.daily.map((day: WeatherDaily) => {
            const dayIcon = getWeatherIcon(day.weathercode);
            const DayIcon = dayIcon.icon;
            return (
              <div key={day.date} className="text-center space-y-1.5">
                <p className="text-[10px] text-txt-sec uppercase tracking-wider font-medium">{formatDay(day.date)}</p>
                <DayIcon className={`w-5 h-5 mx-auto ${dayIcon.color}`} />
                <p className="text-xs font-bold">{Math.round(day.tempMax)}°</p>
                <p className="text-[10px] text-txt-muted">{Math.round(day.tempMin)}°</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
