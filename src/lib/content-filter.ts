const FLAGGED_WORDS = [
  'spam', 'scam', 'fraud',
];

export function isFlaggedContent(text: string): boolean {
  const lower = text.toLowerCase();
  return FLAGGED_WORDS.some((word) => lower.includes(word));
}
