'use client';

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
  az: { visa_change: 'Viza yenilikləri', general: 'TravelAZ yenilikləri', travel_tip: 'Səyahət bildirişi' },
  en: { visa_change: 'Visa updates', general: 'TravelAZ updates', travel_tip: 'Travel brief' },
  ru: { visa_change: 'Визовые обновления', general: 'Новости TravelAZ', travel_tip: 'Тревел-сводка' },
};

const CATEGORY_COLORS: Record<string, string> = {
  visa_change: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  general: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  travel_tip: 'bg-green-500/10 text-green-400 border-green-500/20',
};

const MONTHS_SHORT: Record<string, string[]> = {
  az: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'İyn', 'İyl', 'Avq', 'Sen', 'Okt', 'Noy', 'Dek'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  ru: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
};

function formatNewsDate(dateStr: string, locale: string) {
  const date = new Date(dateStr);
  const months = MONTHS_SHORT[locale] || MONTHS_SHORT.az;
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export default function NewsCard({ item, locale }: { item: NewsItem; locale: string }) {
  const title = item[`title_${locale}` as 'title_az' | 'title_en' | 'title_ru'] || item.title_az;
  const categoryLabel = (CATEGORY_LABELS[locale] || CATEGORY_LABELS.az)[item.category] || item.category;
  const categoryColor = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.general;
  const date = formatNewsDate(item.created_at, locale);

  return (
    <Link
      href={`/${locale}/news/${item.id}`}
      className="group block h-full"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-bg-surface/50 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(14,165,233,0.15)]">
        {item.image_url && (
          <div className="relative aspect-video overflow-hidden bg-bg-surface">
            <Image
              src={item.image_url}
              alt={title}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          </div>
        )}
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${categoryColor}`}>
              <Tag className="mr-1 h-3 w-3" />
              {categoryLabel}
            </span>
          </div>

          <h3 className="line-clamp-2 flex-1 font-semibold leading-snug transition-colors group-hover:text-primary">{title}</h3>

          <div className="mt-4 flex items-center gap-3 border-t border-border/10 pt-3 text-txt-muted">
            <span className="flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" />
              {date}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
