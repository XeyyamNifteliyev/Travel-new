'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { DestinationStep } from './steps/DestinationStep';
import { DateStep } from './steps/DateStep';
import { BudgetStep } from './steps/BudgetStep';
import { InterestsStep } from './steps/InterestsStep';
import { PlanResult } from './PlanResult';
import { PlannerLoading } from './PlannerLoading';
import { PlanRequest, PlanResponse } from '@/types/ai-planner';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale } from 'next-intl';

const POPULAR_DESTINATIONS = [
  { slug: 'turkey', name: 'Türkiyə', flag: '🇹🇷' },
  { slug: 'dubai', name: 'Dubai', flag: '🇦🇪' },
  { slug: 'georgia', name: 'Gürcüstan', flag: '🇬🇪' },
  { slug: 'japan', name: 'Yaponiya', flag: '🇯🇵' },
  { slug: 'thailand', name: 'Tailand', flag: '🇹🇭' },
  { slug: 'italy', name: 'İtaliya', flag: '🇮🇹' },
  { slug: 'france', name: 'Fransa', flag: '🇫🇷' },
  { slug: 'russia', name: 'Rusiya', flag: '🇷🇺' },
];

const INTERESTS = [
  { id: 'culture', icon: '🏛️' },
  { id: 'nature', icon: '🏔️' },
  { id: 'food', icon: '🍜' },
  { id: 'shopping', icon: '🛍️' },
  { id: 'beach', icon: '🏖️' },
  { id: 'photography', icon: '📸' },
  { id: 'nightlife', icon: '🎉' },
  { id: 'family', icon: '👨‍👩‍👧' },
];

export function PlannerWizard() {
  const t = useTranslations('aiPlanner');
  const locale = useLocale();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<PlanResponse | null>(null);

  const [form, setForm] = useState<PlanRequest>({
    destination: '',
    startDate: '',
    endDate: '',
    budget: 1000,
    travelers: 2,
    interests: [],
    travelStyle: 'mid',
    language: locale as 'az' | 'ru' | 'en',
  });

  const totalSteps = 4;

  function updateForm(partial: Partial<PlanRequest>) {
    setForm((prev) => ({ ...prev, ...partial }));
  }

  function canProceed(): boolean {
    switch (step) {
      case 1:
        return form.destination.trim().length > 0;
      case 2:
        return form.startDate !== '' && form.endDate !== '' && form.travelers > 0;
      case 3:
        return form.budget > 0;
      case 4:
        return form.interests.length > 0;
      default:
        return false;
    }
  }

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, language: locale }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Xəta baş verdi');
        setLoading(false);
        return;
      }
      setResult(data);
      setLoading(false);
    } catch {
      setError('Şəbəkə xətası. Yenidən cəhd edin.');
      setLoading(false);
    }
  }

  if (loading) {
    return <PlannerLoading destination={form.destination} />;
  }

  if (result) {
    return <PlanResult response={result} onReset={() => { setResult(null); setStep(1); }} />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  i + 1 <= step
                    ? 'bg-primary text-white'
                    : 'bg-bg-surface text-txt-sec'
                }`}
              >
                {i + 1}
              </div>
              {i < totalSteps - 1 && (
                <div
                  className={`w-12 sm:w-20 h-0.5 mx-1 transition-colors ${
                    i + 1 < step ? 'bg-primary' : 'bg-bg-surface'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="bg-card-bg backdrop-blur-sm border border-border rounded-2xl p-6 sm:p-8">
        {step === 1 && (
          <DestinationStep
            value={form.destination}
            onChange={(v) => updateForm({ destination: v })}
            destinations={POPULAR_DESTINATIONS}
          />
        )}
        {step === 2 && (
          <DateStep
            startDate={form.startDate}
            endDate={form.endDate}
            travelers={form.travelers}
            onChange={(partial) => updateForm(partial)}
          />
        )}
        {step === 3 && (
          <BudgetStep
            value={form.budget}
            travelStyle={form.travelStyle}
            onChange={(partial) => updateForm(partial)}
          />
        )}
        {step === 4 && (
          <InterestsStep
            selected={form.interests}
            onChange={(interests) => updateForm({ interests })}
            interests={INTERESTS}
          />
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="flex items-center gap-1 px-4 py-2 text-txt-sec hover:text-txt disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {t('back')}
          </button>

          {step < totalSteps ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-1 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {t('next')}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white rounded-xl font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
            >
              <Sparkles className="w-4 h-4" />
              {t('generatePlan')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
