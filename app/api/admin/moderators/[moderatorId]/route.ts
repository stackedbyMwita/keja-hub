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

interface Params { params: Promise<{ moderatorId: string }> }

// GET — moderator detail + full activity
export async function GET(_: Request, { params }: Params) {
  try {
    const adminId = await requireAdmin()
    if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { moderatorId } = await params

    const [profile, activity] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('id', moderatorId)
        .eq('role', 'moderator')
        .single(),
      supabase
        .from('activity_logs')
        .select('*')
        .eq('actor_id', moderatorId)
        .order('created_at', { ascending: false })
        .limit(50),
    ])

    if (!profile.data) return NextResponse.json({ error: 'Moderator not found' }, { status: 404 })

    return NextResponse.json({ data: { ...profile.data, activity: activity.data ?? [] } })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// PATCH — deactivate/reactivate moderator
export async function PATCH(req: Request, { params }: Params) {
  try {
    const adminId = await requireAdmin()
    if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { moderatorId } = await params
    const { is_active }   = await req.json()

    const clerk       = await clerkClient()
    const clerkUser   = await clerk.users.getUser(moderatorId)
    const existingMeta = (clerkUser.publicMetadata ?? {}) as Record<string, unknown>

    await Promise.all([
      clerk.users.updateUserMetadata(moderatorId, {
        publicMetadata: { ...existingMeta, is_active },
      }),
      supabase
        .from('profiles')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', moderatorId),
    ])

    await supabase.from('activity_logs').insert({
      actor_id:    adminId,
      action:      is_active ? 'reactivated_moderator' : 'deactivated_moderator',
      target_type: 'profiles',
      target_id:   moderatorId,
      metadata:    {},
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}