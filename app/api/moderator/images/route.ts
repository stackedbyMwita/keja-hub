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
        id, name, county, location, approved_at,
        unit_types (
          id,
          unit_images ( id )
        )
      `)
      .eq('status', 'approved')
      .eq('approved_by', userId)
      .order('approved_at', { ascending: false })

    if (error) {
      console.error('❌ Images overview error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Compute image stats per property
    const properties = (data ?? []).map((p: any) => {
      const unitTypes      = p.unit_types ?? []
      const totalUnitTypes = unitTypes.length
      const withImages     = unitTypes.filter((u: any) => u.unit_images.length > 0).length
      const withoutImages  = totalUnitTypes - withImages
      const totalImages    = unitTypes.reduce((a: number, u: any) => a + u.unit_images.length, 0)

      return {
        id:             p.id,
        name:           p.name,
        county:         p.county,
        location:       p.location,
        approved_at:    p.approved_at,
        totalUnitTypes,
        withImages,
        withoutImages,
        totalImages,
        isComplete:     withoutImages === 0 && totalUnitTypes > 0,
      }
    })

    return NextResponse.json({ data: properties })
  } catch (err) {
    console.error('❌ Images overview error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}