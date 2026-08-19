import { auth, clerkClient } from '@clerk/nextjs/server'
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

// GET — all moderators with stats
export async function GET() {
  try {
    const adminId = await requireAdmin()
    if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: moderators, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone_number, avatar_url, created_at, is_active, is_banned')
      .eq('role', 'moderator')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Fetch stats for each moderator from activity_logs
    const now        = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const statsPromises = (moderators ?? []).map(async (mod) => {
      const [totalReviews, monthReviews, lastActivity] = await Promise.all([
        supabase
          .from('activity_logs')
          .select('id', { count: 'exact', head: true })
          .eq('actor_id', mod.id)
          .in('action', ['approved_property', 'rejected_property', 'approved_landlord_application', 'rejected_landlord_application']),
        supabase
          .from('activity_logs')
          .select('id', { count: 'exact', head: true })
          .eq('actor_id', mod.id)
          .in('action', ['approved_property', 'rejected_property', 'approved_landlord_application', 'rejected_landlord_application'])
          .gte('created_at', monthStart),
        supabase
          .from('activity_logs')
          .select('created_at')
          .eq('actor_id', mod.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single(),
      ])

      return {
        ...mod,
        total_reviews:  totalReviews.count ?? 0,
        month_reviews:  monthReviews.count ?? 0,
        last_active:    lastActivity.data?.created_at ?? null,
      }
    })

    const data = await Promise.all(statsPromises)
    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// POST — invite new moderator
export async function POST(req: Request) {
  try {
    const adminId = await requireAdmin()
    if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { email } = await req.json()
    if (!email?.trim()) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

    // Check not already a user in our system
    const { data: existing } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('email', email.trim())
      .maybeSingle()

    if (existing) {
      // Update existing user to moderator
      const clerk  = await clerkClient()
      const clerkUser = await clerk.users.getUserList({ emailAddress: [email.trim()] })

      if (clerkUser.data.length > 0) {
        const clerkUserId   = clerkUser.data[0].id
        const existingMeta  = (clerkUser.data[0].publicMetadata ?? {}) as Record<string, unknown>

        await clerk.users.updateUserMetadata(clerkUserId, {
          publicMetadata: { ...existingMeta, role: 'moderator' },
        })

        await supabase
          .from('profiles')
          .update({ role: 'moderator', updated_at: new Date().toISOString() })
          .eq('id', clerkUserId)

        await supabase.from('activity_logs').insert({
          actor_id:    adminId,
          action:      'promoted_to_moderator',
          target_type: 'profiles',
          target_id:   clerkUserId,
          metadata:    { email: email.trim() },
        })

        return NextResponse.json({ success: true, message: 'User promoted to moderator' })
      }
    }

    return NextResponse.json({ error: 'User not found. They must sign up first.' }, { status: 404 })
  } catch (err) {
    console.error('❌ Invite moderator error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}