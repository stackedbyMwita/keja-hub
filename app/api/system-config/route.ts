import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Public route — no auth needed
// Used by middleware, landing page, and maintenance page
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('system_config')
      .select('maintenance_mode, maintenance_message, disable_signups, disable_signups_message, disable_landlord_applications, disable_landlord_message, announcement_active, announcement_text, announcement_type')
      .eq('id', 1)
      .single()

    if (error) return NextResponse.json({ data: null }, { status: 500 })
    return NextResponse.json({ data }, {
      headers: {
        // Cache for 30 seconds — fresh enough, not hammering DB
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    })
  } catch {
    return NextResponse.json({ data: null })
  }
}