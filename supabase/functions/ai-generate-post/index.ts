// deno-lint-ignore-file no-explicit-any
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

interface GenerateBody {
  topic?: string;
  tone?: 'friendly' | 'professional' | 'short';
  language?: 'English' | 'Arabic';
  brandVoice?: string;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const body = (await req.json()) as GenerateBody;
    const topic = body.topic?.trim() || 'your business update';
    const tone = body.tone || 'friendly';
    const language = body.language || 'English';

    const system = language === 'Arabic'
      ? `أنت كاتب محتوى موجز لمنشورات Google Business. اكتب 2-3 نسخ قصيرة بنبرة ${tone}.`
      : `You are a concise copywriter for Google Business posts. Write 2-3 short variants in a ${tone} tone.`;

    const user = language === 'Arabic'
      ? `الموضوع: ${topic}. اجعل النص بسيطًا وجذابًا مع رموز تعبيرية مناسبة.`
      : `Topic: ${topic}. Keep it simple and engaging with suitable emojis.`;

    // Multi-provider selection (Groq -> DeepSeek -> Together -> OpenAI -> stub)
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
          temperature: 0.7,
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
      // Continue to next provider or fallback
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
      const captions = language === 'Arabic'
        ? [
            `لا تفوّت عروض نهاية الأسبوع لدينا! ${topic}`,
            `تحديث جديد: ${topic} — زورونا اليوم!`,
            `نخدمكم يوميًا. ${topic} ✨`,
          ]
        : [
            `Don't miss our weekend special! ${topic} just for you.`,
            `New update: ${topic} — come check it out today!`,
            `We help you every day. ${topic} ✨`,
          ];
      return Response.json({ captions });
    }

    const parts = content
      .split(/\n+/)
      .map((s: string) => s.replace(/^[\-*\d\.\s]+/, '').trim())
      .filter((s: string) => s.length > 0)
      .slice(0, 3);

    return Response.json({ captions: parts.length ? parts : [content.trim()].filter(Boolean) });
  } catch (e) {
    return new Response(`Bad Request: ${e instanceof Error ? e.message : 'Unknown error'}`, { status: 400 });
  }
});
