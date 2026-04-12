'use client';

import { useTranslations } from 'next-intl';
import { Calendar, Users } from 'lucide-react';

interface Props {
  startDate: string;
  endDate: string;
  travelers: number;
  onChange: (partial: { startDate?: string; endDate?: string; travelers?: number }) => void;
}

export function DateStep({ startDate, endDate, travelers, onChange }: Props) {
  const t = useTranslations('aiPlanner');

  const daysCount =
    startDate && endDate
      ? Math.ceil(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;

  return (
    <div>
      <h2 className="text-xl font-bold text-txt mb-2 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-primary" />
        {t('when')}
      </h2>
      <p className="text-txt-sec text-sm mb-6">{t('whenDesc')}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-txt-sec text-sm mb-1 block">{t('startDate')}</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onChange({ startDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-txt focus:border-primary focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="text-txt-sec text-sm mb-1 block">{t('endDate')}</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onChange({ endDate: e.target.value })}
            min={startDate || new Date().toISOString().split('T')[0]}
            className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-txt focus:border-primary focus:outline-none transition-colors"
          />
        </div>
      </div>

      {daysCount > 0 && (
        <div className="mb-6 p-3 bg-primary/10 border border-primary/30 rounded-xl text-primary text-sm">
          {t('tripDuration')}: <strong>{daysCount}</strong> {t('days')}
        </div>
      )}

      <div>
        <label className="text-txt-sec text-sm mb-1 flex items-center gap-1">
          <Users className="w-4 h-4" />
          {t('travelers')}
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => travelers > 1 && onChange({ travelers: travelers - 1 })}
            className="w-10 h-10 bg-bg-input border border-border rounded-xl text-txt hover:bg-bg-surface-hover transition-colors"
          >
            -
          </button>
          <span className="text-txt text-xl font-bold w-8 text-center">{travelers}</span>
          <button
            onClick={() => travelers < 10 && onChange({ travelers: travelers + 1 })}
            className="w-10 h-10 bg-bg-input border border-border rounded-xl text-txt hover:bg-bg-surface-hover transition-colors"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
