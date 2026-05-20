'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { AppLogo } from '@/components/logo/Logo'
import { Menu, X, LayoutDashboard, ClipboardList, ActivitySquare, ShieldCheck, Users, BarChart3, Building2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

interface NavItem {
  label: string
  href:  string
  icon:  React.ElementType
}

const MODERATOR_NAV: NavItem[] = [
  { label: 'Overview',     href: '/dashboard/moderator',          icon: LayoutDashboard },
  { label: 'Review Queue', href: '/dashboard/moderator/queue',    icon: ClipboardList   },
  { label: 'Property Reviews', href: '/dashboard/moderator/properties', icon: Building2       },
  { label: 'My Activity',      href: '/dashboard/moderator/activity',   icon: ActivitySquare  },
]

const ADMIN_NAV: NavItem[] = [
  { label: 'Overview',   href: '/dashboard/admin',            icon: LayoutDashboard },
  { label: 'Moderators', href: '/dashboard/admin/moderators', icon: ShieldCheck     },
  { label: 'Landlords',  href: '/dashboard/admin/landlords',  icon: Building2       },
  { label: 'Users',      href: '/dashboard/admin/users',      icon: Users           },
  { label: 'Metrics',    href: '/dashboard/admin/metrics',    icon: BarChart3       },
  { label: 'Activity',   href: '/dashboard/admin/activity',   icon: ActivitySquare  },
]

function getNav(role: string): NavItem[] {
  if (role === 'moderator') return MODERATOR_NAV
  return ADMIN_NAV
}

export function MobileNav({ role }: { role: string }) {
  const [open, setOpen]  = useState(false)
  const pathname         = usePathname()
  const nav              = getNav(role)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-72 p-0 border-sidebar-border">
        <SheetHeader className="h-16 flex flex-row items-center px-5 border-b border-sidebar-border space-y-0">
          <SheetTitle asChild>
            <Link href="/" onClick={() => setOpen(false)}>
              <AppLogo />
            </Link>
          </SheetTitle>
        </SheetHeader>

        {/* Role badge */}
        <div className="px-4 pt-5 pb-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 capitalize">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            {role}
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {nav.map((item) => {
            const active = pathname === item.href ||
              (item.href !== `/dashboard/${role}` && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Back to listings */}
        <div className="px-3 pb-6 border-t border-sidebar-border pt-4">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all"
          >
            <Building2 className="h-4 w-4" />
            Back to listings
          </Link>
        </div>

      </SheetContent>
    </Sheet>
  )
}