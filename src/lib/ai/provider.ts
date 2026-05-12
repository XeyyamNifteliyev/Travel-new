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

const providerCache = new Map<string, AIProvider>();

export function getProvider(name?: string): AIProvider {
  const providerName = (name || process.env.AI_PROVIDER || 'gemini') as ProviderName;

  const cached = providerCache.get(providerName);
  if (cached) return cached;

  const config = PROVIDERS[providerName];
  if (!config) {
    throw new Error(`Naməlum AI provider: "${providerName}". Mövcud: ${Object.keys(PROVIDERS).join(', ')}`);
  }

  const apiKey = process.env[config.envKey];
  if (!apiKey) {
    throw new Error(`${config.label} API açarı tapılmadı. .env.local faylına ${config.envKey}=... əlavə edin.`);
  }

  let provider: AIProvider;
  switch (providerName) {
    case 'gemini':
      provider = createGeminiProvider(apiKey);
      break;
    case 'openai':
      provider = createOpenAIProvider(apiKey);
      break;
    case 'claude':
      provider = createClaudeProvider(apiKey);
      break;
    case 'deepseek':
      provider = createDeepSeekProvider(apiKey);
      break;
    case 'groq':
      provider = createGroqProvider(apiKey);
      break;
    case 'glm':
      provider = createGLMProvider(apiKey);
      break;
    default:
      provider = createGeminiProvider(apiKey);
  }

  providerCache.set(providerName, provider);
  return provider;
}
