'use client'

import { AppLogo } from '@/components/logo/Logo'
import { SearchBar } from '@/components/Navbar/SearchBar'
import ThemeToggle from '@/components/theme/ThemeToggle'
import { Menu } from 'lucide-react'
import Link from 'next/link'
import { Suspense, useState } from 'react'
import { AuthButton } from './AuthButton'

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
  onSignInClick?: () => void // Optional if passed down
  searchQuery: string
  onSearchChange: (value: string) => void
}

export function Navbar({ searchQuery, onSearchChange }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 transition-colors duration-300">
      <MaxWidthWrapper className="py-0">
        {/* Added justify-between to push logo left and actions right */}
        <div className="flex h-16 items-center justify-between gap-4 md:gap-8">

          {/* Left: Logo */}
          <div className="flex-shrink-0 transition-transform hover:scale-[1.02]">
            <Link href="/" className="block outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
              <AppLogo />
            </Link>
          </div>

          {/* Center: Search bar (Hidden on mobile, expands smoothly on desktop) */}
          <div className="flex-1 min-w-0 hidden sm:block max-w-2xl mx-auto">
            <SearchBar 
              searchQuery={searchQuery} 
              onSearchChange={onSearchChange} 
            />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            
            {/* Desktop-only links */}
            <Link
              href="/become-a-landlord"
              className="hidden md:inline-flex items-center justify-center h-9 px-4 rounded-full text-sm font-semibold text-muted-foreground border border-transparent hover:text-foreground hover:bg-muted transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              Become a Landlord
            </Link>
            
            <Link
              href="/dashboard"
              className="hidden md:inline-flex items-center justify-center h-9 px-4 rounded-full text-sm font-semibold bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 focus:ring-offset-background"
            >
              Dashboard
            </Link>

            {/* Desktop Theme Toggle */}
            <div className="hidden md:flex items-center justify-center border-l border-border/50 pl-3 ml-1">
              <ThemeToggle />
            </div>
  
            {/* Auth Button (Visible on all screen sizes) */}
            <Suspense fallback={<div className="h-9 w-24 rounded-full bg-muted animate-pulse" />}>
              <div className="pl-1">
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
                
                {/* Mobile Slide-out Menu */}
                <SheetContent side="right" className="w-[80vw] sm:w-[350px] flex flex-col gap-6 pt-12 p-4">
                  <SheetHeader className="text-left">
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  
                  <div className="flex flex-col gap-4">
                    <Link 
                      href="/dashboard" 
                      onClick={() => setIsOpen(false)}
                      className="flex items-center h-10 px-4 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
                    >
                      Dashboard
                    </Link>
                    
                    <Link 
                      href="/become-a-landlord" 
                      onClick={() => setIsOpen(false)}
                      className="flex items-center h-10 px-4 rounded-lg font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      Become a Landlord
                    </Link>
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
        
        {/* Mobile Search Bar (Shows below header on very small screens) */}
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