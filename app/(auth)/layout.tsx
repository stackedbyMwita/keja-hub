'use client'

import { usePathname } from 'next/navigation'
import MaxWidthWrapper from "@/components/layout/MaxWidthWrapper"
import { AppLogo } from "@/components/logo/Logo"
import { Star } from "lucide-react"
import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isSignIn = pathname.startsWith('/sign-in')

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left panel */}
      <MaxWidthWrapper className="hidden md:flex flex-col justify-center px-12 bg-muted/40 border-r border-border">
        <div className="max-w-lg px-12 flex flex-col gap-8">
          <AppLogo/>
          <p className="text-muted-foreground leading-relaxed">
            The platform built for teams who move fast. Manage, collaborate, and ship — all in one place.
          </p>
        </div>
      </MaxWidthWrapper>

      {/* Right panel */}
      <div className="flex items-center flex-col gap-8 justify-center p-8">
        <AppLogo/>
        {children}
        <p className="text-sm text-muted-foreground">
          {isSignIn ? (
            <>Don't have an account? <Link href="/sign-up" className="text-primary hover:underline">Sign up</Link></>
          ) : (
            <>Already have an account? <Link href="/sign-in" className="text-primary hover:underline">Sign in</Link></>
          )}
        </p>
      </div>
    </div>
  )
}