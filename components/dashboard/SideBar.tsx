'use client'

import { AppLogo } from '@/components/logo/Logo'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
  ActivitySquare,
  ArrowLeft,
  BarChart3,
  Building2,
  ClipboardList,
  ImageIcon,
  LayoutDashboard,
  ShieldCheck,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  label:    string
  href:     string
  icon:     React.ElementType
  divider?: boolean  // adds a subtle separator before this item
}

const MODERATOR_NAV: NavItem[] = [
  { label: 'Overview',          href: '/dashboard/moderator',            icon: LayoutDashboard },
  { label: 'Landlord Queue',    href: '/dashboard/moderator/queue',      icon: ClipboardList,  divider: true },
  { label: 'Property Reviews',  href: '/dashboard/moderator/properties', icon: Building2       },
  { label: 'Image Management',  href: '/dashboard/moderator/images',     icon: ImageIcon       },
  { label: 'My Activity',       href: '/dashboard/moderator/activity',   icon: ActivitySquare, divider: true },
]

const ADMIN_NAV: NavItem[] = [
  { label: 'Overview',    href: '/dashboard/admin',            icon: LayoutDashboard },
  { label: 'Moderators',  href: '/dashboard/admin/moderators', icon: ShieldCheck,    divider: true },
  { label: 'Landlords',   href: '/dashboard/admin/landlords',  icon: Building2       },
  { label: 'Users',       href: '/dashboard/admin/users',      icon: Users           },
  { label: 'Metrics',     href: '/dashboard/admin/metrics',    icon: BarChart3,      divider: true },
  { label: 'Activity',    href: '/dashboard/admin/activity',   icon: ActivitySquare  },
]

const SUPERADMIN_NAV: NavItem[] = [
  ...ADMIN_NAV,
]

function getNav(role: string): NavItem[] {
  if (role === 'moderator') return MODERATOR_NAV
  if (role === 'superadmin') return SUPERADMIN_NAV
  return ADMIN_NAV
}

const ROLE_COLORS: Record<string, string> = {
  moderator:  'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
  admin:      'bg-primary/10 text-primary border-primary/20',
  superadmin: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
}

const ROLE_DOT: Record<string, string> = {
  moderator:  'bg-blue-500',
  admin:      'bg-primary',
  superadmin: 'bg-amber-500',
}

export function DashboardSidebar({ role }: { role: string }) {
  const pathname  = usePathname()
  const nav       = getNav(role)
  const roleColor = ROLE_COLORS[role] ?? ROLE_COLORS.admin
  const roleDot   = ROLE_DOT[role]   ?? ROLE_DOT.admin

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r border-sidebar-border bg-sidebar shrink-0">

      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border shrink-0">
        <Link
          href="/"
          className="rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring transition-opacity hover:opacity-80"
        >
          <AppLogo />
        </Link>
      </div>

      {/* Role badge */}
      <div className="px-5 pt-5 pb-3 shrink-0">
        <span className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border capitalize',
          roleColor
        )}>
          <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', roleDot)} />
          {role} dashboard
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 flex flex-col gap-0.5 overflow-y-auto">
        <TooltipProvider delayDuration={150}>
          {nav.map((item) => {
            const active =
              item.href === `/dashboard/${role}`
                ? pathname === item.href
                : pathname.startsWith(item.href)

            return (
              <div key={item.href}>
                {item.divider && (
                  <div className="my-1.5 mx-2 h-px bg-sidebar-border/60" />
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                        active
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                          : 'text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                      )}
                    >
                      <item.icon className={cn(
                        'h-4 w-4 shrink-0',
                        active ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/50'
                      )} />
                      <span>{item.label}</span>

                      {/* Active indicator dot */}
                      {active && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary/60" />
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="lg:hidden">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              </div>
            )
          })}
        </TooltipProvider>
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 pt-3 border-t border-sidebar-border shrink-0">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to listings
        </Link>
      </div>

    </aside>
  )
}