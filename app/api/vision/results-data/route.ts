import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase/admin';
import { logApi, logApiError } from '../../../../lib/apiLog';

/**
 * GET /api/vision/results-data?id=<project_id>
 *
 * Returns all results data for a project in a single call:
 * project, estimate, materials, brief, concept images.
 * Used by the results page for polling.
 */
export async function GET(req: NextRequest) {
  let projectId: string | null = null;
  try {
    const { searchParams } = new URL(req.url);
    projectId = searchParams.get('id');
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const [projectRes, estimateRes, materialsRes, briefRes] = await Promise.all([
      supabaseAdmin.from('projects').select('*').eq('id', projectId).single(),
      supabaseAdmin.from('estimates').select('*').eq('project_id', projectId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabaseAdmin.from('material_lists').select('*').eq('project_id', projectId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabaseAdmin.from('project_briefs').select('*').eq('project_id', projectId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ]);

    if (projectRes.error) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({
      project: projectRes.data,
      estimate: estimateRes.data || null,
      materials: materialsRes.data || null,
      brief: briefRes.data || null,
    });
  } catch (error) {
    logApiError('results-data', error, { projectId });
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}
