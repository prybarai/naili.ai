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

    // Track annotations for each new image
    let newAnnotations: Record<string, unknown>[] = [];

    if (imageUrls.length > 0) {
      // Append new concepts to existing ones
      const { data: existingProject } = await supabaseAdmin
        .from('projects')
        .select('generated_image_urls, image_annotations')
        .eq('id', params.project_id)
        .single();

      const existingUrls: string[] = Array.isArray(existingProject?.generated_image_urls)
        ? existingProject.generated_image_urls
        : [];

      const mergedUrls = [...existingUrls, ...imageUrls];

      // Try to get annotations for the new images
      for (const imageUrl of imageUrls) {
        try {
          // Fetch the project materials for this project
          const { data: mats } = await supabaseAdmin
            .from('materials')
            .select('line_items')
            .eq('project_id', params.project_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (mats?.line_items) {
            const annotateRes = await fetch(
              new URL('/api/vision/annotate-image', req.url).toString(),
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  image_url: imageUrl,
                  materials: mats.line_items,
                  category: params.category,
                }),
              }
            );
            if (annotateRes.ok) {
              const { annotations } = await annotateRes.json();
              if (annotations) {
                newAnnotations.push({
                  image_url: imageUrl,
                  annotations,
                });
              }
            }
          }
        } catch {
          // Non-blocking — skip annotation for this image
        }
      }

      // Merge existing annotations with new ones
      const existingAnnotations: Record<string, unknown>[] = Array.isArray(existingProject?.image_annotations)
        ? existingProject.image_annotations
        : [];

      const mergedAnnotations = [...existingAnnotations, ...newAnnotations];

      await supabaseAdmin
        .from('projects')
        .update({
          generated_image_urls: mergedUrls,
          image_annotations: mergedAnnotations.length > 0 ? mergedAnnotations : undefined,
        })
        .eq('id', params.project_id);
    }

    return NextResponse.json({ image_urls: imageUrls });
  } catch (error) {
    logApiError('generate-concepts', error, { projectId: body?.project_id });
    return NextResponse.json({ error: 'Failed to generate concepts', image_urls: [] }, { status: 500 });
  }
}
