'use client';

import { useTranslations } from 'next-intl';
import { TravelPlan } from '@/types/ai-planner';
import { DayCard } from './DayCard';
import { CostBreakdown } from './CostBreakdown';
import { PlanActions } from './PlanActions';
import { Plane, Hotel, Utensils, Ticket, Bus, ShieldCheck, Lightbulb, Backpack } from 'lucide-react';

interface Props {
  plan: TravelPlan;
  destination: string;
}

export function PlanResultContent({ plan, destination }: Props) {
  const t = useTranslations('aiPlanner');

  return (
    <div className="space-y-6">
      <div className="bg-card-bg backdrop-blur-sm border border-border rounded-2xl p-6">
        <p className="text-txt-sec text-sm leading-relaxed">{plan.summary}</p>
      </div>

      <CostBreakdown cost={plan.totalEstimatedCost} />

      {plan.visaInfo && (
        <div className={`p-4 rounded-xl border ${
          plan.visaInfo.required
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-emerald-500/10 border-emerald-500/30'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className={`w-4 h-4 ${plan.visaInfo.required ? 'text-amber-400' : 'text-emerald-400'}`} />
            <span className="font-medium text-txt text-sm">{t('visaInfo')}</span>
          </div>
          <p className="text-txt-sec text-sm">{plan.visaInfo.type}</p>
          {plan.visaInfo.processingTime && (
            <p className="text-txt-sec text-xs mt-1">{plan.visaInfo.processingTime}</p>
          )}
        </div>
      )}

      <div>
        <h3 className="text-lg font-bold text-txt mb-4">{t('dailyPlan')}</h3>
        <div className="space-y-3">
          {plan.days.map((day) => (
            <DayCard key={day.day} day={day} />
          ))}
        </div>
      </div>

      {plan.tips.length > 0 && (
        <div className="bg-card-bg backdrop-blur-sm border border-border rounded-2xl p-6">
          <h3 className="text-lg font-bold text-txt mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            {t('tips')}
          </h3>
          <ul className="space-y-2">
            {plan.tips.map((tip, i) => (
              <li key={i} className="text-txt-sec text-sm flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {plan.packingList.length > 0 && (
        <div className="bg-card-bg backdrop-blur-sm border border-border rounded-2xl p-6">
          <h3 className="text-lg font-bold text-txt mb-3 flex items-center gap-2">
            <Backpack className="w-5 h-5 text-accent" />
            {t('packingList')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {plan.packingList.map((item, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-bg-surface text-txt-sec text-xs rounded-full"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
