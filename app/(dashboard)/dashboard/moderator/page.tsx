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

  const stats = [
    {
      label:  'Pending in queue',
      value:  pending.count ?? 0,
      icon:   Clock,
      color:  'text-amber-500',
      bg:     'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800',
    },
    {
      label:  'Approved this month',
      value:  approved.count ?? 0,
      icon:   CheckCircle2,
      color:  'text-green-600',
      bg:     'bg-green-50 dark:bg-green-950/30',
      border: 'border-green-200 dark:border-green-800',
    },
    {
      label:  'Rejected this month',
      value:  rejected.count ?? 0,
      icon:   XCircle,
      color:  'text-destructive',
      bg:     'bg-destructive/5',
      border: 'border-destructive/20',
    },
    {
      label:  'My reviews this month',
      value:  (myApproved.count ?? 0) + (myRejected.count ?? 0),
      icon:   ClipboardList,
      color:  'text-primary',
      bg:     'bg-primary/5',
      border: 'border-primary/20',
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label} className={`border ${stat.border}`}>
            <CardHeader className="pb-2 pt-4 px-4">
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">My recent activity</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {!recentActivity?.length ? (
            <p className="text-sm text-muted-foreground px-6 pb-6">
              No activity yet. Head to the queue to start reviewing.
            </p>
          ) : (
            <div className="flex flex-col">
              {recentActivity.map((log, i) => (
                <div
                  key={log.id}
                  className={`flex items-start gap-3 px-6 py-3 ${
                    i !== recentActivity.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    log.action.includes('approved') ? 'bg-green-500' : 'bg-destructive'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground font-medium">
                      {log.action === 'approved_landlord_application'
                        ? `Approved: ${log.metadata?.landlord_name ?? 'Unknown'}`
                        : `Rejected: ${log.metadata?.landlord_name ?? 'Unknown'}`
                      }
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border border-border">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="w-8 h-8 rounded-lg bg-muted" />
            </CardHeader>
            <CardContent className="px-4 pb-4 gap-2 flex flex-col mt-2">
              <div className="h-6 w-12 bg-muted rounded" />
              <div className="h-3 w-24 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="animate-pulse">
        <CardHeader className="pb-3">
          <div className="h-5 w-32 bg-muted rounded" />
        </CardHeader>
        <CardContent className="px-0 pb-0 flex flex-col">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 px-6 py-4 border-b border-border">
              <div className="w-2 h-2 rounded-full mt-1.5 bg-muted flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-muted rounded" />
                <div className="h-3 w-32 bg-muted rounded" />
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
    <div className="p-4 md:p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Good work, moderator.</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Here&apos;s what&apos;s happening on KejaHub today.
        </p>
      </div>

      <Suspense fallback={<OverviewSkeleton />}>
        <OverviewContent />
      </Suspense>
    </div>
  )
}