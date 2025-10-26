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

    // Multi-provider: Groq -> DeepSeek -> Together -> OpenAI -> stub
    const groqKey = Deno.env.get('GROQ_API_KEY');
    const deepseekKey = Deno.env.get('DEEPSEEK_API_KEY');
    const togetherKey = Deno.env.get('TOGETHER_API_KEY');
    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    async function callProvider(provider: 'groq'|'deepseek'|'together'|'openai', key: string): Promise<string> {
      const endpoint = provider === 'groq'
        ? 'https://api.groq.com/openai/v1/chat/completions'
        : provider === 'deepseek'
        ? 'https://api.deepseek.com/chat/completions'
        : provider === 'together'
        ? 'https://api.together.xyz/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';

      const model = provider === 'groq'
        ? 'llama-3.1-70b-versatile'
        : provider === 'deepseek'
        ? 'deepseek-chat'
        : provider === 'together'
        ? 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo'
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

    let content = '';
    try {
      if (groqKey) content = await callProvider('groq', groqKey);
      else if (deepseekKey) content = await callProvider('deepseek', deepseekKey);
      else if (togetherKey) content = await callProvider('together', togetherKey);
      else if (openaiKey) content = await callProvider('openai', openaiKey);
    } catch (_) {
      if (!content && deepseekKey && !(groqKey)) {
        try { content = await callProvider('deepseek', deepseekKey); } catch {}
      }
      if (!content && togetherKey && !(groqKey||deepseekKey)) {
        try { content = await callProvider('together', togetherKey); } catch {}
      }
      if (!content && openaiKey && !(groqKey||deepseekKey||togetherKey)) {
        try { content = await callProvider('openai', openaiKey); } catch {}
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
