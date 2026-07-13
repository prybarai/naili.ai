import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { count, error } = await supabaseAdmin
      .from('projects')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching project count:', error);
      return NextResponse.json({ count: 0 }, { status: 200 });
    }

    return NextResponse.json({ count: count ?? 0 }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    console.error('Unexpected error in project count:', err);
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}
