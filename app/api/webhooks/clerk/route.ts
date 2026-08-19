import { WebhookEvent } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { clerkClient } from '@clerk/nextjs/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// HELPERS
function getAvatar(data: any): string {
  const google = data.external_accounts?.find(
    (a: any) => a.provider === 'google'
  )
  if (google?.image_url) return google.image_url
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username ?? data.id}`
}

function getName(data: any): { first: string | null; last: string | null; full: string | null } {
  const google = data.external_accounts?.find(
    (a: any) => a.provider === 'google'
  )
  const first = data.first_name?.trim() || google?.given_name?.trim() || null
  const last  = data.last_name?.trim()  || google?.family_name?.trim() || null
  const full  = [first, last].filter(Boolean).join(' ') || null
  return { first, last, full }
}

function getUsername(data: any): string {
  if (data.username) return data.username

  const google = data.external_accounts?.find(
    (a: any) => a.provider === 'google'
  )
  const base = google?.given_name
    ? `${google.given_name}${google.family_name ? '_' + google.family_name : ''}`
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9_]/g, '')
    : 'user'

  return `${base}_${data.id.slice(-6)}`
}

function getEmail(data: any): string {
  return data.email_addresses?.[0]?.email_address ?? `${data.id}@placeholder.kejalink`
}

// WEBHOOK HANDLER

export async function GET() {
  return new Response('KejaLink webhook is reachable', { status: 200 })
}

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set')
    return new Response('Missing webhook secret', { status: 500 })
  }

  const headerPayload  = await headers()
  const svix_id        = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const payload = await req.json()
  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(JSON.stringify(payload), {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return new Response('Invalid webhook signature', { status: 400 })
  }

  // USER CREATED
  if (evt.type === 'user.created') {
    const d        = evt.data
    const role     = 'user'
    const username = getUsername(d)
    const email    = getEmail(d)
    const { first, last, full } = getName(d)

    try {
      const client = await clerkClient()
      await client.users.updateUserMetadata(d.id, {
        publicMetadata: {
          role,
          is_banned:         false,
          is_active:         true,
          onboarding_status: 'pending',
        },
      })
    } catch {
      console.warn(`⚠️  Clerk metadata update skipped for ${d.id} — likely a test event`)
    }

    const { error } = await supabase.from('profiles').upsert({
      id:                d.id,
      email,
      username,
      first_name:        first,
      last_name:         last,
      full_name:         full,
      avatar_url:        getAvatar(d),
      phone_number:      null,
      role,
      onboarding_status: 'pending',
      is_active:         true,
      is_banned:         false,
      updated_at:        new Date().toISOString(),
    }, { onConflict: 'id' })

    if (error) {
      console.error('❌ Error creating profile:', error)
      return new Response(`Supabase error: ${error.message}`, { status: 500 })
    }

    console.log(`✅ Profile created — ${username} (${d.id}) role: ${role}`)
  }

  // USER UPDATED
  if (evt.type === 'user.updated') {
    const d   = evt.data
    const meta = (d.public_metadata ?? {}) as {
      role?:              string
      is_banned?:         boolean
      is_active?:         boolean
      onboarding_status?: string
    }

    // Preserve all existing metadata values — never overwrite with defaults
    const role              = meta.role              ?? 'user'
    const is_banned         = meta.is_banned         ?? false
    const is_active         = meta.is_active         ?? true
    const onboarding_status = meta.onboarding_status ?? 'pending'

    const username = getUsername(d)
    const email    = getEmail(d)
    const { first, last, full } = getName(d)

    const { error } = await supabase.from('profiles').upsert({
      id:                d.id,
      email,
      username,
      first_name:        first,
      last_name:         last,
      full_name:         full,
      avatar_url:        getAvatar(d),
      role,
      onboarding_status,
      is_active,
      is_banned,
      updated_at:        new Date().toISOString(),
    }, { onConflict: 'id' })

    if (error) {
      console.error('❌ Error updating profile:', error)
      return new Response(`Supabase error: ${error.message}`, { status: 500 })
    }

    console.log(`✅ Profile updated — ${username} (${d.id}) role: ${role}`)
  }

  // ─── USER DELETED ──────────────────────────────────────────────────────────
  if (evt.type === 'user.deleted') {
    const { id } = evt.data
    if (!id) return new Response('Missing user id', { status: 400 })

    const { error } = await supabase
      .from('profiles')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('❌ Error deactivating profile:', error)
      return new Response('Error deactivating profile', { status: 500 })
    }

    console.log(`✅ Profile deactivated — ${id}`)
  }

  return new Response('OK', { status: 200 })
}