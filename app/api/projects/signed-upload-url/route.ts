import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase/admin';
import { logApi, logApiError } from '../../../../lib/apiLog';

export const maxDuration = 30;

/**
 * Returns a signed upload URL so the browser can upload photos
 * directly to Supabase Storage without proxying through Vercel
 * (which has a 4.5MB body limit on Hobby tier).
 */
export async function POST(req: NextRequest) {
  try {
    const { file_name, content_type } = await req.json();
    if (!file_name) {
      return NextResponse.json({ error: 'file_name required' }, { status: 400 });
    }

    // Generate a unique path preserving extension
    const crypto = await import('crypto');
    const uuid = crypto.randomUUID();
    const ext = file_name.split('.').pop() || 'jpg';
    const path = `uploads/${uuid}.${ext}`;

    logApi('projects.signed-upload-url', 'creating', { path, contentType: content_type });

    const { data, error } = await supabaseAdmin.storage
      .from('project-images')
      .createSignedUploadUrl(path);

    if (error) {
      logApiError('projects.signed-upload-url', error);
      return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 });
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
      path: data.path,
      token: data.token,
      publicUrl: supabaseAdmin.storage.from('project-images').getPublicUrl(path).data.publicUrl,
    });
  } catch (error) {
    logApiError('projects.signed-upload-url', error);
    return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 });
  }
}
