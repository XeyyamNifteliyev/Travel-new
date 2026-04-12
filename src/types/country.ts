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
}
