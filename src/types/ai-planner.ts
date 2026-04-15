export interface PlanRequest {
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  travelers: number;
  interests: string[];
  travelStyle: 'budget' | 'mid' | 'luxury';
  language: 'az' | 'ru' | 'en';
}

export interface Activity {
  time: string;
  activity: string;
  location: string;
  cost: number;
  tip?: string;
}

export interface DayPlan {
  day: number;
  title: string;
  activities: Activity[];
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  transport: string;
  estimatedCost: number;
}

export interface TravelPlan {
  summary: string;
  totalEstimatedCost: {
    amount: number;
    currency: string;
    breakdown: {
      flights: number;
      accommodation: number;
      food: number;
      activities: number;
      transport: number;
    };
  };
  days: DayPlan[];
  tips: string[];
  visaInfo: {
    required: boolean;
    type: string;
    processingTime: string;
  };
  bestTimeToVisit: string;
  packingList: string[];
}

export interface PlanResponse {
  plan: TravelPlan;
  platformData: {
    countryPage: string;
    tours: string[];
    flightsLink: string;
    hotelsLink: string;
    visaPage: string;
  };
}

export interface CheapDatesRequest {
  destination: string;
  duration: number;
  travelers: number;
  season: string;
  language: 'az' | 'ru' | 'en';
}

export interface CheapDateOption {
  period: string;
  flightPrice: number;
  hotelPricePerNight: number;
  totalPrice: number;
  reason: string;
}

export interface CheapDatesResponse {
  destination: string;
  options: CheapDateOption[];
  tip: string;
}
