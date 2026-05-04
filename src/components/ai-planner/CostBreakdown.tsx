'use client';

import { Plane, Hotel, Utensils, Ticket, Bus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TravelPlan } from '@/types/ai-planner';

interface Props {
  cost: TravelPlan['totalEstimatedCost'];
}

export function CostBreakdown({ cost }: Props) {
  const t = useTranslations('aiPlanner');

  const ICONS = [
    { key: 'flights' as const, icon: Plane, color: 'text-primary', label: t('costFlights') },
    { key: 'accommodation' as const, icon: Hotel, color: 'text-secondary', label: t('costAccommodation') },
    { key: 'food' as const, icon: Utensils, color: 'text-accent', label: t('costFood') },
    { key: 'activities' as const, icon: Ticket, color: 'text-purple-400', label: t('costActivities') },
    { key: 'transport' as const, icon: Bus, color: 'text-cyan-400', label: t('costTransport') },
  ];

  return (
    <div className="bg-card-bg backdrop-blur-sm border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-txt">{t('costBreakdown')}</h3>
        <div className="text-right">
          <div className="text-primary font-bold text-xl">{cost.amount} {cost.currency}</div>
          <div className="text-txt-muted text-xs">{t('perPerson')}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {ICONS.map(({ key, icon: Icon, color, label }) => (
          <div
            key={key}
            className="bg-bg-surface rounded-xl p-3 text-center"
          >
            <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
            <div className="text-txt text-sm font-medium">{cost.breakdown[key]}</div>
            <div className="text-txt-muted text-xs">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
