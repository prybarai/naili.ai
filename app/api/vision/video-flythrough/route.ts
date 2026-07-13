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
 * Generates a 5-second video flythrough from the concept image using
 * Replicate + minimax/video-01-live (image-to-video).
 * Gracefully falls back if no video API is configured.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const params = schema.parse(body);

    const hasVideoApi = !!(process.env.REPLICATE_API_TOKEN);

    if (!hasVideoApi) {
      console.log('[video-flythrough] No video API configured');

      // Attempt to save an "unavailable" record — tables may not exist yet
      try {
        await supabaseAdmin.from('project_videos').insert({
          project_id: params.project_id,
          video_url: null,
          thumbnail_url: null,
          prompt: 'Video generation not configured',
          model: 'unavailable',
          duration_seconds: 5,
          status: 'failed',
        });
      } catch {
        // Table doesn't exist yet — that's fine
      }

      return NextResponse.json({
        video_url: null,
        thumbnail_url: null,
        status: 'unavailable',
        message: 'Video flythrough generation is not available for this project. Check back later as we roll out this feature.',
      });
    }

    // Try generating via Replicate
    let videoUrl: string | null = null;
    let thumbnailUrl: string | null = null;
    let modelName = 'unavailable';
    let status = 'unavailable';

    try {
      const result = await generateVideoFromImage(params.image_url);
      if (result?.video_url) {
        videoUrl = result.video_url;
        thumbnailUrl = result.thumbnail_url || null;
        modelName = 'minimax/video-01-live';
        status = 'ready';
      }
    } catch (videoErr) {
      console.error('[video-flythrough] generation error:', videoErr);
      status = 'failed';
    }

    // Save to DB (best-effort — tables may not exist yet)
    try {
      const { data, error } = await supabaseAdmin
        .from('project_videos')
        .insert({
          project_id: params.project_id,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          prompt: 'Flythrough of renovated space from concept image',
          model: modelName,
          duration_seconds: 5,
          status,
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        status,
        id: data?.id || null,
      });
    } catch (dbErr) {
      console.warn('[video-flythrough] DB save failed (table may not exist):', dbErr);
      // Return the data even without the DB record
      return NextResponse.json({
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        status,
      });
    }
  } catch (error) {
    console.error('[video-flythrough] error:', error);
    return NextResponse.json({
      video_url: null,
      thumbnail_url: null,
      status: 'unavailable',
      message: 'Unable to generate video flythrough at this time.',
    });
  }
}

/**
 * Generate a video from an image using Replicate's minimax/video-01-live.
 * Falls back to stability-ai/stable-video-diffusion if available.
 */
async function generateVideoFromImage(
  imageUrl: string
): Promise<{ video_url: string; thumbnail_url?: string } | null> {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken) return null;

  // Strategy 1: Try minimax/video-01-live (image-to-video, best for renovation walkthroughs)
  const miniMaxResult = await tryMiniMaxVideo(imageUrl, apiToken);
  if (miniMaxResult) return miniMaxResult;

  // Strategy 2: Fall back to stability-ai/stable-video-diffusion
  const svdResult = await tryStableVideoDiffusion(imageUrl, apiToken);
  if (svdResult) return svdResult;

  return null;
}

/**
 * Try minimax/video-01-live image-to-video generation.
 */
async function tryMiniMaxVideo(
  imageUrl: string,
  apiToken: string
): Promise<{ video_url: string; thumbnail_url?: string } | null> {
  try {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: '7574e16b8f1ad52c6332ecb264c0f132e555f46c222255a738131ec1bb614092',
        input: {
          prompt: 'A slow cinematic flythrough of a beautifully renovated interior space, smooth camera movement showing modern finishes, professional real estate video quality, well-lit stylish room',
          first_frame_image: imageUrl,
          prompt_optimizer: true,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn('[video-flythrough] MiniMax prediction failed:', response.status, errText);
      return null;
    }

    const prediction = await response.json();
    const predictionId = prediction.id;

    // Poll for completion
    for (let i = 0; i < 60; i++) {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const pollRes = await fetch(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: { Authorization: `Token ${apiToken}` },
        }
      );

      if (!pollRes.ok) continue;

      const pollData = await pollRes.json();

      if (pollData.status === 'succeeded') {
        const videoUrl = typeof pollData.output === 'string'
          ? pollData.output
          : Array.isArray(pollData.output)
            ? pollData.output[0]
            : null;

        if (videoUrl) {
          // Download first frame as thumbnail
          const thumbnailUrl = imageUrl; // Use the input image as thumbnail
          return { video_url: videoUrl, thumbnail_url: thumbnailUrl };
        }
        return null;
      }

      if (pollData.status === 'failed') {
        console.warn('[video-flythrough] MiniMax prediction failed:', pollData.error);
        return null;
      }
    }

    console.warn('[video-flythrough] MiniMax prediction timed out after 3 minutes');
    return null;
  } catch (err) {
    console.warn('[video-flythrough] MiniMax error:', err);
    return null;
  }
}

/**
 * Try stability-ai/stable-video-diffusion as a fallback.
 */
async function tryStableVideoDiffusion(
  imageUrl: string,
  apiToken: string
): Promise<{ video_url: string; thumbnail_url?: string } | null> {
  try {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
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

    if (!response.ok) {
      const errText = await response.text();
      console.warn('[video-flythrough] SVD prediction failed:', response.status, errText);
      return null;
    }

    const prediction = await response.json();
    const predictionId = prediction.id;

    // Poll for completion
    for (let i = 0; i < 60; i++) {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const pollRes = await fetch(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: { Authorization: `Token ${apiToken}` },
        }
      );

      if (!pollRes.ok) continue;

      const pollData = await pollRes.json();

      if (pollData.status === 'succeeded') {
        const videoUrl = typeof pollData.output === 'string'
          ? pollData.output
          : Array.isArray(pollData.output)
            ? pollData.output[0]
            : null;

        if (videoUrl) {
          return { video_url: videoUrl, thumbnail_url: imageUrl };
        }
        return null;
      }

      if (pollData.status === 'failed') {
        console.warn('[video-flythrough] SVD prediction failed:', pollData.error);
        return null;
      }
    }

    return null;
  } catch (err) {
    console.warn('[video-flythrough] SVD error:', err);
    return null;
  }
}
