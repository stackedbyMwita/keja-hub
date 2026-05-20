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
    const { notes } = await req.json()

    // Fetch property
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

    // ── Step 1: Approve property ──────────────────────────────────────────
    const { error: approveError } = await supabase
      .from('properties')
      .update({
        status:           'approved',
        approved_by:      userId,
        approved_at:      new Date().toISOString(),
        rejection_reason: null,
        moderator_notes:  notes?.trim() || null,
        updated_at:       new Date().toISOString(),
      })
      .eq('id', propertyId)

    if (approveError) {
      console.error('❌ Property approve error:', approveError)
      return NextResponse.json({ error: 'Failed to approve property' }, { status: 500 })
    }

    // ── Step 2: Write activity log ────────────────────────────────────────
    await supabase.from('activity_logs').insert({
      actor_id:    userId,
      action:      'approved_property',
      target_type: 'properties',
      target_id:   propertyId,
      metadata: {
        property_name:    property.name,
        landlord_user_id: property.landlord_id,
        notes:            notes ?? null,
      },
    })

    console.log(`✅ Property approved — ${propertyId} by ${userId}`)
    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('❌ Property approve error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}