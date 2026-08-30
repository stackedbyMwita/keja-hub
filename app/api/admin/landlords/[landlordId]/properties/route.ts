import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

interface Params { params: Promise<{ landlordId: string }> }

export async function GET(_: Request, { params }: Params) {
  try {
    const { userId, sessionClaims } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const role = (sessionClaims?.publicMetadata as any)?.role
    if (!['admin', 'superadmin'].includes(role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    const { landlordId } = await params

    const { data, error } = await supabase
      .from('properties')
      .select(`
        id, name, county, location, status,
        total_score, submitted_at, approved_at,
        created_at, rejection_reason, suspended_reason,
        unit_types (
          id, type, price, total_count, available_count, status,
          unit_images ( id )
        )
      `)
      .eq('landlord_id', landlordId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Landlord properties error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('❌ Landlord properties error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}