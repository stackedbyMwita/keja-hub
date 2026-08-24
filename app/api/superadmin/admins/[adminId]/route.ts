import { auth, clerkClient } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

interface Params { params: Promise<{ adminId: string }> }

async function requireSuperadmin() {
  const { userId, sessionClaims } = await auth()
  if (!userId) return null
  const role = (sessionClaims?.publicMetadata as any)?.role
  if (role !== 'superadmin') return null
  return userId
}

// PATCH — demote to user OR deactivate/reactivate
export async function PATCH(req: Request, { params }: Params) {
  try {
    const superadminId = await requireSuperadmin()
    if (!superadminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { adminId }              = await params
    const { action, is_active }    = await req.json()

    const clerk        = await clerkClient()
    const clerkUser    = await clerk.users.getUser(adminId)
    const existingMeta = (clerkUser.publicMetadata ?? {}) as Record<string, unknown>

    if (action === 'demote') {
      await Promise.all([
        clerk.users.updateUserMetadata(adminId, {
          publicMetadata: { ...existingMeta, role: 'user' },
        }),
        supabase
          .from('profiles')
          .update({ role: 'user', updated_at: new Date().toISOString() })
          .eq('id', adminId),
      ])

      await supabase.from('activity_logs').insert({
        actor_id:    superadminId,
        action:      'demoted_admin',
        target_type: 'profiles',
        target_id:   adminId,
        metadata:    {},
      })
    } else if (action === 'toggle_active') {
      await Promise.all([
        clerk.users.updateUserMetadata(adminId, {
          publicMetadata: { ...existingMeta, is_active },
        }),
        supabase
          .from('profiles')
          .update({ is_active, updated_at: new Date().toISOString() })
          .eq('id', adminId),
      ])

      await supabase.from('activity_logs').insert({
        actor_id:    superadminId,
        action:      is_active ? 'reactivated_admin' : 'deactivated_admin',
        target_type: 'profiles',
        target_id:   adminId,
        metadata:    {},
      })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}