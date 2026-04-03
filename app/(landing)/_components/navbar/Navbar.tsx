import { AppLogo } from '@/components/logo/Logo'
import ThemeToggle from '@/components/theme/ThemeToggle'
import { Button } from "@/components/ui/button"
import {
  Sheet, SheetClose, SheetContent,
  SheetDescription, SheetHeader, SheetTitle, SheetTrigger
} from "@/components/ui/sheet"
import { Menu, X } from "lucide-react"
import { Suspense } from 'react'
import { AuthButton } from "./AuthButton"
import NavMenu from "./Menu"

export default function Navbar() {
  return (
    <nav className="w-full sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <AppLogo />

        {/* desktop menu */}
        <div className="hidden lg:block">
          <Suspense fallback={<div className="h-8 w-64 rounded-md bg-muted animate-pulse" />}>
            <NavMenu orientation="desktop" />
          </Suspense>
        </div>

        <div className="flex items-center gap-2">
          <div className='hidden lg:block'>
            <ThemeToggle/>
          </div>

          <Suspense fallback={<div className="h-9 w-24 rounded-md bg-muted animate-pulse" />}>
            <AuthButton variant="default" />
          </Suspense>

          {/* mobile sheet */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="[&>button]:hidden">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <SheetDescription className="sr-only">Main navigation links</SheetDescription>

              {/* header */}
              <SheetHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
                <AppLogo />
                <div className='flex items-center gap-2'>
                  <ThemeToggle />
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon">
                      <X className="w-5 h-5" />
                    </Button>
                  </SheetClose>
                </div>
              </SheetHeader>

              {/* mobile nav */}
              <div className="py-4">
                <Suspense>
                  <NavMenu orientation="mobile" />
                </Suspense>
              </div>

              {/* mobile auth */}
              <div className="p-4 border-t border-border">
                <Suspense>
                  <AuthButton variant="expanded" />
                </Suspense>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}