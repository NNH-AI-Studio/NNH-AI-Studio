import { supabase } from './supabase';

export type AITone = 'friendly' | 'professional' | 'short';
export type AILanguage = 'English' | 'Arabic';

export async function aiGeneratePost({
  topic,
  tone = 'friendly',
  language = 'English',
}: {
  topic?: string;
  tone?: AITone;
  language?: AILanguage;
}): Promise<string[]> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-generate-post', {
      body: { topic, tone, language },
    });
    if (error) throw error;
    const captions: string[] = (data as any)?.captions || [];
    if (Array.isArray(captions) && captions.length) return captions;
    return [];
  } catch {
    // Fallback stubs
    return language === 'Arabic'
      ? [
          `لا تفوّت عروض نهاية الأسبوع لدينا! ${topic || 'تحديث جديد'}`,
          `تحديث جديد: ${topic || 'خبر رائع'} — زورونا اليوم!`,
          `نخدمكم يوميًا. ${topic || 'شيء تحبونه'} ✨`,
        ]
      : [
          `Don't miss our weekend special! ${topic || 'Great deals'} just for you.`,
          `New update: ${topic || 'exciting news'} — come check it out today!`,
          `We help you every day. ${topic || "Here’s something you’ll love"} ✨`,
        ];
  }
}

export async function aiSuggestReply({
  prompt,
  tone = 'friendly',
  language = 'English',
  customerName,
  rating,
}: {
  prompt?: string;
  tone?: AITone;
  language?: AILanguage;
  customerName?: string;
  rating?: number;
}): Promise<string[]> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-suggest-reply', {
      body: { prompt, tone, language, customerName, rating },
    });
    if (error) throw error;
    const suggestions: string[] = (data as any)?.suggestions || [];
    if (Array.isArray(suggestions) && suggestions.length) return suggestions;
    return [];
  } catch {
    // Fallback stubs
    return language === 'Arabic'
      ? [
          `شكراً لك${customerName ? ' ' + customerName : ''}! سعداء بتجربتك.`,
          `نعتذر عن أي إزعاج${customerName ? ' ' + customerName : ''}. شكرًا لملاحظاتك.`,
          `نسعد بوقتك وتعليقك${customerName ? ' ' + customerName : ''}. رضاك مهم لنا.`,
        ]
      : [
          `Thank you${customerName ? ', ' + customerName : ''}! We appreciate your feedback.`,
          `We're sorry for any inconvenience${customerName ? ', ' + customerName : ''}. We'll improve.`,
          `Thanks for your time${customerName ? ', ' + customerName : ''}. Your satisfaction matters to us.`,
        ];
  }
}
