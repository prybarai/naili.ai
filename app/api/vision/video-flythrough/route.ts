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
 * Kicks off video generation on Replicate (minimax/video-01-live).
 * Returns a prediction URL that the client can poll for status.
 * 
 * This avoids synchronous polling in a serverless function (which risks
 * timeout on Vercel Hobby's 10s limit). Instead:
 *   1. Start prediction → return prediction URL + id
 *   2. Client polls prediction URL for completion
 *   3. On completion, save to DB and signal the client
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const params = schema.parse(body);

    const apiToken = process.env.REPLICATE_API_TOKEN;

    if (!apiToken) {
      return NextResponse.json({
        status: 'unavailable',
        message: 'Video generation is not configured. Check back later.',
      });
    }

    // Start MiniMax prediction on Replicate
    const startRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: '7574e16b8f1ad52c6332ecb264c0f132e555f46c222255a738131ec1bb614092',
        input: {
          prompt: 'A slow cinematic flythrough of a beautifully renovated interior space, smooth camera movement showing modern finishes, professional real estate video quality, well-lit stylish room',
          first_frame_image: params.image_url,
          prompt_optimizer: true,
        },
      }),
    });

    if (!startRes.ok) {
      const errText = await startRes.text();
      console.error('[video-flythrough] Replicate prediction start failed:', startRes.status, errText);
      // Try fallback: stable-video-diffusion
      return tryFallbackSVD(params.image_url, apiToken, params.project_id);
    }

    const prediction = await startRes.json();

    // Save prediction tracking to DB (best-effort)
    try {
      await supabaseAdmin.from('project_videos').insert({
        project_id: params.project_id,
        video_url: null,
        thumbnail_url: null,
        prompt: 'Flythrough of renovated space from concept image',
        model: 'minimax/video-01-live',
        duration_seconds: 5,
        status: 'generating',
        replicate_prediction_id: prediction.id,
      });
    } catch {
      // Table may not exist
    }

    // Return prediction info for client to poll
    return NextResponse.json({
      status: 'generating',
      prediction_id: prediction.id,
      prediction_url: prediction.urls?.get || null,
      model: 'minimax/video-01-live',
      poll_url: `/api/vision/video-poll?id=${prediction.id}&project_id=${params.project_id}`,
    });
  } catch (error) {
    console.error('[video-flythrough] error:', error);
    return NextResponse.json({
      status: 'unavailable',
      message: 'Unable to generate video flythrough at this time.',
    });
  }
}

/**
 * Start a stability-ai/stable-video-diffusion prediction as fallback.
 */
async function tryFallbackSVD(
  imageUrl: string,
  apiToken: string,
  projectId: string
): Promise<NextResponse> {
  try {
    const startRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: '3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
        input: {
          input_image: imageUrl,
          video_length: '14_frames_with_svd',
          frames_per_second: 3,
          motion_bucket_id: 127,
          cond_aug: 0.02,
          decoding_t: 14,
          sizing_strategy: 'maintain_aspect_ratio',
          seed: Math.floor(Math.random() * 1000000),
        },
      }),
    });

    if (!startRes.ok) {
      return NextResponse.json({
        status: 'unavailable',
        message: 'Video generation is not available at this time.',
      });
    }

    const prediction = await startRes.json();

    try {
      await supabaseAdmin.from('project_videos').insert({
        project_id: projectId,
        video_url: null,
        thumbnail_url: null,
        prompt: 'Flythrough of renovated space from concept image',
        model: 'stability-ai/stable-video-diffusion',
        duration_seconds: 4,
        status: 'generating',
        replicate_prediction_id: prediction.id,
      });
    } catch {
      // Table may not exist
    }

    return NextResponse.json({
      status: 'generating',
      prediction_id: prediction.id,
      prediction_url: prediction.urls?.get || null,
      model: 'stability-ai/stable-video-diffusion',
      poll_url: `/api/vision/video-poll?id=${prediction.id}&project_id=${projectId}`,
    });
  } catch (err) {
    console.error('[video-flythrough] SVD fallback error:', err);
    return NextResponse.json({
      status: 'unavailable',
      message: 'Unable to generate video flythrough at this time.',
    });
  }
}
