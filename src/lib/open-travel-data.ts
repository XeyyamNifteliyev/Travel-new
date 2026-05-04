import type {
  CityCountryRef,
  CityRow,
  CitySummary,
  CityWithCountryRow,
  LocalizedTravelText,
  PlaceDetail,
  PlaceReview,
  PlaceReviewWithAuthorRow,
  PlaceRow,
  PlaceSummary,
  PlaceWithRelationsRow,
} from '@/types/place';
import type { Locale } from '@/i18n/routing';

function optionalString(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function optionalNumber(value: number | null | undefined): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

export function getLocalizedCountryName(country: CityCountryRef, locale: Locale): string {
  if (locale === 'en') return optionalString(country.name_en) || country.name_az;
  if (locale === 'ru') return optionalString(country.name_ru) || country.name_az;
  return country.name_az;
}

export function getLocalizedCityText(city: CityRow, locale: Locale): LocalizedTravelText {
  if (locale === 'en') {
    return {
      locale,
      name: optionalString(city.name_en) || city.name_az,
      description: optionalString(city.short_desc_en) || optionalString(city.description_en) || undefined,
    };
  }

  if (locale === 'ru') {
    return {
      locale,
      name: optionalString(city.name_ru) || city.name_az,
      description: optionalString(city.short_desc_ru) || optionalString(city.description_ru) || undefined,
    };
  }

  return {
    locale,
    name: city.name_az,
    description: optionalString(city.short_desc_az) || optionalString(city.description_az) || undefined,
  };
}

export function getLocalizedPlaceText(place: PlaceRow, locale: Locale): LocalizedTravelText {
  if (locale === 'en') {
    return {
      locale,
      name: optionalString(place.name_en) || place.name,
      description: optionalString(place.description_en),
    };
  }

  if (locale === 'ru') {
    return {
      locale,
      name: optionalString(place.name_ru) || place.name,
      description: optionalString(place.description_ru),
    };
  }

  return {
    locale,
    name: optionalString(place.name_az) || place.name,
    description: optionalString(place.description_az),
  };
}

export function mapCityToSummary(city: CityWithCountryRow, locale: Locale): CitySummary {
  const text = getLocalizedCityText(city, locale);

  return {
    id: city.id,
    countryId: city.country_id,
    slug: city.slug,
    name: text.name,
    description: text.description,
    region: optionalString(city.region) || optionalString(city.admin_region),
    lat: optionalNumber(city.lat),
    lng: optionalNumber(city.lng),
    population: optionalNumber(city.population),
    coverPhotoId: optionalString(city.cover_photo_id),
    coverPhotoUrl: optionalString(city.cover_photo_url),
    source: optionalString(city.source),
    sourceUrl: optionalString(city.source_url),
    license: optionalString(city.license),
    attributionText: optionalString(city.attribution_text),
    isFeatured: city.is_featured,
    popularRank: city.popular_rank,
    country: city.countries
      ? {
          id: city.countries.id,
          slug: city.countries.slug,
          name: getLocalizedCountryName(city.countries, locale),
          flagEmoji: optionalString(city.countries.flag_emoji),
        }
      : undefined,
  };
}

export function mapPlaceToSummary(place: PlaceWithRelationsRow, locale: Locale): PlaceSummary {
  const text = getLocalizedPlaceText(place, locale);

  return {
    id: place.id,
    countryId: place.country_id,
    cityId: optionalString(place.city_id),
    slug: place.slug,
    name: text.name,
    category: place.category,
    subcategory: optionalString(place.subcategory),
    description: text.description,
    lat: optionalNumber(place.lat),
    lng: optionalNumber(place.lng),
    address: optionalString(place.address),
    website: optionalString(place.website),
    phone: optionalString(place.phone),
    openingHours: optionalString(place.opening_hours),
    coverPhotoId: optionalString(place.cover_photo_id),
    coverPhotoUrl: optionalString(place.cover_photo_url),
    source: optionalString(place.source),
    sourceUrl: optionalString(place.source_url),
    license: optionalString(place.license),
    attributionText: optionalString(place.attribution_text),
    ratingSummary: place.rating_summary,
    reviewCount: place.review_count,
    isFeatured: place.is_featured,
    popularRank: place.popular_rank,
    city: place.cities
      ? {
          id: place.cities.id,
          slug: place.cities.slug,
          name: getLocalizedCityText(place.cities as CityRow, locale).name,
        }
      : undefined,
    country: place.countries
      ? {
          id: place.countries.id,
          slug: place.countries.slug,
          name: getLocalizedCountryName(place.countries, locale),
          flagEmoji: optionalString(place.countries.flag_emoji),
        }
      : undefined,
  };
}

export function mapPlaceToDetail(place: PlaceWithRelationsRow, locale: Locale): PlaceDetail {
  return {
    ...mapPlaceToSummary(place, locale),
    email: optionalString(place.email),
    status: place.status,
    rawData: place.raw_data,
    lastSyncedAt: optionalString(place.last_synced_at),
    createdAt: place.created_at,
    updatedAt: place.updated_at,
  };
}

export function mapPlaceReview(review: PlaceReviewWithAuthorRow): PlaceReview {
  const authorName = optionalString(review.profiles?.display_name) || optionalString(review.profiles?.name);

  return {
    id: review.id,
    placeId: review.place_id,
    userId: review.user_id,
    rating: review.rating,
    title: optionalString(review.title),
    content: review.content,
    visitDate: optionalString(review.visit_date),
    photos: review.photos,
    helpfulCount: review.helpful_count,
    status: review.status,
    createdAt: review.created_at,
    updatedAt: review.updated_at,
    author: review.profiles
      ? {
          id: review.profiles.id,
          name: authorName,
          avatarUrl: optionalString(review.profiles.avatar_url),
        }
      : undefined,
  };
}
