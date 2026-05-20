import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

interface Params { params: Promise<{ propertyId: string; unitTypeId: string }> }

// PATCH — update available_count (the availability toggle)
export async function PATCH(req: Request, { params }: Params) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { propertyId, unitTypeId } = await params
    const { available_count } = await req.json()

    if (available_count === undefined || available_count < 0) {
      return NextResponse.json({ error: 'Valid available count required' }, { status: 400 })
    }

    // Verify ownership
    const { data: property } = await supabase
      .from('properties')
      .select('id, landlord_id, status')
      .eq('id', propertyId)
      .single()

    if (!property || property.landlord_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get unit type to validate count
    const { data: unitType } = await supabase
      .from('unit_types')
      .select('id, total_count, status')
      .eq('id', unitTypeId)
      .single()

    if (!unitType) return NextResponse.json({ error: 'Unit type not found' }, { status: 404 })
    if (unitType.status !== 'active') return NextResponse.json({ error: 'Unit type must be active' }, { status: 409 })
    if (available_count > unitType.total_count) {
      return NextResponse.json(
        { error: `Available count cannot exceed total count (${unitType.total_count})` },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('unit_types')
      .update({
        available_count,
        updated_at: new Date().toISOString(),
      })
      .eq('id', unitTypeId)

    if (error) return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 })

    return NextResponse.json({ success: true, available_count })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}