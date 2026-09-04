import { StatusBadge } from '@/components/Components/StatusBadge'
import { DashboardPageWrapper } from '@/components/dashboard/DashboardPageWrapper'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getPropertyTypeLabel } from '@/lib/constants/propertyTypes'
import { timeAgo } from '@/lib/utils'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import {
  Building2,
  Clock,
  Home,
  Images,
  Inbox,
  MapPin
} from 'lucide-react'
import Link from 'next/link'
import { connection } from 'next/server'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export default async function ModeratorPropertiesPage() {
  await connection()
  const { userId } = await auth()

  // 1. Fetch pending properties
  const { data: pendingProps } = await supabase
    .from('properties')
    .select(`
      id, name, county, location, status,
      submitted_at, approved_at, created_at, approved_by,
      profiles!landlord_id ( full_name, phone_number )
    `)
    .eq('status', 'pending_review')
    .order('submitted_at', { ascending: false, nullsFirst: false })

  // 2. Fetch reviewed properties
  const { data: myProps } = await supabase
    .from('properties')
    .select(`
      id, name, county, location, status,
      submitted_at, approved_at, created_at, approved_by,
      profiles!landlord_id ( full_name, phone_number )
    `)
    .eq('approved_by', userId!)
    .in('status', ['approved', 'rejected'])
    .order('approved_at', { ascending: false, nullsFirst: false })

  const pending  = pendingProps ?? []
  const reviewed = myProps ?? []
  const approved = reviewed.filter((p) => p.status === 'approved')
  const rejected = reviewed.filter((p) => p.status === 'rejected')

  // Combine and order by newest activity date (submitted or reviewed)
  const allProperties = [...pending, ...reviewed].sort((a, b) => {
    const dateA = new Date(a.approved_at ?? a.submitted_at ?? a.created_at).getTime()
    const dateB = new Date(b.approved_at ?? b.submitted_at ?? b.created_at).getTime()
    return dateB - dateA
  })

  return (
    <DashboardPageWrapper>
      {/* Header */}
      <div className="flex flex-col gap-2 pb-5">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground tracking-tight">
          Property Reviews
        </h1>
        <div className="flex items-center gap-2 flex-wrap pt-1">
          {/* Total */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted/60 text-foreground border border-border/60">
            <span className="w-1.5 h-1.5 rounded-full bg-foreground/40" />
            {allProperties.length} total
          </span>

          {/* Pending */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {pending.length} pending
          </span>

          {/* Approved */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {approved.length} approved
          </span>

          {/* Rejected */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {rejected.length} rejected
          </span>
        </div>
      </div>

      {/* Tabs Filter */}
      <Tabs defaultValue="all" className="w-full flex flex-col">
        <div className="mb-6 overflow-x-auto pb-2">
          <TabsList className="inline-flex bg-muted/50 p-1 w-full sm:w-max self-start">
            <TabsTrigger value="all" className="px-4 py-1.5">
              All ({allProperties.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2 px-4 py-1.5">
              Pending
              {pending.length > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {pending.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="px-4 py-1.5">
              Approved ({approved.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="px-4 py-1.5">
              Rejected ({rejected.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Panels */}
        <TabsContent value="all" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          <PropertyList
            properties={allProperties}
            emptyMessage="No properties found"
            emptyDescription="There are currently no submitted or reviewed properties to display."
          />
        </TabsContent>

        <TabsContent value="pending" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          <PropertyList
            properties={pending}
            emptyMessage="No properties pending review"
            emptyDescription="All submissions have been reviewed. Check back later."
          />
        </TabsContent>

        <TabsContent value="approved" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          <PropertyList
            properties={approved}
            emptyMessage="No approved properties yet"
            emptyDescription="Properties you approve will appear here."
          />
        </TabsContent>

        <TabsContent value="rejected" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          <PropertyList
            properties={rejected}
            emptyMessage="No rejected properties"
            emptyDescription="Properties you reject will appear here."
          />
        </TabsContent>
      </Tabs>
      
    </DashboardPageWrapper>
  )
}

function PropertyList({
  properties,
  emptyMessage,
  emptyDescription,
}: {
  properties: any[]
  emptyMessage: string
  emptyDescription: string
}) {
  if (properties.length === 0) {
    return (
      <Card className="border-dashed border-border/60 bg-transparent shadow-none w-full">
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center">
            <Inbox className="h-6 w-6 text-muted-foreground/70" />
          </div>
          <p className="text-base font-semibold text-foreground mt-2">{emptyMessage}</p>
          <p className="text-sm text-muted-foreground text-center max-w-xs">{emptyDescription}</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {properties.map((property: any) => {
        const units = property.unit_types ?? []
        const totalUnits = units.reduce((a: number, u: any) => a + (u.total_count ?? 0), 0)
        const unitTypes = units.map((u: any) => getPropertyTypeLabel(u.type, { short: true }))
        const landlord = property.profiles
        const imageCount = units.reduce((acc: number, u: any) => acc + (u.unit_images?.length ?? 0), 0)

        return (
          <Card
            key={property.id}
            className="hover:shadow-md transition-all duration-200 border-border/60 rounded-2xl overflow-hidden w-full"
          >
            <Link href={`/dashboard/moderator/properties/${property.id}`}>
              <CardContent className="p-5 md:p-6 bg-card">
                <div className="flex items-start gap-4">

                  {/* Icon */}
                  <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <p className="text-base font-bold text-foreground truncate">
                        {property.name}
                      </p>

                      {/* Status indicator on every card */}
                      <StatusBadge status={property.status} />
                    </div>

                    <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                      {property.location}, {property.county}
                    </div>

                    <div className="flex items-center gap-4 flex-wrap mt-1">
                      {units.length > 0 && (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                          <Home className="h-3.5 w-3.5 text-muted-foreground/70" />
                          {totalUnits} units · {unitTypes.slice(0, 2).join(', ')}
                          {unitTypes.length > 2 && ` +${unitTypes.length - 2}`}
                        </span>
                      )}

                      {imageCount > 0 && (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                          <Images className="h-3.5 w-3.5 text-muted-foreground/70" />
                          {imageCount} image{imageCount !== 1 ? 's' : ''}
                        </span>
                      )}

                      {landlord && (
                        <span className="text-xs font-medium text-muted-foreground">
                          by <span className="font-semibold text-foreground">{landlord.full_name}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mt-1">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                      {property.status === 'pending_review'
                        ? `Submitted ${timeAgo(property.submitted_at ?? property.created_at)}`
                        : `Reviewed ${timeAgo(property.approved_at ?? property.submitted_at ?? property.created_at)}`}
                    </div>
                  </div>

                </div>
              </CardContent>
            </Link>
          </Card>
        )
      })}
    </div>
  )
}