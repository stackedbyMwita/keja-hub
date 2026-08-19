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

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id, full_name, email, phone_number, avatar_url,
        created_at, is_active, is_banned,
        landlord_profiles (
          id, county, location, status,
          number_of_properties, number_of_units
        )
      `)
      .eq('role', 'landlord')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Add property counts per landlord
    const withCounts = await Promise.all((data ?? []).map(async (landlord) => {
      const { data: props } = await supabase
        .from('properties')
        .select('id, status')
        .eq('landlord_id', landlord.id)

      const properties = props ?? []
      return {
        ...landlord,
        property_counts: {
          total:    properties.length,
          approved: properties.filter(p => p.status === 'approved').length,
          pending:  properties.filter(p => p.status === 'pending_review').length,
          draft:    properties.filter(p => p.status === 'draft').length,
        },
      }
    }))

    return NextResponse.json({ data: withCounts })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}