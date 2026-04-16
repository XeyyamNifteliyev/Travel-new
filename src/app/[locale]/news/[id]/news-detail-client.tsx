'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  az: { visa_change: 'Viza dəyişiklikləri', general: 'Ümumi', travel_tip: 'Səyahət məsləhətləri' },
  en: { visa_change: 'Visa changes', general: 'General', travel_tip: 'Travel tips' },
  ru: { visa_change: 'Изменения виз', general: 'Общие', travel_tip: 'Советы' },
};

const CATEGORY_COLORS: Record<string, string> = {
  visa_change: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  general: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  travel_tip: 'bg-green-500/10 text-green-400 border-green-500/20',
};

export default function NewsDetailClient({ news, locale }: { news: Record<string, unknown>; locale: string }) {
  const t = useTranslations('news');
  const title = (news[`title_${locale}`] as string) || (news.title_az as string);
  const content = (news[`content_${locale}`] as string) || (news.content_az as string);
  const category = news.category as string;
  const createdAt = news.created_at as string;
  const imageUrl = news.image_url as string | null;

  const categoryLabel = (CATEGORY_LABELS[locale] || CATEGORY_LABELS.az)[category] || category;
  const categoryColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.general;
  const date = new Date(createdAt).toLocaleDateString(locale === 'az' ? 'az-AZ' : locale === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href={`/${locale}/news`} className="flex items-center gap-2 text-txt-sec hover:text-primary mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" />
        {t('backToNews')}
      </Link>

      {imageUrl && (
        <div className="aspect-video rounded-xl overflow-hidden mb-6">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <span className={`text-xs px-2.5 py-1 rounded-full border ${categoryColor}`}>
          <Tag className="w-3 h-3 inline mr-1" />
          {categoryLabel}
        </span>
        <span className="text-sm text-txt-sec flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {date}
        </span>
      </div>

      <h1 className="text-3xl font-bold mb-6">{title}</h1>

      <div className="prose prose-invert max-w-none text-txt-sec leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
}
