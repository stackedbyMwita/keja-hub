import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { connection } from 'next/server'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Building2, MapPin, Clock, ArrowRight,
  Inbox, Home, CheckCircle2, XCircle, Images,
} from 'lucide-react'
import { timeAgo } from '@/lib/date'

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

const STATUS_CONFIG = {
  pending_review: { label: 'Pending',  variant: 'outline',     icon: Clock        },
  approved:       { label: 'Approved', variant: 'default',     icon: CheckCircle2 },
  rejected:       { label: 'Rejected', variant: 'destructive', icon: XCircle      },
} as const

export default async function ModeratorPropertiesPage() {
  await connection()
  const { userId } = await auth()

  // Fetch ALL properties this moderator has interacted with
  const { data: pendingProps, error: pendingError } = await supabase
    .from('properties')
    .select(`
      id, name, county, location, status,
      submitted_at, approved_at, created_at, approved_by,
      profiles!landlord_id ( full_name, phone_number )
    `)
    .eq('status', 'pending_review')
    .order('submitted_at', { ascending: false, nullsFirst: false })

   console.log("Penidng error", pendingError) 
   console.log("Penidng Properties", pendingProps) 

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

  const pending  = pendingProps  ?? []
  const reviewed = myProps       ?? []
  const approved = reviewed.filter(p => p.status === 'approved')
  const rejected = reviewed.filter(p => p.status === 'rejected')

  console.log(pending)

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full">
      
      {/* ── Header (Fully separated from Tabs) ──────────────────────── */}
      <div className="flex flex-col gap-2 border-b border-border/50 pb-5">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground tracking-tight">
          Property Reviews
        </h1>
        <p className="text-sm font-medium text-muted-foreground">
          {pending.length} pending · {approved.length} approved · {rejected.length} rejected
        </p>
      </div>

      {/* ── Tabs (Standard Top-Down Layout) ─────────────────────────── */}
      <Tabs defaultValue="pending" className="w-full flex flex-col">
        
        {/* Wrapper to allow horizontal scrolling on small screens without breaking layout */}
        <div className="mb-6 overflow-x-auto pb-2">
          <TabsList className="inline-flex bg-muted/50 p-1 w-full sm:w-max self-start">
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

        {/* ── Tab Contents ─────────────────────────────────────────────── */}
        <TabsContent value="pending" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          <PropertyList
            properties={pending}
            emptyMessage="No properties pending review"
            emptyDescription="All submissions have been reviewed. Check back later."
            showImageButton={false}
            currentModeratorId={userId!}
          />
        </TabsContent>

        <TabsContent value="approved" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          <PropertyList
            properties={approved}
            emptyMessage="No approved properties yet"
            emptyDescription="Properties you approve will appear here."
            showImageButton={true}
            currentModeratorId={userId!}
          />
        </TabsContent>

        <TabsContent value="rejected" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          <PropertyList
            properties={rejected}
            emptyMessage="No rejected properties"
            emptyDescription="Properties you reject will appear here."
            showImageButton={false}
            currentModeratorId={userId!}
          />
        </TabsContent>

      </Tabs>
    </div>
  )
}

// ── Reusable property list ───────────────────────────────────────────────────

function PropertyList({
  properties,
  emptyMessage,
  emptyDescription,
  showImageButton,
  currentModeratorId,
}: {
  properties:          any[]
  emptyMessage:        string
  emptyDescription:    string
  showImageButton:     boolean
  currentModeratorId:  string
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
        const units      = property.unit_types ?? []
        const totalUnits = units.reduce((a: number, u: any) => a + u.total_count, 0)
        const unitTypes  = units.map((u: any) => TYPE_LABELS[u.type] ?? u.type)
        const landlord   = property.profiles
        const imageCount = property.unit_images?.length ?? 0
        const config     = STATUS_CONFIG[property.status as keyof typeof STATUS_CONFIG]
          ?? STATUS_CONFIG.pending_review
        const Icon       = config.icon

        return (
          <Card key={property.id} className="hover:shadow-md transition-all duration-200 border-border/60 rounded-2xl overflow-hidden w-full">
            <Link href={`/dashboard/moderator/properties/${property.id}`}>
              <CardContent className="p-5 md:p-6 bg-card">
                <div className="flex items-start gap-4">

                  {/* Icon */}
                  <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <p className="text-base font-bold text-foreground truncate">
                        {property.name}
                      </p>
                      <Badge variant={config.variant as any} className="flex items-center gap-1.5 shrink-0 text-xs px-2 py-1 shadow-sm rounded-full">
                        <Icon className="h-3.5 w-3.5" />
                        {config.label}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                      {property.location}, {property.county}
                    </div>

                    <div className="flex items-center gap-4 flex-wrap mt-1">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Home className="h-3.5 w-3.5 text-muted-foreground/70" />
                        {totalUnits} units · {unitTypes.slice(0, 2).join(', ')}
                        {unitTypes.length > 2 && ` +${unitTypes.length - 2}`}
                      </span>
                      {showImageButton && (
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
                        : `Reviewed ${timeAgo(property.approved_at ?? property.submitted_at ?? property.created_at)}`
                      }
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