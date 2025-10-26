// deno-lint-ignore-file no-explicit-any
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

interface SuggestBody {
  prompt?: string;
  tone?: 'friendly' | 'professional' | 'short';
  language?: 'English' | 'Arabic';
  customerName?: string;
  rating?: number;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const body = (await req.json()) as SuggestBody;
    const prompt = (body.prompt || '').trim();
    const tone = body.tone || 'friendly';
    const language = body.language || 'English';
    const name = body.customerName || '';
    const rating = body.rating ?? undefined;

    const system = language === 'Arabic'
      ? `أنت مساعد يكتب ردود موجزة ولبقة على مراجعات العملاء بنبرة ${tone}. أعط 3 اقتراحات قصيرة.`
      : `You are an assistant writing concise and polite replies to customer reviews in a ${tone} tone. Provide 3 short suggestions.`;

    const user = language === 'Arabic'
      ? `المراجعة: ${prompt || '—'}${name ? `\nالعميل: ${name}` : ''}${rating ? `\nالتقييم: ${rating}` : ''}`
      : `Review: ${prompt || '—'}${name ? `\nCustomer: ${name}` : ''}${rating ? `\nRating: ${rating}` : ''}`;

    // Multi-provider: Groq -> DeepSeek -> Together -> Mistral -> Perplexity -> Gemini -> Cohere -> OpenAI -> stub
    const groqKey = Deno.env.get('GROQ_API_KEY');
    const deepseekKey = Deno.env.get('DEEPSEEK_API_KEY');
    const togetherKey = Deno.env.get('TOGETHER_API_KEY');
    const mistralKey = Deno.env.get('MISTRAL_API_KEY');
    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY');
    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    const cohereKey = Deno.env.get('COHERE_API_KEY');
    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    async function callProvider(provider: 'groq'|'deepseek'|'together'|'openai'|'mistral'|'perplexity', key: string): Promise<string> {
      const endpoint = provider === 'groq'
        ? 'https://api.groq.com/openai/v1/chat/completions'
        : provider === 'deepseek'
        ? 'https://api.deepseek.com/chat/completions'
        : provider === 'together'
        ? 'https://api.together.xyz/v1/chat/completions'
        : provider === 'mistral'
        ? 'https://api.mistral.ai/v1/chat/completions'
        : provider === 'perplexity'
        ? 'https://api.perplexity.ai/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';

      const model = provider === 'groq'
        ? 'llama-3.1-70b-versatile'
        : provider === 'deepseek'
        ? 'deepseek-chat'
        : provider === 'together'
        ? 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo'
        : provider === 'mistral'
        ? 'mistral-large-latest'
        : provider === 'perplexity'
        ? 'sonar'
        : 'gpt-4o-mini';

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          temperature: 0.5,
        }),
      });

      if (!resp.ok) {
        throw new Error(`${provider} error: ${await resp.text()}`);
      }
      const data: any = await resp.json();
      return data.choices?.[0]?.message?.content || '';
    }

    async function callGemini(key: string): Promise<string> {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${system}\n\n${user}` }],
            },
          ],
          generationConfig: { temperature: 0.5 },
        }),
      });
      if (!resp.ok) throw new Error(await resp.text());
      const data: any = await resp.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    async function callCohere(key: string): Promise<string> {
      const endpoint = 'https://api.cohere.ai/v1/generate';
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: 'command',
          prompt: `${system}\n\n${user}`,
          temperature: 0.5,
          max_tokens: 384,
        }),
      });
      if (!resp.ok) throw new Error(await resp.text());
      const data: any = await resp.json();
      return data.generations?.[0]?.text || '';
    }

    let content = '';
    type ProviderName = 'groq'|'deepseek'|'together'|'mistral'|'perplexity'|'gemini'|'cohere'|'openai';
    const order: Array<{ name: ProviderName; key?: string|null }> = [
      { name: 'groq', key: groqKey },
      { name: 'deepseek', key: deepseekKey },
      { name: 'together', key: togetherKey },
      { name: 'mistral', key: mistralKey },
      { name: 'perplexity', key: perplexityKey },
      { name: 'gemini', key: geminiKey },
      { name: 'cohere', key: cohereKey },
      { name: 'openai', key: openaiKey },
    ];

    for (const p of order) {
      if (!p.key) continue;
      try {
        if (p.name === 'gemini') {
          content = await callGemini(p.key);
        } else if (p.name === 'cohere') {
          content = await callCohere(p.key);
        } else {
          content = await callProvider(p.name, p.key);
        }
        if (content) break;
      } catch (_) {
        // try next
      }
    }

    if (!content) {
      const base = language === 'Arabic'
        ? [
            `شكراً لك${name ? ' ' + name : ''}! نسعد بأنك قيّمتنا${rating ? ` ${rating} نجوم` : ''}. نرحب بك دائماً!`,
            `نعتذر عن أي إزعاج${name ? ' ' + name : ''}. شكرًا لملاحظاتك وسنعمل على التحسين.`,
            `شاكرين وقتك وتعليقك${name ? ' ' + name : ''}. رضاك أولوية لنا دائمًا.`,
          ]
        : [
            `Thank you${name ? ', ' + name : ''}! We're glad about your ${rating ? rating + '-star ' : ''}experience. You're always welcome!`,
            `We're sorry for any inconvenience${name ? ', ' + name : ''}. We appreciate your feedback and will improve.`,
            `Thanks for your time${name ? ', ' + name : ''}. Your satisfaction is always our priority.`,
          ];
      return Response.json({ suggestions: base });
    }

    const parts = content
      .split(/\n+/)
      .map((s: string) => s.replace(/^[\-*\d\.\s]+/, '').trim())
      .filter((s: string) => s.length > 0)
      .slice(0, 3);

    return Response.json({ suggestions: parts.length ? parts : [content.trim()].filter(Boolean) });
  } catch (e) {
    return new Response(`Bad Request: ${e instanceof Error ? e.message : 'Unknown error'}`, { status: 400 });
  }
});
