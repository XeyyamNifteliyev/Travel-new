'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import type { Country } from '@/types/country';

interface CountryCardProps {
  country: Country;
}

export function CountryCard({ country }: CountryCardProps) {
  const params = useParams();
  const locale = params?.locale as string;
  const t = useTranslations('common');
  const name = country[`name_${locale}` as keyof Country] as string;
  const description = (country[`description_${locale}` as keyof Country] as string) || country.description;

  return (
    <Link href={`/${locale}/countries/${country.slug}`}>
      <div className="bg-bg-surface rounded-xl p-6 border border-border hover:border-primary/50 transition-colors">
        <div className="text-5xl mb-4">{country.flag_emoji}</div>
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        <p className="text-txt-sec text-sm line-clamp-2">{description}</p>
        <div className="mt-4 text-primary text-sm font-medium">{t('explore')} →</div>
      </div>
    </Link>
  );
}
