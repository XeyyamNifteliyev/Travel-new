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
