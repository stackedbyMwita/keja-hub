import { Separator } from '@/components/ui/separator'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { PropertyHeader } from '@/components/landlord/properties/PropertyHeader'
import { StatusBanner } from '@/components/landlord/properties/StatusBanner'
import { UnitTypeCard } from '@/components/landlord/UnitTypeCard'
import { SubmitForReview } from '@/components/landlord/properties/SubmitForReview'
import { AddUnitSheetTriggerClient } from '@/components/landlord/properties/AddUnitSheetTrigger'

function AddUnitSheetTrigger({
  propertyId, existingTypes,
}: { propertyId: string; existingTypes: string[] }) {
  return (
    <AddUnitSheetTriggerClient
      propertyId={propertyId}
      existingTypes={existingTypes}
    />
  )
}

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

interface PageProps { params: Promise<{ propertyId: string }> }

export default async function PropertyDetailPage({ params }: PageProps) {
  await connection()
  const { userId }    = await auth()
  const { propertyId } = await params

  const { data: property, error } = await supabase
    .from('properties')
    .select(`
      *,
      unit_types (
        *,
        unit_images ( id, cloudflare_url, is_cover )
      )
    `)
    .eq('id', propertyId)
    .eq('landlord_id', userId!)
    .single()

  if (error || !property) notFound()

  const units      = property.unit_types ?? []
  const approved   = property.status === 'approved'
  const canEdit    = property.status !== 'pending_review' && property.status !== 'suspended'
  const canDelete  = property.status === 'draft'
  const canSubmit  = property.status === 'draft' || property.status === 'rejected'
  const existingTypes = units.map((u: any) => u.type)

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

      {/* Property header — name, location, edit, delete */}
      <PropertyHeader
        propertyId={propertyId}
        name={property.name}
        location={property.location}
        county={property.county}
        status={property.status}
        description={property.description}
        address={property.address}
        canEdit={canEdit}
        canDelete={canDelete}
      />

      {/* Status banner */}
      <StatusBanner
        status={property.status}
        rejectionReason={property.rejection_reason}
        totalScore={property.total_score}
        submittedAt={property.submitted_at}
      />

      <Separator />

      {/* Unit types section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Unit types
              {units.length > 0 && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({units.length} type{units.length !== 1 ? 's' : ''})
                </span>
              )}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {approved
                ? 'Activate units to list them. Adjust availability as units get occupied.'
                : canEdit
                ? 'Add unit types to your property before submitting for review.'
                : 'Unit types are locked while your property is under review.'
              }
            </p>
          </div>

          {/* Add unit type — only when not pending */}
          {canEdit && existingTypes.length < 9 && (
            <AddUnitSheetTrigger
              propertyId={propertyId}
              existingTypes={existingTypes}
            />
          )}
        </div>

        {/* Empty state */}
        {units.length === 0 && (
          <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 text-center">
            <p className="text-sm font-medium text-foreground">No unit types yet</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Add at least one unit type (e.g. Bedsitter × 5 @ KES 5,000/mo) before submitting for review.
            </p>
          </div>
        )}

        {/* Unit type cards */}
        <div className="flex flex-col gap-3">
          {units.map((unit: any) => (
            <UnitTypeCard
              key={unit.id}
              unit={unit}
              propertyId={propertyId}
              propertyApproved={approved}
              canEdit={canEdit}
            />
          ))}
        </div>
      </div>

      {/* Submit for review */}
      {canSubmit && (
        <>
          <Separator />
          <SubmitForReview
            propertyId={propertyId}
            hasUnits={units.length > 0}
          />
        </>
      )}

    </div>
  )
}
