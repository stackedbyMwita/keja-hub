import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { connection } from 'next/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft, ShieldCheck, CheckCircle2,
  XCircle, Star, ImageIcon, ClipboardList,
  ActivitySquare, Mail, Phone,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { AdminModeratorDetailActions } from '@/components/admin/AdminModeratorDetailActions'
import { DashboardPageWrapper } from '@/components/dashboard/DashboardPageWrapper'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const ACTION_LABELS: Record<string, string> = {
  approved_property:             'Approved property',
  rejected_property:             'Rejected property',
  approved_landlord_application: 'Approved landlord',
  rejected_landlord_application: 'Rejected landlord',
  scored_property:               'Scored property',
  uploaded_unit_image:           'Uploaded image',
}

const ACTION_DOT: Record<string, string> = {
  approved_property:             'bg-green-500',
  approved_landlord_application: 'bg-green-500',
  scored_property:               'bg-primary',
  uploaded_unit_image:           'bg-blue-500',
  rejected_property:             'bg-destructive',
  rejected_landlord_application: 'bg-destructive',
}

function getTarget(action: string, metadata: any): string {
  if (metadata?.property_name) return metadata.property_name
  if (metadata?.landlord_name) return metadata.landlord_name
  if (metadata?.full_name)     return metadata.full_name
  return '—'
}

interface PageProps { params: Promise<{ moderatorId: string }> }

export default async function AdminModeratorDetailPage({ params }: PageProps) {
  await connection()
  const { userId, sessionClaims } = await auth()
  if (!userId) redirect('/sign-in')
  const role = (sessionClaims?.publicMetadata as any)?.role
  if (!['admin', 'superadmin'].includes(role)) redirect('/dashboard')

  const { moderatorId } = await params

  const [profileRes, activityRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', moderatorId)
      .eq('role', 'moderator')
      .single(),
    supabase
      .from('activity_logs')
      .select('*')
      .eq('actor_id', moderatorId)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  if (!profileRes.data) notFound()

  const moderator = profileRes.data
  const activity  = activityRes.data ?? []

  const now        = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const totalApproved  = activity.filter(l => l.action.includes('approved')).length
  const totalRejected  = activity.filter(l => l.action.includes('rejected')).length
  const totalScored    = activity.filter(l => l.action === 'scored_property').length
  const totalImages    = activity.filter(l => l.action === 'uploaded_unit_image').length
  const monthActions   = activity.filter(l => l.created_at >= monthStart).length
  const lastActive     = activity[0]?.created_at ?? null

  const stats = [
    { label: 'Approved',       value: totalApproved, icon: CheckCircle2, color: 'text-green-600',   bg: 'bg-green-50 dark:bg-green-950/30'  },
    { label: 'Rejected',       value: totalRejected, icon: XCircle,      color: 'text-destructive', bg: 'bg-destructive/5'                  },
    { label: 'Scored',         value: totalScored,   icon: Star,         color: 'text-primary',     bg: 'bg-primary/10'                     },
    { label: 'Images',         value: totalImages,   icon: ImageIcon,    color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-950/30'    },
    { label: 'This month',     value: monthActions,  icon: ActivitySquare,color: 'text-amber-600',  bg: 'bg-amber-50 dark:bg-amber-950/30'  },
    { label: 'Total actions',  value: activity.length,icon: ClipboardList,color: 'text-foreground', bg: 'bg-muted'                          },
  ]

  return (
    <DashboardPageWrapper>

      {/* Back */}
      <Link
        href="/dashboard/admin/moderators"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group w-fit"
      >
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        All moderators
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Avatar className="w-14 h-14 shrink-0">
            <AvatarImage src={moderator.avatar_url} />
            <AvatarFallback className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 font-bold text-lg">
              {moderator.full_name?.charAt(0) ?? 'M'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold text-foreground">
                {moderator.full_name ?? 'No name'}
              </h1>
              <Badge
                variant={moderator.is_active ? 'default' : 'secondary'}
                className="flex items-center gap-1"
              >
                <ShieldCheck className="h-3 w-3" />
                {moderator.is_active ? 'Active moderator' : 'Deactivated'}
              </Badge>
            </div>
            <div className="flex flex-col gap-1 mt-1">
              {moderator.email && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  {moderator.email}
                </div>
              )}
              {moderator.phone_number && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  {moderator.phone_number}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Admin actions */}
      <AdminModeratorDetailActions
        moderatorId={moderatorId}
        isActive={moderator.is_active}
        moderatorName={moderator.full_name ?? 'this moderator'}
      />

      <Separator />

      {/* Stats grid */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Performance
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-border/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground tabular-nums">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Info row */}
      <Card className="border-border/60">
        <CardContent className="p-4 flex flex-col gap-2">
          <Row
            label="Joined"
            value={new Date(moderator.created_at).toLocaleDateString('en-KE', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          />
          <Row
            label="Last active"
            value={lastActive
              ? new Date(lastActive).toLocaleDateString('en-KE', {
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })
              : 'No activity yet'
            }
          />
          <Row
            label="Status"
            value={moderator.is_active ? 'Active' : 'Deactivated'}
          />
        </CardContent>
      </Card>

      <Separator />

      {/* Activity log */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Activity log ({activity.length})
        </h2>

        <Card className="border-border/60 overflow-hidden">
          <CardContent className="px-0 pb-0">
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground px-6 py-8 text-center">
                No activity yet.
              </p>
            ) : (
              <div className="flex flex-col">
                {activity.map((log, i) => {
                  const dotColor = ACTION_DOT[log.action] ?? 'bg-muted-foreground'
                  const label    = ACTION_LABELS[log.action] ?? log.action.replace(/_/g, ' ')
                  const target   = getTarget(log.action, log.metadata)

                  return (
                    <div
                      key={log.id}
                      className={`flex items-start gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors ${
                        i !== activity.length - 1 ? 'border-b border-border' : ''
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full mt-2 shrink-0 ${dotColor}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-foreground">{label}</p>
                          <span className="text-sm text-muted-foreground truncate">— {target}</span>
                        </div>
                        {log.metadata?.reason && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            Reason: {log.metadata.reason}
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

    </DashboardPageWrapper>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-foreground font-medium text-right">{value}</span>
    </div>
  )
}