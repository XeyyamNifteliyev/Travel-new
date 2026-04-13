import { AIProvider } from '../provider';

const MODEL = 'glm-4-flash';
const BASE_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

export function createGLMProvider(apiKey: string): AIProvider {
  return {
    async generateText(prompt: string): Promise<string> {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`GLM API xətası (${response.status}): ${err.substring(0, 200)}`);
      }

      const data = await response.json();

      const text = data.choices?.[0]?.message?.content;
      if (text) return text;

      throw new Error('GLM-dən cavab alınmadı');
    },
  };
}
