import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Home,
  Images,
  Inbox,
  MapPin,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { connection } from 'next/server'

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

function timeAgo(date: string): string {
  const diff  = Date.now() - new Date(date).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1)  return 'Just now'
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default async function ModeratorPropertiesPage() {
  await connection()
  const { userId } = await auth()

  // Fetch ALL properties this moderator has interacted with
  // pending = not yet assigned to anyone OR submitted
  // approved/rejected = reviewed by this moderator
  const { data: allProperties } = await supabase
    .from('properties')
    .select(`
      id, name, county, location, status,
      submitted_at, approved_at, created_at,
      approved_by,
      profiles!landlord_id ( full_name, phone_number ),
      unit_types ( id, type, price, total_count ),
      unit_images ( id )
    `)
    .or(`status.eq.pending_review,approved_by.eq.${userId}`)
    .order('submitted_at', { ascending: false, nullsFirst: false })

  const props    = allProperties ?? []
  const pending  = props.filter(p => p.status === 'pending_review')
  const reviewed = props.filter(p => p.approved_by === userId)
  const approved = reviewed.filter(p => p.status === 'approved')
  const rejected = reviewed.filter(p => p.status === 'rejected')

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Property Reviews</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {pending.length} pending · {approved.length} approved · {rejected.length} rejected
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="pending" className="flex-1 sm:flex-none gap-2">
            Pending
            {pending.length > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {pending.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex-1 sm:flex-none">
            Approved ({approved.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex-1 sm:flex-none">
            Rejected ({rejected.length})
          </TabsTrigger>
        </TabsList>

        {/* ── Pending tab ─────────────────────────────────────────────── */}
        <TabsContent value="pending" className="mt-4">
          <PropertyList
            properties={pending}
            emptyMessage="No properties pending review"
            emptyDescription="All submissions have been reviewed. Check back later."
            showImageButton={false}
            currentModeratorId={userId!}
          />
        </TabsContent>

        {/* ── Approved tab ─────────────────────────────────────────────── */}
        <TabsContent value="approved" className="mt-4">
          <PropertyList
            properties={approved}
            emptyMessage="No approved properties yet"
            emptyDescription="Properties you approve will appear here."
            showImageButton={true}
            currentModeratorId={userId!}
          />
        </TabsContent>

        {/* ── Rejected tab ─────────────────────────────────────────────── */}
        <TabsContent value="rejected" className="mt-4">
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
      <Card className="border-dashed">
        <div className="flex flex-col items-center justify-center py-14 gap-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Inbox className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">{emptyMessage}</p>
          <p className="text-xs text-muted-foreground text-center max-w-xs">{emptyDescription}</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-3">
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
          <Card key={property.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-start gap-3">

                {/* Icon */}
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {property.name}
                    </p>
                    <Badge variant={config.variant as any} className="flex items-center gap-1 shrink-0 text-xs">
                      <Icon className="h-3 w-3" />
                      {config.label}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {property.location}, {property.county}
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Home className="h-3 w-3" />
                      {totalUnits} units · {unitTypes.slice(0, 2).join(', ')}
                      {unitTypes.length > 2 && ` +${unitTypes.length - 2}`}
                    </span>
                    {showImageButton && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Images className="h-3 w-3" />
                        {imageCount} image{imageCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    {landlord && (
                      <span className="text-xs text-muted-foreground">
                        by <span className="font-medium text-foreground">{landlord.full_name}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {property.status === 'pending_review'
                      ? `Submitted ${timeAgo(property.submitted_at ?? property.created_at)}`
                      : `Reviewed ${timeAgo(property.approved_at ?? property.submitted_at ?? property.created_at)}`
                    }
                  </div>
                </div>

              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border flex-wrap">
                <Button asChild size="sm" variant="outline" className="gap-1.5 h-8 text-xs flex-1 sm:flex-none">
                  <Link href={`/dashboard/moderator/properties/${property.id}`}>
                    {property.status === 'pending_review' ? 'Review' : 'View details'}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>

                {/* Image management — only for approved properties reviewed by this moderator */}
                {showImageButton && property.approved_by === currentModeratorId && (
                  <Button asChild size="sm" className="gap-1.5 h-8 text-xs flex-1 sm:flex-none">
                    <Link href={`/dashboard/moderator/properties/${property.id}/images`}>
                      <Images className="h-3 w-3" />
                      Manage images
                      {imageCount === 0 && (
                        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold leading-none">
                          0
                        </span>
                      )}
                    </Link>
                  </Button>
                )}
              </div>

            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}