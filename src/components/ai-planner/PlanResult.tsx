'use client';

import { useTranslations, useLocale } from 'next-intl';
import { PlanResponse } from '@/types/ai-planner';
import { PlanResultContent } from './PlanResultContent';
import { PlanActions } from './PlanActions';
import { Plane, Hotel, FileText, MapPin } from 'lucide-react';
import Link from 'next/link';

interface Props {
  response: PlanResponse;
  onReset: () => void;
}

export function PlanResult({ response, onReset }: Props) {
  const t = useTranslations('aiPlanner');
  const locale = useLocale();
  const { plan, platformData } = response;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-txt mb-2">{t('planReady')}</h1>
        <p className="text-txt-sec">{t('planReadyDesc')}</p>
      </div>

      <PlanResultContent plan={plan} destination={platformData.countryPage.split('/').pop() || ''} />

      <div className="mt-6 bg-card-bg backdrop-blur-sm border border-border rounded-2xl p-6">
        <h3 className="text-lg font-bold text-txt mb-3">{t('platformLinks')}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href={platformData.flightsLink}
            className="flex flex-col items-center gap-2 p-3 bg-bg-surface rounded-xl hover:bg-bg-surface-hover transition-colors"
          >
            <Plane className="w-5 h-5 text-primary" />
            <span className="text-txt-sec text-xs">{t('searchFlights')}</span>
          </Link>
          <Link
            href={platformData.hotelsLink}
            className="flex flex-col items-center gap-2 p-3 bg-bg-surface rounded-xl hover:bg-bg-surface-hover transition-colors"
          >
            <Hotel className="w-5 h-5 text-secondary" />
            <span className="text-txt-sec text-xs">{t('searchHotels')}</span>
          </Link>
          <Link
            href={platformData.visaPage}
            className="flex flex-col items-center gap-2 p-3 bg-bg-surface rounded-xl hover:bg-bg-surface-hover transition-colors"
          >
            <FileText className="w-5 h-5 text-amber-400" />
            <span className="text-txt-sec text-xs">{t('visaPage')}</span>
          </Link>
          <Link
            href={`/${locale}/countries`}
            className="flex flex-col items-center gap-2 p-3 bg-bg-surface rounded-xl hover:bg-bg-surface-hover transition-colors"
          >
            <MapPin className="w-5 h-5 text-accent" />
            <span className="text-txt-sec text-xs">{t('countryPage')}</span>
          </Link>
        </div>
      </div>

      <PlanActions onReset={onReset} />
    </div>
  );
}
