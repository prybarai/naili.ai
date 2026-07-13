import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/vision/video-poll?id=<replicate_prediction_id>&project_id=<project_id>
 *
 * Polls Replicate for the status of a video generation prediction.
 * Returns the video URL when complete.
 *
 * Called by the client every few seconds after /api/vision/video-flythrough
 * returns a prediction_id. Lightweight enough to run within Vercel's timeout.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const predictionId = searchParams.get('id');
    const projectId = searchParams.get('project_id');

    if (!predictionId) {
      return NextResponse.json({ status: 'error', message: 'Missing prediction ID' }, { status: 400 });
    }

    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json({ status: 'unavailable', message: 'Video API not configured' });
    }

    const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: { Authorization: `Token ${apiToken}` },
    });

    if (!pollRes.ok) {
      return NextResponse.json({ status: 'error', message: 'Failed to poll Replicate' }, { status: 502 });
    }

    const data = await pollRes.json();
    const { status, output, error } = data;

    if (status === 'succeeded') {
      const videoUrl = typeof output === 'string'
        ? output
        : Array.isArray(output)
          ? output[0]
          : null;

      if (videoUrl) {
        // Try to save to DB (best-effort)
        try {
          const { supabaseAdmin } = await import('../../../../lib/supabase/admin');
          await supabaseAdmin
            .from('project_videos')
            .update({
              video_url: videoUrl,
              thumbnail_url: null,
              status: 'ready',
            })
            .eq('replicate_prediction_id', predictionId);
        } catch {
          // Table may not exist
        }
      }

      return NextResponse.json({
        status: 'ready',
        video_url: videoUrl,
        prediction_id: predictionId,
        project_id: projectId,
      });
    }

    if (status === 'failed') {
      console.warn('[video-poll] Prediction failed:', error);
      return NextResponse.json({
        status: 'failed',
        message: error || 'Video generation failed',
        prediction_id: predictionId,
      });
    }

    // Still processing
    return NextResponse.json({
      status: 'generating',
      prediction_id: predictionId,
    });
  } catch (error) {
    console.error('[video-poll] error:', error);
    return NextResponse.json({ status: 'error', message: 'Internal error' }, { status: 500 });
  }
}
