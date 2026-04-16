'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Clock, DollarSign, CheckCircle, AlertCircle, Plane } from 'lucide-react';
import type { VisaCountryData } from '@/types/country';

interface VisaCountryGridProps {
  countries: VisaCountryData[];
}

const TYPE_CONFIG: Record<string, { color: string; icon: typeof CheckCircle }> = {
  not_required: { color: 'text-green-400 bg-green-500/10 border-green-500/20', icon: CheckCircle },
  on_arrival: { color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', icon: Plane },
  e_visa: { color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: AlertCircle },
  required: { color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: AlertCircle },
};

const TYPE_LABEL_KEYS: Record<string, string> = {
  not_required: 'notRequired',
  on_arrival: 'onArrival',
  e_visa: 'eVisa',
  required: 'required',
};

export default function VisaCountryGrid({ countries }: VisaCountryGridProps) {
  const t = useTranslations('visa');
  const locale = useLocale();

  if (countries.length === 0) {
    return (
      <div className="text-center py-12 text-txt-sec">
        {t('noVisaInfo')}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {countries.map(({ visa, country }) => {
        const config = TYPE_CONFIG[visa.requirement_type] || TYPE_CONFIG.required;
        const Icon = config.icon;
        const name = country[`name_${locale}` as 'name_az' | 'name_en' | 'name_ru'] || country.name_az;
        const fee = visa.fee_usd ? `$${visa.fee_usd}` : t('feeFree');

        return (
          <Link
            key={country.id}
            href={`/${locale}/visa/${country.slug}`}
            className="bg-bg-surface rounded-xl p-5 border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{country.flag_emoji}</span>
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{name}</h3>
              </div>
            </div>

            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
              <Icon className="w-3 h-3" />
              {t(TYPE_LABEL_KEYS[visa.requirement_type] || 'required')}
            </div>

            <div className="flex items-center gap-4 mt-3 text-sm text-txt-sec">
              <div className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                {fee}
              </div>
              {visa.processing_days_max ? (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {visa.processing_days_min}-{visa.processing_days_max} {t('workDays')}
                </div>
              ) : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
