export function getDuffelToken(): string | null {
  return process.env.DUFFEL_ACCESS_TOKEN || null;
}

export function getDuffelBaseUrl(): string {
  return process.env.DUFFEL_BASE_URL || 'https://api.duffel.com';
}

export function duffelHeaders(): Record<string, string> {
  const token = getDuffelToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Duffel-Version': 'v2',
    'Accept': 'application/json',
  };
}

export function isDuffelConfigured(): boolean {
  return !!process.env.DUFFEL_ACCESS_TOKEN;
}
