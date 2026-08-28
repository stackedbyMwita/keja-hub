import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2, XCircle, FileText,
  ImageIcon, Star, ClipboardList,
} from 'lucide-react'
import { redirect } from 'next/navigation'
import MaxWidthWrapper from '@/components/UIComponents/layout/MaxWidthWrapper'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// ── Action config ─────────────────────────────────────────────────────────────

const ACTION_CONFIG: Record<string, {
  label:   string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  icon:    any
  iconCls: string
  bgCls:   string
  getName: (metadata: any) => string
}> = {
  approved_property: {
    label:   'Approved property',
    variant: 'default',
    icon:    CheckCircle2,
    iconCls: 'text-green-600',
    bgCls:   'bg-green-50 dark:bg-green-950/30',
    getName: (m) => m?.property_name ?? 'Unknown property',
  },
  rejected_property: {
    label:   'Rejected property',
    variant: 'destructive',
    icon:    XCircle,
    iconCls: 'text-destructive',
    bgCls:   'bg-destructive/5',
    getName: (m) => m?.property_name ?? 'Unknown property',
  },
  approved_landlord_application: {
    label:   'Approved landlord',
    variant: 'default',
    icon:    CheckCircle2,
    iconCls: 'text-green-600',
    bgCls:   'bg-green-50 dark:bg-green-950/30',
    getName: (m) => m?.landlord_name ?? m?.full_name ?? 'Unknown applicant',
  },
  rejected_landlord_application: {
    label:   'Rejected landlord',
    variant: 'destructive',
    icon:    XCircle,
    iconCls: 'text-destructive',
    bgCls:   'bg-destructive/5',
    getName: (m) => m?.landlord_name ?? m?.full_name ?? 'Unknown applicant',
  },
  scored_property: {
    label:   'Scored property',
    variant: 'secondary',
    icon:    Star,
    iconCls: 'text-primary',
    bgCls:   'bg-primary/10',
    getName: (m) => m?.property_name ?? 'Unknown property',
  },
  uploaded_unit_image: {
    label:   'Uploaded image',
    variant: 'outline',
    icon:    ImageIcon,
    iconCls: 'text-blue-600',
    bgCls:   'bg-blue-50 dark:bg-blue-950/30',
    getName: (_) => 'Unit image',
  },
}

const FALLBACK_CONFIG = {
  label:   'Action',
  variant: 'outline' as const,
  icon:    ClipboardList,
  iconCls: 'text-muted-foreground',
  bgCls:   'bg-muted',
  getName: (m: any) => m?.property_name ?? m?.landlord_name ?? m?.full_name ?? '—',
}

export default async function ModeratorActivityPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { data: logs } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('actor_id', userId!)
    .order('created_at', { ascending: false })
    .limit(100)

  const entries = logs ?? []

  // Stats
  const totalApproved   = entries.filter(l =>
    l.action === 'approved_property' ||
    l.action === 'approved_landlord_application'
  ).length
  const totalRejected   = entries.filter(l =>
    l.action === 'rejected_property' ||
    l.action === 'rejected_landlord_application'
  ).length
  const totalScored     = entries.filter(l => l.action === 'scored_property').length
  const totalImages     = entries.filter(l => l.action === 'uploaded_unit_image').length

  return (
    <MaxWidthWrapper>
      <div className="p-4 md:p-6 flex flex-col gap-6">

      {/* Header */}
      <div className="border-b border-border/50 pb-4">
        <h1 className="text-xl font-semibold text-foreground">My Activity</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your complete review history · {entries.length} actions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Approved',  value: totalApproved, icon: CheckCircle2, color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-950/30',    border: 'border-green-200 dark:border-green-800'    },
          { label: 'Rejected',  value: totalRejected, icon: XCircle,      color: 'text-destructive', bg: 'bg-destructive/5',                    border: 'border-destructive/20'                     },
          { label: 'Scored',    value: totalScored,   icon: Star,         color: 'text-primary',    bg: 'bg-primary/10',                        border: 'border-primary/20'                         },
          { label: 'Images',    value: totalImages,   icon: ImageIcon,    color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-950/30',       border: 'border-blue-200 dark:border-blue-800'      },
        ].map((stat) => (
          <Card key={stat.label} className={`border ${stat.border}`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                <stat.icon className={`h-4.5 w-4.5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Log list */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Activity log
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground px-6 pb-6">
              No activity yet. Start reviewing applications from the queue.
            </p>
          ) : (
            <div className="flex flex-col">
              {entries.map((log, i) => {
                const cfg  = ACTION_CONFIG[log.action] ?? FALLBACK_CONFIG
                const Icon = cfg.icon
                const name = cfg.getName(log.metadata)

                return (
                  <div
                    key={log.id}
                    className={`flex items-start gap-3 px-4 md:px-6 py-3.5 ${
                      i !== entries.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${cfg.bgCls}`}>
                      <Icon className={`h-3.5 w-3.5 ${cfg.iconCls}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground truncate">
                          {name}
                        </p>
                        <Badge variant={cfg.variant} className="text-xs capitalize rounded-full shrink-0">
                          {cfg.label}
                        </Badge>
                      </div>

                      {/* Extra metadata */}
                      {log.metadata?.reason && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          Reason: {log.metadata.reason}
                        </p>
                      )}
                      {log.action === 'scored_property' && log.metadata?.scores && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Score: {Object.values(log.metadata.scores as Record<string, number>).reduce((a, b) => a + b, 0)}/100
                        </p>
                      )}

                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(log.created_at).toLocaleDateString('en-KE', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
    </MaxWidthWrapper>
  )
}