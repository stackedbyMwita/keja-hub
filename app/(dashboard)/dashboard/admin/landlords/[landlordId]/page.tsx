import { AdminLandlordActions } from '@/components/admin/AdminLandlordActions'
import { LandlordApplicationOverride } from '@/components/admin/LandlordApplicationOverride'
import { StatusBadge } from '@/components/Components/StatusBadge'
import { UserAvatar } from '@/components/Components/UserAvatar'
import { DashboardPageWrapper } from '@/components/dashboard/DashboardPageWrapper'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatKenyaPhone } from '@/lib/utils'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import {
  Building2,
  ChevronLeft,
  Home,
  Mail,
  MapPin,
  Phone,
  Star
} from 'lucide-react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { connection } from 'next/server'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

interface PageProps { params: Promise<{ landlordId: string }> }

export default async function AdminLandlordDetailPage({ params }: PageProps) {
  await connection()
  const { userId, sessionClaims } = await auth()
  if (!userId) redirect('/sign-in')
  const role = (sessionClaims?.publicMetadata as any)?.role
  if (!['admin', 'superadmin'].includes(role)) redirect('/dashboard')

  const { landlordId } = await params

  const [profileRes, appRes, propsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', landlordId)
      .single(),
    supabase
      .from('landlord_profiles')
      .select('*')
      .eq('user_id', landlordId)
      .maybeSingle(),
    supabase
      .from('properties')
      .select(`
        id, name, county, location, status,
        total_score, submitted_at, approved_at, created_at,
        rejection_reason, suspended_reason,
        unit_types ( id, type, total_count, available_count, status,
          unit_images ( id )
        )
      `)
      .eq('landlord_id', landlordId)
      .order('created_at', { ascending: false }),
  ])

  if (!profileRes.data) notFound()

  const landlord   = profileRes.data
  const app        = appRes.data
  const properties = propsRes.data ?? []

  const counts = {
    total:     properties.length,
    approved:  properties.filter(p => p.status === 'approved').length,
    pending:   properties.filter(p => p.status === 'pending_review').length,
    draft:     properties.filter(p => p.status === 'draft').length,
    rejected:  properties.filter(p => p.status === 'rejected').length,
    suspended: properties.filter(p => p.status === 'suspended').length,
  }

  return (
    <DashboardPageWrapper>

      {/* Back */}
      <Link
        href="/dashboard/admin/landlords"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group w-fit"
      >
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        All landlords
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 flex-wrap">
        <UserAvatar
          name={landlord.full_name}
          imageUrl={landlord.avatar_url}
          userId={landlord.id}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold text-foreground">
              {landlord.full_name ?? 'No name'}
            </h1>
            <Badge variant={landlord.is_banned ? 'destructive' : landlord.is_active ? 'default' : 'secondary'}>
              {landlord.is_banned ? 'Banned' : landlord.is_active ? 'Active' : 'Suspended'}
            </Badge>
          </div>
          <div className="flex flex-col gap-1 mt-1.5">
            {landlord.email && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                {landlord.email}
              </div>
            )}
            {landlord.phone_number && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                {formatKenyaPhone(landlord.phone_number)}
              </div>
            )}
            {app?.location && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {app.location}, {app.county}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin actions */}
      <AdminLandlordActions
        landlordId={landlordId}
        landlordName={landlord.full_name ?? 'this landlord'}
        isActive={landlord.is_active}
        isBanned={landlord.is_banned}
      />

      {app && (
        <LandlordApplicationOverride
          landlordId={landlordId}
          landlordName={landlord.full_name ?? 'this landlord'}
          applicationStatus={app.status}
        />
      )}

      <Separator />

      {/* Property stats */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Properties
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total',     value: counts.total,     color: 'text-foreground'   },
            { label: 'Approved',  value: counts.approved,  color: 'text-green-600'    },
            { label: 'Pending',   value: counts.pending,   color: 'text-amber-600'    },
            { label: 'Draft',     value: counts.draft,     color: 'text-muted-foreground' },
            { label: 'Rejected',  value: counts.rejected,  color: 'text-destructive'  },
            { label: 'Suspended', value: counts.suspended, color: 'text-destructive'  },
          ].map(stat => (
            <Card key={stat.label} className="border-border/60">
              <CardContent className="p-4">
                <p className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* Application details */}
      {app && (
        <>
          <Section title="Landlord application">
            <Card>
              <CardContent className="p-4 flex flex-col gap-2">
                <Row label="Status"      value={app.status}              />
                <Row label="County"      value={app.county ?? '—'}       />
                <Row label="Location"    value={app.location ?? '—'}     />
                <Row label="Properties"  value={String(app.number_of_properties ?? '—')} />
                <Row label="Units"       value={String(app.number_of_units ?? '—')}      />
                {app.notes && (
                  <div className="pt-1 border-t border-border mt-1">
                    <p className="text-xs text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm text-foreground leading-relaxed">{app.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </Section>
          <Separator />
        </>
      )}

      {/* Properties list */}
      <Section title={`Properties (${properties.length})`}>
        {properties.length === 0 ? (
          <p className="text-sm text-muted-foreground">No properties yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {properties.map((property: any) => {
              const units    = property.unit_types ?? []
              const total    = units.reduce((a: number, u: any) => a + u.total_count, 0)
              const images   = units.reduce((a: number, u: any) => a + (u.unit_images?.length ?? 0), 0)

              return (
                <Link
                  key={property.id}
                  href={`/dashboard/admin/properties/${property.id}`}
                  className="block group"
                >
                  <Card className="border-border/60 hover:shadow-sm transition-all group-hover:border-primary/30">
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {property.name}
                          </p>
                          <StatusBadge status={property.status} />
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {property.location}, {property.county}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Home className="h-3 w-3" />
                            {total} units · {units.length} type{units.length !== 1 ? 's' : ''}
                          </span>
                          {images > 0 && <span>{images} image{images !== 1 ? 's' : ''}</span>}
                          {property.total_score > 0 && (
                            <span className="flex items-center gap-1 text-primary font-medium">
                              <Star className="h-3 w-3" />
                              {property.total_score}/100
                            </span>
                          )}
                        </div>
                        {property.suspended_reason && (
                          <p className="text-xs text-destructive mt-1 truncate">
                            {property.suspended_reason}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
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