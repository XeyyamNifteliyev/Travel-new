import { AIProvider } from '../provider';

const MODEL = 'claude-3-5-haiku-20241022';
const BASE_URL = 'https://api.anthropic.com/v1/messages';

export function createClaudeProvider(apiKey: string): AIProvider {
  return {
    async generateText(prompt: string): Promise<string> {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 4096,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Claude API xətası (${response.status}): ${err.substring(0, 200)}`);
      }

      const data = await response.json();

      const text = data.content?.[0]?.text;
      if (text) return text;

      throw new Error('Claude-dan cavab alınmadı');
    },
  };
}
