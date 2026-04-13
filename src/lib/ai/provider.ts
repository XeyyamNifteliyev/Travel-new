import { createGeminiProvider } from './providers/gemini';
import { createOpenAIProvider } from './providers/openai';
import { createClaudeProvider } from './providers/claude';
import { createDeepSeekProvider } from './providers/deepseek';
import { createGroqProvider } from './providers/groq';
import { createGLMProvider } from './providers/glm';

export interface AIProvider {
  generateText(prompt: string): Promise<string>;
}

type ProviderName = 'gemini' | 'openai' | 'claude' | 'deepseek' | 'groq' | 'glm';

const PROVIDERS: Record<ProviderName, { envKey: string; label: string }> = {
  gemini: { envKey: 'GEMINI_API_KEY', label: 'Gemini' },
  openai: { envKey: 'OPENAI_API_KEY', label: 'OpenAI' },
  claude: { envKey: 'ANTHROPIC_API_KEY', label: 'Claude' },
  deepseek: { envKey: 'DEEPSEEK_API_KEY', label: 'DeepSeek' },
  groq: { envKey: 'GROQ_API_KEY', label: 'Groq' },
  glm: { envKey: 'GLM_API_KEY', label: 'GLM' },
};

export function getProvider(name?: string): AIProvider {
  const providerName = (name || process.env.AI_PROVIDER || 'gemini') as ProviderName;

  const config = PROVIDERS[providerName];
  if (!config) {
    throw new Error(`Naməlum AI provider: "${providerName}". Mövcud: ${Object.keys(PROVIDERS).join(', ')}`);
  }

  const apiKey = process.env[config.envKey];
  if (!apiKey) {
    throw new Error(`${config.label} API açarı tapılmadı. .env.local faylına ${config.envKey}=... əlavə edin.`);
  }

  switch (providerName) {
    case 'gemini':
      return createGeminiProvider(apiKey);
    case 'openai':
      return createOpenAIProvider(apiKey);
    case 'claude':
      return createClaudeProvider(apiKey);
    case 'deepseek':
      return createDeepSeekProvider(apiKey);
    case 'groq':
      return createGroqProvider(apiKey);
    case 'glm':
      return createGLMProvider(apiKey);
    default:
      return createGeminiProvider(apiKey);
  }
}
