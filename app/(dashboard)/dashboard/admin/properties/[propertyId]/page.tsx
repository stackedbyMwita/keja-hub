import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { connection } from 'next/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft, Building2, MapPin, Home,
  CheckCircle2, Clock, XCircle, AlertCircle,
  ShieldAlert, Star, Images, User,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AdminPropertyActions } from '@/components/admin/adminPropertyActions'
import { getPropertyTypeLabel } from '@/lib/constants/propertyTypes'
import { DashboardPageWrapper } from '@/components/dashboard/DashboardPageWrapper'
import { formatKenyaPhone } from '@/lib/phone'
import { PropertyOverrideActions, ReassignModeratorAction } from '@/components/admin/PropertyOverrideActions'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const STATUS_CONFIG = {
  draft:          { label: 'Draft',      variant: 'secondary',   icon: AlertCircle  },
  pending_review: { label: 'Pending',    variant: 'outline',     icon: Clock        },
  approved:       { label: 'Approved',   variant: 'default',     icon: CheckCircle2 },
  rejected:       { label: 'Rejected',   variant: 'destructive', icon: XCircle      },
  suspended:      { label: 'Suspended',  variant: 'destructive', icon: ShieldAlert  },
} as const

interface PageProps { params: Promise<{ propertyId: string }> }

export default async function AdminPropertyDetailPage({ params }: PageProps) {
  await connection()
  const { userId, sessionClaims } = await auth()
  if (!userId) redirect('/sign-in')
  const role = (sessionClaims?.publicMetadata as any)?.role
  if (!['admin', 'superadmin'].includes(role)) redirect('/dashboard')

  const { propertyId } = await params

  const { data: property, error } = await supabase
    .from('properties')
    .select(`
      *,
      profiles!properties_landlord_id_fkey (
        id, full_name, email, phone_number
      ),
      unit_types (
        id, type, price, total_count, available_count,
        status, description, amenities,
        unit_images ( id, image_url, is_cover )
      )
    `)
    .eq('id', propertyId)
    .single()

  if (error || !property) notFound()

  // Fetch moderator info if approved
  let moderator: any = null
  if (property.approved_by) {
    const { data: mod } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', property.approved_by)
      .single()
    moderator = mod
  }

  const landlord   = (property as any).profiles
  const units      = (property as any).unit_types ?? []
  const config     = STATUS_CONFIG[property.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.draft
  const Icon       = config.icon
  const totalUnits = units.reduce((a: number, u: any) => a + u.total_count, 0)
  const totalImages = units.reduce((a: number, u: any) => a + u.unit_images.length, 0)

  return (
    <DashboardPageWrapper>
      {/* Back */}
      <Link
        href="/dashboard/admin/properties"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group w-fit"
      >
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        All properties
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
        <Badge variant={config.variant as any} className="flex items-center gap-1.5 shrink-0">
          <Icon className="h-3 w-3" />
          {config.label}
        </Badge>
      </div>

      {/* Score card */}
      {property.total_score > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-primary">{property.total_score}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">KéjaLink Score</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {property.total_score >= 80 ? '🏆 Excellent'
                  : property.total_score >= 65 ? '⭐ Good'
                  : property.total_score >= 50 ? '📍 Average'
                  : '⚠️ Below average'}
                {' · '}Scored by {moderator?.full_name ?? 'moderator'}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-primary">
              <Star className="h-4 w-4" />
              <span className="text-sm font-bold">{property.total_score}/100</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin actions */}
      <AdminPropertyActions
        propertyId={propertyId}
        status={property.status}
        propertyName={property.name}
      />
      
      <PropertyOverrideActions
        propertyId={propertyId}
        propertyName={property.name}
        status={property.status}
      />
      
      <ReassignModeratorAction
        propertyId={propertyId}
        propertyName={property.name}
        currentModeratorId={property.approved_by}
      />

      <Separator />

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Unit types', value: units.length, icon: Home       },
          { label: 'Total units', value: totalUnits,   icon: Building2  },
          { label: 'Images',      value: totalImages,  icon: Images     },
        ].map(stat => (
          <Card key={stat.label} className="border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xl font-bold text-foreground tabular-nums">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Landlord */}
      <Section title="Landlord">
        <Card>
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">{landlord?.full_name ?? '—'}</p>
            </div>
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
            <Row label="County"   value={property.county}   />
            <Row label="Location" value={property.location} />
            {property.address && <Row label="Address" value={property.address} />}
            {property.submitted_at && (
              <Row
                label="Submitted"
                value={new Date(property.submitted_at).toLocaleDateString('en-KE', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              />
            )}
            {property.approved_at && moderator && (
              <Row
                label="Approved by"
                value={`${moderator.full_name} on ${new Date(property.approved_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}`}
              />
            )}
            {property.rejection_reason && (
              <div className="pt-1 border-t border-border mt-1">
                <p className="text-xs text-muted-foreground mb-1">Rejection reason</p>
                <p className="text-sm text-destructive">{property.rejection_reason}</p>
              </div>
            )}
            {property.suspended_reason && (
              <div className="pt-1 border-t border-border mt-1">
                <p className="text-xs text-muted-foreground mb-1">Suspension reason</p>
                <p className="text-sm text-destructive">{property.suspended_reason}</p>
              </div>
            )}
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
              <Card key={unit.id} className="border-border/60">
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-primary shrink-0" />
                      <p className="text-sm font-semibold text-foreground">
                        {getPropertyTypeLabel(unit.type)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={unit.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {unit.status}
                      </Badge>
                      <p className="text-sm font-semibold text-foreground">
                        KES {unit.price.toLocaleString()}
                        <span className="text-xs font-normal text-muted-foreground">/mo</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{unit.total_count} total · {unit.available_count} available</span>
                    <span className={imgCount === 0 ? 'text-amber-600' : 'text-green-600'}>
                      {imgCount} image{imgCount !== 1 ? 's' : ''}
                    </span>
                  </div>

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
          {units.length === 0 && (
            <p className="text-sm text-muted-foreground">No unit types added yet.</p>
          )}
        </div>
      </Section>

    </DashboardPageWrapper>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{title}</h2>
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