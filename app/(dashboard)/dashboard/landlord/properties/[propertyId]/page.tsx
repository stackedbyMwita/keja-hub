import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { connection } from 'next/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, MapPin, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UnitTypeCard } from '@/components/landlord/UnitTypeCard'
import { SubmitForReview } from '@/components/landlord/properties/SubmitForReview'


export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const STATUS_CONFIG = {
  draft:          { label: 'Draft',       variant: 'secondary', icon: AlertCircle,  message: 'Submit this property for review when you\'re ready.' },
  pending_review: { label: 'In Review',   variant: 'outline',   icon: Clock,        message: 'Our team is reviewing your property. This usually takes 1–3 business days.' },
  approved:       { label: 'Approved',    variant: 'default',   icon: CheckCircle2, message: 'Your property is approved! Activate your units to list them.' },
  rejected:       { label: 'Rejected',    variant: 'destructive', icon: XCircle,    message: '' },
  suspended:      { label: 'Suspended',   variant: 'destructive', icon: XCircle,    message: 'This property has been suspended. Contact support.' },
} as const

interface PageProps { params: Promise<{ propertyId: string }> }

export default async function PropertyDetailPage({ params }: PageProps) {
  await connection()
  const { userId } = await auth()
  const { propertyId } = await params

  const { data: property, error } = await supabase
    .from('properties')
    .select(`*, unit_types(*, unit_images(id, cloudflare_url, is_cover))`)
    .eq('id', propertyId)
    .eq('landlord_id', userId!)
    .single()

  if (error || !property) notFound()

  const config   = STATUS_CONFIG[property.status as keyof typeof STATUS_CONFIG]
  const Icon     = config.icon
  const units    = property.unit_types ?? []
  const approved = property.status === 'approved'

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto flex flex-col gap-6">

      {/* Back */}
      <Link
        href="/dashboard/landlord/properties"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group w-fit"
      >
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        My properties
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1 min-w-0">
          <h1 className="text-xl font-semibold text-foreground">{property.name}</h1>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {property.location}, {property.county}
          </div>
        </div>
        <Badge variant={config.variant as any} className="shrink-0 flex items-center gap-1.5">
          <Icon className="h-3 w-3" />
          {config.label}
        </Badge>
      </div>

      {/* Status message */}
      <div className={`p-4 rounded-xl border flex items-start gap-3 ${
        property.status === 'approved'
          ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
          : property.status === 'rejected'
          ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
          : 'bg-muted/50 border-border'
      }`}>
        <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${
          property.status === 'approved' ? 'text-green-600'
          : property.status === 'rejected' ? 'text-destructive'
          : 'text-muted-foreground'
        }`} />
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-foreground">{config.label}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {property.status === 'rejected'
              ? property.rejection_reason ?? 'No reason provided.'
              : config.message
            }
          </p>
        </div>
      </div>

      {/* Score — if approved and scored */}
      {approved && property.total_score > 0 && (
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-primary">{property.total_score}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">KejaHub Score</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Out of 100 · Ranked {property.total_score >= 80 ? '🏆 Excellent' : property.total_score >= 60 ? '⭐ Good' : '📍 Average'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Unit types */}
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Unit types</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {approved
              ? 'Activate units to list them. Adjust availability as units get occupied.'
              : 'Unit types you\'ve added to this property.'
            }
          </p>
        </div>

        {units.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No unit types added yet.</p>
            </CardContent>
          </Card>
        ) : (
          units.map((unit: any) => (
            <UnitTypeCard
              key={unit.id}
              unit={unit}
              propertyId={propertyId}
              propertyApproved={approved}
            />
          ))
        )}
      </div>

      <Separator />

      {/* Submit for review */}
      {(property.status === 'draft' || property.status === 'rejected') && (
        <SubmitForReview
          propertyId={propertyId}
          hasUnits={units.length > 0}
        />
      )}

    </div>
  )
}