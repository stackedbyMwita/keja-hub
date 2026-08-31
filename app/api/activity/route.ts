import { getActionsForCategory, getDateRangeFilter } from '@/components/Activity/ActivityUtils'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const PAGE_SIZE = 20

export async function GET(req: Request) {
  try {
    const { userId, sessionClaims } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const role = (sessionClaims?.publicMetadata as any)?.role ?? 'user'
    const { searchParams } = new URL(req.url)

    const page      = parseInt(searchParams.get('page') ?? '1')
    const category  = searchParams.get('category') ?? 'all'
    const dateRange = searchParams.get('dateRange') ?? 'all'
    const search    = searchParams.get('search')?.trim() ?? ''
    const actorId   = searchParams.get('actorId') ?? null
    const targetId  = searchParams.get('targetId') ?? null
    const targetType= searchParams.get('targetType') ?? null

    const from = (page - 1) * PAGE_SIZE
    const to   = from + PAGE_SIZE - 1

    let query = supabase
      .from('activity_logs')
      .select(`
        id, action, target_type, target_id,
        metadata, created_at,
        profiles!activity_logs_actor_id_fkey (
          id, full_name, email, role, avatar_url
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    // ── Role-based scoping ────────────────────────────────────────────────────
    // Moderators only see their own logs
    // Landlords only see their own logs
    // Admins and superadmins see all logs
    if (role === 'moderator' || role === 'landlord') {
      query = query.eq('actor_id', userId)
    } else if (actorId) {
      query = query.eq('actor_id', actorId)
    }

    // Target filters
    if (targetId)   query = query.eq('target_id',   targetId)
    if (targetType) query = query.eq('target_type', targetType)

    // Category filter
    const categoryActions = getActionsForCategory(category)
    if (categoryActions.length > 0) {
      query = query.in('action', categoryActions)
    }

    // Date range filter
    const dateFrom = getDateRangeFilter(dateRange)
    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('❌ Activity logs error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Search filter — done in memory since metadata is JSONB
    let filtered = data ?? []
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(log => {
        const meta   = log.metadata ?? {}
        const actor  = (log.profiles as any)
        const target = [
          meta.property_name, meta.landlord_name,
          meta.full_name, meta.email, meta.new_mod_name,
          actor?.full_name, actor?.email,
        ].filter(Boolean).join(' ').toLowerCase()
        return target.includes(q) || log.action.includes(q.replace(/\s/g, '_'))
      })
    }

    return NextResponse.json({
      data:       filtered,
      total:      count ?? 0,
      page,
      pageSize:   PAGE_SIZE,
      totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
    })
  } catch (err) {
    console.error('❌ Activity route error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
