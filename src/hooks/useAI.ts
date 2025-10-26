import { useState } from 'react';
import { aiService } from '../lib/ai/aiService';
import type { AIRequest, AIResponse } from '../lib/ai/types';
import { useAuth } from '../contexts/AuthContext';

export function useAI() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<AIResponse | null>(null);

  const generate = async (request: AIRequest): Promise<AIResponse | null> => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await aiService.chat(request);
      setResponse(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate AI response';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateReviewReply = async (
    reviewText: string,
    rating: number,
    businessName: string,
    tone: 'professional' | 'friendly' | 'casual' = 'professional'
  ): Promise<string | null> => {
    const toneInstructions = {
      professional: 'Use a professional and courteous tone.',
      friendly: 'Use a warm and friendly tone.',
      casual: 'Use a casual and approachable tone.'
    };

    const prompt = `Generate a reply to this ${rating}-star review for ${businessName}:

"${reviewText}"

Guidelines:
- ${toneInstructions[tone]}
- Thank the customer for their feedback
- ${rating >= 4 ? 'Express appreciation for their positive experience' : 'Acknowledge their concerns and offer a solution'}
- Keep it concise (2-3 sentences)
- Be genuine and personalized
- ${rating <= 3 ? 'Provide contact information to resolve issues' : ''}

Reply:`;

    const result = await generate({
      prompt,
      feature: 'review_reply',
      userId: user?.id,
      temperature: 0.7,
      maxTokens: 200
    });

    return result?.content || null;
  };

  const generatePost = async (
    businessName: string,
    postType: 'photo' | 'event' | 'offer' | 'update',
    topic?: string
  ): Promise<string | null> => {
    const postTypeInstructions = {
      photo: 'Create an engaging caption for a photo post',
      event: 'Create an exciting announcement for an upcoming event',
      offer: 'Create a compelling offer or promotion announcement',
      update: 'Create an informative business update'
    };

    const prompt = `${postTypeInstructions[postType]} for ${businessName}${topic ? ` about: ${topic}` : ''}.

Guidelines:
- Keep it engaging and authentic
- Include a call-to-action
- Length: 2-3 sentences
- Use appropriate emojis (1-2 max)
- Make it shareable

Post:`;

    const result = await generate({
      prompt,
      feature: 'post_generation',
      userId: user?.id,
      temperature: 0.8,
      maxTokens: 150
    });

    return result?.content || null;
  };

  const generateHashtags = async (caption: string, maxHashtags: number = 10): Promise<string[] | null> => {
    const prompt = `Generate ${maxHashtags} relevant hashtags for this social media post:

"${caption}"

Requirements:
- Mix of popular and niche hashtags
- Relevant to the content
- No spaces in hashtags
- Return only the hashtags, one per line, with # symbol

Hashtags:`;

    const result = await generate({
      prompt,
      feature: 'hashtag_generator',
      userId: user?.id,
      temperature: 0.6,
      maxTokens: 200
    });

    if (!result?.content) return null;

    return result.content
      .split('\n')
      .filter(line => line.trim().startsWith('#'))
      .map(line => line.trim())
      .slice(0, maxHashtags);
  };

  const generateContentIdeas = async (
    businessType: string,
    month: string
  ): Promise<string[] | null> => {
    const prompt = `Generate 10 content ideas for a ${businessType} business for ${month}.

Format: Return a numbered list (1-10) of specific, actionable content ideas.
Each idea should be one sentence.

Content Ideas:`;

    const result = await generate({
      prompt,
      feature: 'content_ideas',
      userId: user?.id,
      temperature: 0.8,
      maxTokens: 400
    });

    if (!result?.content) return null;

    return result.content
      .split('\n')
      .filter(line => /^\d+\./.test(line.trim()))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(idea => idea.length > 0);
  };

  return {
    loading,
    error,
    response,
    generate,
    generateReviewReply,
    generatePost,
    generateHashtags,
    generateContentIdeas
  };
}
