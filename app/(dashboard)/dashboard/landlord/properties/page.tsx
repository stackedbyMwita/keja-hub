import { StatusBadge } from '@/components/Components/StatusBadge'
import { DashboardPageWrapper } from '@/components/dashboard/DashboardPageWrapper'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import {
  AlertCircle, ArrowRight,
  Building2,
  CheckCircle2, Clock,
  Home,
  MapPin,
  PlusCircle,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { connection } from 'next/server'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

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
    <DashboardPageWrapper>

      {/* Header Section */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Properties</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {props.length} {props.length === 1 ? 'property' : 'properties'} total
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/landlord/properties/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add property
          </Link>
        </Button>
      </div>

      {/* Empty State */}
      {props.length === 0 && (
        <Card className="border-dashed border-2 bg-transparent shadow-none mt-2">
          <CardContent className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">No properties yet</p>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto">
                Add your first property to get started. Our team will verify it within 1–3 days.
              </p>
            </div>
            <Button asChild className="mt-2">
              <Link href="/dashboard/landlord/properties/new">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add your first property
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Properties List */}
      <div className="flex flex-col gap-3">
        {props.map((property) => {
          const units      = property.unit_types ?? []
          const totalUnits = units.reduce((a: number, u: any) => a + u.total_count, 0)
          const activeUnits = units.filter((u: any) => u.status === 'active')
          const availUnits = activeUnits.reduce((a: number, u: any) => a + u.available_count, 0)
          const unitTypes  = [...new Set(units.map((u: any) => u.type))].length

          return (
            <Link
              key={property.id}
              href={`/dashboard/landlord/properties/${property.id}`}
              className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
            >
              <Card className="hover:shadow-md transition-all duration-200 group-hover:border-primary/40">
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-start gap-4">

                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                          {property.name}
                        </h3>
                        <StatusBadge status={property.status} />

                      </div>

                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{property.location}, {property.county}</span>
                      </div>

                      <div className="flex items-center gap-x-4 gap-y-2 mt-3 flex-wrap">
                        <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
                          <Home className="h-3.5 w-3.5" />
                          {totalUnits} units · {unitTypes} {unitTypes === 1 ? 'type' : 'types'}
                        </span>
                        
                        {property.status === 'approved' && availUnits > 0 && (
                          <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {availUnits} available
                          </span>
                        )}
                        
                        {property.total_score > 0 && (
                          <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                            Score: {property.total_score}/100
                          </span>
                        )}
                      </div>

                      {/* Rejection reason preview */}
                      {property.status === 'rejected' && property.rejection_reason && (
                        <p className="text-sm font-medium text-destructive mt-3 line-clamp-2 bg-destructive/10 px-3 py-2 rounded-md border border-destructive/20">
                          <span className="font-bold mr-1">Reason:</span> 
                          {property.rejection_reason}
                        </p>
                      )}
                    </div>

                    {/* Arrow Indicator */}
                    <div className="hidden sm:flex self-center">
                      <ArrowRight className="h-5 w-5 text-muted-foreground/50 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

    </DashboardPageWrapper>
  )
}