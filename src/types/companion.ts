export interface Companion {
  id: string;
  userId: string;
  destinationCountry: string;
  destinationCity?: string;
  departureDate: string;
  returnDate?: string;
  genderPreference: 'any' | 'male' | 'female';
  ageMin: number;
  ageMax: number;
  interests: string[];
  languages: string[];
  description?: string;
  status: 'open' | 'filled' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  author?: {
    name: string;
    avatarUrl?: string;
  };
}

export interface CompanionFormData {
  destinationCountry: string;
  destinationCity?: string;
  departureDate: string;
  returnDate?: string;
  genderPreference: 'any' | 'male' | 'female';
  ageMin: number;
  ageMax: number;
  interests: string[];
  languages: string[];
  description?: string;
}
