import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

interface Params { params: Promise<{ propertyId: string }> }

export async function POST(_: Request, { params }: Params) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { propertyId } = await params

    const { data: property } = await supabase
      .from('properties')
      .select('id, status, landlord_id')
      .eq('id', propertyId)
      .single()

    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    if (property.landlord_id !== userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    if (property.status !== 'draft' && property.status !== 'rejected') {
      return NextResponse.json({ error: 'Only draft or rejected properties can be submitted' }, { status: 409 })
    }

    // Check has at least one unit type
    const { count } = await supabase
      .from('unit_types')
      .select('id', { count: 'exact', head: true })
      .eq('property_id', propertyId)

    if (!count || count === 0) {
      return NextResponse.json({ error: 'Add at least one unit type before submitting' }, { status: 400 })
    }

    const { error } = await supabase
      .from('properties')
      .update({
        status:       'pending_review',
        submitted_at: new Date().toISOString(),
        rejection_reason: null,
        updated_at:   new Date().toISOString(),
      })
      .eq('id', propertyId)

    if (error) return NextResponse.json({ error: 'Failed to submit property' }, { status: 500 })

    await supabase.from('activity_logs').insert({
      actor_id:    userId,
      action:      'submitted_property_for_review',
      target_type: 'properties',
      target_id:   propertyId,
      metadata:    {},
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}