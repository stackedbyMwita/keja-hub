import { MobileNav } from '@/components/dashboard/DashboardNavigation' // Update import path!
import ThemeSwitch from '@/components/theme/ThemeToggle'
import { AuthButton } from '../LandlordComponents/navbar/AuthButton'
import { AppLogo } from '../logo/Logo'
import { cn } from '@/lib/utils'

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


export function DashboardHeader({ role }: { role: string }) {
  const roleColor = ROLE_COLORS[role] ?? ROLE_COLORS.admin
  const roleDot   = ROLE_DOT[role]    ?? ROLE_DOT.admin
  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur flex items-center px-4 md:px-6 gap-4 shrink-0">
      
      {/* Mobile button lives inside the header flow safely */}
      <MobileNav role={role} />
      <div className="px-4 pt-5 pb-3 shrink-0">
        <span className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border capitalize',
          roleColor
        )}>
          <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse shrink-0', roleDot)} />
          {role} dashboard
        </span>
      </div>
      <div className="flex-1" />
      <AuthButton />
      <ThemeSwitch />
    </header>
  )
}