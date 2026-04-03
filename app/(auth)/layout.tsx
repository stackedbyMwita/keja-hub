'use client'

import MaxWidthWrapper from "@/components/layout/MaxWidthWrapper"
import { AppLogo } from "@/components/logo/Logo"
import { Suspense } from "react"
import { AuthFooter } from "./_components/auth-footer"

export default function AuthLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      
      {/* Left panel */}
      <MaxWidthWrapper className="hidden md:flex flex-col justify-center px-12 bg-muted/40 border border-border rounded-lg m-4 md:m-8 lg:m-20 mr-0 items-center">
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
        <Suspense>
          <AuthFooter />
        </Suspense>
      </div>
    </div>
  )
}