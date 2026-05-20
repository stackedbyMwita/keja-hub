import { auth } from '@clerk/nextjs/server'
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

    const { applicationId, reason } = await req.json()
    if (!applicationId) return NextResponse.json({ error: 'Application ID required' }, { status: 400 })
    if (!reason?.trim()) return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 })

    const { data: app, error: fetchError } = await supabase
      .from('landlord_profiles')
      .select('id, user_id, status, full_name')
      .eq('id', applicationId)
      .single()

    if (fetchError || !app) return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    if (app.status !== 'pending') return NextResponse.json({ error: 'Application is no longer pending' }, { status: 409 })

    // Update application to rejected
    const { error } = await supabase
      .from('landlord_profiles')
      .update({
        status:           'rejected',
        reviewed_by:      userId,
        reviewed_at:      new Date().toISOString(),
        rejection_reason: reason.trim(),
      })
      .eq('id', applicationId)

    if (error) {
      console.error('❌ Reject error:', error)
      return NextResponse.json({ error: 'Failed to reject application' }, { status: 500 })
    }

    // Write activity log
    await supabase.from('activity_logs').insert({
      actor_id:    userId,
      action:      'rejected_landlord_application',
      target_type: 'landlord_profiles',
      target_id:   applicationId,
      metadata: {
        landlord_user_id: app.user_id,
        landlord_name:    app.full_name,
        reason:           reason.trim(),
      },
    })

    console.log(`✅ Application rejected — ${applicationId} by moderator ${userId}`)
    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('❌ Reject route error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}