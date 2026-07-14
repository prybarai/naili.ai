/**
 * DeepSeek AI client with fallback to deterministic outputs.
 * Used for photo analysis, brief generation, and materials.
 */
import OpenAI from 'openai';

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (_client) return _client;

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY is not configured');
  }

  _client = new OpenAI({
    apiKey,
    baseURL: 'https://api.deepseek.com',
  });

  return _client;
}

function extractJsonText(text: string) {
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fencedMatch?.[1]?.trim() || text.trim();
  const firstBrace = candidate.indexOf('{');
  const lastBrace = candidate.lastIndexOf('}');
  return firstBrace >= 0 && lastBrace > firstBrace ? candidate.slice(firstBrace, lastBrace + 1) : candidate;
}

export async function callDeepSeek(
  systemPrompt: string,
  userPrompt: string,
  opts: { maxTokens?: number; temperature?: number; timeoutMs?: number } = {}
): Promise<string> {
  const { timeoutMs = 30000 } = opts;
  try {
    const client = getClient();
    const response = await client.chat.completions.create(
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: opts.maxTokens || 2048,
        temperature: opts.temperature ?? 0.3,
      },
      { timeout: timeoutMs }
    );
    const text = response.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('Empty response from DeepSeek');
    return text;
  } catch (err) {
    console.error('DeepSeek call failed:', err);
    throw err;
  }
}

export async function callDeepSeekJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  opts: { maxTokens?: number; temperature?: number; timeoutMs?: number } = {}
): Promise<T> {
  const text = await callDeepSeek(systemPrompt, userPrompt, {
    ...opts,
    temperature: opts.temperature ?? 0.1,
  });
  try {
    return JSON.parse(extractJsonText(text)) as T;
  } catch (parseError) {
    console.error('Failed to parse DeepSeek response as JSON:', extractJsonText(text).slice(0, 200));
    throw new Error('Invalid JSON from DeepSeek');
  }
}

/**
 * Analyze a photo using DeepSeek vision (supports base64 inline images).
 * Falls back to FALLBACK_VISION_ANALYSIS if DeepSeek is unavailable.
 */
export async function deepSeekVisionJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  imageBase64: string,
  opts: { maxTokens?: number; timeoutMs?: number } = {}
): Promise<T> {
  try {
    const client = getClient();
    const response = await client.chat.completions.create(
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: 'low',
                },
              },
            ],
          },
        ],
        max_tokens: opts.maxTokens || 1800,
        temperature: 0.1,
      },
      { timeout: opts.timeoutMs || 60000 }
    );

    const text = response.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('Empty response from DeepSeek vision');
    return JSON.parse(extractJsonText(text)) as T;
  } catch (err) {
    console.error('DeepSeek vision call failed:', err);
    throw err;
  }
}

export function isDeepSeekAvailable(): boolean {
  return !!process.env.DEEPSEEK_API_KEY;
}
