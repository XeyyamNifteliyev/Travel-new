import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft, ExternalLink, Globe, Mail, MapPin, Phone, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { mapPlaceReview, mapPlaceToDetail } from '@/lib/open-travel-data';
import PlaceHelpfulButton from '@/components/place/place-helpful-button';
import PlaceReviewForm from '@/components/place/place-review-form';
import type { Metadata } from 'next';
import type { Locale } from '@/i18n/routing';
import type { PlaceReviewWithAuthorRow, PlaceSourceRow, PlaceWithRelationsRow } from '@/types/place';

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('places')
    .select('name, description_az, description_en')
    .eq('id', id)
    .maybeSingle();

  return {
    title: data?.name ? `${data.name} - TravelAZ` : 'Place - TravelAZ',
    description: data?.description_az || data?.description_en || '',
  };
}

export default async function PlaceDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
  const currentLocale = locale as Locale;
  const t = await getTranslations({ locale, namespace: 'places' });
  const supabase = await createClient();

  const { data: placeRow } = await supabase
    .from('places')
    .select('*, cities(id, slug, name_az, name_en, name_ru), countries(id, slug, name_az, name_en, name_ru, flag_emoji)')
    .eq('id', id)
    .eq('status', 'active')
    .maybeSingle();

  if (!placeRow) notFound();

  const place = mapPlaceToDetail(placeRow as PlaceWithRelationsRow, currentLocale);

  const [{ data: reviewRows }, { data: sourceRows }] = await Promise.all([
    supabase
      .from('place_reviews')
      .select('*, profiles(id, name, display_name, avatar_url)')
      .eq('place_id', place.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(12),
    supabase
      .from('place_sources')
      .select('*')
      .eq('place_id', place.id)
      .order('imported_at', { ascending: false }),
  ]);

  const reviews = ((reviewRows || []) as PlaceReviewWithAuthorRow[]).map(mapPlaceReview);
  const sources = (sourceRows || []) as PlaceSourceRow[];

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <Link href={place.city ? `/${locale}/cities/${place.city.slug}` : `/${locale}/countries/${place.country?.slug || ''}`} className="inline-flex items-center gap-2 text-txt-sec hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        {place.city?.name || place.country?.name || t('back')}
      </Link>

      <section className="rounded-3xl border border-border bg-bg-surface p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold uppercase">{place.category}</span>
              {place.city?.name && (
                <span className="inline-flex items-center gap-1 text-xs text-txt-sec">
                  <MapPin className="w-3 h-3" />
                  {place.city.name}
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">{place.name}</h1>
            {place.description && <p className="text-txt-sec mt-4 max-w-3xl leading-7">{place.description}</p>}
          </div>
          <div className="rounded-2xl border border-border bg-bg p-4 min-w-48">
            <div className="inline-flex items-center gap-2 text-2xl font-bold">
              <Star className="w-5 h-5 text-amber-500 fill-current" />
              {place.ratingSummary > 0 ? place.ratingSummary.toFixed(1) : '-'}
            </div>
            <div className="text-xs text-txt-sec mt-1">{place.reviewCount} {t('reviews')}</div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <section className="space-y-6">
          <PlaceReviewForm placeId={place.id} locale={locale} />

          <div className="rounded-2xl border border-border bg-bg-surface p-5">
            <h2 className="font-bold text-xl mb-4">{t('reviewsTitle')}</h2>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <article key={review.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{review.title || t('review')}</h3>
                        <p className="text-xs text-txt-sec mt-1">{review.author?.name || t('anonymous')} · {new Date(review.createdAt).toLocaleDateString(locale === 'ru' ? 'ru' : locale === 'en' ? 'en' : 'az')}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600 dark:text-amber-300">
                        <Star className="w-4 h-4 fill-current" />
                        {review.rating}
                      </span>
                    </div>
                    <p className="text-sm text-txt-sec mt-3 leading-6">{review.content}</p>
                    <div className="mt-3">
                      <PlaceHelpfulButton reviewId={review.id} initialCount={review.helpfulCount} locale={locale} />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-txt-sec">{t('emptyReviews')}</div>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-bg-surface p-5">
            <h2 className="font-bold mb-4">{t('details')}</h2>
            <div className="space-y-3 text-sm">
              {place.address && <p className="flex gap-2"><MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" /> <span>{place.address}</span></p>}
              {place.phone && <p className="flex gap-2"><Phone className="w-4 h-4 text-primary shrink-0 mt-0.5" /> <span>{place.phone}</span></p>}
              {place.email && <p className="flex gap-2"><Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" /> <span>{place.email}</span></p>}
              {place.website && (
                <a href={place.website} target="_blank" rel="noreferrer" className="flex gap-2 hover:text-primary">
                  <Globe className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{t('website')}</span>
                </a>
              )}
              {place.openingHours && <p className="text-txt-sec">{t('openingHours')}: {place.openingHours}</p>}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-bg-surface p-5">
            <h2 className="font-bold mb-4">{t('sources')}</h2>
            {sources.length > 0 ? (
              <div className="space-y-3">
                {sources.map((source) => (
                  <a key={source.id} href={source.source_url || '#'} target="_blank" rel="noreferrer" className="block rounded-xl border border-border p-3 hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between gap-3 text-sm font-semibold">
                      <span>{source.source}</span>
                      {source.source_url && <ExternalLink className="w-3 h-3" />}
                    </div>
                    {source.license && <p className="text-xs text-txt-sec mt-1">{source.license}</p>}
                    {source.attribution_text && <p className="text-xs text-txt-sec mt-1">{source.attribution_text}</p>}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-txt-sec">{t('sourceFallback')}</p>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
