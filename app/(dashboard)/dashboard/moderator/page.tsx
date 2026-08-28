import { Suspense } from 'react'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ClipboardList, CheckCircle2, XCircle, Clock,
  Building2, ImageIcon, Star, ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

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

const ACTION_COLOR: Record<string, string> = {
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

async function OverviewContent() {
  const { userId } = await auth()
  const now         = new Date()
  const monthStart  = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    // Queue metrics
    pendingLandlords,
    pendingProperties,
    // My all-time stats
    myApprovedLandlords,
    myRejectedLandlords,
    myApprovedProperties,
    myRejectedProperties,
    myScoredProperties,
    myImages,
    // My this-month stats
    myMonthActions,
    // Approved properties I manage (for image coverage)
    myApprovedPropertyList,
    // Recent activity
    recentActivity,
  ] = await Promise.all([
    supabase.from('landlord_profiles').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
    supabase.from('activity_logs').select('id', { count: 'exact', head: true }).eq('actor_id', userId!).eq('action', 'approved_landlord_application'),
    supabase.from('activity_logs').select('id', { count: 'exact', head: true }).eq('actor_id', userId!).eq('action', 'rejected_landlord_application'),
    supabase.from('activity_logs').select('id', { count: 'exact', head: true }).eq('actor_id', userId!).eq('action', 'approved_property'),
    supabase.from('activity_logs').select('id', { count: 'exact', head: true }).eq('actor_id', userId!).eq('action', 'rejected_property'),
    supabase.from('activity_logs').select('id', { count: 'exact', head: true }).eq('actor_id', userId!).eq('action', 'scored_property'),
    supabase.from('activity_logs').select('id', { count: 'exact', head: true }).eq('actor_id', userId!).eq('action', 'uploaded_unit_image'),
    supabase.from('activity_logs').select('id', { count: 'exact', head: true }).eq('actor_id', userId!).gte('created_at', monthStart),
    supabase.from('properties').select(`
      id, name,
      unit_types ( id, unit_images ( id ) )
    `).eq('approved_by', userId!).eq('status', 'approved'),
    supabase.from('activity_logs').select('id, action, metadata, created_at').eq('actor_id', userId!).order('created_at', { ascending: false }).limit(6),
  ])

  // Image coverage — how many of my approved properties have all unit types covered
  const approvedProps       = myApprovedPropertyList.data ?? []
  const propsWithNoImages   = approvedProps.filter((p: any) =>
    (p.unit_types ?? []).some((ut: any) => ut.unit_images.length === 0)
  ).length
  const propsFullyCovered   = approvedProps.length - propsWithNoImages

  const queueStats = [
    { label: 'Landlord applications pending', value: pendingLandlords.count ?? 0,  icon: ClipboardList, href: '/dashboard/moderator/queue',      color: 'text-amber-600',  bg: 'bg-amber-50 dark:bg-amber-950/30',   border: 'border-amber-200 dark:border-amber-800'   },
    { label: 'Properties pending review',      value: pendingProperties.count ?? 0, icon: Building2,     href: '/dashboard/moderator/properties', color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-950/30',     border: 'border-blue-200 dark:border-blue-800'     },
    { label: 'My props needing images',        value: propsWithNoImages,            icon: ImageIcon,     href: '/dashboard/moderator/images',     color: 'text-destructive', bg: 'bg-destructive/5',                   border: 'border-destructive/20'                    },
    { label: 'My actions this month',          value: myMonthActions.count ?? 0,    icon: CheckCircle2,  href: '/dashboard/moderator/activity',   color: 'text-primary',    bg: 'bg-primary/10',                      border: 'border-primary/20'                        },
  ]

  const myStats = [
    { label: 'Landlords approved', value: myApprovedLandlords.count  ?? 0, icon: CheckCircle2, color: 'text-green-600',   bg: 'bg-green-50 dark:bg-green-950/30'   },
    { label: 'Landlords rejected', value: myRejectedLandlords.count  ?? 0, icon: XCircle,      color: 'text-destructive', bg: 'bg-destructive/5'                   },
    { label: 'Properties approved',value: myApprovedProperties.count ?? 0, icon: Building2,    color: 'text-green-600',   bg: 'bg-green-50 dark:bg-green-950/30'   },
    { label: 'Properties rejected', value: myRejectedProperties.count ?? 0,icon: XCircle,      color: 'text-destructive', bg: 'bg-destructive/5'                   },
    { label: 'Properties scored',   value: myScoredProperties.count  ?? 0, icon: Star,         color: 'text-primary',     bg: 'bg-primary/10'                      },
    { label: 'Images uploaded',     value: myImages.count            ?? 0, icon: ImageIcon,    color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-950/30'     },
  ]

  return (
    <>
      {/* Queue at a glance */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Queue at a glance</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {queueStats.map((stat) => (
            <Link key={stat.label} href={stat.href} className="block group">
              <Card className={`border ${stat.border} transition-all hover:shadow-md group-hover:border-opacity-60 h-full`}>
                <CardContent className="p-5">
                  <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <p className="text-3xl font-bold text-foreground tabular-nums">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-tight">{stat.label}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    View <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* My all-time performance */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">My all-time performance</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {myStats.map((stat) => (
            <Card key={stat.label} className="border-border/60">
              <CardContent className="p-4 flex flex-col gap-2">
                <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</p>
                <p className="text-xs text-muted-foreground leading-tight">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Image coverage summary */}
      {approvedProps.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Image coverage</h2>
          <Card className="border-border/60">
            <CardContent className="p-5 flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                <div className="flex-1 bg-muted rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-2.5 rounded-full bg-primary transition-all"
                    style={{ width: `${approvedProps.length ? (propsFullyCovered / approvedProps.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-foreground tabular-nums whitespace-nowrap">
                  {propsFullyCovered}/{approvedProps.length}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {propsFullyCovered === approvedProps.length
                  ? '✅ All your approved properties have images'
                  : `${propsWithNoImages} propert${propsWithNoImages !== 1 ? 'ies' : 'y'} still need images`
                }
              </p>
              {propsWithNoImages > 0 && (
                <Link href="/dashboard/moderator/images">
                  <Badge variant="outline" className="gap-1.5 cursor-pointer hover:bg-muted transition-colors">
                    <ImageIcon className="h-3 w-3" />
                    Upload images
                  </Badge>
                </Link>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Recent activity */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Recent activity</h2>
          <Link href="/dashboard/moderator/activity" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <Card className="border-border/60 overflow-hidden">
          <CardContent className="px-0 pb-0">
            {!(recentActivity.data ?? []).length ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <ClipboardList className="h-8 w-8 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  No activity yet. Head to the queue to start reviewing.
                </p>
              </div>
            ) : (
              <div className="flex flex-col">
                {(recentActivity.data ?? []).map((log: any, i: number) => {
                  const dotColor = ACTION_COLOR[log.action] ?? 'bg-muted-foreground'
                  const label    = ACTION_LABELS[log.action] ?? log.action.replace(/_/g, ' ')
                  const target   = getTarget(log.action, log.metadata)

                  return (
                    <div
                      key={log.id}
                      className={`flex items-start gap-4 px-6 py-4 hover:bg-muted/30 transition-colors ${
                        i !== (recentActivity.data?.length ?? 0) - 1 ? 'border-b border-border/50' : ''
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${dotColor}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground">{label}</p>
                          <span className="text-sm text-muted-foreground truncate">— {target}</span>
                        </div>
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
      </section>
    </>
  )
}

function OverviewSkeleton() {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-5 flex flex-col gap-3">
              <div className="w-9 h-9 rounded-xl bg-muted" />
              <div className="h-8 w-12 bg-muted rounded" />
              <div className="h-3 w-28 bg-muted/50 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="w-8 h-8 rounded-lg bg-muted" />
              <div className="h-7 w-10 bg-muted rounded" />
              <div className="h-3 w-20 bg-muted/50 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-border/50 animate-pulse">
        <CardContent className="px-0 pb-0">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-start gap-4 px-6 py-4 border-b border-border/50">
              <div className="w-2 h-2 rounded-full mt-2 bg-muted flex-shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-4 w-48 bg-muted rounded" />
                <div className="h-3 w-32 bg-muted/50 rounded" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  )
}

export default function ModeratorOverviewPage() {
  return (
    <div className="p-4 md:p-8 flex flex-col gap-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-1.5 border-b border-border/50 pb-5">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground tracking-tight">
          Moderator Overview
        </h1>
        <p className="text-sm text-muted-foreground">
          Platform queue status and your personal review performance.
        </p>
      </div>
      <Suspense fallback={<OverviewSkeleton />}>
        <OverviewContent />
      </Suspense>
    </div>
  )
}