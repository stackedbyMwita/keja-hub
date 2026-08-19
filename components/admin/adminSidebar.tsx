'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { AppLogo } from '@/components/logo/Logo'
import {
  LayoutDashboard, ShieldCheck, Building2,
  Users, BarChart3, ActivitySquare, ArrowLeft, Crown,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface NavItem {
  label:    string
  href:     string
  icon:     React.ElementType
  exact?:   boolean
  divider?: boolean
}

const ADMIN_NAV: NavItem[] = [
  { label: 'Overview',    href: '/dashboard/admin',            icon: LayoutDashboard, exact: true  },
  { label: 'Moderators',  href: '/dashboard/admin/moderators', icon: ShieldCheck,     divider: true },
  { label: 'Landlords',   href: '/dashboard/admin/landlords',  icon: Building2        },
  { label: 'Users',       href: '/dashboard/admin/users',      icon: Users            },
  { label: 'Properties',  href: '/dashboard/admin/properties', icon: Building2        },
  { label: 'Metrics',     href: '/dashboard/admin/metrics',    icon: BarChart3,       divider: true },
  { label: 'Activity',    href: '/dashboard/admin/activity',   icon: ActivitySquare   },
]

const SUPERADMIN_NAV: NavItem[] = [
  ...ADMIN_NAV,
  { label: 'Admins',      href: '/dashboard/superadmin',       icon: Crown,           divider: true },
]

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href
  return pathname === item.href || pathname.startsWith(item.href + '/')
}

const ROLE_BADGE: Record<string, string> = {
  admin:      'bg-primary/10 text-primary border-primary/20',
  superadmin: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800 dark:text-amber-400',
}
const ROLE_DOT: Record<string, string> = {
  admin:      'bg-primary',
  superadmin: 'bg-amber-500',
}

export function AdminSidebar({ role }: { role: string }) {
  const pathname = usePathname()
  const nav      = role === 'superadmin' ? SUPERADMIN_NAV : ADMIN_NAV
  const badgeCls = ROLE_BADGE[role] ?? ROLE_BADGE.admin
  const dotCls   = ROLE_DOT[role]   ?? ROLE_DOT.admin

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen border-r border-sidebar-border bg-sidebar shrink-0">
      <div className="h-16 flex items-center px-5 border-b border-sidebar-border shrink-0">
        <Link href="/" className="hover:opacity-80 transition-opacity rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
          <AppLogo />
        </Link>
      </div>

      <div className="px-4 pt-5 pb-3 shrink-0">
        <span className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border capitalize', badgeCls)}>
          <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse shrink-0', dotCls)} />
          {role}
        </span>
      </div>

      <nav className="flex-1 px-3 py-2 flex flex-col gap-0.5 overflow-y-auto">
        <TooltipProvider delayDuration={200}>
          {nav.map((item) => {
            const active = isActive(pathname, item)
            return (
              <div key={item.href}>
                {item.divider && <div className="my-2 mx-1 h-px bg-sidebar-border/50" />}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                        active
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                          : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                      )}
                    >
                      {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-sidebar-primary-foreground/50" />}
                      <item.icon className={cn('h-4 w-4 shrink-0', active ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/40')} />
                      <span className="flex-1 truncate">{item.label}</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="lg:hidden">{item.label}</TooltipContent>
                </Tooltip>
              </div>
            )
          })}
        </TooltipProvider>
      </nav>

      <div className="px-3 pb-4 pt-3 border-t border-sidebar-border shrink-0">
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 shrink-0" />
          <span>Back to listings</span>
        </Link>
      </div>
    </aside>
  )
}