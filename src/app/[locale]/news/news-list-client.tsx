'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import NewsCard from '@/components/news/news-card';

interface NewsItem {
  id: string;
  title_az: string;
  title_en?: string;
  title_ru?: string;
  category: string;
  image_url?: string;
  created_at: string;
}

const CATEGORIES = ['all', 'visa_change', 'general', 'travel_tip'];

export default function NewsListClient({ news }: { news: NewsItem[] }) {
  const t = useTranslations('news');
  const locale = useLocale();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? news : news.filter((n) => n.category === filter);

  const labelKey: Record<string, string> = {
    all: 'allCategories',
    visa_change: 'categoryVisaChange',
    general: 'categoryGeneral',
    travel_tip: 'categoryTravelTip',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
      <p className="text-txt-sec mb-8">{t('subtitle')}</p>

      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`text-sm px-4 py-2 rounded-full border transition-colors ${
              filter === cat ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/50 text-txt-sec'
            }`}
          >
            {t(labelKey[cat])}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-txt-sec">{t('noNews')}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <NewsCard key={item.id} item={item} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
