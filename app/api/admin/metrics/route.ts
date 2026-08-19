import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function GET() {
  try {
    const { userId, sessionClaims } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const role = (sessionClaims?.publicMetadata as any)?.role
    if (!['admin', 'superadmin'].includes(role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    const now        = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const lastMonth  = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()

    const [
      totalUsers, totalLandlords, totalModerators,
      newUsersMonth, totalProperties, approvedProperties,
      pendingProperties, totalUnlocks, monthUnlocks,
      topProperties,
    ] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'user'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'landlord'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'moderator'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', monthStart),
      supabase.from('properties').select('id', { count: 'exact', head: true }),
      supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
      supabase.from('contact_unlocks').select('id', { count: 'exact', head: true }),
      supabase.from('contact_unlocks').select('id', { count: 'exact', head: true }).gte('unlocked_at', monthStart),
      supabase.from('properties').select('id, name, total_score, county').eq('status', 'approved').order('total_score', { ascending: false, nullsFirst: false }).limit(5),
    ])

    return NextResponse.json({
      data: {
        users: {
          total:      totalUsers.count      ?? 0,
          landlords:  totalLandlords.count  ?? 0,
          moderators: totalModerators.count ?? 0,
          new_month:  newUsersMonth.count   ?? 0,
        },
        properties: {
          total:    totalProperties.count    ?? 0,
          approved: approvedProperties.count ?? 0,
          pending:  pendingProperties.count  ?? 0,
        },
        unlocks: {
          total: totalUnlocks.count ?? 0,
          month: monthUnlocks.count ?? 0,
        },
        top_properties: topProperties.data ?? [],
      },
    })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}