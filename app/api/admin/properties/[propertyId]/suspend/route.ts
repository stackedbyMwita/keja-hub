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
    const { userId, sessionClaims } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const role = (sessionClaims?.publicMetadata as any)?.role
    if (!['admin', 'superadmin'].includes(role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    const { propertyId }      = await params
    const { suspend, reason } = await req.json()

    const { error } = await supabase
      .from('properties')
      .update({
        status:           suspend ? 'suspended' : 'approved',
        suspended_reason: suspend ? (reason ?? 'Suspended by admin') : null,
        updated_at:       new Date().toISOString(),
      })
      .eq('id', propertyId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await supabase.from('activity_logs').insert({
      actor_id:    userId,
      action:      suspend ? 'suspended_property' : 'unsuspended_property',
      target_type: 'properties',
      target_id:   propertyId,
      metadata:    { reason: reason ?? null },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}