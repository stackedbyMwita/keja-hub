import { AlertCircle, Clock, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react'

interface StatusBannerProps {
  status:          string
  rejectionReason: string | null
  totalScore:      number | null
  submittedAt:     string | null
}

const CONFIGS = {
  draft: {
    icon:    AlertCircle,
    bg:      'bg-muted/60 border-border',
    iconCls: 'text-muted-foreground',
    title:   'Draft',
    message: 'Your property is saved as a draft. Add your unit types and submit for review when ready.',
  },
  pending_review: {
    icon:    Clock,
    bg:      'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800',
    iconCls: 'text-amber-600 dark:text-amber-400',
    title:   'Under review',
    message: 'Our team is reviewing your property. This usually takes 1–3 business days. You cannot edit while under review.',
  },
  approved: {
    icon:    CheckCircle2,
    bg:      'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
    iconCls: 'text-green-600 dark:text-green-400',
    title:   'Approved',
    message: 'Your property is approved! Activate unit types below to list them on KéjaLink.',
  },
  rejected: {
    icon:    XCircle,
    bg:      'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
    iconCls: 'text-destructive',
    title:   'Rejected',
    message: '',
  },
  suspended: {
    icon:    ShieldAlert,
    bg:      'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800',
    iconCls: 'text-orange-600',
    title:   'Suspended',
    message: 'This property has been suspended. Please contact support@kejalink.co.ke.',
  },
} as const

export function StatusBanner({
  status, rejectionReason, totalScore, submittedAt,
}: StatusBannerProps) {
  const config = CONFIGS[status as keyof typeof CONFIGS] ?? CONFIGS.draft
  const Icon   = config.icon

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3 ${config.bg}`}>
      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${config.iconCls}`} />
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{config.title}</p>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {status === 'rejected'
            ? rejectionReason ?? 'No specific reason provided. Update your details and resubmit.'
            : config.message
          }
        </p>

        {/* Approved + scored */}
        {status === 'approved' && totalScore != null && totalScore > 0 && (
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
              <span className="text-xs font-bold text-primary">{totalScore}/100</span>
              <span className="text-xs text-muted-foreground">KéjaLink Score</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {totalScore >= 80 ? '🏆 Excellent' : totalScore >= 60 ? '⭐ Good' : '📍 Average'}
            </span>
          </div>
        )}

        {/* Submitted timestamp */}
        {status === 'pending_review' && submittedAt && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Submitted {new Date(submittedAt).toLocaleDateString('en-KE', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        )}
      </div>
    </div>
  )
}