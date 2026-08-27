import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { updateSession } from '@/lib/supabase/proxy'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// ── Route matchers ────────────────────────────────────────────────────────────

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding-details',
  '/become-a-landlord',
  '/banned',
  '/maintenance',
  '/sso-callback',
  '/api/webhooks/clerk',
  '/api/onboarding',
  '/api/system-config',
  '/api/listings',
  '/api/landlord/(.*)',
  '/api/moderator/(.*)',
])

const isMaintenanceExempt = createRouteMatcher([
  '/maintenance',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/clerk',
  '/api/system-config',
  '/dashboard/superadmin(.*)',
])

const isLandlordDashboard   = createRouteMatcher(['/dashboard/landlord(.*)'])
const isModeratorDashboard  = createRouteMatcher(['/dashboard/moderator(.*)'])
const isAdminDashboard      = createRouteMatcher(['/dashboard/admin(.*)'])
const isSuperadminDashboard = createRouteMatcher(['/dashboard/superadmin(.*)'])

// Cache system config to avoid a DB call on every request
let configCache: { maintenance_mode: boolean; updated: number } | null = null
const CACHE_TTL = 30_000 // 30 seconds

async function isMaintenanceMode(): Promise<boolean> {
  const now = Date.now()
  if (configCache && now - configCache.updated < CACHE_TTL) {
    return configCache.maintenance_mode
  }
  try {
    const { data } = await supabase
      .from('system_config')
      .select('maintenance_mode')
      .eq('id', 1)
      .single()
    configCache = { maintenance_mode: data?.maintenance_mode ?? false, updated: now }
    return configCache.maintenance_mode
  } catch {
    return false
  }
}

// ── Middleware ────────────────────────────────────────────────────────────────

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const url = req.nextUrl

  // ── Maintenance mode check (before everything else) ──────────────────────
  if (!isMaintenanceExempt(req)) {
    const maintenance = await isMaintenanceMode()
    if (maintenance) {
      const { userId, sessionClaims } = await auth()
      const role = (sessionClaims?.publicMetadata as any)?.role ?? 'user'
      // Superadmins bypass maintenance mode
      if (!userId || role !== 'superadmin') {
        return NextResponse.redirect(new URL('/maintenance', req.url))
      }
    }
  }

  // ── Public routes — pass through ─────────────────────────────────────────
  if (isPublicRoute(req)) {
    return await updateSession(req)
  }

  // ── Not signed in ─────────────────────────────────────────────────────────
  const { userId, sessionClaims } = await auth()

  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirectUrl', url.pathname)
    return NextResponse.redirect(signInUrl)
  }

  // ── Read metadata ─────────────────────────────────────────────────────────
  const meta = (sessionClaims?.publicMetadata ?? {}) as {
    role?: string; is_banned?: boolean; is_active?: boolean
  }

  const role      = meta.role      ?? 'user'
  const is_banned = meta.is_banned ?? false
  const is_active = meta.is_active ?? true

  // ── Banned or deactivated ─────────────────────────────────────────────────
  if (is_banned || !is_active) {
    if (!url.pathname.startsWith('/banned')) {
      return NextResponse.redirect(new URL('/banned', req.url))
    }
    return await updateSession(req)
  }

  // ── Role-based dashboard protection ──────────────────────────────────────
  if (isSuperadminDashboard(req) && role !== 'superadmin') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  if (isAdminDashboard(req) && !['admin', 'superadmin'].includes(role)) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  if (isModeratorDashboard(req) && !['moderator', 'admin', 'superadmin'].includes(role)) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  if (isLandlordDashboard(req) && role !== 'landlord') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // ── /dashboard root ───────────────────────────────────────────────────────
  if (url.pathname === '/dashboard') {
    const destinations: Record<string, string> = {
      superadmin: '/dashboard/superadmin',
      admin:      '/dashboard/admin',
      moderator:  '/dashboard/moderator',
      landlord:   '/dashboard/landlord',
      user:       '/',
    }
    return NextResponse.redirect(new URL(destinations[role] ?? '/', req.url))
  }

  return await updateSession(req)
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/(api|trpc)(.*)',
  ],
}