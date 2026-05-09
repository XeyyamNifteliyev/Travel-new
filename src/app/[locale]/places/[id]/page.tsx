import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft, ExternalLink, Globe, Mail, MapPin, Phone, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { mapPlaceReview, mapPlaceToDetail } from '@/lib/open-travel-data';
import PlaceHelpfulButton from '@/components/place/place-helpful-button';
import PlaceReviewForm from '@/components/place/place-review-form';
import { getUnsplashUrl } from '@/lib/unsplash';
import type { Metadata } from 'next';
import type { Locale } from '@/i18n/routing';
import type { PlaceReviewWithAuthorRow, PlaceSourceRow, PlaceWithRelationsRow } from '@/types/place';

const PLACE_DETAIL_FIELDS = [
  'id',
  'city_id',
  'country_id',
  'slug',
  'name',
  'name_az',
  'name_en',
  'name_ru',
  'category',
  'subcategory',
  'lat',
  'lng',
  'address',
  'website',
  'phone',
  'email',
  'opening_hours',
  'description_az',
  'description_en',
  'description_ru',
  'cover_photo_id',
  'cover_photo_url',
  'source',
  'source_place_id',
  'source_url',
  'license',
  'attribution_text',
  'rating_summary',
  'review_count',
  'is_featured',
  'popular_rank',
  'status',
  'raw_data',
  'last_synced_at',
  'created_at',
  'updated_at',
  'cities(id, slug, name_az, name_en, name_ru)',
  'countries(id, slug, name_az, name_en, name_ru, flag_emoji, cca2)',
].join(', ');

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

interface AboutFact {
  label: string;
  value: string;
  href?: string;
}

function getRawTags(rawData: Record<string, unknown> | undefined): Record<string, string> {
  const tags = rawData?.tags;
  if (!tags || typeof tags !== 'object' || Array.isArray(tags)) return {};
  return Object.fromEntries(
    Object.entries(tags as Record<string, unknown>)
      .filter(([, value]) => typeof value === 'string' && value.trim().length > 0)
      .map(([key, value]) => [key, String(value)])
  );
}

function wikipediaUrl(value?: string) {
  if (!value) return null;
  const [lang, ...titleParts] = value.split(':');
  const title = titleParts.join(':');
  if (!lang || !title) return null;
  return `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title.replaceAll(' ', '_'))}`;
}

function truncateMeta(text: string, maxLength = 155) {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength - 1).trim()}…`;
}

function schemaTypeForCategory(category: string) {
  if (category === 'restaurant') return 'Restaurant';
  if (category === 'cafe') return 'CafeOrCoffeeShop';
  if (category === 'hotel') return 'Hotel';
  return 'TouristAttraction';
}

function localizedText(row: {
  description_az?: string | null;
  description_en?: string | null;
  description_ru?: string | null;
}, locale: string) {
  if (locale === 'en') return row.description_en || row.description_az || row.description_ru || '';
  if (locale === 'ru') return row.description_ru || row.description_az || row.description_en || '';
  return row.description_az || row.description_en || row.description_ru || '';
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, locale } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('places')
    .select('name, category, description_az, description_en, description_ru, cities(name_az, name_en, name_ru), countries(name_az, name_en, name_ru)')
    .eq('id', id)
    .maybeSingle();
  const description = data ? localizedText(data, locale) : '';
  const cityRelation = firstRelation(data?.cities);
  const city = locale === 'en'
    ? cityRelation?.name_en || cityRelation?.name_az
    : locale === 'ru'
      ? cityRelation?.name_ru || cityRelation?.name_az
      : cityRelation?.name_az || cityRelation?.name_en;
  const title = data?.name ? `${data.name}${city ? `, ${city}` : ''} - TravelAZ` : 'Place - TravelAZ';
  const fallbackDescription = data?.name && city
    ? `${data.name} ${city} səyahət bələdçisi: ünvan, xəritə, rəsmi link, rəylər və praktiki məlumatlar.`
    : '';

  return {
    title,
    description: truncateMeta(description || fallbackDescription),
    openGraph: {
      title,
      description: truncateMeta(description || fallbackDescription),
      type: 'article',
    },
  };
}

export default async function PlaceDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
  const currentLocale = locale as Locale;
  const t = await getTranslations({ locale, namespace: 'places' });
  const supabase = await createClient();

  const { data: placeRow } = await supabase
    .from('places')
    .select(PLACE_DETAIL_FIELDS)
    .eq('id', id)
    .eq('status', 'active')
    .maybeSingle();

  if (!placeRow) notFound();

  const place = mapPlaceToDetail(placeRow as unknown as PlaceWithRelationsRow, currentLocale);

  const [{ data: reviewRows }, { data: sourceRows }] = await Promise.all([
    supabase
      .from('place_reviews')
      .select('id, place_id, user_id, rating, title, content, visit_date, photos, helpful_count, status, created_at, updated_at, profiles(id, name, display_name, avatar_url)')
      .eq('place_id', place.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(12),
    supabase
      .from('place_sources')
      .select('id, place_id, source, source_id, source_url, license, attribution_text, imported_at, raw_data')
      .eq('place_id', place.id)
      .order('imported_at', { ascending: false }),
  ]);

  const reviews = ((reviewRows || []) as unknown as PlaceReviewWithAuthorRow[]).map(mapPlaceReview);
  const sources = (sourceRows || []) as unknown as PlaceSourceRow[];
  const categoryLabel = t(`category${place.category.charAt(0).toUpperCase()}${place.category.slice(1)}`);
  const heroImageUrl = place.coverPhotoUrl
    || (place.coverPhotoId ? getUnsplashUrl(place.coverPhotoId, { w: 1200, h: 620 }) : null)
    || getUnsplashUrl(`${place.slug}-${place.category}`, { w: 1200, h: 620 });
  const subcategoryLabel = place.subcategory && place.subcategory !== place.category
    ? place.subcategory.replaceAll(';', ', ').replaceAll('_', ' ')
    : null;
  const aboutText = place.description;
  const rawTags = getRawTags(place.rawData);
  const wikipediaHref = wikipediaUrl(rawTags.wikipedia);
  const aboutFacts: AboutFact[] = [
    { label: t('category'), value: categoryLabel },
    { label: t('location'), value: place.city?.name || place.country?.name || '-' },
    place.address ? { label: t('address'), value: place.address } : null,
    subcategoryLabel ? { label: t('subcategory'), value: subcategoryLabel } : null,
    place.openingHours ? { label: t('openingHours'), value: place.openingHours } : null,
    place.phone ? { label: t('phone'), value: place.phone } : null,
    place.website ? { label: t('officialWebsite'), value: t('website'), href: place.website } : null,
    place.lat && place.lng ? { label: t('coordinates'), value: `${place.lat.toFixed(4)}, ${place.lng.toFixed(4)}` } : null,
    wikipediaHref ? { label: 'Wikipedia', value: rawTags.wikipedia, href: wikipediaHref } : null,
    rawTags.wikidata ? { label: 'Wikidata', value: rawTags.wikidata, href: `https://www.wikidata.org/wiki/${rawTags.wikidata}` } : null,
    { label: t('dataSource'), value: place.source || 'open data' },
  ].filter(Boolean) as AboutFact[];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': schemaTypeForCategory(place.category),
    name: place.name,
    description: aboutText || undefined,
    image: heroImageUrl,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://travelaz.az'}/${locale}/places/${place.id}`,
    address: place.address || undefined,
    telephone: place.phone || undefined,
    sameAs: place.website ? [place.website] : undefined,
    geo: place.lat && place.lng ? {
      '@type': 'GeoCoordinates',
      latitude: place.lat,
      longitude: place.lng,
    } : undefined,
    aggregateRating: place.ratingSummary > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: place.ratingSummary,
      reviewCount: Math.max(place.reviewCount, 1),
    } : undefined,
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <Link href={place.city ? `/${locale}/cities/${place.city.slug}` : `/${locale}/countries/${place.country?.slug || ''}`} className="inline-flex items-center gap-2 text-txt-sec hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        {place.city?.name || place.country?.name || t('back')}
      </Link>

      <section className="rounded-3xl border border-border bg-bg-surface overflow-hidden mb-8">
        <div className="relative h-56 md:h-80 overflow-hidden">
          <Image src={heroImageUrl} alt={`${place.name}${place.city?.name ? `, ${place.city.name}` : ''}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 896px" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
          {place.website && (
            <a href={place.website} target="_blank" rel="noreferrer" className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-primary/90">
              <ExternalLink className="w-4 h-4" />
              {t('visitWebsite')}
            </a>
          )}
        </div>
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold uppercase">{categoryLabel}</span>
            {place.city?.name && (
              <span className="inline-flex items-center gap-1 text-xs text-txt-sec">
                <MapPin className="w-3 h-3" />
                {place.city.name}
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">{place.name}</h1>
          {aboutText && <p className="text-txt-sec mt-4 max-w-3xl leading-7">{aboutText}</p>}
          <div className="mt-4 flex items-center gap-4">
            <div className="inline-flex items-center gap-2 text-lg font-bold">
              <Star className="w-4 h-4 text-amber-500 fill-current" />
              {place.ratingSummary > 0 ? place.ratingSummary.toFixed(1) : '-'}
            </div>
            <div className="text-sm text-txt-sec">{place.reviewCount} {t('reviews')}</div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <section className="space-y-6">
          <div className="rounded-2xl border border-border bg-bg-surface p-5">
            <h2 className="font-bold text-xl mb-3">{t('aboutPlace')}</h2>
            {aboutText && <p className="text-sm leading-7 text-txt-sec">{aboutText}</p>}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              {aboutFacts.map((fact) => (
                <div key={`${fact.label}-${fact.value}`} className="rounded-xl border border-border bg-bg p-3">
                  <div className="text-xs text-txt-sec">{fact.label}</div>
                  {fact.href ? (
                    <a href={fact.href} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 font-semibold text-primary hover:underline">
                      {fact.value}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <div className="font-semibold mt-1 break-words">{fact.value}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

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
                        <p className="text-xs text-txt-sec mt-1">{review.author?.name || t('anonymous')} | {new Date(review.createdAt).toLocaleDateString(locale === 'ru' ? 'ru' : locale === 'en' ? 'en' : 'az')}</p>
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
              {place.lat && place.lng && <p className="flex gap-2"><MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" /> <span>{place.lat.toFixed(4)}, {place.lng.toFixed(4)}</span></p>}
              {place.website && (
                <a href={place.website} target="_blank" rel="noreferrer" className="flex gap-2 hover:text-primary">
                  <Globe className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{t('website')}</span>
                </a>
              )}
              {place.openingHours && <p className="text-txt-sec">{t('openingHours')}: {place.openingHours}</p>}
              {place.city && (
                <Link href={`/${locale}/cities/${place.city.slug}`} className="flex gap-2 hover:text-primary">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{place.city.name}</span>
                </Link>
              )}
              {place.country && (
                <Link href={`/${locale}/countries/${place.country.slug}`} className="flex gap-2 hover:text-primary">
                  <Globe className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{place.country.name}</span>
                </Link>
              )}
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
