import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '../../../../lib/supabase/admin';

const schema = z.object({
  project_id: z.string().uuid(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(7, 'Phone number is required'),
  prefer_real_estimate: z.boolean().optional().default(false),
  timing: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * POST /api/vision/submit-lead
 *
 * Saves homeowner contact info as a contractor lead.
 * Creates records in:
 * 1. lead_connections (new table for vision result lead capture)
 * 2. leads (existing table for backward compatibility)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const params = schema.parse(body);

    // 1. Save to lead_connections
    const { data: connection, error: connError } = await supabaseAdmin
      .from('lead_connections')
      .insert({
        project_id: params.project_id,
        first_name: params.first_name,
        last_name: params.last_name,
        email: params.email,
        phone: params.phone,
        prefer_real_estimate: params.prefer_real_estimate || false,
        timing: params.timing || null,
        notes: params.notes || null,
        source: 'naili_results',
        status: 'new',
      })
      .select()
      .single();

    if (connError) {
      console.error('[submit-lead] lead_connections insert error:', connError);
      throw connError;
    }

    // 2. Also save to legacy leads table for backward compatibility
    // Load project for context
    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('zip_code, project_category')
      .eq('id', params.project_id)
      .single();

    try {
      await supabaseAdmin.from('leads').insert({
        project_id: params.project_id,
        first_name: params.first_name,
        last_name: params.last_name,
        email: params.email,
        phone: params.phone,
        zip_code: project?.zip_code || '',
        project_type: project?.project_category || '',
        preferred_timing: params.timing || 'within_month',
        priority: 'quality',
        notes: params.notes || null,
        source: 'naili_results',
        status: 'new',
      });
    } catch (legacyErr) {
      // Legacy table insert is best-effort — don't fail on it
      console.warn('[submit-lead] legacy leads insert (optional):', legacyErr);
    }

    // 3. Update project status
    await supabaseAdmin
      .from('projects')
      .update({ status: 'lead_submitted' })
      .eq('id', params.project_id);

    return NextResponse.json({
      success: true,
      connection_id: connection.id,
      message: 'Your request has been submitted. A Naili advisor will be in touch.',
    });
  } catch (error) {
    console.error('[submit-lead] error:', error);
    return NextResponse.json(
      { error: 'Failed to submit your information. Please try again.' },
      { status: 500 }
    );
  }
}
