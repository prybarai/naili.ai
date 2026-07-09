/**
 * Concept image generation entry point.
 *
 * Tries available AI providers in order. Returns empty array if none work.
 */

import { type VisionAnalysis } from '@/lib/visionAnalysis';

async function tryOpenAI(params: ImageGenParams): Promise<string[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return [];
  try {
    const { generateConceptImages: openaiGen } = await import('./imageGenerationOpenAI');
    return await openaiGen(params);
  } catch (err) {
    console.error('OpenAI image generation failed:', err);
    return [];
  }
}

type ImageGenParams = {
  category: string;
  style: string;
  qualityTier: string;
  notes?: string;
  referenceImageUrl?: string;
  analysis?: VisionAnalysis;
  projectId: string;
  count?: number;
};

/**
 * Generate concept images for a renovation project.
 * Returns array of image URLs (or empty if unavailable).
 */
export async function generateConceptImages(params: ImageGenParams): Promise<string[]> {
  const openaiResults = await tryOpenAI(params);
  if (openaiResults.length > 0) return openaiResults;
  return [];
}
