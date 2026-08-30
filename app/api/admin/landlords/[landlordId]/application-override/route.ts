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
    if (!['admin', 'superadmin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { landlordId }            = await params
    const { action, reason }        = await req.json()

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Action must be approve or reject' }, { status: 400 })
    }
    if (action === 'reject' && !reason?.trim()) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 })
    }

    const { data: application } = await supabase
      .from('landlord_profiles')
      .select('id, status, full_name')
      .eq('user_id', landlordId)
      .single()

    if (!application) {
      return NextResponse.json({ error: 'No landlord application found' }, { status: 404 })
    }

    if (action === 'approve') {
      // Update landlord_profiles
      await supabase
        .from('landlord_profiles')
        .update({
          status:           'approved',
          reviewed_by:      userId,
          reviewed_at:      new Date().toISOString(),
          rejection_reason: null,
          updated_at:       new Date().toISOString(),
        })
        .eq('user_id', landlordId)

      // Update profile role
      await supabase
        .from('profiles')
        .update({
          role:       'landlord',
          is_active:  true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', landlordId)

      // Update Clerk metadata
      const clerk    = await clerkClient()
      const user     = await clerk.users.getUser(landlordId)
      const meta     = (user.publicMetadata ?? {}) as Record<string, unknown>
      await clerk.users.updateUserMetadata(landlordId, {
        publicMetadata: { ...meta, role: 'landlord', is_active: true },
      })

    } else {
      // Reject
      await supabase
        .from('landlord_profiles')
        .update({
          status:           'rejected',
          reviewed_by:      userId,
          reviewed_at:      new Date().toISOString(),
          rejection_reason: reason.trim(),
          updated_at:       new Date().toISOString(),
        })
        .eq('user_id', landlordId)
    }

    await supabase.from('activity_logs').insert({
      actor_id:    userId,
      action:      action === 'approve'
        ? 'admin_approved_landlord_application'
        : 'admin_rejected_landlord_application',
      target_type: 'landlord_profiles',
      target_id:   application.id,
      metadata: {
        landlord_name:     application.full_name,
        landlord_user_id:  landlordId,
        previous_status:   application.status,
        reason:            reason?.trim() ?? null,
        override:          true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('❌ Application override error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}