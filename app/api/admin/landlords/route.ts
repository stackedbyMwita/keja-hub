import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function requireAdmin() {
  const { userId, sessionClaims } = await auth()
  if (!userId) return null
  const role = (sessionClaims?.publicMetadata as any)?.role
  if (!['admin', 'superadmin'].includes(role)) return null
  return userId
}

export async function GET() {
  try {
    const adminId = await requireAdmin()
    if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // ── Step 1: fetch landlord profiles ──────────────────────────────────────
    const { data: landlords, error: landlordError } = await supabase
      .from('profiles')
      .select(`
        id, full_name, email, phone_number, avatar_url,
        created_at, is_active, is_banned
      `)
      .eq('role', 'landlord')
      .order('created_at', { ascending: false })

    if (landlordError) {
      console.error('❌ Landlords fetch error:', landlordError)
      return NextResponse.json({ error: landlordError.message }, { status: 500 })
    }

    if (!landlords || landlords.length === 0) {
      return NextResponse.json({ data: [] })
    }

    const landlordIds = landlords.map(l => l.id)

    // ── Step 2: fetch landlord_profiles separately ────────────────────────────
    const { data: landlordApps } = await supabase
      .from('landlord_profiles')
      .select('id, user_id, county, location, status, number_of_properties, number_of_units')
      .in('user_id', landlordIds)

    const appMap = new Map(
      (landlordApps ?? []).map(a => [a.user_id, a])
    )

    // ── Step 3: fetch property counts ─────────────────────────────────────────
    const { data: allProps } = await supabase
      .from('properties')
      .select('id, landlord_id, status')
      .in('landlord_id', landlordIds)

    const propsByLandlord = new Map<string, any[]>()
    for (const prop of allProps ?? []) {
      const existing = propsByLandlord.get(prop.landlord_id) ?? []
      existing.push(prop)
      propsByLandlord.set(prop.landlord_id, existing)
    }

    // ── Step 4: combine ───────────────────────────────────────────────────────
    const withCounts = landlords.map(landlord => {
      const props = propsByLandlord.get(landlord.id) ?? []
      return {
        ...landlord,
        landlord_profile: appMap.get(landlord.id) ?? null,
        property_counts: {
          total:    props.length,
          approved: props.filter(p => p.status === 'approved').length,
          pending:  props.filter(p => p.status === 'pending_review').length,
          draft:    props.filter(p => p.status === 'draft').length,
        },
      }
    })

    return NextResponse.json({ data: withCounts })

  } catch (err) {
    console.error('❌ Admin landlords route error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}