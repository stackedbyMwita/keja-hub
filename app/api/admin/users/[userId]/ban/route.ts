import { auth, clerkClient } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

interface Params { params: Promise<{ userId: string }> }

export async function POST(req: Request, { params }: Params) {
  try {
    const { userId: adminId, sessionClaims } = await auth()
    if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const role = (sessionClaims?.publicMetadata as any)?.role
    if (!['admin', 'superadmin'].includes(role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    const { userId }     = await params
    const { ban, reason } = await req.json()

    const clerk  = await clerkClient()
    const user   = await clerk.users.getUser(userId)
    const meta   = (user.publicMetadata ?? {}) as Record<string, unknown>

    await Promise.all([
      clerk.users.updateUserMetadata(userId, {
        publicMetadata: { ...meta, is_banned: ban },
      }),
      supabase
        .from('profiles')
        .update({ is_banned: ban, updated_at: new Date().toISOString() })
        .eq('id', userId),
    ])

    await supabase.from('activity_logs').insert({
      actor_id:    adminId,
      action:      ban ? 'banned_user' : 'unbanned_user',
      target_type: 'profiles',
      target_id:   userId,
      metadata:    { reason: reason ?? null },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}