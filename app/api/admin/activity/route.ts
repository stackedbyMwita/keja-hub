import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function GET(req: Request) {
  try {
    const { userId, sessionClaims } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const role = (sessionClaims?.publicMetadata as any)?.role
    if (!['admin', 'superadmin'].includes(role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')
    const limit  = parseInt(searchParams.get('limit') ?? '50')

    let query = supabase
      .from('activity_logs')
      .select(`
        id, action, target_type, target_id, metadata, created_at,
        profiles!activity_logs_actor_id_fkey ( full_name, email, role, avatar_url )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (action && action !== 'all') query = query.eq('action', action)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
