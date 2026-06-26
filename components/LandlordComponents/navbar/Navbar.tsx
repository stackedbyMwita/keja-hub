'use client'

import { AppLogo } from '@/components/logo/Logo'
import { SearchBar } from '@/components/Navbar/SearchBar'
import ThemeToggle from '@/components/theme/ThemeToggle'
import { Menu, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { Suspense, useState } from 'react'
import { AuthButton } from './AuthButton'
import { useAuth } from '@clerk/nextjs'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import MaxWidthWrapper from '@/components/UIComponents/layout/MaxWidthWrapper'

interface NavbarProps {
  onSignInClick?: () => void
  searchQuery:    string
  onSearchChange: (value: string) => void
}

// Roles that have an actual dashboard
const DASHBOARD_ROLES = ['landlord', 'moderator', 'admin', 'superadmin']

export function Navbar({ searchQuery, onSearchChange }: NavbarProps) {
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
            <Link href="/" className="block outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
              <AppLogo />
            </Link>
          </div>

          {/* Center: Search */}
          <div className="flex-1 min-w-0 hidden sm:block max-w-2xl mx-auto">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
            />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">

            {/* Become a Landlord — shown to non-landlord signed-in users and guests */}
            {(!isSignedIn || role === 'user') && (
              <Link
                href="/become-a-landlord"
                className="hidden md:inline-flex items-center justify-center h-9 px-4 rounded-full text-sm font-semibold text-muted-foreground border border-transparent hover:text-foreground hover:bg-muted transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                Become a Landlord
              </Link>
            )}

            {/* Dashboard — only for roles that have one */}
            {hasDashboard && (
              <Link
                href="/dashboard"
                className="hidden md:inline-flex items-center justify-center gap-2 h-9 px-4 rounded-full text-sm font-semibold bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Link>
            )}

            {/* Theme Toggle — desktop */}
            <div className="hidden md:flex items-center justify-center border-l border-border/50 pl-3 ml-1">
              <ThemeToggle />
            </div>

            {/* Auth Button */}
            <Suspense fallback={<div className="h-19 w-24 flex items-center rounded-full bg-muted animate-pulse" />}>
              <div className="pl-1 flex items-center">
                <AuthButton variant="default" />
              </div>
            </Suspense>

            {/* Mobile Nav Trigger */}
            <div className="md:hidden flex items-center">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 px-0">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>

                <SheetContent side="right" className="w-[80vw] sm:w-[350px] flex flex-col gap-6 pt-12 p-4">
                  <SheetHeader className="text-left">
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>

                  <div className="flex flex-col gap-3">

                    {/* Dashboard — only for roles that have one */}
                    {hasDashboard && (
                      <Link
                        href="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 h-10 px-4 rounded-lg bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                    )}

                    {/* Become a Landlord — guests and user role only */}
                    {(!isSignedIn || role === 'user') && (
                      <Link
                        href="/become-a-landlord"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center h-10 px-4 rounded-lg font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        Become a Landlord
                      </Link>
                    )}

                    {/* Mobile search */}
                    <div className="pt-1">
                      <SearchBar
                        searchQuery={searchQuery}
                        onSearchChange={onSearchChange}
                      />
                    </div>

                  </div>

                  <div className="mt-auto border-t border-border pt-4 pb-8 flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Theme</span>
                    <ThemeToggle />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="block sm:hidden pb-3 px-1 mt-2">
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
          />
        </div>

      </MaxWidthWrapper>
    </header>
  )
}