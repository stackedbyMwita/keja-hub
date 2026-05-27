'use client'

import { usePathname } from 'next/navigation'
import { MobileNav } from './MobileNav'
import ThemeSwitch from '../theme/ThemeToggle'
import { AuthButton } from '../LandlordComponents/navbar/AuthButton'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard/moderator':          'Overview',
  '/dashboard/moderator/queue':    'Review Queue',
  '/dashboard/moderator/activity': 'My Activity',
  '/dashboard/admin':              'Overview',
  '/dashboard/admin/moderators':   'Moderators',
  '/dashboard/admin/landlords':    'Landlords',
  '/dashboard/admin/users':        'Users',
  '/dashboard/admin/metrics':      'Metrics',
  '/dashboard/admin/activity':     'Activity Logs',
}

interface HeaderProps {
  role: string
}

export function DashboardHeader({ role }: HeaderProps) {
  const pathname = usePathname()

  // Get title — fallback for dynamic routes like /queue/[id]
  const title = PAGE_TITLES[pathname]
    ?? (pathname.includes('/queue/') ? 'Application Review' : 'Dashboard')

  return (
    <header className="h-16 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 flex items-center px-4 md:px-8 gap-4 sticky top-0 z-30 transition-colors">

      {/* Mobile hamburger */}
      <MobileNav role={role} />

      {/* Page title */}
      <div className="flex-1 min-w-0 flex items-center">
        <h2 className="text-base md:text-lg font-bold text-foreground truncate tracking-tight">
          {title}
        </h2>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        <div className="flex items-center justify-center border-r border-border/50 pr-3 md:pr-4">
          <ThemeSwitch />
        </div>
        <AuthButton />
      </div>

    </header>
  )
}