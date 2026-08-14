import {
  ActivitySquare,
  BarChart3,
  Building2,
  ClipboardList,
  ImageIcon,
  LayoutDashboard,
  PlusCircle,
  ShieldCheck,
  Users,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  divider?: boolean
}

export const NAV_CONFIG: Record<string, NavItem[]> = {
  landlord: [
    { label: 'Overview',      href: '/dashboard/landlord',                icon: LayoutDashboard },
    { label: 'My Properties', href: '/dashboard/landlord/properties',     icon: Building2 },
    { label: 'Add Property',  href: '/dashboard/landlord/properties/new', icon: PlusCircle },
  ],
  moderator: [
    { label: 'Overview',         href: '/dashboard/moderator',            icon: LayoutDashboard },
    { label: 'Landlord Management',   href: '/dashboard/moderator/landlord',      icon: ClipboardList, divider: true },
    { label: 'Property Management', href: '/dashboard/moderator/properties', icon: Building2 },
    { label: 'Image Management', href: '/dashboard/moderator/images',     icon: ImageIcon },
    { label: 'My Activity',      href: '/dashboard/moderator/activity',   icon: ActivitySquare, divider: true },
  ],
  admin: [
    { label: 'Overview',   href: '/dashboard/admin',            icon: LayoutDashboard },
    { label: 'Moderators', href: '/dashboard/admin/moderators', icon: ShieldCheck, divider: true },
    { label: 'Landlords',  href: '/dashboard/admin/landlords',  icon: Building2 },
    { label: 'Users',      href: '/dashboard/admin/users',      icon: Users },
    { label: 'Metrics',    href: '/dashboard/admin/metrics',    icon: BarChart3, divider: true },
    { label: 'Activity',   href: '/dashboard/admin/activity',   icon: ActivitySquare },
  ],
}

// Superadmin inherits admin nav
NAV_CONFIG.superadmin = [...NAV_CONFIG.admin]

export function getNavByRole(role: string): NavItem[] {
  return NAV_CONFIG[role] || []
}

// ... keep your NAV_CONFIG imports and arrays the same ...
export const ROLE_STYLES: Record<string, { badge: string, dot: string, label: string, activeLink: string }> = {
  landlord: { 
    badge: 'bg-primary/10 text-primary border-primary/20', 
    dot: 'bg-primary', 
    label: 'Landlord Portal',
    activeLink: 'bg-primary text-primary-foreground shadow-sm' 
  },
  moderator: { 
    badge: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400', 
    dot: 'bg-blue-500', 
    label: 'Moderator Dashboard',
    activeLink: 'bg-blue-500 text-white shadow-sm dark:bg-blue-600'
  },
  admin: { 
    badge: 'bg-primary/10 text-primary border-primary/20', 
    dot: 'bg-primary', 
    label: 'Admin Dashboard',
    activeLink: 'bg-primary text-primary-foreground shadow-sm'
  },
  superadmin: { 
    badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400', 
    dot: 'bg-amber-500', 
    label: 'Superadmin Dashboard',
    activeLink: 'bg-amber-500 text-white shadow-sm dark:bg-amber-600'
  },
}