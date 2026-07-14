import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase/admin';
import { v4 as uuidv4 } from 'uuid';
import { logApi, logApiError } from '../../../../lib/apiLog';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let logContext: Record<string, unknown> = {};
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const projectId = formData.get('project_id') as string | null;
    logContext = { projectId };

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    // Accept mobile formats (HEIC, HEIF, etc.) plus standard web formats
    // Modern phones (iPhone 15 Pro, etc.) shoot HEIC by default
    const mime = file.type.toLowerCase();
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    // Also check extension for cases where MIME is generic (octet-stream)
    const fileName = file.name?.toLowerCase() || '';
    const validExts = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'];
    const hasValidType = validTypes.includes(mime);
    const hasValidExt = validExts.some(ext => fileName.endsWith(ext));
    if (!hasValidType && !hasValidExt) {
      // If browser sends generic MIME but extension is valid, proceed anyway
      // This helps with some mobile browsers
      if (mime !== 'application/octet-stream' && mime !== '') {
        return NextResponse.json({ error: 'Invalid file type. Use JPG, PNG, WEBP, or HEIC.' }, { status: 400 });
      }
    }
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 50MB.' }, { status: 400 });
    }

    // Normalize file extension — HEIC -> jpg for broader compatibility
    const rawExt = file.type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    // HEIC/HEIF files get converted to jpg extension for Supabase/S3 compatibility
    const ext = rawExt === 'heic' || rawExt === 'heif' ? 'jpg' : rawExt;
    const contentType = ext === 'jpg' ? 'image/jpeg' : (file.type || 'image/jpeg');
    const filename = `uploads/${uuidv4()}.${ext}`;
    const bytes = await file.arrayBuffer();

    const { error: uploadError } = await supabaseAdmin.storage
      .from('project-images')
      .upload(filename, bytes, { contentType, upsert: false });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabaseAdmin.storage
      .from('project-images')
      .getPublicUrl(filename);

    const publicUrl = urlData.publicUrl;

    // Update project with uploaded image URL
    if (projectId) {
      const { data: project } = await supabaseAdmin
        .from('projects')
        .select('uploaded_image_urls')
        .eq('id', projectId)
        .single();

      const existing = project?.uploaded_image_urls || [];
      await supabaseAdmin
        .from('projects')
        .update({ uploaded_image_urls: [...existing, publicUrl] })
        .eq('id', projectId);
    }

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    logApiError('projects.upload-image', error, logContext);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
