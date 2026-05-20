import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('properties')
      .select(`
        id,
        name,
        county,
        location,
        address,
        description,
        status,
        submitted_at,
        created_at,
        landlord_id,
        profiles!landlord_id (
          full_name,
          phone_number,
          email
        ),
        unit_types (
          id,
          type,
          price,
          total_count,
          description,
          amenities
        )
      `)
      .eq('status', 'pending_review')
      .order('submitted_at', { ascending: true })

    if (error) {
      console.error('❌ Properties queue error:', error)
      return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('❌ Properties queue error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}