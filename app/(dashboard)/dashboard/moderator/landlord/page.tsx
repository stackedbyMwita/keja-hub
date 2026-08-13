import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Building2, Clock, ArrowRight, Inbox } from 'lucide-react'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

function timeAgo(date: string): string {
  const diff  = Date.now() - new Date(date).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1)   return 'Just now'
  if (hours < 24)  return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default async function ModeratorQueuePage() {
  const { data: applications } = await supabase
    .from('landlord_profiles')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Review Queue</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {applications?.length ?? 0} application{applications?.length !== 1 ? 's' : ''} pending review
          </p>
        </div>
        <Badge variant="secondary" className="tabular-nums">
          {applications?.length ?? 0} pending
        </Badge>
      </div>

      {/* Empty state */}
      {!applications?.length && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Inbox className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Queue is empty</p>
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              All landlord applications have been reviewed. Check back later.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Application cards */}
      <div className="flex flex-col gap-3">
        {applications?.map((app) => (
          <Card key={app.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-start justify-between gap-4">

                {/* Left — info */}
                <div className="flex flex-col gap-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">
                      {app.full_name}
                    </p>
                    {app.assigned_moderator_id && (
                      <Badge variant="outline" className="text-xs">
                        Claimed
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      {app.location}, {app.county}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3 flex-shrink-0" />
                      {app.phone_number}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3 flex-shrink-0" />
                      {app.number_of_properties} {app.number_of_properties === 1 ? 'property' : 'properties'} · {app.number_of_units} units
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Submitted {timeAgo(app.created_at)}
                  </div>
                </div>

                {/* Right — action */}
                <Button asChild size="sm" className="shrink-0">
                  <Link href={`/dashboard/moderator/queue/${app.id}`}>
                    Review
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Link>
                </Button>

              </div>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  )
}