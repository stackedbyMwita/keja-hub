import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { connection } from 'next/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft, MapPin, Building2, Home,
  CheckCircle2, Clock, XCircle, Images, Trophy,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { PropertyApprovedActions } from '@/components/moderator/PropertyApprovedActions'
import { PropertyReviewActions } from '@/components/moderator/PropertyReviewActions'
import MaxWidthWrapper from '@/components/UIComponents/layout/MaxWidthWrapper'
import { formatKenyaPhone } from '@/lib/phone'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const TYPE_LABELS: Record<string, string> = {
  single_room: 'Single Room', double_room: 'Double Room',
  bedsitter: 'Bedsitter', studio: 'Studio',
  '1br': '1 Bedroom', '2br': '2 Bedrooms', '3br': '3 Bedrooms',
  '4br_plus': '4+ Bedrooms', commercial: 'Shop/Commercial',
}

const STATUS_CONFIG = {
  pending_review: { label: 'Pending Review', variant: 'outline',     icon: Clock        },
  approved:       { label: 'Approved',       variant: 'default',     icon: CheckCircle2 },
  rejected:       { label: 'Rejected',       variant: 'destructive', icon: XCircle      },
  draft:          { label: 'Draft',          variant: 'secondary',   icon: Clock        },
  suspended:      { label: 'Suspended',      variant: 'destructive', icon: XCircle      },
} as const

interface PageProps { params: Promise<{ propertyId: string }> }

export default async function ModeratorPropertyDetailPage({ params }: PageProps) {
  await connection()
  const { userId }     = await auth()
  const { propertyId } = await params

  const { data: property, error } = await supabase
    .from('properties')
    .select(`
      *,
      profiles!landlord_id (
        full_name, phone_number, email, avatar_url
      ),
      unit_types (
        id, type, price, total_count, description, amenities,
        unit_images ( id, image_url, is_cover )
      )
    `)
    .eq('id', propertyId)
    .single()

  if (error || !property) notFound()

  const landlord        = (property as any).profiles
  const units           = (property as any).unit_types ?? []
  const isApproved      = property.status === 'approved'
  const isPending       = property.status === 'pending_review'
  const isMyProperty    = property.approved_by === userId
  const config          = STATUS_CONFIG[property.status as keyof typeof STATUS_CONFIG]
                          ?? STATUS_CONFIG.draft
  const Icon            = config.icon
  const totalImages     = units.reduce((a: number, u: any) => a + (u.unit_images?.length ?? 0), 0)
  const hasScores       = property.total_score > 0

  // Build existing scores object for the scoring sheet
  const existingScores = hasScores ? {
    score_security:    property.score_security,
    score_water:       property.score_water,
    score_electricity: property.score_electricity,
    score_road_access: property.score_road_access,
    score_amenities:   property.score_amenities,
    score_cleanliness: property.score_cleanliness,
    score_lighting:    property.score_lighting,
    score_sanitation:  property.score_sanitation,
    score_value:       property.score_value,
    score_landlord:    property.score_landlord,
  } : undefined

  return (
    <MaxWidthWrapper>
      <div className="p-4 md:p-6 flex flex-col gap-6">

        {/* Back */}
        <Link
          href="/dashboard/moderator/properties"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group w-fit"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Property reviews
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-foreground">{property.name}</h1>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {property.location}, {property.county}
              </div>
            </div>
          </div>
          <Badge variant={config.variant as any} className="flex items-center gap-1.5 shrink-0 rounded-full">
            <Icon className="h-3 w-3" />
            {config.label}
          </Badge>
        </div>

        {/* Score card — if scored */}
        {isApproved && hasScores && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-primary">{property.total_score}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">KéjaLink Score</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Out of 100 ·{' '}
                    {property.total_score >= 80 ? '🏆 Excellent'
                      : property.total_score >= 65 ? '⭐ Good'
                      : property.total_score >= 50 ? '📍 Average'
                      : '⚠️ Below average'}
                  </p>
                </div>
              </div>
              {/* Score breakdown mini */}
              <div className="hidden sm:grid grid-cols-5 gap-1">
                {[
                  property.score_security, property.score_water,
                  property.score_electricity, property.score_road_access,
                  property.score_amenities, property.score_cleanliness,
                  property.score_lighting, property.score_sanitation,
                  property.score_value, property.score_landlord,
                ].map((s, i) => (
                  <div
                    key={i}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      s >= 8 ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                      : s >= 6 ? 'bg-primary/10 text-primary'
                      : s >= 4 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                      : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    {s}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Approved actions — image management + scoring */}
        {isApproved && isMyProperty && (
          <PropertyApprovedActions
            propertyId={propertyId}
            propertyName={property.name}
            imageCount={totalImages}
            existingScores={existingScores}
            hasScores={hasScores}
          />
        )}

        <Separator />

        {/* Landlord details */}
        <Section title="Landlord">
          <Card>
            <CardContent className="p-4 flex flex-col gap-2">
              <Row label="Name"  value={landlord?.full_name  ?? '—'} />
              <Row label="Email" value={landlord?.email      ?? '—'} />
              <Row label="Phone" value={formatKenyaPhone(landlord?.phone_number ?? '—')} />
            </CardContent>
          </Card>
        </Section>

        <Separator />

        {/* Property details */}
        <Section title="Property details">
          <Card>
            <CardContent className="p-4 flex flex-col gap-2">
              <Row label="County"   value={property.county} />
              <Row label="Location" value={property.location} />
              {property.address && <Row label="Address" value={property.address} />}
              {property.description && (
                <div className="pt-1 border-t border-border mt-1">
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm text-foreground leading-relaxed">{property.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </Section>

        <Separator />

        {/* Unit types */}
        <Section title={`Unit types (${units.length})`}>
          <div className="flex flex-col gap-2">
            {units.map((unit: any) => {
              const imgCount = unit.unit_images?.length ?? 0
              return (
                <Card key={unit.id}>
                  <CardContent className="p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-primary shrink-0" />
                        <p className="text-sm font-semibold text-foreground">
                          {TYPE_LABELS[unit.type] ?? unit.type}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isApproved && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            imgCount === 0
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                              : 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                          }`}>
                            {imgCount === 0 ? 'No images' : `${imgCount} image${imgCount !== 1 ? 's' : ''}`}
                          </span>
                        )}
                        <p className="text-sm font-semibold text-foreground">
                          KES {unit.price.toLocaleString()}
                          <span className="text-xs font-normal text-muted-foreground">/mo</span>
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {unit.total_count} unit{unit.total_count !== 1 ? 's' : ''} total
                    </p>

                    {unit.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed">{unit.description}</p>
                    )}

                    {unit.amenities?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {unit.amenities.map((a: string) => (
                          <span key={a} className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </Section>

        {/* Moderator notes */}
        {property.moderator_notes && (
          <>
            <Separator />
            <Section title="Moderator notes">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {property.moderator_notes}
                  </p>
                </CardContent>
              </Card>
            </Section>
          </>
        )}

        <Separator />

        {/* Review actions — only for pending */}
        {isPending && (
          <PropertyReviewActions propertyId={propertyId} />
        )}

        {/* Rejected state */}
        {property.status === 'rejected' && (
          <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
            <p className="text-sm font-semibold text-foreground">Rejected</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {property.rejection_reason ?? 'No reason provided.'}
            </p>
          </div>
        )}

      </div>
    </MaxWidthWrapper>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
        {title}
      </h2>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-foreground font-medium text-right">{value}</span>
    </div>
  )
}
