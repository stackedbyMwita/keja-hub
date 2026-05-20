import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      full_name,
      phone_number,
      whatsapp_number,
      county,
      location,
      number_of_properties,
      number_of_units,
      property_names,
      notes,
    } = body

    // ── Validate required fields ──────────────────────────────────────────
    if (!full_name?.trim())      return NextResponse.json({ error: 'Full name is required' }, { status: 400 })
    if (!phone_number?.trim())   return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    if (!county?.trim())         return NextResponse.json({ error: 'County is required' }, { status: 400 })
    if (!location?.trim())       return NextResponse.json({ error: 'Location is required' }, { status: 400 })
    if (!number_of_properties)   return NextResponse.json({ error: 'Number of properties is required' }, { status: 400 })
    if (!number_of_units)        return NextResponse.json({ error: 'Number of units is required' }, { status: 400 })

    // ── Must have a rejected application to reapply ───────────────────────
    const { data: existing } = await supabase
      .from('landlord_profiles')
      .select('id, status')
      .eq('user_id', userId)
      .maybeSingle()

    if (!existing) {
      return NextResponse.json({ error: 'No existing application found' }, { status: 404 })
    }

    if (existing.status !== 'rejected') {
      return NextResponse.json({ error: 'Only rejected applications can be resubmitted' }, { status: 400 })
    }

    // ── Update existing application back to pending ───────────────────────
    const { error } = await supabase
      .from('landlord_profiles')
      .update({
        full_name:            full_name.trim(),
        phone_number:         phone_number.trim(),
        whatsapp_number:      whatsapp_number?.trim() || null,
        county:               county.trim(),
        location:             location.trim(),
        number_of_properties: Number(number_of_properties),
        number_of_units:      Number(number_of_units),
        property_names:       property_names?.filter(Boolean) ?? [],
        notes:                notes?.trim() || null,
        status:               'pending',
        rejection_reason:     null,
        reviewed_by:          null,
        reviewed_at:          null,
        updated_at:           new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (error) {
      console.error('❌ Landlord reapply error:', error)
      return NextResponse.json({ error: 'Failed to resubmit application. Please try again.' }, { status: 500 })
    }

    console.log(`✅ Landlord reapplication submitted — ${userId}`)
    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('❌ Landlord reapply error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}