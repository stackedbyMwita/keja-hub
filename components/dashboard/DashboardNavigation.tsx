'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Menu, LayoutDashboard, ClipboardList, ActivitySquare,
  ShieldCheck, Users, BarChart3, Building2, ImageIcon,
  ChevronLeft, ArrowLeft, PlusCircle, Home, UserCog, Settings
} from 'lucide-react'
import {
  Tooltip, TooltipContent,
  TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Sheet, SheetContent, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

// --- SHARED TYPES & CONFIGURATION ---

interface NavItem {
  label:    string
  href:     string
  icon:     React.ElementType
  exact?:   boolean
  divider?: boolean
}

const MODERATOR_NAV: NavItem[] = [
  { label: 'Overview',         href: '/dashboard/moderator',            icon: LayoutDashboard, exact: true },
  { label: 'Landlord Review',   href: '/dashboard/moderator/landlord',      icon: ClipboardList,   divider: true },
  { label: 'Property Management', href: '/dashboard/moderator/properties', icon: Building2 },
  { label: 'My Activity',      href: '/dashboard/moderator/activity',   icon: ActivitySquare,  divider: true },
]

const LANDLORD_NAV: NavItem[] = [
  { label: 'Overview',      href: '/dashboard/landlord',                icon: LayoutDashboard, exact: true },
  { label: 'My Properties', href: '/dashboard/landlord/properties',     icon: Home,            divider: true },
  { label: 'Add Property',  href: '/dashboard/landlord/properties/new', icon: PlusCircle },
]

const ADMIN_NAV: NavItem[] = [
  { label: 'Overview',      href: '/dashboard/admin',            icon: LayoutDashboard, exact: true },
  { label: 'Moderators',    href: '/dashboard/admin/moderators', icon: ShieldCheck,     divider: true },
  { label: 'Landlords',     href: '/dashboard/admin/landlords',  icon: Building2 },
  { label: 'Users',         href: '/dashboard/admin/users',      icon: Users },
  { label: 'Properties',    href: '/dashboard/admin/properties', icon: Home },
  { label: 'Metrics',       href: '/dashboard/admin/metrics',    icon: BarChart3,       divider: true },
  { label: 'Activity Logs', href: '/dashboard/admin/activity',   icon: ActivitySquare },
]

const SUPERADMIN_NAV: NavItem[] = [
  // ...ADMIN_NAV.map(item => ({
  //   ...item,
  //   href: item.href.replace('/dashboard/admin', '/dashboard/superadmin')
  // })),
  { label: 'Overview',      href: '/dashboard/admin',            icon: LayoutDashboard, exact: true },
  { label: 'Admins', href: '/dashboard/superadmin/admins', icon: UserCog, divider: true },
  { label: 'System', href: '/dashboard/superadmin/system', icon: Settings },
]

function getNav(role: string): NavItem[] {
  switch (role) {
    case 'moderator':  return MODERATOR_NAV
    case 'landlord':   return LANDLORD_NAV
    case 'superadmin': return SUPERADMIN_NAV
    case 'admin':
    default:           return ADMIN_NAV
  }
}

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href
  return pathname === item.href || pathname.startsWith(item.href + '/')
}

const ROLE_COLORS: Record<string, string> = {
  moderator:  'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
  landlord:   'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
  admin:      'bg-primary/10 text-primary border-primary/20',
  superadmin: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
}

const ROLE_DOT: Record<string, string> = {
  moderator:  'bg-blue-500',
  landlord:   'bg-emerald-500',
  admin:      'bg-primary',
  superadmin: 'bg-amber-500',
}

// --- SHARED INNER CONTENT ---

function SidebarContent({ role, isMobile, setOpen }: { role: string; isMobile?: boolean; setOpen?: (v: boolean) => void }) {
  const pathname  = usePathname()
  const nav       = getNav(role)
  const roleColor = ROLE_COLORS[role] ?? ROLE_COLORS.admin
  const roleDot   = ROLE_DOT[role]    ?? ROLE_DOT.admin

  return (
    <>
      {isMobile && <SheetTitle className="sr-only">Navigation Menu</SheetTitle>}

      {/* Role badge */}
      <div className="px-4 pt-5 pb-3 shrink-0">
        <span className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border capitalize',
          roleColor
        )}>
          <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse shrink-0', roleDot)} />
          {role} dashboard
        </span>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto">
        <nav className="px-3 py-2 flex flex-col gap-0.5">
          <TooltipProvider delayDuration={200}>
            {nav.map((item) => {
              const active = isActive(pathname, item)

              const LinkComponent = (
                <Link
                  href={item.href}
                  onClick={() => setOpen?.(false)}
                  className={cn(
                    'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                  )}
                >
                  {/* Desktop Active Left-Bar Indicator */}
                  <item.icon className={cn(
                    'h-4 w-4 shrink-0',
                    active ? 'text-primary-foreground' : 'text-sidebar-foreground/40'
                  )} />
                  <span className="flex-1 truncate">{item.label}</span>

                  {/* Mobile Active Dot Indicator */}
                  {isMobile && active && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-current shadow-sm" />
                  )}
                </Link>
              )

              return (
                <div key={item.href}>
                  {item.divider && (
                    <div className="my-2 mx-1 h-px bg-sidebar-border/50" />
                  )}
                  
                  {isMobile ? (
                    LinkComponent
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {LinkComponent}
                      </TooltipTrigger>
                      <TooltipContent side="right" className="lg:hidden">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              )
            })}
          </TooltipProvider>
        </nav>
      </div>

      {/* Footer */}
      <div className="px-3 pb-4 pt-3 shrink-0 border-t border-sidebar-border">
        <Link
          href="/"
          onClick={() => setOpen?.(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          {isMobile ? (
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 shrink-0" />
          ) : (
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 shrink-0" />
          )}
          <span>Back to listings</span>
        </Link>
      </div>
    </>
  )
}

// --- EXPORT 1: DESKTOP SIDEBAR ---
export function DesktopSidebar({ role }: { role: string }) {
  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen border-r border-sidebar-border bg-sidebar shrink-0">
      <SidebarContent role={role} />
    </aside>
  )
}

// --- EXPORT 2: MOBILE NAV TRIGGER & SHEET ---
export function MobileNav({ role }: { role: string }) {
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9 text-foreground hover:bg-muted/60"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-72 p-0 border-r border-sidebar-border bg-sidebar flex flex-col"
      >
        <SidebarContent role={role} isMobile setOpen={setOpen} />
      </SheetContent>
    </Sheet>
  )
}