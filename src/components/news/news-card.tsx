'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Tag } from 'lucide-react';

interface NewsItem {
  id: string;
  title_az: string;
  title_en?: string;
  title_ru?: string;
  category: string;
  image_url?: string;
  created_at: string;
}

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

export default function NewsCard({ item, locale }: { item: NewsItem; locale: string }) {
  const t = useTranslations('news');
  const title = item[`title_${locale}` as 'title_az' | 'title_en' | 'title_ru'] || item.title_az;
  const categoryLabel = (CATEGORY_LABELS[locale] || CATEGORY_LABELS.az)[item.category] || item.category;
  const categoryColor = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.general;
  const date = new Date(item.created_at).toLocaleDateString(locale === 'az' ? 'az-AZ' : locale === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Link
      href={`/${locale}/news/${item.id}`}
      className="bg-bg-surface rounded-xl border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 group block"
    >
      {item.image_url && (
        <div className="aspect-video rounded-t-xl overflow-hidden bg-bg-surface">
          <Image src={item.image_url} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" fill />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${categoryColor}`}>
            <Tag className="w-3 h-3 inline mr-1" />
            {categoryLabel}
          </span>
          <span className="text-xs text-txt-sec flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {date}
          </span>
        </div>
        <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">{title}</h3>
      </div>
    </Link>
  );
}
