import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

interface Params { params: Promise<{ propertyId: string }> }

export async function POST(req: Request, { params }: Params) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { propertyId } = await params
    const { reason } = await req.json()

    if (!reason?.trim()) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 })
    }

    const { data: property, error: fetchError } = await supabase
      .from('properties')
      .select('id, landlord_id, status, name')
      .eq('id', propertyId)
      .single()

    if (fetchError || !property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    if (property.status !== 'pending_review') {
      return NextResponse.json({ error: 'Property is not pending review' }, { status: 409 })
    }

    // ── Reject property ───────────────────────────────────────────────────
    const { error: rejectError } = await supabase
      .from('properties')
      .update({
        status:           'rejected',
        rejection_reason: reason.trim(),
        approved_by:      null,
        approved_at:      null,
        updated_at:       new Date().toISOString(),
      })
      .eq('id', propertyId)

    if (rejectError) {
      console.error('❌ Property reject error:', rejectError)
      return NextResponse.json({ error: 'Failed to reject property' }, { status: 500 })
    }

    // ── Write activity log ────────────────────────────────────────────────
    await supabase.from('activity_logs').insert({
      actor_id:    userId,
      action:      'rejected_property',
      target_type: 'properties',
      target_id:   propertyId,
      metadata: {
        property_name:    property.name,
        landlord_user_id: property.landlord_id,
        reason:           reason.trim(),
      },
    })

    console.log(`✅ Property rejected — ${propertyId} by ${userId}`)
    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('❌ Property reject error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}