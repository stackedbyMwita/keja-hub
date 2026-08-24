import { auth, clerkClient } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

function normalizePhone(raw: string): string | null {
  const cleaned = raw.replace(/[\s\-()]/g, '')
  const stripped = cleaned.startsWith('+') ? cleaned.slice(1) : cleaned
  if (/^0[71]\d{8}$/.test(stripped)) return '254' + stripped.slice(1)
  if (/^254[71]\d{8}$/.test(stripped)) return stripped
  return null
}

async function waitForProfile(userId: string, maxAttempts = 3): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()
    if (data?.id) return true
    await new Promise(r => setTimeout(r, 1000))
  }
  return false
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { phone_number, heard_from } = body

    if (!phone_number) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    const normalized = normalizePhone(phone_number)
    if (!normalized) {
      return NextResponse.json(
        { error: 'Please enter a valid Kenyan phone number' },
        { status: 400 }
      )
    }

    // Check phone not already taken
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone_number', normalized)
      .neq('id', userId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'This phone number is already registered to another account' },
        { status: 409 }
      )
    }

    // Check if profile exists — wait up to 3 seconds for webhook
    const profileExists = await waitForProfile(userId, 3)

    if (!profileExists) {
      // ── Webhook never fired (ngrok down, dev environment etc.)
      // Create the profile ourselves directly from Clerk data ──────────────
      console.warn(`⚠️ Profile not found for ${userId} — creating it directly`)

      const client   = await clerkClient()
      const clerkUser = await client.users.getUser(userId)

      const email     = clerkUser.emailAddresses?.[0]?.emailAddress ?? `${userId}@placeholder.kejalink`
      const firstName = clerkUser.firstName ?? null
      const lastName  = clerkUser.lastName  ?? null
      const fullName  = [firstName, lastName].filter(Boolean).join(' ') || null
      const google    = clerkUser.externalAccounts?.find((a: any) => a.provider === 'google')
      const avatar    = google?.imageUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`
      const username  = clerkUser.username ?? `user_${userId.slice(-6)}`

      const { error: createError } = await supabase.from('profiles').upsert({
        id:                userId,
        email,
        username,
        first_name:        firstName,
        last_name:         lastName,
        full_name:         fullName,
        avatar_url:        avatar,
        phone_number:      null,
        role:              'user',
        onboarding_status: 'complete',
        is_active:         true,
        is_banned:         false,
        updated_at:        new Date().toISOString(),
      }, { onConflict: 'id' })

      if (createError) {
        console.error('❌ Failed to create profile as fallback:', createError)
        return NextResponse.json(
          { error: 'Account setup failed. Please try again.' },
          { status: 500 }
        )
      }
    }

    // Update phone + onboarding status
    const { error: dbError } = await supabase
      .from('profiles')
      .update({
        phone_number:      normalized,
        onboarding_status: 'complete',
        heard_from:        heard_from ?? null,
        updated_at:        new Date().toISOString(),
      })
      .eq('id', userId)

    if (dbError) {
      console.error('❌ Supabase update error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save your details. Please try again.' },
        { status: 500 }
      )
    }

    // Update Clerk metadata
    const client      = await clerkClient()
    const clerkUser   = await client.users.getUser(userId)
    const existingMeta = (clerkUser.publicMetadata ?? {}) as Record<string, unknown>

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...existingMeta,
        role:              existingMeta.role ?? 'user',
        is_banned:         existingMeta.is_banned ?? false,
        is_active:         existingMeta.is_active ?? true,
        onboarding_status: 'complete',
      },
    })

    console.log(`✅ Onboarding complete — ${userId} phone: ${normalized}`)
    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('❌ Onboarding API error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}