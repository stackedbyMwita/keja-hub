import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

interface Params { params: Promise<{ propertyId: string }> }

// POST — add a new unit type to an existing property
export async function POST(req: Request, { params }: Params) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { propertyId } = await params
    const body = await req.json()

    // Verify ownership
    const { data: property } = await supabase
      .from('properties')
      .select('id, landlord_id, status')
      .eq('id', propertyId)
      .single()

    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    if (property.landlord_id !== userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    if (property.status === 'pending_review') return NextResponse.json({ error: 'Cannot add units while under review' }, { status: 409 })

    const { error } = await supabase.from('unit_types').insert({
      property_id:     propertyId,
      type:            body.type,
      price:           Number(body.price),
      description:     body.description?.trim() || null,
      amenities:       body.amenities ?? [],
      total_count:     Number(body.total_count),
      available_count: 0,
      status:          'draft',
    })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'This unit type already exists for this property' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Failed to add unit type' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}