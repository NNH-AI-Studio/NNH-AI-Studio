import type { AIRequest, AIResponse, AIProvider, AIError } from './types';
import { FALLBACK_CHAIN, AI_PROVIDERS, calculateCost } from './providers';
import { supabase } from '../supabase';

class AIService {
  private errors: AIError[] = [];
  private providerChain: AIProvider[] | null = null;

  // Helper: الحصول على JWT المستخدم الحالي
  private async getUserAccessToken(): Promise<string> {
    // أولاً حاول الحصول على الجلسة الحالية بسرعة
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) return session.access_token;

    // خيار إضافي: محاولة التحديث إذا لم توجد جلسة نشطة
    const { data } = await supabase.auth.refreshSession();
    const token = data.session?.access_token;
    if (!token) throw new Error('No user session. Please sign in.');
    return token;
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No user session. Please sign in.');
      }

      // احصل على JWT المستخدم بدل anon key
      const accessToken = await this.getUserAccessToken();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // مهم: استخدم توكن المستخدم
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            prompt: request.prompt,
            systemPrompt: request.systemPrompt,
            userId: user.id,
            taskType: request.feature || 'general'
          }),
        }
      );

      if (!response.ok) {
        // حاول قراءة رسالة الخطأ من الوظيفة
        let errorMessage = `AI generation failed (HTTP ${response.status})`;
        try {
          const errorData = await response.json();
          if (errorData?.error) errorMessage = errorData.error;
        } catch {
          // تجاهل فشل JSON واستخدم الرسالة الافتراضية
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      return {
        content: data.content,
        provider: data.provider as AIProvider,
        model: AI_PROVIDERS[data.provider as AIProvider]?.models.text || 'unknown',
        tokensUsed: {
          prompt: request.prompt.length,
          completion: data.content.length,
          total: request.prompt.length + data.content.length
        },
        cost: 0,
        latency: 0
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.errors.push({
        provider: 'groq',
        error: errorMessage,
        timestamp: Date.now()
      });
      throw new Error(`AI request failed: ${errorMessage}`);
    }
  }

  // باقي الكلاس كما هو دون تغيير...
  private async callProvider(provider: AIProvider, request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    const config = AI_PROVIDERS[provider];

    const apiKey = await this.getApiKeyFromDB(provider, request.userId);
    if (!apiKey) {
      throw new Error(`API key not configured for ${provider}`);
    }

    let response: Response;

    if (provider === 'openai' || provider === 'groq' || provider === 'deepseek' || provider === 'together' || provider === 'mistral') {
      response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: request.model || config.models.text,
          messages: [
            ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
            { role: 'user', content: request.prompt }
          ],
          temperature: request.temperature || 0.7,
          max_tokens: request.maxTokens || 1000
        })
      });
    } else if (provider === 'gemini') {
      response = await fetch(`${config.baseUrl}/models/${config.models.text}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: request.prompt }]
          }]
        })
      });
    } else if (provider === 'cohere') {
      response = await fetch(`${config.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: config.models.text,
          prompt: request.prompt,
          max_tokens: request.maxTokens || 1000,
          temperature: request.temperature || 0.7
        })
      });
    } else if (provider === 'perplexity') {
      response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: config.models.text,
          messages: [
            { role: 'user', content: request.prompt }
          ]
        })
      });
    } else {
      throw new Error(`Provider ${provider} not implemented`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const latency = Date.now() - startTime;

    return this.parseResponse(provider, data, latency, request.model || config.models.text);
  }

  private parseResponse(provider: AIProvider, data: any, latency: number, model: string): AIResponse {
    let content = '';
    let promptTokens = 0;
    let completionTokens = 0;

    if (provider === 'openai' || provider === 'groq' || provider === 'deepseek' || provider === 'together' || provider === 'mistral' || provider === 'perplexity') {
      content = data.choices?.[0]?.message?.content || '';
      promptTokens = data.usage?.prompt_tokens || 0;
      completionTokens = data.usage?.completion_tokens || 0;
    } else if (provider === 'gemini') {
      content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      promptTokens = data.usageMetadata?.promptTokenCount || 0;
      completionTokens = data.usageMetadata?.candidatesTokenCount || 0;
    } else if (provider === 'cohere') {
      content = data.generations?.[0]?.text || '';
      promptTokens = data.meta?.billed_units?.input_tokens || 0;
      completionTokens = data.meta?.billed_units?.output_tokens || 0;
    }

    const totalTokens = promptTokens + completionTokens;
    const cost = calculateCost(provider, promptTokens, completionTokens);

    return {
      content: content.trim(),
      provider,
      model,
      tokensUsed: {
        prompt: promptTokens,
        completion: completionTokens,
        total: totalTokens
      },
      cost,
      latency
    };
  }

  private async getProviderChain(userId?: string): Promise<AIProvider[]> {
    if (!userId) {
      return FALLBACK_CHAIN;
    }
    if (this.providerChain) {
      return this.providerChain;
    }
    try {
      const { data: settings, error } = await supabase
        .from('ai_settings')
        .select('provider, api_key, is_active')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('priority');

      if (error || !settings || settings.length === 0) {
        return FALLBACK_CHAIN;
      }

      const activeProviders = settings
        .filter(s => s.api_key && s.is_active)
        .map(s => s.provider as AIProvider);

      this.providerChain = activeProviders.length > 0 ? activeProviders : FALLBACK_CHAIN;
      return this.providerChain;
    } catch (error) {
      console.error('Failed to load provider chain:', error);
      return FALLBACK_CHAIN;
    }
  }

  private async getApiKeyFromDB(provider: AIProvider, userId?: string): Promise<string | undefined> {
    if (!userId) {
      return this.getApiKeyFromEnv(provider);
    }
    try {
      const { data, error } = await supabase
        .from('ai_settings')
        .select('api_key')
        .eq('user_id', userId)
        .eq('provider', provider)
        .eq('is_active', true)
        .maybeSingle();

      if (error || !data) {
        return this.getApiKeyFromEnv(provider);
      }
      return data.api_key || this.getApiKeyFromEnv(provider);
    } catch {
      return this.getApiKeyFromEnv(provider);
    }
  }

  private async logRequest(
    provider: AIProvider,
    request: AIRequest,
    response: AIResponse | null,
    success: boolean,
    errorMessage?: string
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('ai_requests').insert({
        user_id: user.id,
        provider,
        model: response?.model || AI_PROVIDERS[provider].models.text,
        feature: request.feature,
        prompt_tokens: response?.tokensUsed.prompt || 0,
        completion_tokens: response?.tokensUsed.completion || 0,
        total_tokens: response?.tokensUsed.total || 0,
        cost_usd: response?.cost || 0,
        latency_ms: response?.latency || 0,
        success
      });
    } catch (error) {
      console.error('Failed to log AI request:', error);
    }
  }

  clearProviderCache(): void {
    this.providerChain = null;
  }

  private getApiKeyFromEnv(provider: AIProvider): string | undefined {
    const envVarMap: Record<AIProvider, string> = {
      groq: 'VITE_GROQ_API_KEY',
      deepseek: 'VITE_DEEPSEEK_API_KEY',
      together: 'VITE_TOGETHER_API_KEY',
      gemini: 'VITE_GEMINI_API_KEY',
      cohere: 'VITE_COHERE_API_KEY',
      mistral: 'VITE_MISTRAL_API_KEY',
      perplexity: 'VITE_PERPLEXITY_API_KEY',
      openai: 'VITE_OPENAI_API_KEY'
    };
    return import.meta.env[envVarMap[provider]];
  }

  getErrors(): AIError[] {
    return this.errors;
  }

  clearErrors(): void {
    this.errors = [];
  }
}

export const aiService = new AIService();