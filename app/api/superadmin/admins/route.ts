import { auth, clerkClient } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function requireSuperadmin() {
  const { userId, sessionClaims } = await auth()
  if (!userId) return null
  const role = (sessionClaims?.publicMetadata as any)?.role
  if (role !== 'superadmin') return null
  return userId
}

// GET — all admins with stats
export async function GET() {
  try {
    const superadminId = await requireSuperadmin()
    if (!superadminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: admins, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone_number, avatar_url, created_at, is_active, is_banned')
      .eq('role', 'admin')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const withStats = await Promise.all((admins ?? []).map(async (admin) => {
      const { count: totalActions } = await supabase
        .from('activity_logs')
        .select('id', { count: 'exact', head: true })
        .eq('actor_id', admin.id)

      const { data: lastActivity } = await supabase
        .from('activity_logs')
        .select('created_at')
        .eq('actor_id', admin.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      return {
        ...admin,
        total_actions: totalActions ?? 0,
        last_active:   lastActivity?.created_at ?? null,
      }
    }))

    return NextResponse.json({ data: withStats })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// POST — promote user to admin
export async function POST(req: Request) {
  try {
    const superadminId = await requireSuperadmin()
    if (!superadminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { email } = await req.json()
    if (!email?.trim()) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('email', email.trim())
      .maybeSingle()

    if (!profile) return NextResponse.json({ error: 'User not found. They must sign up first.' }, { status: 404 })
    if (profile.role === 'superadmin') return NextResponse.json({ error: 'Cannot modify superadmin accounts' }, { status: 403 })
    if (profile.role === 'admin') return NextResponse.json({ error: 'User is already an admin' }, { status: 409 })

    const clerk        = await clerkClient()
    const clerkUser    = await clerk.users.getUser(profile.id)
    const existingMeta = (clerkUser.publicMetadata ?? {}) as Record<string, unknown>

    await Promise.all([
      clerk.users.updateUserMetadata(profile.id, {
        publicMetadata: { ...existingMeta, role: 'admin' },
      }),
      supabase
        .from('profiles')
        .update({ role: 'admin', updated_at: new Date().toISOString() })
        .eq('id', profile.id),
    ])

    await supabase.from('activity_logs').insert({
      actor_id:    superadminId,
      action:      'promoted_to_admin',
      target_type: 'profiles',
      target_id:   profile.id,
      metadata:    { email: email.trim() },
    })

    return NextResponse.json({ success: true, message: 'User promoted to admin' })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}