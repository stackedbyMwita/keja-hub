import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { connection } from 'next/server'
import Link from 'next/link'
import {
  Building2, MapPin, Images, CheckCircle2,
  AlertTriangle, Inbox, ArrowRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

function timeAgo(date: string | null): string {
  if (!date) return 'Recently'
  const diff  = Date.now() - new Date(date).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1)  return 'Just now'
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default async function ModeratorImagesHubPage() {
  await connection()
  const { userId } = await auth()

  const { data: rawProperties } = await supabase
    .from('properties')
    .select(`
      id, name, county, location, approved_at,
      unit_types ( id, unit_images ( id ) )
    `)
    .eq('status', 'approved')
    .eq('approved_by', userId!)
    .order('approved_at', { ascending: false })

  const properties = (rawProperties ?? []).map((p: any) => {
    const unitTypes      = p.unit_types ?? []
    const totalUnitTypes = unitTypes.length
    const withImages     = unitTypes.filter((u: any) => u.unit_images.length > 0).length
    const withoutImages  = totalUnitTypes - withImages
    const totalImages    = unitTypes.reduce((a: number, u: any) => a + u.unit_images.length, 0)

    return {
      id:          p.id,
      name:        p.name,
      county:      p.county,
      location:    p.location,
      approved_at: p.approved_at,
      totalUnitTypes,
      withImages,
      withoutImages,
      totalImages,
      isComplete:  withoutImages === 0 && totalUnitTypes > 0,
    }
  })

  const needsImages = properties.filter(p => !p.isComplete)
  const complete    = properties.filter(p => p.isComplete)

  const totalProperties = properties.length
  const totalNeedsWork   = needsImages.length
  const totalComplete    = complete.length

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Image Management</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {totalProperties} approved propert{totalProperties !== 1 ? 'ies' : 'y'} · {totalNeedsWork} need{totalNeedsWork === 1 ? 's' : ''} images
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground tabular-nums">{totalProperties}</p>
              <p className="text-xs text-muted-foreground">Total approved</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 dark:border-amber-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground tabular-nums">{totalNeedsWork}</p>
              <p className="text-xs text-muted-foreground">Need images</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground tabular-nums">{totalComplete}</p>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            All ({totalProperties})
          </TabsTrigger>
          <TabsTrigger value="needs-images" className="gap-1.5">
            Needs images
            {totalNeedsWork > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold">
                {totalNeedsWork}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="complete">
            Complete ({totalComplete})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <PropertyImageList properties={properties} emptyMessage="No approved properties yet" />
        </TabsContent>

        <TabsContent value="needs-images" className="mt-4">
          <PropertyImageList properties={needsImages} emptyMessage="All properties have images! 🎉" />
        </TabsContent>

        <TabsContent value="complete" className="mt-4">
          <PropertyImageList properties={complete} emptyMessage="No fully completed properties yet" />
        </TabsContent>
      </Tabs>

    </div>
  )
}

// ── Reusable list ─────────────────────────────────────────────────────────────

interface PropertyImageStats {
  id:             string
  name:           string
  county:         string
  location:       string
  approved_at:    string | null
  totalUnitTypes: number
  withImages:     number
  withoutImages:  number
  totalImages:    number
  isComplete:     boolean
}

function PropertyImageList({
  properties, emptyMessage,
}: { properties: PropertyImageStats[]; emptyMessage: string }) {
  if (properties.length === 0) {
    return (
      <Card className="border-dashed">
        <div className="flex flex-col items-center justify-center py-14 gap-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Inbox className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">{emptyMessage}</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {properties.map((property) => (
        <Card key={property.id} className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4 md:p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">

              {/* Left — info */}
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {property.name}
                    </p>
                    {property.isComplete ? (
                      <Badge className="text-xs gap-1 bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-950/40 dark:text-green-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Complete
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs gap-1 border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400">
                        <AlertTriangle className="h-3 w-3" />
                        {property.withoutImages} unit type{property.withoutImages !== 1 ? 's' : ''} missing images
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {property.location}, {property.county}
                  </div>

                  <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Images className="h-3 w-3" />
                      {property.totalImages} image{property.totalImages !== 1 ? 's' : ''}
                    </span>
                    <span>
                      {property.withImages}/{property.totalUnitTypes} unit types covered
                    </span>
                    <span>Approved {timeAgo(property.approved_at)}</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <Button asChild size="sm" className="shrink-0">
                <Link href={`/dashboard/moderator/properties/${property.id}/images`}>
                  Manage images
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Link>
              </Button>

            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}