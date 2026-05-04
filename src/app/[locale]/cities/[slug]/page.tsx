import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft, ExternalLink, MapPin, Star, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { mapCityToSummary, mapPlaceToSummary } from '@/lib/open-travel-data';
import { WeatherWidget } from '@/components/weather/weather-widget';
import { VisaCheckWidget } from '@/components/visa/visa-check-widget';
import type { Metadata } from 'next';
import type { Locale } from '@/i18n/routing';
import type { CityWithCountryRow, PlaceWithRelationsRow } from '@/types/place';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('cities')
    .select('name_az, short_desc_az, short_desc_en')
    .eq('slug', slug)
    .maybeSingle();

  return {
    title: data?.name_az ? `${data.name_az} - TravelAZ` : 'City - TravelAZ',
    description: data?.short_desc_az || data?.short_desc_en || '',
  };
}

export default async function CityDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const currentLocale = locale as Locale;
  const t = await getTranslations({ locale, namespace: 'places' });
  const supabase = await createClient();

  const { data: cityRow } = await supabase
    .from('cities')
    .select('*, countries(id, slug, name_az, name_en, name_ru, flag_emoji)')
    .eq('slug', slug)
    .maybeSingle();

  if (!cityRow) notFound();

  const city = mapCityToSummary(cityRow as CityWithCountryRow, currentLocale);

  const { data: placeRows } = await supabase
    .from('places')
    .select('*, cities(id, slug, name_az, name_en, name_ru), countries(id, slug, name_az, name_en, name_ru, flag_emoji)')
    .eq('city_id', city.id)
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('popular_rank', { ascending: true })
    .order('rating_summary', { ascending: false })
    .limit(24);

  const places = ((placeRows || []) as PlaceWithRelationsRow[]).map((place) => mapPlaceToSummary(place, currentLocale));

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <Link href={`/${locale}/countries/${city.country?.slug || ''}`} className="inline-flex items-center gap-2 text-txt-sec hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        {city.country?.name || t('back')}
      </Link>

      <section className="rounded-3xl border border-border bg-bg-surface p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary mb-3">
              <MapPin className="w-4 h-4" />
              {city.country?.name || t('city')}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">{city.name}</h1>
            {city.description && (
              <p className="text-txt-sec mt-4 max-w-3xl leading-7">{city.description}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 min-w-64">
            {city.population ? (
              <div className="rounded-2xl border border-border bg-bg p-4">
                <Users className="w-5 h-5 text-primary mb-2" />
                <div className="text-xl font-bold">{city.population.toLocaleString(locale === 'ru' ? 'ru' : locale === 'en' ? 'en' : 'az')}</div>
                <div className="text-xs text-txt-sec">{t('population')}</div>
              </div>
            ) : null}
            <div className="rounded-2xl border border-border bg-bg p-4">
              <Star className="w-5 h-5 text-primary mb-2" />
              <div className="text-xl font-bold">{places.length}</div>
              <div className="text-xs text-txt-sec">{t('places')}</div>
            </div>
          </div>
        </div>
        {city.sourceUrl && (
          <a href={city.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs text-txt-sec hover:text-primary mt-5">
            {t('source')}: {city.source || 'open data'} <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {city.lat && city.lng && (
          <WeatherWidget lat={city.lat} lon={city.lng} />
        )}
        <VisaCheckWidget compact />
      </div>

      <section>
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold">{t('placesInCity')}</h2>
            <p className="text-sm text-txt-sec mt-1">{t('placesInCitySub')}</p>
          </div>
        </div>

        {places.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {places.map((place) => (
              <Link key={place.id} href={`/${locale}/places/${place.id}`} className="rounded-2xl border border-border bg-bg-surface p-4 hover:border-primary/30 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold capitalize">{place.category}</span>
                  {place.ratingSummary > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-300">
                      <Star className="w-3 h-3 fill-current" />
                      {place.ratingSummary.toFixed(1)}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold mt-3 line-clamp-2">{place.name}</h3>
                {place.address && <p className="text-xs text-txt-sec mt-2 line-clamp-2">{place.address}</p>}
                <p className="text-xs text-txt-sec mt-4">{place.reviewCount} {t('reviews')}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-bg-surface p-8 text-center text-txt-sec">
            {t('emptyPlaces')}
          </div>
        )}
      </section>
    </main>
  );
}
