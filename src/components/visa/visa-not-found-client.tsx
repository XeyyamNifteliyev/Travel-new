'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Loader2, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SLUG_TO_NAME: Record<string, Record<string, string>> = {
  spain: { az: 'İspaniya', en: 'Spain', ru: 'Испания' },
  germany: { az: 'Almaniya', en: 'Germany', ru: 'Германия' },
  greece: { az: 'Yunanıstan', en: 'Greece', ru: 'Греция' },
  netherlands: { az: 'Hollandiya', en: 'Netherlands', ru: 'Нидерланды' },
  usa: { az: 'ABŞ', en: 'USA', ru: 'США' },
  china: { az: 'Çin', en: 'China', ru: 'Китай' },
  south_korea: { az: 'Cənubi Koreya', en: 'South Korea', ru: 'Южная Корея' },
  india: { az: 'Hindistan', en: 'India', ru: 'Индия' },
  egypt: { az: 'Misir', en: 'Egypt', ru: 'Египет' },
  brazil: { az: 'Braziliya', en: 'Brazil', ru: 'Бразилия' },
  canada: { az: 'Kanada', en: 'Canada', ru: 'Канада' },
  australia: { az: 'Avstraliya', en: 'Australia', ru: 'Австралия' },
  sweden: { az: 'İsveç', en: 'Sweden', ru: 'Швеция' },
  norway: { az: 'Norveç', en: 'Norway', ru: 'Норвегия' },
  czech: { az: 'Çexiya', en: 'Czech Republic', ru: 'Чехия' },
  poland: { az: 'Polşa', en: 'Poland', ru: 'Польша' },
  hungary: { az: 'Macarıstan', en: 'Hungary', ru: 'Венгрия' },
  croatia: { az: 'Xorvatiya', en: 'Croatia', ru: 'Хорватия' },
  portugal: { az: 'Portuqaliya', en: 'Portugal', ru: 'Португалия' },
  switzerland: { az: 'İsveçrə', en: 'Switzerland', ru: 'Швейцария' },
};

export default function VisaNotFoundClient({ slug, locale }: { slug: string; locale: string }) {
  const t = useTranslations('visa');
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const countryName = SLUG_TO_NAME[slug]?.[locale] || SLUG_TO_NAME[slug]?.az || slug.replace(/-/g, ' ');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');

    try {
      const res = await fetch('/api/visa/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country_name: countryName, locale }),
      });
      const data = await res.json();

      if (data.success && data.slug) {
        router.push(`/${locale}/visa/${data.slug}`);
        router.refresh();
      } else {
        setError(data.error || 'Xəta baş verdi');
      }
    } catch {
      setError('Xəta baş verdi. Yenidən cəhd edin.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href={`/${locale}/visa`} className="flex items-center gap-2 text-txt-sec hover:text-primary mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" />
        {t('backToVisa')}
      </Link>

      <div className="bg-bg-surface rounded-xl border border-border p-8 text-center max-w-lg mx-auto">
        <Globe className="w-16 h-16 text-txt-sec mx-auto mb-4 opacity-30" />

        <h2 className="text-2xl font-bold mb-2">{t('countryNotFound')}</h2>
        <p className="text-txt-sec mb-6">{t('countryNotFoundDesc')}</p>

        {error && (
          <div className="text-red-400 text-sm mb-4">{error}</div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('aiGenerating')}
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {t('aiGenerateBtn')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
