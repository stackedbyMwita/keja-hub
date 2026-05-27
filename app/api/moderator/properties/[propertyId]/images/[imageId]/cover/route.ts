import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

interface Params { params: Promise<{ propertyId: string; imageId: string }> }

// PATCH — set image as cover
export async function PATCH(_: Request, { params }: Params) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { propertyId, imageId } = await params

    // Get the image and its unit type
    const { data: image } = await supabase
      .from('unit_images')
      .select('id, unit_type_id, uploaded_by')
      .eq('id', imageId)
      .single()

    if (!image) return NextResponse.json({ error: 'Image not found' }, { status: 404 })

    // Verify moderator approved this property
    const { data: property } = await supabase
      .from('properties')
      .select('approved_by')
      .eq('id', propertyId)
      .single()

    if (!property || property.approved_by !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Unset all covers for this unit type
    await supabase
      .from('unit_images')
      .update({ is_cover: false })
      .eq('unit_type_id', image.unit_type_id)

    // Set this image as cover
    const { error } = await supabase
      .from('unit_images')
      .update({ is_cover: true })
      .eq('id', imageId)

    if (error) return NextResponse.json({ error: 'Failed to set cover' }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}