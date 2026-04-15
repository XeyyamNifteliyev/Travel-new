'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { DestinationStep } from './steps/DestinationStep';
import { DateStep } from './steps/DateStep';
import { BudgetStep } from './steps/BudgetStep';
import { InterestsStep } from './steps/InterestsStep';
import { CheapDateStep } from './steps/CheapDateStep';
import { PlanResult } from './PlanResult';
import { CheapDatesResult } from './CheapDatesResult';
import { PlannerLoading } from './PlannerLoading';
import { PlanRequest, PlanResponse, CheapDatesResponse } from '@/types/ai-planner';
import { Sparkles, ChevronLeft, ChevronRight, SparklesIcon, TrendingDown } from 'lucide-react';

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

type Mode = 'plan' | 'cheap';

export function PlannerWizard() {
  const t = useTranslations('aiPlanner');
  const locale = useLocale();
  const [mode, setMode] = useState<Mode>('plan');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<PlanResponse | null>(null);
  const [cheapResult, setCheapResult] = useState<CheapDatesResponse | null>(null);

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

  const [cheapForm, setCheapForm] = useState({
    destination: '',
    duration: 5,
    travelers: 2,
    season: 'summer',
  });

  const totalSteps = mode === 'plan' ? 4 : 2;

  function updateForm(partial: Partial<PlanRequest>) {
    setForm((prev) => ({ ...prev, ...partial }));
  }

  function updateCheapForm(partial: { destination?: string; duration?: number; travelers?: number; season?: string }) {
    setCheapForm((prev) => ({ ...prev, ...partial }));
  }

  function canProceed(): boolean {
    if (mode === 'cheap') {
      switch (step) {
        case 1: return cheapForm.destination.trim().length > 0;
        case 2: return cheapForm.duration > 0 && cheapForm.travelers > 0 && cheapForm.season !== '';
        default: return false;
      }
    }
    switch (step) {
      case 1: return form.destination.trim().length > 0;
      case 2: return form.startDate !== '' && form.endDate !== '' && form.travelers > 0;
      case 3: return form.budget > 0;
      case 4: return form.interests.length > 0;
      default: return false;
    }
  }

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      if (mode === 'cheap') {
        const res = await fetch('/api/ai/cheap-dates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...cheapForm, language: locale }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Xəta baş verdi');
          setLoading(false);
          return;
        }
        setCheapResult(data);
      } else {
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
      }
      setLoading(false);
    } catch {
      setError('Şəbəkə xətası. Yenidən cəhd edin.');
      setLoading(false);
    }
  }

  function handleModeChange(newMode: Mode) {
    setMode(newMode);
    setStep(1);
    setError('');
    setResult(null);
    setCheapResult(null);
  }

  function handleReset() {
    setResult(null);
    setCheapResult(null);
    setStep(1);
    setError('');
  }

  if (loading) {
    return (
      <PlannerLoading
        destination={mode === 'cheap' ? cheapForm.destination : form.destination}
        cheapMode={mode === 'cheap'}
      />
    );
  }

  if (result) {
    return <PlanResult response={result} onReset={handleReset} />;
  }

  if (cheapResult) {
    return <CheapDatesResult response={cheapResult} onReset={handleReset} />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-center mb-6">
        <div className="inline-flex bg-bg-surface border border-border rounded-xl p-1">
          <button
            onClick={() => handleModeChange('plan')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'plan' ? 'bg-primary text-white' : 'text-txt-sec hover:text-txt'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            {t('modePlan')}
          </button>
          <button
            onClick={() => handleModeChange('cheap')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'cheap' ? 'bg-accent text-white' : 'text-txt-sec hover:text-txt'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            {t('modeCheap')}
          </button>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  i + 1 <= step
                    ? mode === 'cheap' ? 'bg-accent text-white' : 'bg-primary text-white'
                    : 'bg-bg-surface text-txt-sec'
                }`}
              >
                {i + 1}
              </div>
              {i < totalSteps - 1 && (
                <div
                  className={`w-12 sm:w-20 h-0.5 mx-1 transition-colors ${
                    i + 1 < step
                      ? mode === 'cheap' ? 'bg-accent' : 'bg-primary'
                      : 'bg-bg-surface'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card-bg backdrop-blur-sm border border-border rounded-2xl p-6 sm:p-8">
        {mode === 'plan' ? (
          <>
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
          </>
        ) : (
          <>
            {step === 1 && (
              <DestinationStep
                value={cheapForm.destination}
                onChange={(v) => updateCheapForm({ destination: v })}
                destinations={POPULAR_DESTINATIONS}
              />
            )}
            {step === 2 && (
              <CheapDateStep
                duration={cheapForm.duration}
                travelers={cheapForm.travelers}
                season={cheapForm.season}
                onChange={(partial) => updateCheapForm(partial)}
              />
            )}
          </>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

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
              className={`flex items-center gap-1 px-6 py-2.5 text-white rounded-xl font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${
                mode === 'cheap'
                  ? 'bg-accent hover:bg-accent/90'
                  : 'bg-primary hover:bg-primary/90'
              }`}
            >
              {t('next')}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed()}
              className={`flex items-center gap-2 px-6 py-2.5 text-white rounded-xl font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-opacity ${
                mode === 'cheap'
                  ? 'bg-gradient-to-r from-accent to-yellow-500 hover:opacity-90'
                  : 'bg-gradient-to-r from-primary to-accent hover:opacity-90'
              }`}
            >
              {mode === 'cheap' ? (
                <>
                  <TrendingDown className="w-4 h-4" />
                  {t('cheapSearch')}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {t('generatePlan')}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
