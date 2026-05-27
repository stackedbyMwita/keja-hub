'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { AppLogo } from '@/components/logo/Logo'
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  ArrowLeft,
} from 'lucide-react'

const NAV = [
  { label: 'Overview',       href: '/dashboard/landlord',            icon: LayoutDashboard },
  { label: 'My Properties',  href: '/dashboard/landlord/properties', icon: Building2       },
  { label: 'Add Property',   href: '/dashboard/landlord/properties/new', icon: PlusCircle  },
]

export function LandlordSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r border-border bg-card shrink-0">

      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/"><AppLogo /></Link>
      </div>

      {/* Welcome tag */}
      <div className="px-5 pt-6 pb-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <p className="text-xs font-semibold text-primary">Landlord Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-3 flex flex-col gap-1">
        {NAV.map((item) => {
          const active =
            item.href === '/dashboard/landlord'
              ? pathname === item.href
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Back to listings */}
      <div className="px-4 pb-6 border-t border-border pt-4">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to listings
        </Link>
      </div>

    </aside>
  )
}