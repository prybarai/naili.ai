import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '../../../../lib/supabase/admin';

const schema = z.object({
  project_id: z.string().uuid(),
  image_url: z.string().url(),
});

/**
 * POST /api/vision/video-flythrough
 *
 * Generates a 5-second video flythrough from the concept image.
 * Currently checks for available video API keys and returns a placeholder
 * if none are configured. The route exists so the frontend can call it
 * and display appropriate UI regardless of availability.
 *
 * Future: plug in OpenAI Sora 2, Google Veo 3, or other video generation.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const params = schema.parse(body);

    // Check if any video generation API is configured
    const hasVideoApi = !!(process.env.OPENAI_API_KEY);

    if (!hasVideoApi) {
      // Store an "unavailable" record so the frontend can distinguish states
      await supabaseAdmin.from('project_videos').insert({
        project_id: params.project_id,
        video_url: null,
        thumbnail_url: null,
        prompt: 'Video generation not configured',
        model: 'unavailable',
        duration_seconds: 5,
        status: 'failed',
      });

      return NextResponse.json({
        video_url: null,
        thumbnail_url: null,
        status: 'unavailable',
        message: 'Video flythrough generation is not available for this project. Check back later as we roll out this feature.',
      });
    }

    // Try generating using OpenAI's Sora / video generation capabilities
    // For now, since Sora is still in limited preview and may not have an API key,
    // we attempt it but gracefully fall back to unavailable.
    let videoUrl: string | null = null;
    let thumbnailUrl: string | null = null;
    let status: string = 'unavailable';

    try {
      const result = await generateVideoFromImage(params.image_url);
      if (result?.video_url) {
        videoUrl = result.video_url;
        thumbnailUrl = result.thumbnail_url || null;
        status = 'ready';
      }
    } catch (videoErr) {
      console.error('[video-flythrough] generation error:', videoErr);
      status = 'failed';
    }

    // Save result to DB
    const { data, error } = await supabaseAdmin
      .from('project_videos')
      .insert({
        project_id: params.project_id,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        prompt: 'Flythrough of renovated space from concept image',
        model: videoUrl ? 'sora-2' : 'unavailable',
        duration_seconds: 5,
        status: videoUrl ? 'ready' : 'failed',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      status: videoUrl ? 'ready' : 'unavailable',
      id: data?.id || null,
    });
  } catch (error) {
    console.error('[video-flythrough] error:', error);
    // Always return gracefully — don't 500 on the frontend
    return NextResponse.json({
      video_url: null,
      thumbnail_url: null,
      status: 'unavailable',
      message: 'Unable to generate video flythrough at this time.',
    });
  }
}

/**
 * Attempt to generate a video from an image using available APIs.
 * This is a placeholder that checks for Sora/Veo API keys and attempts
 * generation. Returns null if unavailable.
 */
async function generateVideoFromImage(
  imageUrl: string
): Promise<{ video_url: string; thumbnail_url?: string } | null> {
  // Strategy: use OpenAI's video generation if available
  // Future: add Google Veo 3, Runway, Pika, etc.

  // For now, return null since video gen APIs require specific setup
  // When Sora API becomes available, use:
  //
  // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  // const video = await openai.video.create({
  //   model: 'sora-2',
  //   prompt: 'A slow cinematic pan across a beautifully renovated interior space. Camera gently moves from left to right, showing the full room with high-end finishes. Smooth motion, professional quality, 5 seconds.',
  //   image: imageUrl,
  //   size: '1920x1080',
  //   duration: 5,
  // });

  // Placeholder for future implementation
  console.log('[video-flythrough] No video API configured. image_url:', imageUrl);

  return null;
}
