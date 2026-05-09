const FLAGGED_WORDS = [
  'spam', 'scam', 'fraud', 'fake', 'phishing',
  'click here', 'buy now', 'free money',
  'http://', 'https://',
  'telegram.me/', 't.me/',
];

export function isFlaggedContent(text: string): boolean {
  const lower = text.toLowerCase();
  return FLAGGED_WORDS.some((word) => lower.includes(word));
}

export function validateContent(text: string, maxLength = 2000): {
  valid: boolean;
  reason?: string;
} {
  if (!text || typeof text !== 'string') return { valid: false, reason: 'empty' };
  const trimmed = text.trim();
  if (trimmed.length < 2) return { valid: false, reason: 'too_short' };
  if (trimmed.length > maxLength) return { valid: false, reason: 'too_long' };
  if (isFlaggedContent(trimmed)) return { valid: false, reason: 'flagged' };
  return { valid: true };
}
