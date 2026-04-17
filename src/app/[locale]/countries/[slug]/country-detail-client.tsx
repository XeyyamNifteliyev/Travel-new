'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Plane, Hotel, Utensils, Clock, Phone, Globe, Shield } from 'lucide-react';
import YouTubeLite from '@/components/ui/youtube-lite';
import { getUnsplashUrl, getFlagUrl } from '@/lib/unsplash';
import type { ExpandedCountry, CountryHighlight } from '@/types/country';

function HighlightImage({ photoId, name, countrySlug }: { photoId: string; name: string; countrySlug: string }) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div className="relative h-44 bg-bg-surface overflow-hidden">
        <Image
          src={getFlagUrl(countrySlug, 320)}
          alt={name}
          fill
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-txt-sec/60">{name.charAt(0)}</span>
        </div>
      </div>
    );
  }
  return (
    <div className="relative h-44">
      <Image
        src={getUnsplashUrl(photoId, { w: 400, h: 220 })}
        alt={name}
        fill
        className="object-cover"
        loading="lazy"
        onError={() => setError(true)}
      />
    </div>
  );
}

const MONTH_LABELS: Record<string, Record<string, string>> = {
  az: { jan:'Yanvar', feb:'Fevral', mar:'Mart', apr:'Aprel', may:'May', jun:'İyun', jul:'İyul', aug:'Avqust', sep:'Sentyabr', oct:'Oktyabr', nov:'Noyabr', dec:'Dekabr' },
  en: { jan:'January', feb:'February', mar:'March', apr:'April', may:'May', jun:'June', jul:'July', aug:'August', sep:'September', oct:'October', nov:'November', dec:'December' },
  ru: { jan:'Январь', feb:'Февраль', mar:'Март', apr:'Апрель', may:'Май', jun:'Июнь', jul:'Июль', aug:'Август', sep:'Сентябрь', oct:'Октябрь', nov:'Ноябрь', dec:'Декабрь' },
};

const SAFETY_COLORS: Record<string, string> = {
  safe: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  caution: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  warning: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

interface BlogItem {
  id: string;
  title: string;
  cover_image?: string;
  created_at: string;
  views: number;
  profiles?: { display_name: string } | null;
}

interface Props {
  country: ExpandedCountry;
  highlights: CountryHighlight[];
  blogs: BlogItem[];
  locale: string;
  hasVisaInfo?: boolean;
}

export default function CountryDetailClient({ country, highlights, blogs, locale, hasVisaInfo }: Props) {
  const t = useTranslations('countries');
  const tc = useTranslations('common');
  const [heroError, setHeroError] = useState(false);

  const name = locale === 'en' ? country.name_en
    : locale === 'ru' ? country.name_ru
    : country.name_az;

  const desc = locale === 'en' ? country.short_desc_en
    : locale === 'ru' ? country.short_desc_ru
    : country.short_desc;

  const monthLabels = MONTH_LABELS[locale] || MONTH_LABELS.az;
  const allMonths = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href={`/${locale}/countries`} className="inline-flex items-center gap-2 text-txt-sec hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        {t('backToCountries')}
      </Link>

      {country.cover_photo_id && !heroError ? (
        <div className="relative h-72 md:h-[420px] rounded-3xl overflow-hidden mb-8">
          <Image
            src={getUnsplashUrl(country.cover_photo_id, { w: 1400, h: 600 })}
            alt={country.cover_photo_alt || name}
            fill
            className="object-cover"
            priority
            onError={() => setHeroError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <div className="flex items-center gap-3 mb-2">
              {country.flag_emoji && <span className="text-4xl">{country.flag_emoji}</span>}
              <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">{name}</h1>
            </div>
            {country.capital && (
              <p className="text-white/80 text-lg">{country.capital}</p>
            )}
            {desc && (
              <p className="text-white/70 text-sm mt-2 max-w-2xl">{desc}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="relative h-48 md:h-64 rounded-3xl overflow-hidden mb-8 bg-bg-surface border border-border">
          <Image
            src={getFlagUrl(country.slug, 640)}
            alt={name}
            fill
            className="object-cover opacity-15 blur-md scale-110"
            priority
          />
          <div className="absolute inset-0 flex items-center gap-6 px-8">
            <Image
              src={getFlagUrl(country.slug, 320)}
              alt={name}
              width={100}
              height={67}
              className="rounded-xl shadow-2xl"
            />
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">{name}</h1>
              {country.capital && <p className="text-txt-sec text-lg mt-1">{country.capital}</p>}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { icon: <Globe className="w-5 h-5" />, label: t('currency'), value: country.currency_name ? `${country.currency} (${country.currency_name})` : null },
          { icon: <Clock className="w-5 h-5" />, label: t('timezone'), value: country.timezone },
          { icon: <Phone className="w-5 h-5" />, label: t('dialCode'), value: country.calling_code },
          { icon: <Shield className="w-5 h-5" />, label: t('visaRequired').split(' ')[0], value: country.visa_required ? t('visaRequired') : t('visaFree') },
        ].filter(i => i.value).map(info => (
          <div key={info.label} className="bg-bg-surface rounded-2xl p-4 border border-border text-center hover:border-primary/30 transition-colors">
            <div className="flex justify-center text-primary mb-2">{info.icon}</div>
            <div className="text-[11px] text-txt-sec mb-1 uppercase tracking-wide">{info.label}</div>
            <div className="text-sm font-semibold">{info.value}</div>
          </div>
        ))}
      </div>

      {(country.avg_flight_azn || country.avg_hotel_azn || country.avg_daily_azn) && (
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 rounded-2xl p-6 mb-8 border border-primary/10">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">💰</span> {t('costInfo')}
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {country.avg_flight_azn ? (
              <div className="text-center">
                <Plane className="w-6 h-6 mx-auto text-primary mb-2" />
                <div className="text-3xl font-bold text-primary">{country.avg_flight_azn}</div>
                <div className="text-xs text-txt-sec mt-1">{t('avgFlight')}</div>
              </div>
            ) : <div />}
            {country.avg_hotel_azn ? (
              <div className="text-center">
                <Hotel className="w-6 h-6 mx-auto text-primary mb-2" />
                <div className="text-3xl font-bold text-primary">{country.avg_hotel_azn}</div>
                <div className="text-xs text-txt-sec mt-1">{t('avgHotel')}</div>
              </div>
            ) : <div />}
            {country.avg_daily_azn ? (
              <div className="text-center">
                <Utensils className="w-6 h-6 mx-auto text-primary mb-2" />
                <div className="text-3xl font-bold text-primary">{country.avg_daily_azn}</div>
                <div className="text-xs text-txt-sec mt-1">{t('avgDaily')}</div>
              </div>
            ) : <div />}
          </div>
        </div>
      )}

      {country.best_months && country.best_months.length > 0 && (
        <div className="mb-8">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">📅</span> {t('bestVisit')}
          </h2>
          <div className="flex gap-2 flex-wrap">
            {allMonths.map(m => {
              const isGood = country.best_months!.includes(m);
              return (
                <span key={m} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isGood
                    ? 'bg-green-500 text-white shadow-md shadow-green-500/20'
                    : 'bg-bg-surface border border-border text-txt-sec/50'
                }`}>
                  {monthLabels[m]}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {highlights.length > 0 && (
        <div className="mb-8">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">📍</span> {t('topPlaces')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {highlights.map(h => (
              <div key={h.id} className="rounded-2xl overflow-hidden border border-border bg-bg-surface hover:shadow-lg transition-shadow">
                {h.photo_id && (
                  <HighlightImage photoId={h.photo_id} name={h.name} countrySlug={country.slug} />
                )}
                <div className="p-4">
                  <h3 className="font-semibold">{h.name}</h3>
                  {h.description && (
                    <p className="text-sm text-txt-sec mt-1 line-clamp-2">{h.description}</p>
                  )}
                  {h.category && (
                    <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">{h.category}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {country.youtube_ids && country.youtube_ids.length > 0 && (
        <div className="mb-8">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">🎬</span> {t('videos')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {country.youtube_ids.map((id, i) => (
              <YouTubeLite
                key={id}
                videoId={id}
                title={country.youtube_titles?.[i]}
              />
            ))}
          </div>
          <p className="text-xs text-txt-sec mt-3">{t('videoNote')}</p>
        </div>
      )}

      <Link
        href={`/${locale}/visa/${country.slug}`}
        className="block mb-8"
      >
        <div className="bg-gradient-to-r from-orange-500/10 to-orange-500/5 dark:from-orange-500/20 dark:to-orange-500/10 rounded-2xl p-6 border border-orange-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-orange-500/40 transition-colors">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">🛂 {t('visaInfoTitle')}</h3>
            <p className="text-sm text-txt-sec mt-1">{t('visaInfoSub')}</p>
          </div>
          <span className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-orange-500/20 whitespace-nowrap">
            {t('visaInfoBtn')} →
          </span>
        </div>
      </Link>

      {blogs.length > 0 && (
        <div className="mb-8">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">✍️</span> {name} {t('userBlogs')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {blogs.map(b => (
              <Link
                key={b.id}
                href={`/${locale}/blog/${b.id}`}
                className="block p-4 rounded-2xl border border-border bg-bg-surface hover:shadow-md hover:border-primary/30 transition-all"
              >
                <h3 className="font-medium line-clamp-2 mb-2">{b.title}</h3>
                <p className="text-xs text-txt-sec">
                  {b.profiles?.display_name || 'User'} · {new Date(b.created_at).toLocaleDateString(locale === 'en' ? 'en' : locale === 'ru' ? 'ru' : 'az')}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {country.safety_level && (
        <div className={`rounded-2xl p-4 mb-8 ${SAFETY_COLORS[country.safety_level]}`}>
          <div className="flex items-center gap-2 font-semibold">
            <Shield className="w-5 h-5" />
            {t(`safety${country.safety_level.charAt(0).toUpperCase() + country.safety_level.slice(1)}` as 'safetySafe')}
          </div>
        </div>
      )}
    </div>
  );
}
