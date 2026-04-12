export interface TourCompany {
  id: string;
  userId: string;
  companyName: string;
  logoUrl?: string;
  licenseNumber?: string;
  description?: string;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  email?: string;
  website?: string;
  planType: 'starter' | 'pro' | 'premium';
  planExpiresAt?: string;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  status: 'pending' | 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface Tour {
  id: string;
  companyId: string;
  title: string;
  slug: string;
  description: string;
  region: string;
  tourType: 'active' | 'cultural' | 'gastronomy' | 'family' | 'solo' | 'nature' | 'historical';
  price: number;
  currency: string;
  durationDays: number;
  durationNights: number;
  groupMin: number;
  groupMax: number;
  transportationIncluded: boolean;
  hotelIncluded: boolean;
  hotelStars?: number;
  mealsIncluded: string[];
  languages: string[];
  dates: string[];
  itinerary?: Record<string, unknown>;
  images: string[];
  rating: number;
  reviewCount: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  views: number;
  bookingsCount: number;
  createdAt: string;
  updatedAt: string;
  company?: TourCompany;
}

export interface TourBooking {
  id: string;
  tourId: string;
  userId: string;
  guestsCount: number;
  selectedDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TourReview {
  id: string;
  tourId: string;
  userId: string;
  bookingId?: string;
  rating: number;
  comment?: string;
  createdAt: string;
  author?: {
    name: string;
    avatarUrl?: string;
  };
}

export interface TourFormData {
  title: string;
  slug: string;
  description: string;
  region: string;
  tourType: 'active' | 'cultural' | 'gastronomy' | 'family' | 'solo' | 'nature' | 'historical';
  price: number;
  durationDays: number;
  durationNights: number;
  groupMin: number;
  groupMax: number;
  transportationIncluded: boolean;
  hotelIncluded: boolean;
  hotelStars?: number;
  mealsIncluded: string[];
  languages: string[];
  dates: string[];
  images: string[];
}
