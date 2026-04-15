'use client';

import { useTranslations } from 'next-intl';
import { CheapDatesResponse } from '@/types/ai-planner';
import { Plane, Hotel, TrendingDown, Lightbulb, ArrowLeft } from 'lucide-react';

interface Props {
  response: CheapDatesResponse;
  onReset: () => void;
}

export function CheapDatesResult({ response, onReset }: Props) {
  const t = useTranslations('aiPlanner');

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-txt">{t('cheapResultTitle')}</h2>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-txt-sec hover:text-primary text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('back')}
        </button>
      </div>

      <div className="space-y-4">
        {response.options.map((opt, i) => (
          <div
            key={i}
            className="bg-card-bg border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-primary">{opt.period}</span>
              <span className="flex items-center gap-1 text-accent text-sm font-medium">
                <TrendingDown className="w-4 h-4" />
                {i === 0 ? '#1' : `#${i + 1}`}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="bg-bg-surface rounded-xl p-3 text-center">
                <Plane className="w-4 h-4 text-txt-sec mx-auto mb-1" />
                <div className="text-xs text-txt-sec mb-1">{t('cheapFlight')}</div>
                <div className="text-sm font-bold text-txt">{opt.flightPrice} AZN</div>
              </div>
              <div className="bg-bg-surface rounded-xl p-3 text-center">
                <Hotel className="w-4 h-4 text-txt-sec mx-auto mb-1" />
                <div className="text-xs text-txt-sec mb-1">{t('cheapHotel')}</div>
                <div className="text-sm font-bold text-txt">{opt.hotelPricePerNight} AZN</div>
              </div>
              <div className="bg-primary/10 rounded-xl p-3 text-center">
                <div className="text-xs text-primary mb-1">{t('cheapTotal')}</div>
                <div className="text-lg font-bold text-primary">{opt.totalPrice} AZN</div>
              </div>
            </div>

            <div className="text-xs text-txt-sec bg-bg-surface rounded-lg px-3 py-2">
              {opt.reason}
            </div>
          </div>
        ))}
      </div>

      {response.tip && (
        <div className="mt-6 bg-accent/10 border border-accent/30 rounded-xl p-4 flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-accent mb-1">{t('cheapTip')}</div>
            <div className="text-sm text-txt-sec">{response.tip}</div>
          </div>
        </div>
      )}
    </div>
  );
}
