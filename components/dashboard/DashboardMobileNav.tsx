'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { AppLogo } from '@/components/logo/Logo'
import {
  Menu, LayoutDashboard, ClipboardList, ActivitySquare,
  ShieldCheck, Users, BarChart3, Building2, ArrowLeft,
} from 'lucide-react'
import {
  Sheet, SheetContent, SheetHeader,
  SheetTitle, SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

interface NavItem {
  label:    string
  href:     string
  icon:     React.ElementType
  exact?:   boolean
  divider?: boolean
}

const MODERATOR_NAV: NavItem[] = [
  { label: 'Overview',         href: '/dashboard/moderator',            icon: LayoutDashboard, exact: true },
  { label: 'Landlord Queue',   href: '/dashboard/moderator/queue',      icon: ClipboardList,   divider: true },
  { label: 'Property Reviews', href: '/dashboard/moderator/properties', icon: Building2 },
  { label: 'My Activity',      href: '/dashboard/moderator/activity',   icon: ActivitySquare,  divider: true },
]

const ADMIN_NAV: NavItem[] = [
  { label: 'Overview',   href: '/dashboard/admin',            icon: LayoutDashboard, exact: true },
  { label: 'Moderators', href: '/dashboard/admin/moderators', icon: ShieldCheck,     divider: true },
  { label: 'Landlords',  href: '/dashboard/admin/landlords',  icon: Building2 },
  { label: 'Users',      href: '/dashboard/admin/users',      icon: Users },
  { label: 'Metrics',    href: '/dashboard/admin/metrics',    icon: BarChart3,       divider: true },
  { label: 'Activity',   href: '/dashboard/admin/activity',   icon: ActivitySquare },
]

function getNav(role: string): NavItem[] {
  if (role === 'moderator') return MODERATOR_NAV
  return ADMIN_NAV
}

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href
  return pathname === item.href || pathname.startsWith(item.href + '/')
}

const ROLE_BADGE: Record<string, string> = {
  moderator:  'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800 dark:text-blue-400',
  admin:      'bg-primary/10 text-primary border-primary/20',
  superadmin: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800 dark:text-amber-400',
}

const ROLE_DOT: Record<string, string> = {
  moderator:  'bg-blue-500',
  admin:      'bg-primary',
  superadmin: 'bg-amber-500',
}

export function MobileNav({ role }: { role: string }) {
  const [open, setOpen] = useState(false)
  const pathname        = usePathname()
  const nav             = getNav(role)
  const badgeCls        = ROLE_BADGE[role] ?? ROLE_BADGE.admin
  const dotCls          = ROLE_DOT[role]   ?? ROLE_DOT.admin

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9 text-foreground hover:bg-muted/60"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[260px] p-0 border-r border-sidebar-border bg-sidebar flex flex-col"
      >
        {/* Logo */}
        <SheetHeader className="h-16 flex flex-row items-center px-5 border-b border-sidebar-border space-y-0 shrink-0">
          <SheetTitle asChild>
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring hover:opacity-80 transition-opacity"
            >
              <AppLogo />
            </Link>
          </SheetTitle>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* Role badge */}
          <div className="px-4 pt-5 pb-3">
            <span className={cn(
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border capitalize',
              badgeCls
            )}>
              <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse shrink-0', dotCls)} />
              {role}
            </span>
          </div>

          {/* Nav */}
          <nav className="px-3 py-2 flex flex-col gap-0.5">
            {nav.map((item) => {
              const active = isActive(pathname, item)

              return (
                <div key={item.href}>
                  {item.divider && (
                    <div className="my-2 mx-1 h-px bg-sidebar-border/50" />
                  )}
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                      active
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-sidebar-primary-foreground/50" />
                    )}
                    <item.icon className={cn(
                      'h-4 w-4 shrink-0',
                      active ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/40'
                    )} />
                    <span className="flex-1 truncate">{item.label}</span>
                  </Link>
                </div>
              )
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="px-3 pb-4 pt-3 border-t border-sidebar-border shrink-0">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 shrink-0" />
            <span>Back to listings</span>
          </Link>
        </div>

      </SheetContent>
    </Sheet>
  )
}