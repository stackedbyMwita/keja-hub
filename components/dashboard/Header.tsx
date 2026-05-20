'use client'

import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { MobileNav } from './MobileNav'
import { AuthButton } from '@/app/(landing)/_components/navbar/AuthButton'
import ThemeSwitch from '../theme/ThemeToggle'

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
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur flex items-center px-4 md:px-6 gap-4 sticky top-0 z-30">

      {/* Mobile hamburger */}
      <MobileNav role={role} />

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-semibold text-foreground truncate">
          {title}
        </h2>
      </div>

      <AuthButton />
      <ThemeSwitch />

    </header>
  )
}