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

// Poll until the profile row exists (webhook may be slightly behind)
async function waitForProfile(userId: string, maxAttempts = 5): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (data?.id) return true

    // Wait 1s between attempts
    await new Promise(r => setTimeout(r, 1000))
  }
  return false
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { phone_number, heard_from } = body

    if (!phone_number) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    const normalized = normalizePhone(phone_number)
    if (!normalized) {
      return NextResponse.json(
        { error: 'Please enter a valid Kenyan phone number' },
        { status: 400 }
      )
    }

    // Check phone not already taken by another account
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

    // Wait for webhook to create the profile row (max 5 seconds)
    const profileExists = await waitForProfile(userId)

    if (!profileExists) {
      console.error(`❌ Profile row never created for ${userId} after 5 attempts`)
      return NextResponse.json(
        { error: 'Account setup is taking longer than expected. Please try again.' },
        { status: 503 }
      )
    }

    // Now safely update — row is guaranteed to exist
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

    // Update Clerk metadata — merge, never overwrite existing fields
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const existingMeta = (user.publicMetadata ?? {}) as Record<string, unknown>

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...existingMeta,
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