import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { connection } from 'next/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, MapPin, Phone, Building2, Home } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { PropertyReviewActions } from '@/components/moderator/PropertyReviewActions'

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

interface PageProps { params: Promise<{ propertyId: string }> }

export default async function ModeratorPropertyReviewPage({ params }: PageProps) {
  await connection()
  const { propertyId } = await params

  const { data: property, error } = await supabase
    .from('properties')
    .select(`
      *,
      profiles!landlord_id (
        full_name, phone_number, email, avatar_url
      ),
      unit_types (
        id, type, price, total_count, description, amenities
      )
    `)
    .eq('id', propertyId)
    .single()

  if (error || !property) notFound()

  const landlord = (property as any).profiles
  const units    = (property as any).unit_types ?? []

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto flex flex-col gap-6">

      {/* Back */}
      <Link
        href="/dashboard/moderator/properties"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group w-fit"
      >
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Property queue
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{property.name}</h1>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {property.location}, {property.county}
            </div>
          </div>
        </div>
        <Badge variant="outline" className="shrink-0">Pending Review</Badge>
      </div>

      <Separator />

      {/* Landlord details */}
      <Section title="Landlord details">
        {landlord ? (
          <Card>
            <CardContent className="p-4 flex flex-col gap-2">
              <Row label="Name"  value={landlord.full_name ?? '—'} />
              <Row label="Email" value={landlord.email ?? '—'} />
              <Row label="Phone" value={landlord.phone_number ?? '—'} />
            </CardContent>
          </Card>
        ) : (
          <p className="text-sm text-muted-foreground">Landlord details unavailable</p>
        )}
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
              <div className="pt-1">
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
          {units.map((unit: any) => (
            <Card key={unit.id}>
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold text-foreground">
                      {TYPE_LABELS[unit.type] ?? unit.type}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    KES {unit.price.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/mo</span>
                  </p>
                </div>

                <p className="text-xs text-muted-foreground">
                  {unit.total_count} unit{unit.total_count !== 1 ? 's' : ''}
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
          ))}
        </div>
      </Section>

      <Separator />

      {/* Review actions */}
      {property.status === 'pending_review' && (
        <PropertyReviewActions propertyId={propertyId} />
      )}

      {property.status !== 'pending_review' && (
        <div className="p-4 rounded-xl bg-muted/50 border border-border">
          <p className="text-sm font-medium text-foreground capitalize">
            Property already {property.status.replace('_', ' ')}
          </p>
          {property.rejection_reason && (
            <p className="text-xs text-muted-foreground mt-1">
              Reason: {property.rejection_reason}
            </p>
          )}
        </div>
      )}

    </div>
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