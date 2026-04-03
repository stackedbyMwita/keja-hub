// app/(auth)/_components/auth-footer.tsx
'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export function AuthFooter() {
  const pathname = usePathname()
  const isSignIn = pathname.startsWith('/sign-in')

  return (
    <p className="text-sm text-muted-foreground">
      {isSignIn ? (
        <>Don't have an account?{' '}
          <Link href="/sign-up" className="text-primary hover:underline">Sign up</Link>
        </>
      ) : (
        <>Already have an account?{' '}
          <Link href="/sign-in" className="text-primary hover:underline">Sign in</Link>
        </>
      )}
    </p>
  )
}