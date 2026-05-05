import type { FlightOffer, FlightSegment, FlightSearchParams } from '@/types/flight';

const AIRLINE_NAMES: Record<string, string> = {
  AZ: 'AZAL',
  TK: 'Turkish Airlines',
  PC: 'Pegasus',
  FZ: 'FlyDubai',
  LH: 'Lufthansa',
  BA: 'British Airways',
  AF: 'Air France',
  KL: 'KLM',
  QR: 'Qatar Airways',
  EK: 'Emirates',
  EY: 'Etihad',
  SU: 'Aeroflot',
  W6: 'Wizz Air',
  FR: 'Ryanair',
  DP: 'Pobeda',
  J2: 'Azerbaijan Airlines',
  U6: 'Ural Airlines',
  OS: 'Austrian Airlines',
  SK: 'Scandinavian Airlines',
  LO: 'LOT Polish Airlines',
};

function getAirlineName(code: string): string {
  return AIRLINE_NAMES[code] || code;
}

function formatDuration(iso: string): string {
  if (!iso) return '';
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return iso;
  const h = match[1] || '0';
  const m = match[2] || '0';
  return `${h}s ${m}d`;
}

function formatTime(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function mapDuffelOffer(offer: Record<string, unknown>): FlightOffer | null {
  try {
    const id = offer.id as string;
    const slices = offer.slices as Record<string, unknown>[];
    const totalPrice = offer.total_amount as string;
    const totalCurrency = offer.total_currency as string;
    const cabinClass = offer.cabin_class as string | undefined;

    if (!id || !slices?.length || !totalPrice) return null;

    const outbound = slices[0] as Record<string, unknown>;
    const segments = (outbound.segments as Record<string, unknown>[]) || [];
    if (!segments.length) return null;

    const firstSeg = segments[0] as Record<string, unknown>;
    const lastSeg = segments[segments.length - 1] as Record<string, unknown>;

    const departingAt = firstSeg.departing_at as string;
    const arrivingAt = lastSeg.arriving_at as string;

    const origin = firstSeg.origin as Record<string, unknown>;
    const destination = lastSeg.destination as Record<string, unknown>;
    const carrierCode = firstSeg.operating_carrier_code as string || firstSeg.marketing_carrier_code as string || '';
    const airlineName = getAirlineName(carrierCode);

    const totalStops = segments.length - 1;

    const mappedSegments: FlightSegment[] = segments.map((seg: Record<string, unknown>) => {
      const segOrigin = seg.origin as Record<string, unknown>;
      const segDest = seg.destination as Record<string, unknown>;
      const segAircraft = seg.aircraft as Record<string, unknown> | undefined;
      return {
        departingAt: seg.departing_at as string,
        arrivingAt: seg.arriving_at as string,
        origin: {
          iataCode: segOrigin.iata_code as string,
          name: segOrigin.name as string | undefined,
          cityName: segOrigin.city_name as string | undefined,
          terminal: segOrigin.terminal as string | undefined,
        },
        destination: {
          iataCode: segDest.iata_code as string,
          name: segDest.name as string | undefined,
          cityName: segDest.city_name as string | undefined,
          terminal: segDest.terminal as string | undefined,
        },
        carrierCode: (seg.operating_carrier_code as string) || (seg.marketing_carrier_code as string) || '',
        operatingCarrierCode: seg.operating_carrier_code as string | undefined,
        flightNumber: seg.marketing_carrier_flight_number as string || '',
        duration: seg.duration as string || '',
        aircraft: segAircraft ? { code: segAircraft.code as string, name: segAircraft.name as string | undefined } : undefined,
      };
    });

    const price = parseFloat(totalPrice) || 0;
    const bestValue = price > 0 && price <= 200;

    return {
      id,
      source: 'duffel',
      airline: airlineName,
      airlineCode: carrierCode,
      from: (origin.city_name as string) || (origin.iata_code as string),
      fromCode: origin.iata_code as string,
      fromCity: origin.city_name as string | undefined,
      to: (destination.city_name as string) || (destination.iata_code as string),
      toCode: destination.iata_code as string,
      toCity: destination.city_name as string | undefined,
      depart: formatTime(departingAt),
      arrive: formatTime(arrivingAt),
      duration: formatDuration(outbound.duration as string || ''),
      stops: totalStops,
      stopLabel: totalStops === 0 ? 'Direct' : `${totalStops} stop${totalStops > 1 ? 's' : ''}`,
      price,
      currency: totalCurrency || 'EUR',
      bestValue,
      segments: mappedSegments,
      totalPrice,
      totalCurrency,
      cabinClass: cabinClass || undefined,
      expiresAt: offer.expires_at as string | undefined,
    };
  } catch {
    return null;
  }
}

export function mapDuffelOffers(data: { data?: Record<string, unknown>[] }): FlightOffer[] {
  if (!data.data?.length) return [];
  return data.data.map(mapDuffelOffer).filter((o): o is FlightOffer => o !== null);
}

export function buildDuffelOfferRequestBody(params: FlightSearchParams): Record<string, unknown> {
  const body: Record<string, unknown> = {
    slices: [
      {
        origin: params.origin,
        destination: params.destination,
        departure_date: params.departureDate,
      },
    ],
    passengers: [{ type: 'adult' }],
    cabin_class: params.cabinClass || 'economy',
  };

  if (params.returnDate) {
    (body.slices as Record<string, unknown>[]).push({
      origin: params.destination,
      destination: params.origin,
      departure_date: params.returnDate,
    });
  }

  if (params.adults && params.adults > 1) {
    body.passengers = Array.from({ length: params.adults }, () => ({ type: 'adult' }));
  }

  if (params.children) {
    (body.passengers as Record<string, unknown>[]).push(...Array.from({ length: params.children }, () => ({ type: 'child' })));
  }

  return body;
}
