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
    const { userId, sessionClaims } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const role = (sessionClaims?.publicMetadata as any)?.role
    if (!['admin', 'superadmin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { propertyId }          = await params
    const { new_moderator_id }    = await req.json()

    if (!new_moderator_id?.trim()) {
      return NextResponse.json({ error: 'Moderator ID is required' }, { status: 400 })
    }

    // Verify the new moderator exists and is active
    const { data: moderator } = await supabase
      .from('profiles')
      .select('id, full_name, role, is_active')
      .eq('id', new_moderator_id)
      .single()

    if (!moderator) {
      return NextResponse.json({ error: 'Moderator not found' }, { status: 404 })
    }
    if (moderator.role !== 'moderator') {
      return NextResponse.json({ error: 'User is not a moderator' }, { status: 400 })
    }
    if (!moderator.is_active) {
      return NextResponse.json({ error: 'Moderator is deactivated' }, { status: 400 })
    }

    const { data: property } = await supabase
      .from('properties')
      .select('id, name, approved_by, status')
      .eq('id', propertyId)
      .single()

    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 })

    const previousMod = property.approved_by

    const { error } = await supabase
      .from('properties')
      .update({
        approved_by: new_moderator_id,
        updated_at:  new Date().toISOString(),
      })
      .eq('id', propertyId)

    if (error) {
      console.error('❌ Reassign error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await supabase.from('activity_logs').insert({
      actor_id:    userId,
      action:      'reassigned_property_moderator',
      target_type: 'properties',
      target_id:   propertyId,
      metadata: {
        property_name:    property.name,
        previous_mod_id:  previousMod,
        new_mod_id:       new_moderator_id,
        new_mod_name:     moderator.full_name,
      },
    })

    return NextResponse.json({ success: true, moderator_name: moderator.full_name })
  } catch (err) {
    console.error('❌ Reassign error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}