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
    label: 'Draft',
    variant: 'outline',
    icon: FileEdit,
    cls: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700',
  },
  pending_review: {
    label: 'Pending review',
    variant: 'outline',
    icon: Clock,
    cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50',
  },
  approved: {
    label: 'Approved',
    variant: 'outline',
    icon: CheckCircle2,
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50',
  },
  rejected: {
    label: 'Rejected',
    variant: 'outline',
    icon: XCircle,
    cls: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50',
  },
  suspended: {
    label: 'Suspended',
    variant: 'outline',
    icon: ShieldAlert,
    cls: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50',
  },

  // ── Landlord application ─────────────────────────────────────────────────
  pending: {
    label: 'Pending',
    variant: 'outline',
    icon: Clock,
    cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50',
  },

  // ── User ─────────────────────────────────────────────────────────────────
  active: {
    label: 'Active',
    variant: 'outline',
    icon: CheckCircle2,
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50',
  },
  inactive: {
    label: 'Inactive',
    variant: 'outline',
    icon: AlertCircle,
    cls: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700',
  },
  banned: {
    label: 'Banned',
    variant: 'outline',
    icon: XCircle,
    cls: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50',
  },
}

function getFallback(status: string): StatusConfig {
  return {
    label:   status.replace(/_/g, ' '),
    variant: 'outline',
    icon:    AlertCircle,
    cls:     'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700',
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
        ${size === 'sm' ? 'text-xs px-2 py-2' : 'text-xs px-4 py-4'}
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