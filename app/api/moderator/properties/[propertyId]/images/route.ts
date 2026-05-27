import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

interface Params { params: Promise<{ propertyId: string }> }

// GET — fetch all images for all unit types in this property
export async function GET(_: Request, { params }: Params) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { propertyId } = await params

    // Verify moderator approved this property
    const { data: property } = await supabase
      .from('properties')
      .select('id, name, status, approved_by')
      .eq('id', propertyId)
      .single()

    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    if (property.approved_by !== userId) {
      return NextResponse.json({ error: 'You can only manage images for properties you approved' }, { status: 403 })
    }
    if (property.status !== 'approved') {
      return NextResponse.json({ error: 'Property must be approved first' }, { status: 409 })
    }

    // Fetch unit types with their images
    const { data: unitTypes, error } = await supabase
      .from('unit_types')
      .select(`
        id, type, price, total_count,
        unit_images (
          id, cloudinary_image_id, image_url,
          is_cover, uploaded_by, created_at
        )
      `)
      .eq('property_id', propertyId)
      .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data: unitTypes, property })
  } catch (err) {
    console.error('❌ Images GET error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// POST — upload image for a unit type (Cloudinary stub)
// When Cloudinary is integrated, this will receive cloudinary_image_id + image_url
// For now it accepts a placeholder URL for UI testing
export async function POST(req: Request, { params }: Params) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { propertyId } = await params
    const body = await req.json()
    const { unit_type_id, cloudinary_image_id, image_url } = body

    if (!unit_type_id)       return NextResponse.json({ error: 'Unit type ID required' }, { status: 400 })
    if (!cloudinary_image_id) return NextResponse.json({ error: 'Image ID required' }, { status: 400 })
    if (!image_url)     return NextResponse.json({ error: 'Image URL required' }, { status: 400 })

    // Verify ownership
    const { data: property } = await supabase
      .from('properties')
      .select('id, approved_by, status')
      .eq('id', propertyId)
      .single()

    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    if (property.approved_by !== userId) {
      return NextResponse.json({ error: 'You can only upload images for properties you approved' }, { status: 403 })
    }

    // Check if this unit type belongs to this property
    const { data: unitType } = await supabase
      .from('unit_types')
      .select('id')
      .eq('id', unit_type_id)
      .eq('property_id', propertyId)
      .single()

    if (!unitType) return NextResponse.json({ error: 'Unit type not found' }, { status: 404 })

    // Check if this is the first image — auto-set as cover
    const { count } = await supabase
      .from('unit_images')
      .select('id', { count: 'exact', head: true })
      .eq('unit_type_id', unit_type_id)

    const isCover = count === 0

    const { data: image, error } = await supabase
      .from('unit_images')
      .insert({
        unit_type_id,
        cloudinary_image_id,
        image_url,
        uploaded_by: userId,
        is_cover:    isCover,
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Image insert error:', error)
      return NextResponse.json({ error: 'Failed to save image' }, { status: 500 })
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      actor_id:    userId,
      action:      'uploaded_unit_image',
      target_type: 'unit_images',
      target_id:   image.id,
      metadata:    { property_id: propertyId, unit_type_id, is_cover: isCover },
    })

    return NextResponse.json({ success: true, image })
  } catch (err) {
    console.error('❌ Image POST error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}