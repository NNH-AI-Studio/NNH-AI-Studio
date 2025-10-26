import type { AIProvider, AIProviderConfig } from './types';

export const AI_PROVIDERS: Record<AIProvider, Omit<AIProviderConfig, 'apiKey' | 'enabled'>> = {
  groq: {
    name: 'groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    models: {
      text: 'mixtral-8x7b-32768'
    }
  },
  deepseek: {
    name: 'deepseek',
    baseUrl: 'https://api.deepseek.com/v1',
    models: {
      text: 'deepseek-chat'
    }
  },
  together: {
    name: 'together',
    baseUrl: 'https://api.together.xyz/v1',
    models: {
      text: 'mistralai/Mixtral-8x7B-Instruct-v0.1'
    }
  },
  gemini: {
    name: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    models: {
      text: 'gemini-pro'
    }
  },
  cohere: {
    name: 'cohere',
    baseUrl: 'https://api.cohere.ai/v1',
    models: {
      text: 'command'
    }
  },
  mistral: {
    name: 'mistral',
    baseUrl: 'https://api.mistral.ai/v1',
    models: {
      text: 'mistral-small-latest'
    }
  },
  perplexity: {
    name: 'perplexity',
    baseUrl: 'https://api.perplexity.ai',
    models: {
      text: 'llama-3.1-sonar-small-128k-online'
    }
  },
  openai: {
    name: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    models: {
      text: 'gpt-4o-mini',
      image: 'dall-e-3'
    }
  }
};

export const FALLBACK_CHAIN: AIProvider[] = [
  'groq',
  'deepseek',
  'together',
  'gemini',
  'cohere',
  'mistral',
  'perplexity',
  'openai'
];

export const PROVIDER_COSTS: Record<AIProvider, { input: number; output: number }> = {
  groq: { input: 0.0, output: 0.0 },
  deepseek: { input: 0.00014, output: 0.00028 },
  together: { input: 0.0006, output: 0.0006 },
  gemini: { input: 0.00025, output: 0.0005 },
  cohere: { input: 0.0015, output: 0.0015 },
  mistral: { input: 0.0002, output: 0.0006 },
  perplexity: { input: 0.0001, output: 0.0001 },
  openai: { input: 0.00015, output: 0.0006 }
};

export function calculateCost(provider: AIProvider, promptTokens: number, completionTokens: number): number {
  const costs = PROVIDER_COSTS[provider];
  const inputCost = (promptTokens / 1000) * costs.input;
  const outputCost = (completionTokens / 1000) * costs.output;
  return inputCost + outputCost;
}
