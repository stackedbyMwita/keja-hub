import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, FileText } from 'lucide-react'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export default async function ModeratorActivityPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { data: logs } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('actor_id', userId!)
    .order('created_at', { ascending: false })
    .limit(50)

  const totalApproved = logs?.filter(l => l.action.includes('approved')).length ?? 0
  const totalRejected = logs?.filter(l => l.action.includes('rejected')).length ?? 0

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 max-w-7xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">My Activity</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your complete review history
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tabular-nums">{totalApproved}</p>
              <p className="text-xs text-muted-foreground">Total approved</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-destructive/5 flex items-center justify-center shrink-0">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tabular-nums">{totalRejected}</p>
              <p className="text-xs text-muted-foreground">Total rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Log list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Activity log
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {!logs?.length ? (
            <p className="text-sm text-muted-foreground px-6 pb-6">
              No activity yet. Start reviewing applications from the queue.
            </p>
          ) : (
            <div className="flex flex-col">
              {logs.map((log, i) => {
                const isApproved = log.action.includes('approved')
                return (
                  <div
                    key={log.id}
                    className={`flex items-start gap-3 px-4 md:px-6 py-3.5 ${
                      i !== logs.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      isApproved
                        ? 'bg-green-50 dark:bg-green-950/30'
                        : 'bg-destructive/5'
                    }`}>
                      {isApproved
                        ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                        : <XCircle className="h-3.5 w-3.5 text-destructive" />
                      }
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground">
                          {log.metadata?.landlord_name ?? 'Unknown applicant'}
                        </p>
                        <Badge
                          variant={isApproved ? 'secondary' : 'destructive'}
                          className="text-xs capitalize rounded-full"
                        >
                          {isApproved ? 'Approved' : 'Rejected'}
                        </Badge>
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
  )
}