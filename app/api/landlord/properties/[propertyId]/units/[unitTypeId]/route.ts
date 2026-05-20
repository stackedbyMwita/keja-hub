import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

interface Params { params: Promise<{ propertyId: string; unitTypeId: string }> }

// PATCH — edit unit type details or activate/deactivate
export async function PATCH(req: Request, { params }: Params) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { propertyId, unitTypeId } = await params
    const body = await req.json()

    // Verify ownership through property
    const { data: property } = await supabase
      .from('properties')
      .select('id, landlord_id, status')
      .eq('id', propertyId)
      .single()

    if (!property || property.landlord_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Only approved properties can have active units
    if (body.status === 'active' && property.status !== 'approved') {
      return NextResponse.json(
        { error: 'Property must be approved before activating units' },
        { status: 409 }
      )
    }

    const updateData: Record<string, any> = { updated_at: new Date().toISOString() }
    if (body.price !== undefined)       updateData.price       = Number(body.price)
    if (body.description !== undefined) updateData.description = body.description?.trim() || null
    if (body.amenities !== undefined)   updateData.amenities   = body.amenities
    if (body.total_count !== undefined) updateData.total_count = Number(body.total_count)
    if (body.status !== undefined)      updateData.status      = body.status

    const { error } = await supabase
      .from('unit_types')
      .update(updateData)
      .eq('id', unitTypeId)
      .eq('property_id', propertyId)

    if (error) return NextResponse.json({ error: 'Failed to update unit type' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// DELETE — remove unit type (draft only)
export async function DELETE(_: Request, { params }: Params) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { propertyId, unitTypeId } = await params

    const { data: property } = await supabase
      .from('properties')
      .select('id, landlord_id')
      .eq('id', propertyId)
      .single()

    if (!property || property.landlord_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { error } = await supabase
      .from('unit_types')
      .delete()
      .eq('id', unitTypeId)
      .eq('property_id', propertyId)
      .eq('status', 'draft')

    if (error) return NextResponse.json({ error: 'Failed to delete unit type' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}