import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { connection } from 'next/server'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Building2, PlusCircle, MapPin, Home,
  CheckCircle2, Clock, XCircle, AlertCircle, ArrowRight,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const STATUS_CONFIG = {
  draft:          { label: 'Draft',      variant: 'secondary',   icon: AlertCircle  },
  pending_review: { label: 'In Review',  variant: 'outline',     icon: Clock        },
  approved:       { label: 'Approved',   variant: 'default',     icon: CheckCircle2 },
  rejected:       { label: 'Rejected',   variant: 'destructive', icon: XCircle      },
  suspended:      { label: 'Suspended',  variant: 'destructive', icon: XCircle      },
} as const

export default async function LandlordPropertiesPage() {
  await connection()
  const { userId } = await auth()

  const { data: properties } = await supabase
    .from('properties')
    .select(`*, unit_types(id, type, total_count, available_count, status)`)
    .eq('landlord_id', userId!)
    .order('created_at', { ascending: false })

  const props = properties ?? []

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">My Properties</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {props.length} {props.length === 1 ? 'property' : 'properties'} total
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/dashboard/landlord/properties/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add property
          </Link>
        </Button>
      </div>

      {/* Empty state */}
      {props.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">No properties yet</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Add your first property to get started. Our team will verify it within 1–3 days.
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/landlord/properties/new">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add your first property
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Properties list */}
      <div className="flex flex-col gap-3">
        {props.map((property) => {
          const config     = STATUS_CONFIG[property.status as keyof typeof STATUS_CONFIG]
          const Icon       = config.icon
          const units      = property.unit_types ?? []
          const totalUnits = units.reduce((a: number, u: any) => a + u.total_count, 0)
          const activeUnits = units.filter((u: any) => u.status === 'active')
          const availUnits = activeUnits.reduce((a: number, u: any) => a + u.available_count, 0)
          const unitTypes  = [...new Set(units.map((u: any) => u.type))].length

          return (
            <Link
              key={property.id}
              href={`/dashboard/landlord/properties/${property.id}`}
              className="block group"
            >
              <Card className="hover:shadow-md transition-all group-hover:border-primary/30">
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-start gap-4">

                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          {property.name}
                        </p>
                        <Badge variant={config.variant as any} className="flex items-center gap-1 shrink-0 text-xs">
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {property.location}, {property.county}
                      </div>

                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Home className="h-3 w-3" />
                          {totalUnits} units · {unitTypes} {unitTypes === 1 ? 'type' : 'types'}
                        </span>
                        {property.status === 'approved' && (
                          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                            <CheckCircle2 className="h-3 w-3" />
                            {availUnits} available
                          </span>
                        )}
                        {property.total_score > 0 && (
                          <span className="text-xs font-medium text-primary">
                            Score: {property.total_score}/100
                          </span>
                        )}
                      </div>

                      {/* Rejection reason preview */}
                      {property.status === 'rejected' && property.rejection_reason && (
                        <p className="text-xs text-destructive mt-2 line-clamp-1">
                          {property.rejection_reason}
                        </p>
                      )}
                    </div>

                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

    </div>
  )
}