import { WebhookEvent } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { Webhook } from 'svix'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// HELPERS
function getAvatar(data: any): string {
  const googleAccount = data.external_accounts?.find(
    (a: any) => a.provider === 'google'
  )
  if (googleAccount?.image_url) return googleAccount.image_url

  const seed = data.first_name ?? data.id
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
}

function getUsername(data: any): string {
  if (data.username) return data.username

  const googleAccount = data.external_accounts?.find(
    (a: any) => a.provider === 'google'
  )
  if (googleAccount?.given_name) {
    const base   = googleAccount.given_name.toLowerCase().replace(/\s+/g, '')
    const suffix = data.id.slice(-6)
    return `${base}_${suffix}`
  }

  const firstName = data.first_name?.toLowerCase().replace(/\s+/g, '') ?? ''
  const lastName  = data.last_name?.toLowerCase().replace(/\s+/g, '')  ?? ''
  const suffix    = data.id.slice(-6)

  if (firstName && lastName) return `${firstName}_${lastName}_${suffix}`
  if (firstName)             return `${firstName}_${suffix}`
  return `user_${suffix}`
}

function getFullName(data: any): string | null {
    // If we have first_name and last_name separately
    if (data.first_name || data.last_name) {
        return [data.first_name, data.last_name].filter(Boolean).join(' ') || null;
    }
    
    // Fallback for Google OAuth
    const googleAccount = data.external_accounts?.find(
        (a: any) => a.provider === 'google'
    );
    if (googleAccount?.name) return googleAccount.name;
    
    return null;
}

// WEBHOOK HANDLER
export async function GET() {
  return new Response('Webhook route is reachable', { status: 200 })
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
      'svix-id':        svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response('Invalid webhook signature', { status: 400 })
  }

  // USER CREATED OR UPDATED (using upsert)
  if (evt.type === 'user.created' || evt.type === 'user.updated') {
    const d = evt.data

    const email = d.email_addresses?.[0]?.email_address || `${d.id}@temp.user`;
  
  // For test events, generate a temporary username if missing
    const username = getUsername(d) || `user_${d.id.slice(-8)}`;
    
    const { error } = await supabase.from('profiles').upsert({
      id: d.id,
      email: email,
      username: username,
      first_name: d.first_name || null,  // Add this
      last_name: d.last_name || null,    // Add this
      full_name:  getFullName(d),
      avatar_url: getAvatar(d),
      phone_number: null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'id'
    })

    if (error) {
      console.error('Error upserting profile:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      return new Response(`Supabase error: ${error.message}`, { status: 500 })
    }

    console.log(`Profile upserted for ${d.id} (event: ${evt.type})`)
  }

  // USER DELETED
  if (evt.type === 'user.deleted') {
    const { id } = evt.data

    if (!id) return new Response('Missing user id', { status: 400 })

    const { error } = await supabase.from('profiles').delete().eq('id', id)

    if (error) {
      console.error('Error deleting profile:', error)
      return new Response('Error deleting profile', { status: 500 })
    }

    console.log(`Profile deleted for ${id}`)
  }

  return new Response('OK', { status: 200 })
}
