'use client'

import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import { AppLogo } from '@/components/logo/Logo'
import MaxWidthWrapper from '@/components/layout/MaxWidthWrapper'
import { Search } from 'lucide-react'
import { AuthButton } from './navbar/AuthButton'
import { Suspense } from 'react'
import ThemeToggle from '@/components/theme/ThemeToggle'

interface NavbarProps {
  onSignInClick: () => void
  searchQuery: string
  onSearchChange: (value: string) => void
}

export function Navbar({ onSignInClick, searchQuery, onSearchChange }: NavbarProps) {
  const { isSignedIn } = useAuth()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
      <MaxWidthWrapper className="py-0">
        <div className="flex h-16 items-center gap-4">

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <AppLogo />
            </Link>
          </div>

          {/* Search bar — center */}
          <div className="flex-1 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by location or property name..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-full border border-border bg-muted/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/become-a-landlord"
              className="hidden sm:inline-flex items-center h-9 px-4 rounded-full text-sm font-medium text-foreground border border-border hover:bg-muted transition-colors"
            >
              Become a Landlord
            </Link>
            <Link
              href="/dashboard"
              className="hidden bg-primary sm:inline-flex items-center h-9 px-4 rounded-full text-sm font-medium text-foreground border border-border hover:bg-muted transition-colors"
            >
              Dashboard
            </Link>

            <div className='hidden lg:block'>
              <ThemeToggle/>
            </div>
  
            <Suspense fallback={<div className="h-9 w-24 rounded-md bg-muted animate-pulse" />}>
              <AuthButton variant="default" />
            </Suspense>
    
          </div>

        </div>
      </MaxWidthWrapper>
    </header>
  )
}