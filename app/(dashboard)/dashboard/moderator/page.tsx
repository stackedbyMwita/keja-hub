import { Suspense } from 'react'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardList, CheckCircle2, XCircle, Clock } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function OverviewContent() {
  const { userId } = await auth()

  // Fetch stats concurrently
  const now       = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [pending, approved, rejected, myApproved, myRejected] = await Promise.all([
    supabase.from('landlord_profiles').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('landlord_profiles').select('id', { count: 'exact', head: true }).eq('status', 'approved').gte('reviewed_at', monthStart),
    supabase.from('landlord_profiles').select('id', { count: 'exact', head: true }).eq('status', 'rejected').gte('reviewed_at', monthStart),
    supabase.from('landlord_profiles').select('id', { count: 'exact', head: true }).eq('status', 'approved').eq('reviewed_by', userId!).gte('reviewed_at', monthStart),
    supabase.from('landlord_profiles').select('id', { count: 'exact', head: true }).eq('status', 'rejected').eq('reviewed_by', userId!).gte('reviewed_at', monthStart),
  ])

  // Refactored to use only semantic theme variables (no hardcoded colors)
  const stats = [
    {
      label:  'Pending in queue',
      value:  pending.count ?? 0,
      icon:   Clock,
      color:  'text-foreground',
      bg:     'bg-muted',
      border: 'border-border',
    },
    {
      label:  'Approved this month',
      value:  approved.count ?? 0,
      icon:   CheckCircle2,
      color:  'text-primary',
      bg:     'bg-primary/10',
      border: 'border-primary/20',
    },
    {
      label:  'Rejected this month',
      value:  rejected.count ?? 0,
      icon:   XCircle,
      color:  'text-destructive',
      bg:     'bg-destructive/10',
      border: 'border-destructive/20',
    },
    {
      label:  'My reviews this month',
      value:  (myApproved.count ?? 0) + (myRejected.count ?? 0),
      icon:   ClipboardList,
      color:  'text-accent-foreground',
      bg:     'bg-accent',
      border: 'border-border',
    },
  ]

  // Recent activity
  const { data: recentActivity } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('actor_id', userId!)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <>
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className={`border ${stat.border} shadow-sm transition-all hover:shadow-md rounded-2xl`}>
            <CardHeader className="pb-2 pt-5 px-5 flex flex-row items-center justify-between">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center border border-background/50`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 mt-1">
              <p className="text-3xl font-bold text-foreground tabular-nums tracking-tight">{stat.value}</p>
              <p className="text-sm font-medium text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent activity */}
      <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
        <CardHeader className="pb-4 bg-muted/20 border-b border-border/50">
          <CardTitle className="text-base font-semibold">My recent activity</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {!recentActivity?.length ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <ClipboardList className="h-8 w-8 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                No activity yet. Head to the queue to start reviewing.
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {recentActivity.map((log, i) => (
                <div
                  key={log.id}
                  className={`flex items-start gap-4 px-6 py-4 hover:bg-muted/30 transition-colors ${
                    i !== recentActivity.length - 1 ? 'border-b border-border/50' : ''
                  }`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 shadow-sm ${
                    log.action.includes('approved') ? 'bg-primary' : 'bg-destructive'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground font-semibold">
                      {log.action === 'approved_landlord_application'
                        ? `Approved: ${log.metadata?.landlord_name ?? 'Unknown'}`
                        : `Rejected: ${log.metadata?.landlord_name ?? 'Unknown'}`
                      }
                    </p>
                    <p className="text-xs font-medium text-muted-foreground mt-1">
                      {new Date(log.created_at).toLocaleDateString('en-KE', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

function OverviewSkeleton() {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border border-border/50 rounded-2xl">
            <CardHeader className="pb-2 pt-5 px-5">
              <div className="w-10 h-10 rounded-xl bg-muted" />
            </CardHeader>
            <CardContent className="px-5 pb-5 gap-3 flex flex-col mt-3">
              <div className="h-8 w-16 bg-muted rounded-md" />
              <div className="h-4 w-28 bg-muted/50 rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="animate-pulse rounded-2xl border-border/50">
        <CardHeader className="pb-4 border-b border-border/50">
          <div className="h-5 w-40 bg-muted rounded-md" />
        </CardHeader>
        <CardContent className="px-0 pb-0 flex flex-col">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-4 px-6 py-5 border-b border-border/50">
              <div className="w-2.5 h-2.5 rounded-full mt-1 bg-muted flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-56 bg-muted rounded-md" />
                <div className="h-3 w-32 bg-muted/50 rounded-md" />
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
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground tracking-tight">
          Good work, moderator.
        </h1>
        <p className="text-base text-muted-foreground">
          Here&apos;s a quick overview of what&apos;s happening on KejaLink today.
        </p>
      </div>

      <Suspense fallback={<OverviewSkeleton />}>
        <OverviewContent />
      </Suspense>
    </div>
  )
}