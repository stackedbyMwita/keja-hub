import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Building2, Clock, ArrowRight, Inbox, User } from 'lucide-react'
import { timeAgo } from '@/lib/date'
import { DashboardPageWrapper } from '@/components/dashboard/DashboardPageWrapper'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export default async function ModeratorQueuePage() {
  const { data: applications } = await supabase
    .from('landlord_profiles')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  return (
    <DashboardPageWrapper>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Review Queue</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {applications?.length ?? 0} application{applications?.length !== 1 ? 's' : ''} pending review
          </p>
        </div>
        <Badge variant="secondary" className="tabular-nums rounded-full">
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
            <p className="text-sm font-medium text-foreground">Landlord application queue is empty</p>
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
            <CardContent className="p-4 md:p-6">
  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
    {/* Left Section */}
    <div className="flex items-start gap-4 flex-1 min-w-0">
      {/* Avatar */}
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
        <User className="h-6 w-6 text-primary" />
      </div>

      {/* Info Section */}
      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        {/* Name & Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-semibold text-foreground truncate">
            {app.full_name}
          </h3>
          {app.assigned_moderator_id && (
            <Badge variant="secondary" className="text-xs rounded-full bg-emerald-50 text-emerald-700 border-emerald-200">
              ✓ Claimed
            </Badge>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1.5">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/70" />
            {app.location}, {app.county}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/70" />
            0{app.phone_number}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/70" />
            {app.number_of_properties} {app.number_of_properties === 1 ? 'property' : 'properties'} · {app.number_of_units} units
          </span>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70 mt-0.5">
          <Clock className="h-3 w-3" />
          <span>Submitted {timeAgo(app.created_at)}</span>
        </div>
      </div>
    </div>

    {/* Right - Action Button */}
    <Button asChild size="sm" className="shrink-0 rounded-full px-6">
      <Link href={`/dashboard/moderator/landlord/${app.id}`}>
        Review
        <ArrowRight className="h-3.5 w-3.5 ml-2" />
      </Link>
    </Button>
  </div>
</CardContent>
          </Card>
        ))}
      </div>

    </DashboardPageWrapper>
  )
}