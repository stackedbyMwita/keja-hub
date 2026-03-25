import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { updateSession } from '@/lib/supabase/proxy'
import { type NextRequest } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)'
])

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Clerk handles route protection — Supabase redirect logic stays commented out
  if (!isPublicRoute(req)) {
    await auth.protect()
  }

  // Supabase refreshes its session cookies
  return await updateSession(req)
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/(api|trpc)(.*)',
  ],
}