import type { Locale } from '@/i18n/routing';

export type TravelDataSource =
  | 'openstreetmap'
  | 'overpass'
  | 'wikivoyage'
  | 'wikipedia'
  | 'wikimedia'
  | 'geonames'
  | 'manual'
  | 'travelaz'
  | 'other';

export type PlaceCategory =
  | 'attraction'
  | 'museum'
  | 'landmark'
  | 'restaurant'
  | 'cafe'
  | 'hotel'
  | 'viewpoint'
  | 'historic'
  | 'park'
  | 'beach'
  | 'shopping'
  | 'nightlife'
  | 'transport'
  | 'other';

export type PlaceStatus = 'active' | 'hidden' | 'archived';
export type PlaceReviewStatus = 'pending' | 'published' | 'rejected' | 'hidden';
export type ExternalImportStatus = 'running' | 'success' | 'failed' | 'partial';
export type JsonRecord = Record<string, unknown>;

export interface CityRow {
  id: string;
  country_id: string;
  slug: string;
  name_az: string;
  name_en: string | null;
  name_ru: string | null;
  region: string | null;
  admin_region: string | null;
  lat: number | null;
  lng: number | null;
  population: number | null;
  short_desc_az: string | null;
  short_desc_en: string | null;
  short_desc_ru: string | null;
  description_az: string | null;
  description_en: string | null;
  description_ru: string | null;
  cover_photo_id: string | null;
  cover_photo_url: string | null;
  source: TravelDataSource | string | null;
  source_id: string | null;
  source_url: string | null;
  license: string | null;
  attribution_text: string | null;
  is_featured: boolean;
  popular_rank: number;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlaceRow {
  id: string;
  city_id: string | null;
  country_id: string;
  slug: string;
  name: string;
  name_az: string | null;
  name_en: string | null;
  name_ru: string | null;
  category: PlaceCategory;
  subcategory: string | null;
  lat: number | null;
  lng: number | null;
  address: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  opening_hours: string | null;
  description_az: string | null;
  description_en: string | null;
  description_ru: string | null;
  cover_photo_id: string | null;
  cover_photo_url: string | null;
  source: TravelDataSource | string | null;
  source_place_id: string | null;
  source_url: string | null;
  license: string | null;
  attribution_text: string | null;
  rating_summary: number;
  review_count: number;
  is_featured: boolean;
  popular_rank: number;
  status: PlaceStatus;
  raw_data: JsonRecord;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlaceReviewRow {
  id: string;
  place_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  content: string;
  visit_date: string | null;
  photos: string[];
  helpful_count: number;
  status: PlaceReviewStatus;
  created_at: string;
  updated_at: string;
}

export interface PlaceSourceRow {
  id: string;
  place_id: string;
  source: TravelDataSource;
  source_id: string | null;
  source_url: string | null;
  license: string | null;
  attribution_text: string | null;
  imported_at: string;
  raw_data: JsonRecord;
}

export interface PlaceReviewHelpfulVoteRow {
  id: string;
  review_id: string;
  user_id: string;
  created_at: string;
}

export interface ExternalImportLogRow {
  id: string;
  source: TravelDataSource | string;
  entity_type: 'city' | 'place' | 'place_review' | 'place_source' | string;
  status: ExternalImportStatus;
  imported_count: number;
  skipped_count: number;
  error: string | null;
  metadata: JsonRecord;
  started_at: string;
  finished_at: string | null;
}

export interface CityCountryRef {
  id: string;
  slug: string;
  name_az: string;
  name_en: string | null;
  name_ru: string | null;
  flag_emoji?: string | null;
}

export interface PlaceCityRef {
  id: string;
  slug: string;
  name_az: string;
  name_en: string | null;
  name_ru: string | null;
}

export interface CityWithCountryRow extends CityRow {
  countries?: CityCountryRef | null;
}

export interface PlaceWithRelationsRow extends PlaceRow {
  cities?: PlaceCityRef | null;
  countries?: CityCountryRef | null;
}

export interface PlaceReviewWithAuthorRow extends PlaceReviewRow {
  profiles?: {
    id: string;
    name?: string | null;
    display_name?: string | null;
    avatar_url?: string | null;
  } | null;
}

export interface CitySummary {
  id: string;
  countryId: string;
  slug: string;
  name: string;
  description?: string;
  region?: string;
  lat?: number;
  lng?: number;
  population?: number;
  coverPhotoId?: string;
  coverPhotoUrl?: string;
  source?: string;
  sourceUrl?: string;
  license?: string;
  attributionText?: string;
  isFeatured: boolean;
  popularRank: number;
  country?: {
    id: string;
    slug: string;
    name: string;
    flagEmoji?: string;
  };
}

export interface PlaceSummary {
  id: string;
  countryId: string;
  cityId?: string;
  slug: string;
  name: string;
  category: PlaceCategory;
  subcategory?: string;
  description?: string;
  lat?: number;
  lng?: number;
  address?: string;
  website?: string;
  phone?: string;
  openingHours?: string;
  coverPhotoId?: string;
  coverPhotoUrl?: string;
  source?: string;
  sourceUrl?: string;
  license?: string;
  attributionText?: string;
  ratingSummary: number;
  reviewCount: number;
  isFeatured: boolean;
  popularRank: number;
  city?: {
    id: string;
    slug: string;
    name: string;
  };
  country?: {
    id: string;
    slug: string;
    name: string;
    flagEmoji?: string;
  };
}

export interface PlaceDetail extends PlaceSummary {
  email?: string;
  status: PlaceStatus;
  rawData: JsonRecord;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlaceReview {
  id: string;
  placeId: string;
  userId: string;
  rating: number;
  title?: string;
  content: string;
  visitDate?: string;
  photos: string[];
  helpfulCount: number;
  status: PlaceReviewStatus;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name?: string;
    avatarUrl?: string;
  };
}

export interface CityFormData {
  countryId: string;
  slug: string;
  nameAz: string;
  nameEn?: string;
  nameRu?: string;
  lat?: number;
  lng?: number;
  population?: number;
  descriptionAz?: string;
  descriptionEn?: string;
  descriptionRu?: string;
  coverPhotoId?: string;
  source?: TravelDataSource;
  sourceUrl?: string;
}

export interface PlaceFormData {
  countryId: string;
  cityId?: string;
  slug: string;
  name: string;
  category: PlaceCategory;
  lat?: number;
  lng?: number;
  address?: string;
  website?: string;
  phone?: string;
  openingHours?: string;
  descriptionAz?: string;
  descriptionEn?: string;
  descriptionRu?: string;
  source?: TravelDataSource;
  sourcePlaceId?: string;
  sourceUrl?: string;
}

export interface PlaceReviewFormData {
  placeId: string;
  rating: number;
  title?: string;
  content: string;
  visitDate?: string;
  photos?: string[];
}

export interface LocalizedTravelText {
  locale: Locale;
  name: string;
  description?: string;
}
