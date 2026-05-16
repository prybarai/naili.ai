import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Get project error:', error);
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Add a convenience image_url field (first uploaded image)
    // VisionStartFlow expects this field to prefill the upload
    const project = {
      ...data,
      image_url: data.uploaded_image_urls?.[0] || null,
    };

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}
