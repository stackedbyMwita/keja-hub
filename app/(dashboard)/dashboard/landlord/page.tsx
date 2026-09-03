import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { Building2, CheckCircle2, Home, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { connection } from 'next/server'

import { PropertyList } from '@/components/Components/DataTable'
import { StatItem, StatsGrid } from '@/components/Components/StatsGrid'
import { DashboardPageWrapper } from '@/components/dashboard/DashboardPageWrapper'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PropertyStatus } from '@/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export const dynamic = 'force-dynamic'



export default async function LandlordOverviewPage() {
  await connection()
  const { userId } = await auth()

  // 1. Fetch data
  const { data: properties } = await supabase
    .from('properties')
    .select(`*, unit_types(id, type, total_count, available_count, status)`)
    .eq('landlord_id', userId!)
    .order('created_at', { ascending: false })

  // 2. Calculate aggregates
  const props          = properties ?? []
  const totalProps     = props.length
  const totalUnits     = props.reduce((a, p) => a + (p.unit_types?.reduce((b: number, u: any) => b + u.total_count, 0) ?? 0), 0)
  const availableUnits = props.reduce((a, p) => a + (p.unit_types?.filter((u: any) => u.status === 'active').reduce((b: number, u: any) => b + u.available_count, 0) ?? 0), 0)
  const approvedProps  = props.filter(p => p.status === 'approved').length

  // 3. Format data for the PropertyList Component
  const formattedProperties = props.slice(0, 5).map(p => {
    const units  = p.unit_types ?? []
    const tUnits = units.reduce((a: number, u: any) => a + u.total_count, 0)
    const aUnits = units.filter((u: any) => u.status === 'active').reduce((a: number, u: any) => a + u.available_count, 0)

    // Map database status strings to the strict UI PropertyStatus types
    let uiStatus: PropertyStatus = 'Pending'
    if (p.status === 'approved') uiStatus = 'Approved'
    if (p.status === 'rejected' || p.status === 'suspended') uiStatus = 'Rejected'

    return {
      id: p.id,
      name: p.name,
      location: `${p.location}, ${p.county}`,
      totalUnits: tUnits,
      availableUnits: aUnits,
      status: uiStatus 
    }
  })

  const stats: StatItem[] = [
    {
      label: 'Total properties',
      value: totalProps ?? 0,
      icon: Building2
    },
    {
      label: 'Total units',
      value: totalUnits ?? 0,
      icon: Home
    },
    {
      label: 'Available units',
      value: availableUnits ?? 0,
      icon: Building2
    },
    {
      label: 'Approved properties',
      value: approvedProps ?? 0,
      icon: CheckCircle2
    },
  ]

  return (
    <DashboardPageWrapper>
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here&apos;s a summary of your properties on KejaLink.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/landlord/properties/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add property
          </Link>
        </Button>
      </div>

      {/* Analytics Grid */}
      <StatsGrid cols={4} stats={stats} />

      {/* Conditional Rendering: Empty State vs Data List */}
      {totalProps === 0 ? (
        <Card className="border-dashed border-2 bg-transparent shadow-none mt-2">
          <CardContent className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">No properties yet</p>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto">
                Add your first property to start listing on KejaLink. Our team will verify it within 1–3 days.
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
      ) : (
        <PropertyList 
          title="Recent properties"
          properties={formattedProperties}
          viewAllLink="/dashboard/landlord/properties"
        />
      )}

    </DashboardPageWrapper>
  )
}