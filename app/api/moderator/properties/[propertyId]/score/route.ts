import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

interface Params { params: Promise<{ propertyId: string }> }

export async function POST(req: Request, { params }: Params) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { propertyId } = await params
    const body = await req.json()

    const {
      score_security,
      score_water,
      score_electricity,
      score_road_access,
      score_amenities,
      score_cleanliness,
      score_lighting,
      score_sanitation,
      score_value,
      score_landlord,
    } = body

    // Validate all scores are 1-10
    const scores = {
      score_security, score_water, score_electricity,
      score_road_access, score_amenities, score_cleanliness,
      score_lighting, score_sanitation, score_value, score_landlord,
    }

    for (const [key, val] of Object.entries(scores)) {
      if (!val || val < 1 || val > 10) {
        return NextResponse.json(
          { error: `${key.replace('score_', '')} must be between 1 and 10` },
          { status: 400 }
        )
      }
    }

    // Verify property exists and is approved
    const { data: property } = await supabase
      .from('properties')
      .select('id, status, approved_by, name')
      .eq('id', propertyId)
      .single()

    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    if (property.status !== 'approved') {
      return NextResponse.json({ error: 'Only approved properties can be scored' }, { status: 409 })
    }
    if (property.approved_by !== userId) {
      return NextResponse.json({ error: 'You can only score properties you approved' }, { status: 403 })
    }

    // Save scores — total_score is auto-calculated by DB generated column
    const { error } = await supabase
      .from('properties')
      .update({
        ...scores,
        scored_by:  userId,
        scored_at:  new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', propertyId)

    if (error) {
      console.error('❌ Score update error:', error)
      return NextResponse.json({ error: 'Failed to save scores' }, { status: 500 })
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      actor_id:    userId,
      action:      'scored_property',
      target_type: 'properties',
      target_id:   propertyId,
      metadata:    { property_name: property.name, scores },
    })

    console.log(`✅ Property scored — ${propertyId} by ${userId}`)
    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('❌ Score route error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}