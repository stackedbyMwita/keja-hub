import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function requireAdmin() {
  const { userId, sessionClaims } = await auth()
  if (!userId) return null
  const role = (sessionClaims?.publicMetadata as any)?.role
  if (!['admin', 'superadmin'].includes(role)) return null
  return userId
}

export async function GET(req: Request) {
  try {
    const adminId = await requireAdmin()
    if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const view = searchParams.get('view') ?? 'overview'

    // Overview stats
    if (view === 'overview') {
      const now        = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const hourAgo    = new Date(Date.now() - 3600000).toISOString()

      const [total, monthly, topUnits, topUsers, suspicious] = await Promise.all([

        // Total all-time unlocks
        supabase
          .from('contact_unlocks')
          .select('id', { count: 'exact', head: true }),

        // This month
        supabase
          .from('contact_unlocks')
          .select('id', { count: 'exact', head: true })
          .gte('unlocked_at', monthStart),

        // Most unlocked unit types
        supabase
          .from('unit_types')
          .select(`
            id, type, price, unlock_count,
            properties!inner ( name, county, location )
          `)
          .gt('unlock_count', 0)
          .order('unlock_count', { ascending: false })
          .limit(10),

        // Users with most unlocks
        supabase
          .from('contact_unlocks')
          .select(`
            user_id,
            profiles!contact_unlocks_user_id_fkey (
              full_name, email, avatar_url, phone_number
            )
          `)
          .order('unlocked_at', { ascending: false }),

        // Suspicious: users with 50+ unlocks in last hour
        supabase
          .from('contact_unlocks')
          .select('user_id')
          .gte('unlocked_at', hourAgo),
      ])

      // Group users by unlock count
      const userCounts = new Map<string, { count: number; profile: any }>()
      for (const unlock of (topUsers.data ?? [])) {
        const uid = unlock.user_id
        const existing = userCounts.get(uid)
        userCounts.set(uid, {
          count:   (existing?.count ?? 0) + 1,
          profile: (unlock as any).profiles,
        })
      }
      const topUsersList = Array.from(userCounts.entries())
        .map(([uid, val]) => ({ user_id: uid, unlock_count: val.count, profile: val.profile }))
        .sort((a, b) => b.unlock_count - a.unlock_count)
        .slice(0, 10)

      // Suspicious users (50+ unlocks in last hour)
      const suspiciousMap = new Map<string, number>()
      for (const row of (suspicious.data ?? [])) {
        suspiciousMap.set(row.user_id, (suspiciousMap.get(row.user_id) ?? 0) + 1)
      }
      const suspiciousUsers = Array.from(suspiciousMap.entries())
        .filter(([, count]) => count >= 50)
        .map(([user_id, count]) => ({ user_id, unlock_count_last_hour: count }))

      return NextResponse.json({
        data: {
          total:          total.count ?? 0,
          monthly:        monthly.count ?? 0,
          top_units:      topUnits.data ?? [],
          top_users:      topUsersList,
          suspicious:     suspiciousUsers,
        },
      })
    }

    // Per-user unlocks
    if (view === 'user') {
      const userId = searchParams.get('userId')
      if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

      const { data, error } = await supabase
        .from('contact_unlocks')
        .select(`
          id, unlocked_at,
          unit_types!inner (
            id, type, price,
            properties!inner ( name, county, location )
          )
        `)
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false })

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ data })
    }

    // Per-property unlocks
    if (view === 'property') {
      const propertyId = searchParams.get('propertyId')
      if (!propertyId) return NextResponse.json({ error: 'propertyId required' }, { status: 400 })

      const { data, error } = await supabase
        .from('contact_unlocks')
        .select(`
          id, unlocked_at, user_id,
          profiles!contact_unlocks_user_id_fkey (
            full_name, email, phone_number
          ),
          unit_types!inner (
            id, type, price, property_id
          )
        `)
        .eq('unit_types.property_id', propertyId)
        .order('unlocked_at', { ascending: false })

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ data })
    }

    return NextResponse.json({ error: 'Invalid view' }, { status: 400 })

  } catch (err) {
    console.error('❌ Admin unlocks error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}