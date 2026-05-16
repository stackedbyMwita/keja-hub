'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export function AuthFooter() {
  const pathname = usePathname()
  const isSignIn = pathname.startsWith('/sign-in')

  return (
    <p className="text-sm text-muted-foreground text-center">
      {isSignIn ? (
        <>
          Don&apos;t have an account?{' '}
          <Link
            href="/sign-up"
            className="text-primary font-medium hover:underline underline-offset-4 transition-all"
          >
            Create one
          </Link>
        </>
      ) : (
        <>
          Already have an account?{' '}
          <Link
            href="/sign-in"
            className="text-primary font-medium hover:underline underline-offset-4 transition-all"
          >
            Sign in
          </Link>
        </>
      )}
    </p>
  )
}