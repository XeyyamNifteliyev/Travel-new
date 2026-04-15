'use client';

import { useTranslations } from 'next-intl';
import { Sparkles, TrendingDown, CheckCircle2, Loader2 } from 'lucide-react';

interface Props {
  destination: string;
  cheapMode?: boolean;
}

export function PlannerLoading({ destination, cheapMode }: Props) {
  const t = useTranslations('aiPlanner');

  const Icon = cheapMode ? TrendingDown : Sparkles;
  const iconBg = cheapMode ? 'bg-accent/20' : 'bg-primary/20';
  const iconColor = cheapMode ? 'text-accent' : 'text-primary';

  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="relative inline-block mb-8">
        <div className={`w-20 h-20 ${iconBg} rounded-full flex items-center justify-center mx-auto`}>
          <Icon className={`w-10 h-10 ${iconColor} animate-pulse`} />
        </div>
      </div>

      <h2 className="text-xl font-bold text-txt mb-2">
        {cheapMode ? t('cheapLoading') : t('generating')}
      </h2>
      <p className="text-txt-sec text-sm mb-8">
        {destination} {cheapMode ? t('cheapLoadingDesc') : t('generatingDesc')}
      </p>

      <div className="space-y-3 text-left max-w-xs mx-auto">
        {cheapMode ? (
          <>
            <LoadingStep text={t('cheapStepDates')} />
            <LoadingStep text={t('cheapStepPrices')} />
          </>
        ) : (
          <>
            <LoadingStep text={t('stepCountry')} />
            <LoadingStep text={t('stepVisa')} done />
            <LoadingStep text={t('stepPlan')} />
          </>
        )}
      </div>

      <div className="mt-8">
        <Loader2 className={`w-6 h-6 ${iconColor} animate-spin mx-auto`} />
      </div>
    </div>
  );
}

function LoadingStep({ text, done }: { text: string; done?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {done ? (
        <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
      ) : (
        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin flex-shrink-0" />
      )}
      <span className={done ? 'text-txt-sec' : 'text-txt'}>{text}</span>
    </div>
  );
}
