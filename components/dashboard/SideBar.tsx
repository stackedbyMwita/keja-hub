'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { AppLogo } from '@/components/logo/Logo'
import {
  LayoutDashboard,
  ClipboardList,
  ActivitySquare,
  ShieldCheck,
  Users,
  BarChart3,
  Building2,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface NavItem {
  label: string
  href:  string
  icon:  React.ElementType
}

const MODERATOR_NAV: NavItem[] = [
  { label: 'Overview',          href: '/dashboard/moderator',            icon: LayoutDashboard },
  { label: 'Landlord Queue',    href: '/dashboard/moderator/queue',      icon: ClipboardList   },
  { label: 'Property Reviews',  href: '/dashboard/moderator/properties', icon: Building2       },
  { label: 'My Activity',       href: '/dashboard/moderator/activity',   icon: ActivitySquare  },
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

export function DashboardSidebar({ role }: { role: string }) {
  const pathname = usePathname()
  const nav      = getNav(role)

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen border-r border-border bg-sidebar shrink-0">

      <div className="h-16 flex items-center px-5 border-b border-sidebar-border">
        <Link href="/"><AppLogo /></Link>
      </div>

      <div className="px-4 pt-5 pb-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 capitalize">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          {role}
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        <TooltipProvider delayDuration={0}>
          {nav.map((item) => {
            const active = pathname === item.href ||
              (item.href !== `/dashboard/${role}` && pathname.startsWith(item.href))
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                      active
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="lg:hidden">{item.label}</TooltipContent>
              </Tooltip>
            )
          })}
        </TooltipProvider>
      </nav>

      <div className="px-3 pb-4 border-t border-sidebar-border pt-4">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all"
        >
          <Building2 className="h-4 w-4" />
          Back to listings
        </Link>
      </div>

    </aside>
  )
}