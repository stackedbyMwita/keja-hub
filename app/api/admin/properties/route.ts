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
    const status = searchParams.get('status')
    const search = searchParams.get('search')?.trim()

    let query = supabase
      .from('properties')
      .select(`
        id, name, county, location, status, total_score,
        submitted_at, approved_at, created_at,
        profiles!properties_landlord_id_fkey ( full_name, phone_number ),
        unit_types ( id, type, total_count )
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (status && status !== 'all') query = query.eq('status', status)
    if (search) query = query.ilike('name', `%${search}%`)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}