import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { connection } from 'next/server'
import Link from 'next/link'
import { Building2, Home, CheckCircle2, PlusCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DashboardPageWrapper } from '@/components/dashboard/DashboardPageWrapper'
import { PropertyList, PropertyStatus } from '@/components/Components/DataTable'
import { StatCard } from '@/components/Components/StatCard'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export const dynamic = 'force-dynamic'

export default async function LandlordOverviewPage() {
  await connection()
  const { userId } = await auth()

  // 1. Fetch Data
  const { data: properties } = await supabase
    .from('properties')
    .select(`*, unit_types(id, type, total_count, available_count, status)`)
    .eq('landlord_id', userId!)
    .order('created_at', { ascending: false })

  // 2. Calculate Aggregates
  const props          = properties ?? []
  const totalProps     = props.length
  const totalUnits     = props.reduce((a, p) => a + (p.unit_types?.reduce((b: number, u: any) => b + u.total_count, 0) ?? 0), 0)
  const availableUnits = props.reduce((a, p) => a + (p.unit_types?.filter((u: any) => u.status === 'active').reduce((b: number, u: any) => b + u.available_count, 0) ?? 0), 0)
  const approvedProps  = props.filter(p => p.status === 'approved').length

  // 3. Format Data for the PropertyList UI Component
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total properties" 
          value={totalProps} 
          icon={Building2} 
          iconBg="bg-primary/10"
          iconColor="text-primary"
        />
        <StatCard 
          title="Total units" 
          value={totalUnits} 
          icon={Home} 
          iconBg="bg-blue-500/10"
          iconColor="text-blue-500 dark:text-blue-400"
        />
        <StatCard 
          title="Available units" 
          value={availableUnits} 
          icon={CheckCircle2} 
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard 
          title="Approved" 
          value={approvedProps} 
          icon={CheckCircle2} 
          iconBg="bg-primary/10"
          iconColor="text-primary"
        />
      </div>

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