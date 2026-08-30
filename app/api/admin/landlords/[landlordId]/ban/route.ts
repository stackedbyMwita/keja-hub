import { auth, clerkClient } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

interface Params { params: Promise<{ landlordId: string }> }

export async function POST(req: Request, { params }: Params) {
  try {
    const { userId, sessionClaims } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const role = (sessionClaims?.publicMetadata as any)?.role
    if (!['admin', 'superadmin'].includes(role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    const { landlordId }    = await params
    const { ban, reason }   = await req.json()

    // Hide all their properties when banning
    if (ban) {
      await supabase
        .from('properties')
        .update({ status: 'suspended', suspended_reason: 'Owner account banned' })
        .eq('landlord_id', landlordId)
        .in('status', ['approved', 'pending_review'])
    } else {
      // Restore previously suspended-by-ban properties back to approved
      await supabase
        .from('properties')
        .update({ status: 'approved', suspended_reason: null })
        .eq('landlord_id', landlordId)
        .eq('suspended_reason', 'Owner account banned')
    }

    // Update Supabase profile
    await supabase
      .from('profiles')
      .update({
        is_banned:  ban,
        is_active:  !ban,
        updated_at: new Date().toISOString(),
      })
      .eq('id', landlordId)

    // Update Clerk metadata
    const clerk    = await clerkClient()
    const user     = await clerk.users.getUser(landlordId)
    const meta     = (user.publicMetadata ?? {}) as Record<string, unknown>
    await clerk.users.updateUserMetadata(landlordId, {
      publicMetadata: { ...meta, is_banned: ban, is_active: !ban },
    })

    await supabase.from('activity_logs').insert({
      actor_id:    userId,
      action:      ban ? 'banned_landlord' : 'unbanned_landlord',
      target_type: 'profiles',
      target_id:   landlordId,
      metadata:    { reason: reason ?? null },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('❌ Ban landlord error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}