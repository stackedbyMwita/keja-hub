import { MobileNav } from '@/components/dashboard/DashboardNavigation' // Update import path!
import ThemeSwitch from '@/components/theme/ThemeToggle'
import { AuthButton } from '../LandlordComponents/navbar/AuthButton'
import { AppLogo } from '../logo/Logo'

export function DashboardHeader({ role }: { role: string }) {
  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur flex items-center px-4 md:px-6 gap-4 shrink-0">
      
      {/* Mobile button lives inside the header flow safely */}
      <MobileNav role={role} />
      
      <AppLogo />
      <div className="flex-1" />
      <AuthButton />
      <ThemeSwitch />
    </header>
  )
}