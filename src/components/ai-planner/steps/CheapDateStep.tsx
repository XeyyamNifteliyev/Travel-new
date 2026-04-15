'use client';

import { useTranslations } from 'next-intl';
import { Calendar, Users, Sun } from 'lucide-react';

interface Props {
  duration: number;
  travelers: number;
  season: string;
  onChange: (partial: { duration?: number; travelers?: number; season?: string }) => void;
}

const SEASONS = [
  { id: 'spring', icon: '🌸', labelKey: 'seasonSpring' },
  { id: 'summer', icon: '☀️', labelKey: 'seasonSummer' },
  { id: 'autumn', icon: '🍂', labelKey: 'seasonAutumn' },
  { id: 'winter', icon: '❄️', labelKey: 'seasonWinter' },
];

export function CheapDateStep({ duration, travelers, season, onChange }: Props) {
  const t = useTranslations('aiPlanner');

  return (
    <div>
      <h2 className="text-xl font-bold text-txt mb-2 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-primary" />
        {t('cheapDuration')}
      </h2>
      <p className="text-txt-sec text-sm mb-4">{t('cheapDurationDesc')}</p>

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={30}
            value={duration}
            onChange={(e) => {
              const v = parseInt(e.target.value) || 1;
              onChange({ duration: Math.max(1, Math.min(30, v)) });
            }}
            className="w-20 bg-bg-input border border-border rounded-xl px-3 py-2.5 text-txt text-center text-lg font-bold focus:border-primary focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-txt-sec text-sm">{t('cheapDaysLabel')}</span>
        </div>
      </div>

      <h2 className="text-lg font-bold text-txt mb-2 flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        {t('cheapTravelers')}
      </h2>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => onChange({ travelers: Math.max(1, travelers - 1) })}
          className="w-10 h-10 rounded-xl border border-border bg-bg-surface text-txt hover:border-primary/50 flex items-center justify-center text-lg transition-colors"
        >
          −
        </button>
        <span className="text-xl font-bold text-txt min-w-[40px] text-center">{travelers}</span>
        <button
          onClick={() => onChange({ travelers: Math.min(10, travelers + 1) })}
          className="w-10 h-10 rounded-xl border border-border bg-bg-surface text-txt hover:border-primary/50 flex items-center justify-center text-lg transition-colors"
        >
          +
        </button>
      </div>

      <h2 className="text-lg font-bold text-txt mb-2 flex items-center gap-2">
        <Sun className="w-5 h-5 text-primary" />
        {t('cheapSeason')}
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {SEASONS.map((s) => (
          <button
            key={s.id}
            onClick={() => onChange({ season: s.id })}
            className={`p-3 rounded-xl border text-left transition-all ${
              season === s.id
                ? 'border-primary bg-primary/10'
                : 'border-border bg-bg-surface hover:border-primary/50'
            }`}
          >
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className={`text-sm font-medium ${season === s.id ? 'text-primary' : 'text-txt-sec'}`}>
              {t(s.labelKey)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
