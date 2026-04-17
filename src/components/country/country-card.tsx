'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Plane, Hotel, Shield } from 'lucide-react';
import { getUnsplashUrl, getFlagUrl } from '@/lib/unsplash';
import type { ExpandedCountry } from '@/types/country';

const SAFETY_COLORS: Record<string, string> = {
  safe: 'bg-green-500/90 text-white',
  caution: 'bg-yellow-500/90 text-black',
  warning: 'bg-red-500/90 text-white',
};

const MONTH_SHORT: Record<string, string> = {
  jan: 'Yan', feb: 'Fev', mar: 'Mar', apr: 'Apr', may: 'May', jun: 'İyn',
  jul: 'İyl', aug: 'Avq', sep: 'Sen', oct: 'Okt', nov: 'Noy', dec: 'Dek',
};

interface CountryCardProps {
  country: ExpandedCountry;
}

export function CountryCard({ country }: CountryCardProps) {
  const params = useParams();
  const locale = (params?.locale as string) || 'az';
  const t = useTranslations('countries');
  const [imgError, setImgError] = useState(false);

  const name = locale === 'en' ? country.name_en
    : locale === 'ru' ? country.name_ru
    : country.name_az;

  const desc = locale === 'en' ? country.short_desc_en
    : locale === 'ru' ? country.short_desc_ru
    : country.short_desc;

  const showImage = country.cover_photo_id && !imgError;

  return (
    <Link href={`/${locale}/countries/${country.slug}`} className="group block">
      <div className="relative rounded-2xl overflow-hidden border border-border bg-bg-surface hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
        <div className="relative h-52 bg-gray-200 dark:bg-gray-700 overflow-hidden">
          {showImage ? (
            <Image
              src={getUnsplashUrl(country.cover_photo_id!, { w: 500, h: 320 })}
              alt={country.cover_photo_alt || name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-bg-surface">
              <div className="relative w-full h-full">
                <Image
                  src={getFlagUrl(country.slug, 640)}
                  alt={name}
                  fill
                  className="object-cover opacity-30 blur-sm scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src={getFlagUrl(country.slug, 160)}
                    alt={name}
                    width={80}
                    height={54}
                    className="rounded-lg shadow-2xl drop-shadow-xl"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-white font-bold text-lg drop-shadow-lg">{name}</h3>
            {country.capital && (
              <p className="text-white/80 text-xs mt-0.5">{country.capital}</p>
            )}
          </div>

          <div className="absolute top-2 left-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold backdrop-blur-sm ${
              country.visa_required
                ? 'bg-orange-500/90 text-white'
                : 'bg-green-500/90 text-white'
            }`}>
              {country.visa_required ? t('visaRequired') : t('visaFree')}
            </span>
          </div>

          {country.safety_level && country.safety_level !== 'safe' && (
            <div className="absolute top-2 right-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${SAFETY_COLORS[country.safety_level]}`}>
                <Shield className="w-3 h-3 inline mr-0.5" />
                {t(`safety${country.safety_level.charAt(0).toUpperCase() + country.safety_level.slice(1)}` as 'safetySafe')}
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          {desc && (
            <p className="text-txt-sec text-sm line-clamp-2 mb-3">{desc}</p>
          )}

          {(country.avg_flight_azn || country.avg_hotel_azn) && (
            <div className="flex gap-3 text-xs text-txt-sec mb-3">
              {country.avg_flight_azn ? (
                <span className="flex items-center gap-1"><Plane className="w-3 h-3" /> ~{country.avg_flight_azn} AZN</span>
              ) : null}
              {country.avg_hotel_azn ? (
                <span className="flex items-center gap-1"><Hotel className="w-3 h-3" /> ~{country.avg_hotel_azn}</span>
              ) : null}
            </div>
          )}

          {country.best_months && country.best_months.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {country.best_months.slice(0, 4).map(m => (
                <span key={m} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium">
                  {MONTH_SHORT[m] || m}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
