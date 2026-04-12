'use client';

import { useTranslations } from 'next-intl';
import { Target } from 'lucide-react';

interface Props {
  selected: string[];
  onChange: (interests: string[]) => void;
  interests: { id: string; icon: string }[];
}

const INTEREST_LABELS: Record<string, Record<string, string>> = {
  culture: { az: 'Mədəniyyət', ru: 'Культура', en: 'Culture' },
  nature: { az: 'Təbiət', ru: 'Природа', en: 'Nature' },
  food: { az: 'Qastro', ru: 'Гастро', en: 'Food' },
  shopping: { az: 'Alış-veriş', ru: 'Шоппинг', en: 'Shopping' },
  beach: { az: 'Çimərlik', ru: 'Пляж', en: 'Beach' },
  photography: { az: 'Fotoqrafiya', ru: 'Фотография', en: 'Photography' },
  nightlife: { az: 'Gecə həyatı', ru: 'Ночная жизнь', en: 'Nightlife' },
  family: { az: 'Ailə', ru: 'Семья', en: 'Family' },
};

export function InterestsStep({ selected, onChange, interests }: Props) {
  const t = useTranslations('aiPlanner');
  const locale = typeof window !== 'undefined'
    ? document.documentElement.lang || 'az'
    : 'az';

  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-txt mb-2 flex items-center gap-2">
        <Target className="w-5 h-5 text-primary" />
        {t('interestsTitle')}
      </h2>
      <p className="text-txt-sec text-sm mb-6">{t('interestsDesc')}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {interests.map((interest) => (
          <button
            key={interest.id}
            onClick={() => toggle(interest.id)}
            className={`p-4 rounded-xl border text-center transition-all ${
              selected.includes(interest.id)
                ? 'border-primary bg-primary/10'
                : 'border-border bg-bg-surface hover:border-primary/50'
            }`}
          >
            <div className="text-2xl mb-1">{interest.icon}</div>
            <div className="text-txt text-sm">
              {INTEREST_LABELS[interest.id]?.[locale] || interest.id}
            </div>
          </button>
        ))}
      </div>

      <p className="text-txt-muted text-xs mt-3">
        {t('selected')}: {selected.length}
      </p>
    </div>
  );
}
