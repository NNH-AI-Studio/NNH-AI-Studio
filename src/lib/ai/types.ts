export type AIProvider =
  | 'groq'
  | 'deepseek'
  | 'together'
  | 'gemini'
  | 'cohere'
  | 'mistral'
  | 'perplexity'
  | 'openai';

export type AIFeature =
  | 'review_reply'
  | 'post_generation'
  | 'caption_writer'
  | 'hashtag_generator'
  | 'content_ideas'
  | 'image_generation'
  | 'voice_tts'
  | 'voice_stt'
  | 'content_analysis'
  | 'translation';

export interface AIRequest {
  prompt: string;
  feature: AIFeature;
  userId?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface AIResponse {
  content: string;
  provider: AIProvider;
  model: string;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost: number;
  latency: number;
}

export interface AIProviderConfig {
  name: AIProvider;
  apiKey: string;
  baseUrl: string;
  models: {
    text: string;
    image?: string;
  };
  enabled: boolean;
}

export interface AIError {
  provider: AIProvider;
  error: string;
  timestamp: number;
}
