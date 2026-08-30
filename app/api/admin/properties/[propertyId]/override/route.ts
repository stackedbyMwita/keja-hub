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
    const { userId, sessionClaims } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const role = (sessionClaims?.publicMetadata as any)?.role
    if (!['admin', 'superadmin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { propertyId }              = await params
    const { action, reason, notes }   = await req.json()

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Action must be approve or reject' }, { status: 400 })
    }
    if (action === 'reject' && !reason?.trim()) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 })
    }

    const { data: property } = await supabase
      .from('properties')
      .select('id, name, status, landlord_id')
      .eq('id', propertyId)
      .single()

    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 })

    const update = action === 'approve'
      ? {
          status:           'approved',
          approved_by:      userId,
          approved_at:      new Date().toISOString(),
          rejection_reason: null,
          suspended_reason: null,
          moderator_notes:  notes?.trim() || null,
          updated_at:       new Date().toISOString(),
        }
      : {
          status:           'rejected',
          rejection_reason: reason.trim(),
          approved_by:      null,
          approved_at:      null,
          moderator_notes:  notes?.trim() || null,
          updated_at:       new Date().toISOString(),
        }

    const { error } = await supabase
      .from('properties')
      .update(update)
      .eq('id', propertyId)

    if (error) {
      console.error('❌ Property override error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await supabase.from('activity_logs').insert({
      actor_id:    userId,
      action:      action === 'approve' ? 'admin_approved_property' : 'admin_rejected_property',
      target_type: 'properties',
      target_id:   propertyId,
      metadata: {
        property_name:    property.name,
        landlord_id:      property.landlord_id,
        previous_status:  property.status,
        reason:           reason?.trim() ?? null,
        notes:            notes?.trim()  ?? null,
        override:         true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('❌ Property override error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}