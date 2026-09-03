'use client'

import { useAuth } from '@clerk/nextjs'
import { LayoutDashboard, Menu, Search } from 'lucide-react'
import Link from 'next/link'
import { Suspense, useState } from 'react'

import { AuthButton } from '@/components/LandlordComponents/navbar/AuthButton'
import { AppLogo } from '@/components/logo/Logo'
import ThemeToggle from '@/components/theme/ThemeToggle'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import MaxWidthWrapper from '@/components/UIComponents/layout/MaxWidthWrapper'

const DASHBOARD_ROLES = ['landlord', 'moderator', 'admin', 'superadmin']

export function UnitNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { isSignedIn, sessionClaims } = useAuth()

  const meta         = (sessionClaims?.publicMetadata ?? {}) as { role?: string }
  const role         = meta.role ?? 'user'
  const hasDashboard = isSignedIn && DASHBOARD_ROLES.includes(role)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 transition-colors duration-300">
      <MaxWidthWrapper className="py-0">
        <div className="flex h-16 items-center justify-between gap-4 md:gap-8">

          {/* Logo */}
          <div className="flex-shrink-0 transition-transform hover:scale-[1.02]">
            <Link className="block outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md" href="/">
              <AppLogo />
            </Link>
          </div>

          {/* Center: Static Search Link */}
          <div className="flex-1 min-w-0 hidden sm:flex justify-center max-w-2xl mx-auto">
            <Link className="flex items-center gap-2 w-full max-w-md h-10 px-4 rounded-full border border-border bg-muted/20 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50" href="/">
              <Search className="h-4 w-4 shrink-0"/>
              <span className="text-sm truncate">Search properties...</span>
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {(!isSignedIn || role === 'user') && (
              <Link className="hidden md:inline-flex items-center justify-center h-9 px-4 rounded-full text-sm font-semibold text-muted-foreground border border-transparent hover:text-foreground hover:bg-muted transition-all" href="/become-a-landlord">
                Become a Landlord
              </Link>
            )}

            {hasDashboard && (
              <Link className="hidden md:inline-flex items-center justify-center gap-2 h-9 px-4 rounded-full text-sm font-semibold bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-all" href="/dashboard">
                <LayoutDashboard className="h-3.5 w-3.5"/>
                Dashboard
              </Link>
            )}

            <div className="hidden md:flex items-center justify-center border-l border-border/50 pl-3 ml-1">
              <ThemeToggle/>
            </div>

            <Suspense fallback={<div className="h-9 w-24 rounded-full bg-muted animate-pulse" />}>
              <div className="pl-1"><AuthButton variant="default"/></div>
            </Suspense>

            {/* Mobile Nav */}
            <div className="md:hidden flex items-center">
              <Sheet onOpenChange={setIsOpen} open={isOpen}>
                <SheetTrigger asChild>
                  <Button size="icon" variant="ghost"><Menu className="h-5 w-5"/></Button>
                </SheetTrigger>
                <SheetContent className="w-[80vw] sm:w-[350px] flex flex-col gap-6 pt-12 p-4" side="right">
                  <SheetHeader><SheetTitle>Menu</SheetTitle></SheetHeader>
                  <div className="flex flex-col gap-3">
                    <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2 w-full h-10 px-4 rounded-lg border border-border bg-muted/20 text-sm">
                      <Search className="h-4 w-4"/> Search properties...
                    </Link>
                    {hasDashboard && (
                      <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 h-10 px-4 rounded-lg bg-primary/10 text-primary font-semibold">
                        <LayoutDashboard className="h-4 w-4"/> Dashboard
                      </Link>
                    )}
                  </div>
                  <div className="mt-auto border-t border-border pt-4 flex items-center justify-between">
                    <span className="text-sm">Theme</span> <ThemeToggle/>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </header>
  )
}