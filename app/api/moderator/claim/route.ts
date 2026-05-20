import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { applicationId } = await req.json()
    if (!applicationId) return NextResponse.json({ error: 'Application ID required' }, { status: 400 })

    // Check it's still unclaimed
    const { data: app } = await supabase
      .from('landlord_profiles')
      .select('id, assigned_moderator_id, status')
      .eq('id', applicationId)
      .single()

    if (!app) return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    if (app.status !== 'pending') return NextResponse.json({ error: 'Application is no longer pending' }, { status: 409 })
    if (app.assigned_moderator_id && app.assigned_moderator_id !== userId) {
      return NextResponse.json({ error: 'Already claimed by another moderator' }, { status: 409 })
    }

    const { error } = await supabase
      .from('landlord_profiles')
      .update({
        assigned_moderator_id: userId,
        claimed_at:            new Date().toISOString(),
      })
      .eq('id', applicationId)

    if (error) return NextResponse.json({ error: 'Failed to claim application' }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}