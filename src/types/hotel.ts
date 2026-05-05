export interface HotelOffer {
  id: string;
  source: 'duffel' | 'mock';
  name: string;
  stars: number;
  location: string;
  lat: number;
  lng: number;
  rating: number;
  reviews: number;
  price: number;
  currency: string;
  badge: 'premium' | 'bestSeller' | null;
  features: {
    pool: boolean;
    breakfast: boolean;
    spa: boolean;
    wifi: boolean;
  };
  image: string;
  phone: string;
  description?: string;
  amenities?: string[];
  checkInDate?: string;
  checkOutDate?: string;
  accommodationId?: string;
  searchResultId?: string;
  cheapestRate?: number;
  cheapestRateCurrency?: string;
}

export interface HotelSearchParams {
  latitude: number;
  longitude: number;
  radius: number;
  checkInDate: string;
  checkOutDate: string;
  adults?: number;
  rooms?: number;
}
