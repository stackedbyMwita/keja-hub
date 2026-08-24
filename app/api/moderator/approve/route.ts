import { auth, clerkClient } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { applicationId, notes } = await req.json()
    if (!applicationId) return NextResponse.json({ error: 'Application ID required' }, { status: 400 })

    // Fetch application to get the landlord's user_id
    const { data: app, error: fetchError } = await supabase
      .from('landlord_profiles')
      .select('id, user_id, phone_number, status, full_name')
      .eq('id', applicationId)
      .single()

    if (fetchError || !app) return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    if (app.status !== 'pending') return NextResponse.json({ error: 'Application is no longer pending' }, { status: 409 })

    const landlordUserId = app.user_id
    const landlordPhone = app.phone_number

    // ── Step 1: Update landlord_profiles ─────────────────────────────────
    const { error: profileError } = await supabase
      .from('landlord_profiles')
      .update({
        status:                'approved',
        reviewed_by:           userId,
        reviewed_at:           new Date().toISOString(),
        rejection_reason:      null,
      })
      .eq('id', applicationId)

    if (profileError) {
      console.error('❌ landlord_profiles update failed:', profileError)
      return NextResponse.json({ error: 'Failed to approve application' }, { status: 500 })
    }

    // ── Step 2: Update profiles.role to landlord ──────────────────────────
    const profileUpdateData: any = {
      role: 'landlord',
      updated_at: new Date().toISOString()
    }

    // Only update phone if it exists in the landlord_profiles record
    if (landlordPhone) {
      profileUpdateData.phone_number = landlordPhone
    }
    const { error: roleError } = await supabase
      .from('profiles')
      .update(profileUpdateData)
      .eq('id', landlordUserId)

    if (roleError) {
      console.error('❌ profiles role update failed:', roleError)
      return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 })
    }

    // ── Step 3: Update Clerk publicMetadata ───────────────────────────────
    const clerk = await clerkClient()
    const clerkUser = await clerk.users.getUser(landlordUserId)
    const existingMeta = (clerkUser.publicMetadata ?? {}) as Record<string, unknown>

    await clerk.users.updateUserMetadata(landlordUserId, {
      publicMetadata: { ...existingMeta, role: 'landlord' },
    })

    // ── Step 4: Write activity log ────────────────────────────────────────
    await supabase.from('activity_logs').insert({
      actor_id:    userId,
      action:      'approved_landlord_application',
      target_type: 'landlord_profiles',
      target_id:   applicationId,
      metadata: {
        landlord_user_id: landlordUserId,
        landlord_name:    app.full_name,
        landlord_phone: landlordPhone || null,
        notes:            notes ?? null,
      },
    })

    console.log(`✅ Landlord approved — ${landlordUserId} by moderator ${userId}`)
    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('❌ Approve route error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}