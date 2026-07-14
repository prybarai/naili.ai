import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * GET /api/health
 *
 * Lightweight health check endpoint that probes:
 * - Supabase DB connectivity (SELECT 1)
 * - DeepSeek API key presence
 * - OpenAI API key presence
 * - Supabase storage bucket existence
 */
export async function GET() {
  const timestamp = new Date().toISOString();
  const checks: Record<string, boolean | string> = {};

  // 1. Supabase DB connectivity
  try {
    const { error } = await supabase.from('projects').select('id').limit(1);
    checks.supabase = !error;
    if (error) {
      checks.supabase = false;
      checks.supabase_detail = String(error.message);
    }
  } catch (err) {
    checks.supabase = false;
    checks.supabase_detail = err instanceof Error ? err.message : String(err);
  }

  // 2. API key presence
  checks.deepseek = !!process.env.DEEPSEEK_API_KEY;
  checks.openai = !!process.env.OPENAI_API_KEY;

  // 3. Supabase storage bucket existence
  try {
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      checks.supabase_storage = false;
      checks.supabase_storage_detail = bucketsError.message;
    } else {
      checks.supabase_storage =
        Array.isArray(buckets) && buckets.some((b) => b.name === 'project-images');
    }
  } catch (err) {
    checks.supabase_storage = false;
    checks.supabase_storage_detail = err instanceof Error ? err.message : String(err);
  }

  const allCriticalOk = checks.supabase === true;
  return NextResponse.json(
    {
      status: allCriticalOk ? 'ok' : 'degraded',
      version: '2.0',
      timestamp,
      checks,
    },
    { status: allCriticalOk ? 200 : 503 }
  );
}
