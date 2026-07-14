import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase/admin';
import { v4 as uuidv4 } from 'uuid';
import { logApi, logApiError } from '../../../../lib/apiLog';

export const maxDuration = 300;
export const runtime = 'nodejs';

async function recordImageUrl(projectId: string, url: string) {
  try {
    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('uploaded_image_urls')
      .eq('id', projectId)
      .single();
    const existing = project?.uploaded_image_urls || [];
    await supabaseAdmin
      .from('projects')
      .update({ uploaded_image_urls: [...existing, url] })
      .eq('id', projectId);
  } catch (e) {
    logApiError('projects.upload-image.recordUrl', e, { projectId, url });
  }
}

export async function POST(req: NextRequest) {
  let logContext: Record<string, unknown> = {};
  try {
    // Support two modes:
    // 1. JSON mode (browser uploaded directly to Supabase, just record the URL)
    // 2. FormData mode (legacy — Vercel proxy upload)
    const ct = req.headers.get('content-type') || '';
    
    if (ct.includes('application/json')) {
      const { url, project_id } = await req.json();
      logContext = { projectId: project_id, url };
      if (!project_id || !url) {
        return NextResponse.json({ error: 'Missing project_id or url' }, { status: 400 });
      }
      await recordImageUrl(project_id, url);
      return NextResponse.json({ url });
    }
    
    // Legacy FormData mode
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const projectId = formData.get('project_id') as string | null;
    logContext = { projectId, fileName: file?.name, fileSize: file?.size, fileType: file?.type };

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 50MB.' }, { status: 400 });
    }

    const fileName = file.name?.toLowerCase() || '';
    const rawExt = file.type.split('/')[1]?.replace('jpeg', 'jpg') || fileName.split('.').pop() || 'jpg';
    const ext = (rawExt === 'heic' || rawExt === 'heif') ? 'jpg' : rawExt;
    const ctype = ext === 'jpg' ? 'image/jpeg' : (file.type || 'image/jpeg');
    const filename = `uploads/${uuidv4()}.${ext}`;
    const bytes = await file.arrayBuffer();

    const { error: uploadError } = await supabaseAdmin.storage
      .from('project-images')
      .upload(filename, bytes, { contentType: ctype, upsert: false });
    if (uploadError) throw uploadError;

    const { data: urlData } = supabaseAdmin.storage
      .from('project-images')
      .getPublicUrl(filename);
    const publicUrl = urlData.publicUrl;

    if (projectId) {
      await recordImageUrl(projectId, publicUrl);
    }

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    logApiError('projects.upload-image', error, logContext);
    return NextResponse.json({ error: 'Upload failed', details: error instanceof Error ? error.message : 'unknown' }, { status: 500 });
  }
}
