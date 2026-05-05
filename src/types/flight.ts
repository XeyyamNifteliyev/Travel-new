export interface FlightSegment {
  departingAt: string;
  arrivingAt: string;
  origin: {
    iataCode: string;
    name?: string;
    cityName?: string;
    terminal?: string;
  };
  destination: {
    iataCode: string;
    name?: string;
    cityName?: string;
    terminal?: string;
  };
  carrierCode: string;
  operatingCarrierCode?: string;
  flightNumber: string;
  duration: string;
  aircraft?: { code: string; name?: string };
}

export interface FlightOffer {
  id: string;
  source: 'duffel' | 'mock';
  airline: string;
  airlineCode: string;
  from: string;
  fromCode: string;
  fromCity?: string;
  to: string;
  toCode: string;
  toCity?: string;
  depart: string;
  arrive: string;
  duration: string;
  stops: number;
  stopLabel: string;
  price: number;
  currency: string;
  bestValue: boolean;
  segments: FlightSegment[];
  totalPrice: string;
  totalCurrency: string;
  cabinClass?: string;
  expiresAt?: string;
}

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  cabinClass?: 'first' | 'business' | 'premium_economy' | 'economy';
}
