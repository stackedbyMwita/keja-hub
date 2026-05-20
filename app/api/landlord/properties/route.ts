import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// GET — fetch all properties for the landlord
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        unit_types (
          id, type, price, total_count, available_count, status, created_at
        )
      `)
      .eq('landlord_id', userId)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// POST — create new property with unit types
export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { name, description, county, location, address, unit_types } = body

    if (!name?.trim())     return NextResponse.json({ error: 'Property name is required' }, { status: 400 })
    if (!county?.trim())   return NextResponse.json({ error: 'County is required' }, { status: 400 })
    if (!location?.trim()) return NextResponse.json({ error: 'Location is required' }, { status: 400 })
    if (!unit_types?.length) return NextResponse.json({ error: 'At least one unit type is required' }, { status: 400 })

    // Validate unit types
    for (const ut of unit_types) {
      if (!ut.type)           return NextResponse.json({ error: 'Unit type is required' }, { status: 400 })
      if (!ut.price || ut.price < 1) return NextResponse.json({ error: 'Valid price is required' }, { status: 400 })
      if (!ut.total_count || ut.total_count < 1) return NextResponse.json({ error: 'Unit count must be at least 1' }, { status: 400 })
    }

    // Create property
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .insert({
        landlord_id: userId,
        name:        name.trim(),
        description: description?.trim() || null,
        county:      county.trim(),
        location:    location.trim(),
        address:     address?.trim() || null,
        status:      'draft',
      })
      .select()
      .single()

    if (propertyError) {
      console.error('❌ Property insert error:', propertyError)
      return NextResponse.json({ error: 'Failed to create property' }, { status: 500 })
    }

    // Create unit types
    const unitTypesData = unit_types.map((ut: any) => ({
      property_id:     property.id,
      type:            ut.type,
      price:           Number(ut.price),
      description:     ut.description?.trim() || null,
      amenities:       ut.amenities ?? [],
      total_count:     Number(ut.total_count),
      available_count: 0,   // starts at 0 — landlord activates later
      status:          'draft',
    }))

    const { error: unitError } = await supabase
      .from('unit_types')
      .insert(unitTypesData)

    if (unitError) {
      console.error('❌ Unit types insert error:', unitError)
      // Rollback property
      await supabase.from('properties').delete().eq('id', property.id)
      return NextResponse.json({ error: 'Failed to create unit types' }, { status: 500 })
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      actor_id:    userId,
      action:      'created_property',
      target_type: 'properties',
      target_id:   property.id,
      metadata:    { property_name: name.trim() },
    })

    console.log(`✅ Property created — ${property.id} by ${userId}`)
    return NextResponse.json({ success: true, propertyId: property.id })

  } catch (err) {
    console.error('❌ Property create error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}