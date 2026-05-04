'use client';

import { useTranslations } from 'next-intl';
import { PlannerWizard } from '@/components/ai-planner/PlannerWizard';
import { Sparkles } from 'lucide-react';

export default function AIPlannerPage() {
  const t = useTranslations('aiPlanner');

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-primary text-sm mb-4">
            <Sparkles className="w-4 h-4" />
            {t('aiBadge')}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-txt mb-2">{t('title')}</h1>
          <p className="text-txt-sec max-w-xl mx-auto">{t('subtitle')}</p>
        </div>

        <PlannerWizard />
      </div>
    </div>
  );
}
