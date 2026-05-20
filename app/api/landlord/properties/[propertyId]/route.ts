import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

interface Params { params: Promise<{ propertyId: string }> }

// GET — single property with unit types + images
export async function GET(_: Request, { params }: Params) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { propertyId } = await params

    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        unit_types (
          *,
          unit_images ( id, cloudflare_url, is_cover, created_at )
        )
      `)
      .eq('id', propertyId)
      .eq('landlord_id', userId)
      .single()

    if (error) return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// PATCH — edit property details
export async function PATCH(req: Request, { params }: Params) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { propertyId } = await params
    const body = await req.json()

    // Verify ownership
    const { data: existing } = await supabase
      .from('properties')
      .select('id, status, landlord_id')
      .eq('id', propertyId)
      .single()

    if (!existing) return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    if (existing.landlord_id !== userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    if (existing.status === 'pending_review') return NextResponse.json({ error: 'Cannot edit while under review' }, { status: 409 })

    const { error } = await supabase
      .from('properties')
      .update({
        name:        body.name?.trim(),
        description: body.description?.trim() || null,
        county:      body.county?.trim(),
        location:    body.location?.trim(),
        address:     body.address?.trim() || null,
        updated_at:  new Date().toISOString(),
      })
      .eq('id', propertyId)

    if (error) return NextResponse.json({ error: 'Failed to update property' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// DELETE — delete draft property only
export async function DELETE(_: Request, { params }: Params) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { propertyId } = await params

    const { data: existing } = await supabase
      .from('properties')
      .select('id, status, landlord_id')
      .eq('id', propertyId)
      .single()

    if (!existing) return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    if (existing.landlord_id !== userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    if (existing.status !== 'draft') return NextResponse.json({ error: 'Only draft properties can be deleted' }, { status: 409 })

    const { error } = await supabase.from('properties').delete().eq('id', propertyId)
    if (error) return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}