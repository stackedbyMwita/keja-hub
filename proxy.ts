import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { updateSession } from '@/lib/supabase/proxy'
import { type NextRequest, NextResponse } from 'next/server'

// ── Route matchers ────────────────────────────────────────────────────────────

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding-details',
  // Removed /become-a-landlord from here
  '/become-a-landlord',
  '/banned',
  '/sso-callback',
  '/api/webhooks/clerk',
  '/api/onboarding',
  '/api/landlord/(.*)',
  '/api/moderator/(.*)',
])

const isLandlordDashboard   = createRouteMatcher(['/dashboard/landlord(.*)'])
const isModeratorDashboard  = createRouteMatcher(['/dashboard/moderator(.*)'])
const isAdminDashboard      = createRouteMatcher(['/dashboard/admin(.*)'])
const isSuperadminDashboard = createRouteMatcher(['/dashboard/superadmin(.*)'])

// ── Middleware ────────────────────────────────────────────────────────────────

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const url = req.nextUrl
  console.log('🛡️ Middleware:', url.pathname)

  // ── 1. Public routes — pass through ─────────────────────────────────────
  if (isPublicRoute(req)) {
    return await updateSession(req)
  }

  // ── 2. Not signed in — redirect to sign-in with returnUrl ───────────────
  const { userId, sessionClaims } = await auth()

  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirectUrl', url.pathname)
    return NextResponse.redirect(signInUrl)
  }

  // ── 3. Read metadata from session token ─────────────────────────────────
  const meta = (sessionClaims?.publicMetadata ?? {}) as {
    role?: string
    is_banned?: boolean
    is_active?: boolean
  }

  const role      = meta.role      ?? 'user'
  const is_banned = meta.is_banned ?? false
  const is_active = meta.is_active ?? true

  // ── 4. Banned or deactivated ─────────────────────────────────────────────
  if (is_banned || !is_active) {
    if (!url.pathname.startsWith('/banned')) {
      return NextResponse.redirect(new URL('/banned', req.url))
    }
    return await updateSession(req)
  }

  // ── 5. Role-based dashboard protection ──────────────────────────────────
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

  // ── 6. /dashboard root — redirect to role-specific dashboard ────────────
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

  // ── 7. All clear ─────────────────────────────────────────────────────────
  return await updateSession(req)
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/(api|trpc)(.*)',
  ],
}