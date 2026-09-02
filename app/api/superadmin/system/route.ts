import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function requireSuperadmin() {
  const { userId, sessionClaims } = await auth()
  if (!userId) return null
  if ((sessionClaims?.publicMetadata as any)?.role !== 'superadmin') return null
  return userId
}

export async function GET() {
  try {
    const superadminId = await requireSuperadmin()
    if (!superadminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('system_config')
      .select('*')
      .eq('id', 1)
      .maybeSingle()

    if (error) {
      console.error('❌ System config GET error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('❌ System config GET error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const superadminId = await requireSuperadmin()
    if (!superadminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    const update = {
      maintenance_mode:              Boolean(body.maintenance_mode),
      maintenance_message:           String(body.maintenance_message ?? '').trim()
        || 'KéjaLink is currently undergoing scheduled maintenance. We will be back shortly.',
      disable_signups:               Boolean(body.disable_signups),
      disable_signups_message:       String(body.disable_signups_message ?? '').trim()
        || 'New registrations are temporarily disabled. Please check back later.',
      disable_landlord_applications: Boolean(body.disable_landlord_applications),
      disable_landlord_message:      String(body.disable_landlord_message ?? '').trim()
        || 'Landlord applications are temporarily closed.',
      announcement_active:           Boolean(body.announcement_active),
      announcement_text:             String(body.announcement_text ?? '').trim(),
      announcement_type:             ['info','warning','success','error'].includes(body.announcement_type)
        ? body.announcement_type : 'info',
      updated_at:                    new Date().toISOString(),
      updated_by:                    superadminId,
    }

    // ── Use update without .select().single() to avoid JSON coercion error ──
    const { error: updateError } = await supabase
      .from('system_config')
      .update(update)
      .eq('id', 1)

    if (updateError) {
      console.error('❌ System config update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // ── Fetch the updated row separately ─────────────────────────────────────
    const { data, error: fetchError } = await supabase
      .from('system_config')
      .select('*')
      .eq('id', 1)
      .maybeSingle()

    if (fetchError) {
      console.error('❌ System config fetch error:', fetchError)
      // Update succeeded even if fetch fails — return the sent data
      return NextResponse.json({ success: true, data: update })
    }

    // Log the change
    await supabase.from('activity_logs').insert({
      actor_id:    superadminId,
      action:      'system_config_update',
      target_type: 'system',
      target_id:   'config',
      metadata:    {
        maintenance_mode:              update.maintenance_mode,
        disable_signups:               update.disable_signups,
        disable_landlord_applications: update.disable_landlord_applications,
        announcement_active:           update.announcement_active,
      },
    })

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('❌ System config POST error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}