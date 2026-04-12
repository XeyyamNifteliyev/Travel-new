'use client';

import { useTranslations } from 'next-intl';
import { Wallet } from 'lucide-react';

interface Props {
  value: number;
  travelStyle: 'budget' | 'mid' | 'luxury';
  onChange: (partial: { budget?: number; travelStyle?: 'budget' | 'mid' | 'luxury' }) => void;
}

const STYLES = [
  { id: 'budget' as const, labelKey: 'budget', range: '< 500 AZN' },
  { id: 'mid' as const, labelKey: 'midRange', range: '500-1500 AZN' },
  { id: 'luxury' as const, labelKey: 'luxury', range: '1500+ AZN' },
];

export function BudgetStep({ value, travelStyle, onChange }: Props) {
  const t = useTranslations('aiPlanner');

  return (
    <div>
      <h2 className="text-xl font-bold text-txt mb-2 flex items-center gap-2">
        <Wallet className="w-5 h-5 text-primary" />
        {t('budgetTitle')}
      </h2>
      <p className="text-txt-sec text-sm mb-6">{t('budgetDesc')}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => onChange({ travelStyle: style.id })}
            className={`p-4 rounded-xl border text-left transition-all ${
              travelStyle === style.id
                ? 'border-primary bg-primary/10'
                : 'border-border bg-bg-surface hover:border-primary/50'
            }`}
          >
            <div className="text-txt font-medium text-sm">{t(style.labelKey)}</div>
            <div className="text-txt-sec text-xs mt-1">{style.range}</div>
          </button>
        ))}
      </div>

      <div>
        <label className="text-txt-sec text-sm mb-1 block">{t('customBudget')}</label>
        <div className="relative">
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange({ budget: Number(e.target.value) })}
            placeholder="1000"
            min={50}
            className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-txt placeholder-txt-muted focus:border-primary focus:outline-none transition-colors pr-16"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-sec text-sm">
            AZN
          </span>
        </div>
        <p className="text-txt-muted text-xs mt-1">{t('perPerson')}</p>
      </div>
    </div>
  );
}
