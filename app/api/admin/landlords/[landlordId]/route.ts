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

interface Params { params: Promise<{ landlordId: string }> }

export async function GET(_: Request, { params }: Params) {
  try {
    const adminId = await requireAdmin()
    if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { landlordId } = await params

    const [profileRes, appRes, propsRes, activityRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, email, phone_number, avatar_url, created_at, is_active, is_banned, role, heard_from')
        .eq('id', landlordId)
        .single(),
      supabase
        .from('landlord_profiles')
        .select('*')
        .eq('user_id', landlordId)
        .maybeSingle(),
      supabase
        .from('properties')
        .select(`
          id, name, county, location, status,
          total_score, submitted_at, approved_at, created_at,
          unit_types ( id, type, total_count, available_count, status )
        `)
        .eq('landlord_id', landlordId)
        .order('created_at', { ascending: false }),
      supabase
        .from('activity_logs')
        .select('id, action, metadata, created_at')
        .eq('actor_id', landlordId)
        .order('created_at', { ascending: false })
        .limit(20),
    ])

    if (!profileRes.data) {
      return NextResponse.json({ error: 'Landlord not found' }, { status: 404 })
    }

    const properties = propsRes.data ?? []

    return NextResponse.json({
      data: {
        ...profileRes.data,
        landlord_profile: appRes.data ?? null,
        properties,
        activity: activityRes.data ?? [],
        property_counts: {
          total:    properties.length,
          approved: properties.filter(p => p.status === 'approved').length,
          pending:  properties.filter(p => p.status === 'pending_review').length,
          draft:    properties.filter(p => p.status === 'draft').length,
          rejected: properties.filter(p => p.status === 'rejected').length,
          suspended:properties.filter(p => p.status === 'suspended').length,
        },
      },
    })
  } catch (err) {
    console.error('❌ Landlord detail error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}