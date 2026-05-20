import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { connection } from 'next/server'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Building2, Home, CheckCircle2, Clock,
  PlusCircle, ArrowRight, XCircle,
} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const STATUS_CONFIG = {
  draft:          { label: 'Draft',       color: 'bg-muted text-muted-foreground',          icon: Home        },
  pending_review: { label: 'In Review',   color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400', icon: Clock       },
  approved:       { label: 'Approved',    color: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400', icon: CheckCircle2 },
  rejected:       { label: 'Rejected',    color: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',         icon: XCircle     },
  suspended:      { label: 'Suspended',   color: 'bg-orange-100 text-orange-700',            icon: XCircle     },
} as const

export const dynamic = 'force-dynamic'

export default async function LandlordOverviewPage() {
  await connection()
  const { userId } = await auth()

  const { data: properties } = await supabase
    .from('properties')
    .select(`*, unit_types(id, type, total_count, available_count, status)`)
    .eq('landlord_id', userId!)
    .order('created_at', { ascending: false })

  const props         = properties ?? []
  const totalProps    = props.length
  const totalUnits    = props.reduce((a, p) => a + (p.unit_types?.reduce((b: number, u: any) => b + u.total_count, 0) ?? 0), 0)
  const availableUnits = props.reduce((a, p) => a + (p.unit_types?.filter((u: any) => u.status === 'active').reduce((b: number, u: any) => b + u.available_count, 0) ?? 0), 0)
  const approvedProps = props.filter(p => p.status === 'approved').length

  const stats = [
    { label: 'Total properties', value: totalProps,    icon: Building2,    color: 'text-primary',    bg: 'bg-primary/10'    },
    { label: 'Total units',      value: totalUnits,    icon: Home,         color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-950/30'   },
    { label: 'Available units',  value: availableUnits, icon: CheckCircle2, color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-950/30'  },
    { label: 'Approved',         value: approvedProps, icon: CheckCircle2, color: 'text-primary',    bg: 'bg-primary/10'    },
  ]

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 max-w-4xl mx-auto">

      {/* Welcome */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Welcome back 👋</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here&apos;s a summary of your properties on KejaHub.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/dashboard/landlord/properties/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add property
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
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

      {/* No properties CTA */}
      {totalProps === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">No properties yet</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Add your first property to start listing on KejaHub. Our team will verify it within 1–3 days.
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

      {/* Recent properties */}
      {props.length > 0 && (
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Your properties</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link href="/dashboard/landlord/properties">
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {props.slice(0, 5).map((property, i) => {
              const config = STATUS_CONFIG[property.status as keyof typeof STATUS_CONFIG]
              const Icon   = config.icon
              const units  = property.unit_types ?? []
              const totalU = units.reduce((a: number, u: any) => a + u.total_count, 0)
              const availU = units.filter((u: any) => u.status === 'active').reduce((a: number, u: any) => a + u.available_count, 0)

              return (
                <Link
                  key={property.id}
                  href={`/dashboard/landlord/properties/${property.id}`}
                  className={`flex items-center gap-4 px-4 md:px-6 py-4 hover:bg-muted/50 transition-colors ${
                    i !== Math.min(props.length, 5) - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{property.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {property.location}, {property.county} · {totalU} units · {availU} available
                    </p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
                    <Icon className="h-3 w-3" />
                    {config.label}
                  </div>
                </Link>
              )
            })}
          </CardContent>
        </Card>
      )}

    </div>
  )
}