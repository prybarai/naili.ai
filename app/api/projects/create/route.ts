import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '../../../../lib/supabase/admin';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const schema = z.object({
  // Legacy fields (for backward compatibility)
  location_type: z.enum(['interior', 'exterior']).optional().default('interior'),
  project_category: z.string().optional().default('custom_project'),
  style_preference: z.string().optional().default('modern'),
  quality_tier: z.enum(['budget', 'mid', 'premium']).optional().default('mid'),
  address: z.string().optional(),
  notes: z.string().optional(),
  
  // Required fields
  zip_code: z.string().min(5),
  session_id: z.string().optional(),
  
  // Optional
  description: z.string().optional(),
});

async function getAuthUser() {
  try {
    const cookieStore = await cookies();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    });
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const params = schema.parse(body);
    
    // Get authenticated user (if any)
    const user = await getAuthUser();
    
    // Extract fields that might be in params but aren't in database schema
    const paramsAny = params as any;
    const project_type = paramsAny.project_type;
    const description = paramsAny.description;
    
    // Create project data with only valid database fields
    const projectData: any = {
      location_type: params.location_type,
      project_category: params.project_category,
      style_preference: params.style_preference,
      quality_tier: params.quality_tier,
      zip_code: params.zip_code,
      status: 'draft',
    };
    
    // Add optional fields if they exist
    if (params.address) projectData.address = params.address;
    if (params.notes) projectData.notes = params.notes;
    if (params.session_id) projectData.session_id = params.session_id;
    
    // Map project_type to project_category if provided
    if (project_type && project_type !== 'custom') {
      projectData.project_category = project_type;
    }
    
    // Add description to notes if provided
    if (description) {
      projectData.notes = description;
    }

    // Try to insert with user_id if authenticated.
    // If the user_id column doesn't exist yet (migration not run),
    // fall back to inserting without it so the flow never breaks.
    if (user) {
      const withUserId = { ...projectData, user_id: user.id };
      const { data, error } = await supabaseAdmin
        .from('projects')
        .insert(withUserId)
        .select()
        .single();
      
      if (!error) {
        return NextResponse.json({ project: data });
      }
      
      // If the error is about user_id column not existing, retry without it
      const msg = (error.message || '').toLowerCase();
      const isColumnError = msg.includes('user_id') || msg.includes('column') || error.code === '42703';
      if (isColumnError) {
        console.warn('user_id column not found — inserting without it. Run the migration to fix.');
        const { data: fallbackData, error: fallbackError } = await supabaseAdmin
          .from('projects')
          .insert(projectData)
          .select()
          .single();
        if (fallbackError) throw fallbackError;
        return NextResponse.json({ project: fallbackData });
      }
      
      // Some other DB error
      throw error;
    }
    
    // Anonymous user — no user_id needed
    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert(projectData)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ project: data });
  } catch (error) {
    console.error('create project error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create project';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
