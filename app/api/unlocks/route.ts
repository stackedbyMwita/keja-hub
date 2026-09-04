import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// ── POST /api/unlocks — unlock a unit contact ─────────────────────────────────
export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'You must be signed in to unlock contacts' }, { status: 401 })
    }

    const { unit_type_id } = await req.json()
    if (!unit_type_id) {
      return NextResponse.json({ error: 'Unit ID is required' }, { status: 400 })
    }

    // ── Check unit exists and is active ──────────────────────────────────────
    const { data: unit, error: unitError } = await supabase
      .from('unit_types')
      .select(`
        id, price, status, unlock_count,
        properties!inner (
          id, name, county, location, address, status, landlord_id
        )
      `)
      .eq('id', unit_type_id)
      .single()

    if (unitError || !unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    }

    const property = (unit as any).properties

    if (property.status !== 'approved' || unit.status !== 'active') {
      return NextResponse.json({ error: 'This unit is not available' }, { status: 409 })
    }

    // ── Check if already unlocked ─────────────────────────────────────────────
    const { data: existing } = await supabase
      .from('contact_unlocks')
      .select('id, unlocked_at')
      .eq('unit_type_id', unit_type_id)
      .eq('user_id', userId)
      .maybeSingle()

    // ── Get landlord contact ──────────────────────────────────────────────────
    const { data: landlord } = await supabase
      .from('profiles')
      .select('full_name, phone_number, email')
      .eq('id', property.landlord_id)
      .single()

    if (!existing) {
      // ── Save new unlock ───────────────────────────────────────────────────
      const { error: insertError } = await supabase
        .from('contact_unlocks')
        .insert({
          unit_type_id,
          user_id:     userId,
          unlocked_at: new Date().toISOString(),
        })

      if (insertError) {
        console.error('❌ Unlock insert error:', insertError)
        return NextResponse.json({ error: 'Failed to unlock contact' }, { status: 500 })
      }

      // ── Increment unlock counter on unit ─────────────────────────────────
      await supabase
        .from('unit_types')
        .update({ unlock_count: (unit.unlock_count ?? 0) + 1 })
        .eq('id', unit_type_id)

      // ── Log activity ──────────────────────────────────────────────────────
      await supabase.from('activity_logs').insert({
        actor_id:    userId,
        action:      'unlocked_contact',
        target_type: 'unit_types',
        target_id:   unit_type_id,
        metadata: {
          property_id:   property.id,
          property_name: property.name,
          unit_price:    unit.price,
        },
      })
    }

    // ── Return contact details ────────────────────────────────────────────────
    return NextResponse.json({
      success:    true,
      already_unlocked: !!existing,
      contact: {
        landlord_name: landlord?.full_name    ?? 'KéjaLink Landlord',
        phone:         landlord?.phone_number ?? '',
        email:         landlord?.email        ?? '',
        full_address:  property.address ?? property.location,
        maps_url:      `https://maps.google.com/?q=${encodeURIComponent(
          property.location + ', ' + property.county
        )}`,
      },
    })

  } catch (err) {
    console.error('❌ Unlock error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// ── GET /api/unlocks?unitTypeId=xxx — check if already unlocked ──────────────
export async function GET(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ unlocked: false })

    const { searchParams } = new URL(req.url)
    const unit_type_id     = searchParams.get('unitTypeId')

    if (!unit_type_id) {
      return NextResponse.json({ error: 'unitTypeId is required' }, { status: 400 })
    }

    const { data } = await supabase
      .from('contact_unlocks')
      .select('id, unlocked_at')
      .eq('unit_type_id', unit_type_id)
      .eq('user_id', userId)
      .maybeSingle()

    if (!data) return NextResponse.json({ unlocked: false })

    // If already unlocked, also return the contact
    const { data: unit } = await supabase
      .from('unit_types')
      .select(`
        properties!inner ( address, location, county, landlord_id, name )
      `)
      .eq('id', unit_type_id)
      .single()

    const property = (unit as any)?.properties
    const { data: landlord } = await supabase
      .from('profiles')
      .select('full_name, phone_number, email')
      .eq('id', property?.landlord_id)
      .single()

    return NextResponse.json({
      unlocked:      true,
      unlocked_at:   data.unlocked_at,
      contact: {
        landlord_name: landlord?.full_name    ?? 'KéjaLink Landlord',
        phone:         landlord?.phone_number ?? '',
        email:         landlord?.email        ?? '',
        full_address:  property?.address ?? property?.location ?? '',
        maps_url:      `https://maps.google.com/?q=${encodeURIComponent(
          (property?.location ?? '') + ', ' + (property?.county ?? '')
        )}`,
      },
    })

  } catch (err) {
    console.error('❌ Unlock check error:', err)
    return NextResponse.json({ unlocked: false })
  }
}