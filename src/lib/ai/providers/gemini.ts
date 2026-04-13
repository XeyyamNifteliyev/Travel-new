import { AIProvider } from '../provider';

const MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3-flash-preview'];
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export function createGeminiProvider(apiKey: string): AIProvider {
  return {
    async generateText(prompt: string): Promise<string> {
      let lastError: Error | null = null;

      for (const model of MODELS) {
        try {
          const url = `${BASE_URL}/${model}:generateContent?key=${apiKey}`;

          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 16384 },
            }),
          });

          if (response.status === 503) {
            console.warn(`Gemini ${model}: 503 overload, növbəti model sınanır...`);
            lastError = new Error(`Gemini ${model}: server sıxışdır (503)`);
            continue;
          }

          if (!response.ok) {
            const err = await response.text();
            lastError = new Error(`Gemini ${model} xətası (${response.status}): ${err.substring(0, 200)}`);
            continue;
          }

          const data = await response.json();

          const candidate = data.candidates?.[0];
          if (candidate?.finishReason === 'MAX_TOKENS') {
            console.warn(`Gemini ${model}: cavab kəsildi (MAX_TOKENS)`);
          }

          const text = candidate?.content?.parts?.[0]?.text;
          if (text) {
            console.log(`Gemini: ${model} uğurla cavab verdi`);
            return text;
          }

          if (data.error) {
            lastError = new Error(`Gemini ${model}: ${data.error.message}`);
            continue;
          }

          lastError = new Error(`Gemini ${model}: cavab boşdur`);
        } catch (e) {
          lastError = e instanceof Error ? e : new Error(String(e));
          continue;
        }
      }

      throw lastError || new Error('Gemini: heç bir model cavab vermədi');
    },
  };
}
