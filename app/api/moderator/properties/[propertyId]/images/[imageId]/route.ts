import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

cloudinary.config({
  cloud_name:  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:     process.env.CLOUDINARY_API_KEY,
  api_secret:  process.env.CLOUDINARY_API_SECRET,
})

interface Params { params: Promise<{ propertyId: string; imageId: string }> }

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { propertyId, imageId } = await params

    // Verify moderator approved this property
    const { data: property } = await supabase
      .from('properties')
      .select('approved_by')
      .eq('id', propertyId)
      .single()

    if (!property || property.approved_by !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get image before deleting (to handle cover reassignment)
    const { data: image } = await supabase
      .from('unit_images')
      .select('id, unit_type_id, is_cover, cloudinary_image_id')
      .eq('id', imageId)
      .single()

    if (!image) return NextResponse.json({ error: 'Image not found' }, { status: 404 })

    // Delete the image
    const { error } = await supabase
      .from('unit_images')
      .delete()
      .eq('id', imageId)

    if (error) {
      return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 })
    }

    if (image.cloudinary_image_id) {
      await cloudinary.uploader.destroy(image.cloudinary_image_id)
    }

    // If deleted image was cover, auto-assign next image as cover
    if (image.is_cover) {
      const { data: nextImage } = await supabase
        .from('unit_images')
        .select('id')
        .eq('unit_type_id', image.unit_type_id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

      if (nextImage) {
        await supabase
          .from('unit_images')
          .update({ is_cover: true })
          .eq('id', nextImage.id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}