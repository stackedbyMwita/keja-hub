'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { AppLogo } from '@/components/logo/Logo'
import { Menu, LayoutDashboard, Building2, PlusCircle, ArrowLeft } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

const NAV = [
  { label: 'Overview',      href: '/dashboard/landlord',                icon: LayoutDashboard },
  { label: 'My Properties', href: '/dashboard/landlord/properties',     icon: Building2       },
  { label: 'Add Property',  href: '/dashboard/landlord/properties/new', icon: PlusCircle      },
]

export function LandlordMobileNav() {
  const [open, setOpen] = useState(false)
  const pathname        = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 bg-card">
        <SheetHeader className="h-16 flex flex-row items-center px-6 border-b border-border space-y-0">
          <SheetTitle asChild>
            <Link href="/" onClick={() => setOpen(false)}><AppLogo /></Link>
          </SheetTitle>
        </SheetHeader>

        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <p className="text-xs font-semibold text-primary">Landlord Portal</p>
          </div>
        </div>

        <nav className="px-4 py-3 flex flex-col gap-1">
          {NAV.map((item) => {
            const active =
              item.href === '/dashboard/landlord'
                ? pathname === item.href
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-4 pb-6 border-t border-border pt-4 mt-auto">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to listings
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  )
}