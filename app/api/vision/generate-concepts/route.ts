import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '../../../../lib/supabase/admin';
import { generateConceptImages } from '../../../../lib/imageGeneration';
import { extractDesignConstraints } from '../../../../lib/designConstraints';
import { type VisionAnalysis } from '../../../../lib/visionAnalysis';
import { logApi, logApiError } from '../../../../lib/apiLog';

const schema = z.object({
  project_id: z.string().uuid(),
  category: z.string(),
  style: z.string(),
  quality_tier: z.string(),
  notes: z.string().optional(),
  reference_image_url: z.string().url().optional(),
  analysis: z.unknown().optional(),
  count: z.number().int().min(1).max(3).optional(),
});

export const maxDuration = 300; // 5 min — OpenAI image edit can take 30-60s per image

function getAnalysis(input: unknown): VisionAnalysis | undefined {
  if (!input || typeof input !== 'object') return undefined;
  return input as VisionAnalysis;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> | undefined;
  try {
    body = await req.json();
    const params = schema.parse(body);
    const constraints = extractDesignConstraints(params.notes);
    const constraintSummary = {
      bodyColor: constraints.bodyColor,
      accentColor: constraints.accentColor,
      trimColor: constraints.trimColor,
      roofColor: constraints.roofColor,
      deckMaterial: constraints.deckMaterial,
      flooringMaterial: constraints.flooringMaterial,
      cabinetColor: constraints.cabinetColor,
      countertopMaterial: constraints.countertopMaterial,
      tileStyle: constraints.tileStyle,
      explicitRequirementCount: constraints.explicitRequirements.length,
    };

    if (!process.env.OPENAI_API_KEY) {
      logApi('generate-concepts', 'OPENAI_API_KEY missing, returning empty');
      return NextResponse.json({ image_urls: [], error: 'OpenAI not configured' }, { status: 503 });
    }

    logApi('generate-concepts', 'request', {
      category: params.category,
      style: params.style,
      hasNotes: Boolean(params.notes),
      requestedCount: params.count ?? 1,
      constraintSummary,
    });

    const imageUrls = await generateConceptImages({
      category: params.category,
      style: params.style,
      qualityTier: params.quality_tier,
      notes: params.notes,
      referenceImageUrl: params.reference_image_url,
      analysis: getAnalysis(params.analysis),
      projectId: params.project_id,
      count: params.count ?? 1,
    });

    if (imageUrls.length > 0) {
      // Append new concepts to existing ones instead of overwriting
      const { data: existingProject } = await supabaseAdmin
        .from('projects')
        .select('generated_image_urls')
        .eq('id', params.project_id)
        .single();

      const existingUrls: string[] = Array.isArray(existingProject?.generated_image_urls)
        ? existingProject.generated_image_urls
        : [];

      const mergedUrls = [...existingUrls, ...imageUrls];

      await supabaseAdmin
        .from('projects')
        .update({ generated_image_urls: mergedUrls })
        .eq('id', params.project_id);
    }

    return NextResponse.json({ image_urls: imageUrls });
  } catch (error) {
    logApiError('generate-concepts', error, { projectId: body?.project_id });
    return NextResponse.json({ error: 'Failed to generate concepts', image_urls: [] }, { status: 500 });
  }
}
