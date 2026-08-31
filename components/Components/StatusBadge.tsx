import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2, Clock, XCircle,
  AlertCircle, ShieldAlert, FileEdit,
} from 'lucide-react'

// Supported status types
type StatusType =
  // Property statuses
  | 'draft' | 'pending_review' | 'approved' | 'rejected' | 'suspended'
  // Landlord application statuses
  | 'pending'
  // User statuses
  | 'active' | 'inactive' | 'banned'
  // Unit type statuses
  | 'active' | 'draft'
  // Generic
  | string

interface StatusConfig {
  label:   string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  icon:    React.ElementType
  cls:     string
}

const STATUS_MAP: Record<string, StatusConfig> = {
  // Property
  draft: {
    label: 'Draft', variant: 'secondary', icon: FileEdit,
    cls: '',
  },
  pending_review: {
    label: 'Pending review', variant: 'outline', icon: Clock,
    cls: 'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400',
  },
  approved: {
    label: 'Approved', variant: 'default', icon: CheckCircle2,
    cls: 'bg-green-600 hover:bg-green-600 text-white border-transparent',
  },
  rejected: {
    label: 'Rejected', variant: 'destructive', icon: XCircle,
    cls: '',
  },
  suspended: {
    label: 'Suspended', variant: 'destructive', icon: ShieldAlert,
    cls: '',
  },

  // ── Landlord application ─────────────────────────────────────────────────
  pending: {
    label: 'Pending', variant: 'outline', icon: Clock,
    cls: 'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400',
  },

  // ── User ─────────────────────────────────────────────────────────────────
  active: {
    label: 'Active', variant: 'default', icon: CheckCircle2,
    cls: 'bg-green-600 hover:bg-green-600 text-white border-transparent',
  },
  inactive: {
    label: 'Inactive', variant: 'secondary', icon: AlertCircle,
    cls: '',
  },
  banned: {
    label: 'Banned', variant: 'destructive', icon: XCircle,
    cls: '',
  },
}

function getFallback(status: string): StatusConfig {
  return {
    label:   status.replace(/_/g, ' '),
    variant: 'secondary',
    icon:    AlertCircle,
    cls:     '',
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status:    string
  showIcon?: boolean   // default true
  size?:     'sm' | 'md'
  className?: string
}

export function StatusBadge({
  status,
  showIcon = true,
  size     = 'md',
  className = '',
}: StatusBadgeProps) {
  const cfg  = STATUS_MAP[status] ?? getFallback(status)
  const Icon = cfg.icon

  return (
    <Badge
      variant={cfg.variant}
      className={`
        inline-flex items-center gap-1 capitalize rounded-full
        ${size === 'sm' ? 'text-xs px-2 py-1' : 'text-xs px-2.5 py-1'}
        ${cfg.cls}
        ${className}
      `.trim()}
    >
      {showIcon && <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />}
      {cfg.label}
    </Badge>
  )
}

export function getStatusLabel(status: string): string {
  return STATUS_MAP[status]?.label ?? status.replace(/_/g, ' ')
}