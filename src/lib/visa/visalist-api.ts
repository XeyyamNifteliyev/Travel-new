export interface VisaRequirement {
  passport: string;
  destination: string;
  status: VisaStatus;
  duration: string;
  notes: string;
  raw: string;
}

export type VisaStatus = 'visaFree' | 'visaOnArrival' | 'eVisa' | 'visaRequired' | 'unknown';

export function normalizeVisaResponse(
  raw: { passport?: string; destination?: string; dur?: string; note?: string; [key: string]: unknown } | null
): VisaRequirement | null {
  if (!raw) return null;

  const dur = (raw.dur ?? '').toLowerCase();
  const note = (raw.note ?? '').toLowerCase();

  let status: VisaStatus = 'unknown';
  if (dur.includes('visa free') || dur.includes('free') || note.includes('visa free')) {
    status = 'visaFree';
  } else if (dur.includes('on arrival') || dur.includes('visa on arrival') || note.includes('on arrival')) {
    status = 'visaOnArrival';
  } else if (dur.includes('e-visa') || dur.includes('evisa') || note.includes('e-visa')) {
    status = 'eVisa';
  } else if (dur.includes('visa required') || dur.includes('required')) {
    status = 'visaRequired';
  }

  return {
    passport: raw.passport ?? '',
    destination: raw.destination ?? '',
    status,
    duration: raw.note ?? '',
    notes: typeof raw.note === 'string' ? raw.note : '',
    raw: typeof raw.dur === 'string' ? raw.dur : '',
  };
}
