import { createClient } from '@supabase/supabase-js'
import { connection } from 'next/server'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Building2, MapPin, Clock, ArrowRight, Inbox, Home } from 'lucide-react'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const TYPE_LABELS: Record<string, string> = {
  single_room: 'Single Room', double_room: 'Double Room',
  bedsitter: 'Bedsitter', studio: 'Studio',
  '1br': '1 Bed', '2br': '2 Bed', '3br': '3 Bed',
  '4br_plus': '4+ Bed', commercial: 'Commercial',
}

function timeAgo(date: string): string {
  const diff  = Date.now() - new Date(date).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1)  return 'Just now'
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default async function ModeratorPropertiesPage() {
  await connection()

  const { data: properties } = await supabase
    .from('properties')
    .select(`
      id, name, county, location, status, submitted_at,
      profiles!landlord_id ( full_name, phone_number ),
      unit_types ( id, type, price, total_count )
    `)
    .eq('status', 'pending_review')
    .order('submitted_at', { ascending: true })

  const props = properties ?? []

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Property Reviews</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {props.length} propert{props.length !== 1 ? 'ies' : 'y'} pending review
          </p>
        </div>
        <Badge variant="secondary" className="tabular-nums">
          {props.length} pending
        </Badge>
      </div>

      {/* Empty state */}
      {props.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Inbox className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No properties to review</p>
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              All property submissions have been reviewed. Check back later.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Property cards */}
      <div className="flex flex-col gap-3">
        {props.map((property: any) => {
          const units      = property.unit_types ?? []
          const totalUnits = units.reduce((a: number, u: any) => a + u.total_count, 0)
          const unitTypes  = units.map((u: any) => TYPE_LABELS[u.type] ?? u.type)
          const landlord   = property.profiles

          return (
            <Card key={property.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4 md:p-5">
                <div className="flex items-start justify-between gap-4">

                  {/* Left */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {property.name}
                      </p>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {property.location}, {property.county}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Home className="h-3 w-3 shrink-0" />
                        {totalUnits} units · {unitTypes.slice(0, 3).join(', ')}
                        {unitTypes.length > 3 && ` +${unitTypes.length - 3} more`}
                      </div>

                      {landlord && (
                        <p className="text-xs text-muted-foreground">
                          by <span className="font-medium text-foreground">{landlord.full_name}</span>
                          {' '}· {landlord.phone_number}
                        </p>
                      )}

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Submitted {timeAgo(property.submitted_at ?? property.created_at)}
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <Button asChild size="sm" className="shrink-0">
                    <Link href={`/dashboard/moderator/properties/${property.id}`}>
                      Review
                      <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Link>
                  </Button>

                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

    </div>
  )
}