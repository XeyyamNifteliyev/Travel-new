export interface Country {
  id: string;
  slug: string;
  name_az: string;
  name_ru: string;
  name_en: string;
  flag_emoji: string;
  description?: string;
  description_az?: string;
  description_ru?: string;
  description_en?: string;
  best_time: string;
  avg_costs: {
    flight: string;
    hotel: string;
    daily: string;
  };
  popular_places: string[];
}

export interface ExpandedCountry {
  id: string;
  slug: string;
  name_az: string;
  name_en: string;
  name_ru: string;
  flag_emoji?: string;
  continent?: string;
  capital?: string;
  currency?: string;
  currency_name?: string;
  language?: string;
  population?: number;
  timezone?: string;
  calling_code?: string;
  best_months?: string[];
  climate_type?: string;
  avg_flight_azn?: number;
  avg_hotel_azn?: number;
  avg_daily_azn?: number;
  cover_photo_id?: string;
  cover_photo_alt?: string;
  gallery_ids?: string[];
  youtube_ids?: string[];
  youtube_titles?: string[];
  top_places?: {
    name: string;
    desc: string;
    photo_id: string;
    lat: number;
    lng: number;
    category: string;
  }[];
  short_desc?: string;
  short_desc_en?: string;
  short_desc_ru?: string;
  safety_level?: 'safe' | 'caution' | 'warning';
  visa_required?: boolean;
  popular_rank?: number;
  is_featured?: boolean;
}

export interface CountryHighlight {
  id: string;
  country_id: string;
  slug: string;
  name: string;
  name_en?: string;
  name_ru?: string;
  description?: string;
  photo_id?: string;
  lat?: number;
  lng?: number;
  category?: string;
  rank?: number;
}

export interface VisaInfo {
  id: string;
  country_id: string;
  requirement_type: 'required' | 'not_required' | 'on_arrival' | 'e_visa';
  embassy_link?: string;
  processing_time?: string;
  documents: string[];
  notes_az?: string;
  notes_ru?: string;
  notes_en?: string;
  fee_usd?: number;
  fee_azn?: number;
  processing_days_min?: number;
  processing_days_max?: number;
  validity_days?: number;
  max_stay_days?: number;
  is_evisa?: boolean;
  evisa_url?: string;
  official_url?: string;
  appointment_url?: string;
  last_verified_at?: string;
  data_confidence?: number;
}

export interface VisaDocument {
  id: string;
  country_id: string;
  visa_type: string;
  document_name_az: string;
  document_name_en?: string;
  document_name_ru?: string;
  description_az?: string;
  is_required: boolean;
  document_category: string;
  accepted_formats?: string[];
  max_size_mb?: number;
  notes_az?: string;
  sort_order: number;
}

export interface VisaCountryData {
  visa: VisaInfo;
  country: {
    id: string;
    name_az: string;
    name_en: string;
    name_ru: string;
    slug: string;
    flag_emoji: string;
  };
  documents: VisaDocument[];
}
