import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// GET — fetch all unassigned + assigned-to-me pending applications
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('landlord_profiles')
      .select(`
        id,
        user_id,
        full_name,
        phone_number,
        whatsapp_number,
        county,
        location,
        number_of_properties,
        number_of_units,
        property_names,
        notes,
        status,
        assigned_moderator_id,
        claimed_at,
        created_at
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('❌ Queue fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch queue' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('❌ Queue route error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}