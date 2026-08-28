import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { connection } from 'next/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

import { DashboardPageWrapper } from '@/components/dashboard/DashboardPageWrapper'
import { UnitTypeCard } from '@/components/HeroComponents/UnitTypeCard'
import { AddUnitSheetTriggerClient } from '@/components/LandlordComponents/properties/AddUnitSheetTrigger'
import { PropertyHeader } from '@/components/LandlordComponents/properties/PropertyHeader'
import { StatusBanner } from '@/components/LandlordComponents/properties/StatusBanner'
import { SubmitForReview } from '@/components/LandlordComponents/properties/SubmitForReview'
import { Separator } from '@/components/ui/separator'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

interface PageProps { 
  params: Promise<{ propertyId: string }> 
}

export default async function PropertyDetailPage({ params }: PageProps) {
  await connection()
  const { userId }     = await auth()
  const { propertyId } = await params

  const { data: property, error } = await supabase
    .from('properties')
    .select(`
      *,
      unit_types (
        *,
        unit_images ( id, image_url, is_cover )
      )
    `)
    .eq('id', propertyId)
    .eq('landlord_id', userId!)
    .single()

  if (error || !property) notFound()

  const units         = property.unit_types ?? []
  const approved      = property.status === 'approved'
  const canEdit       = property.status !== 'pending_review' && property.status !== 'suspended'
  const canDelete     = property.status === 'draft'
  const canSubmit     = property.status === 'draft' || property.status === 'rejected'
  const existingTypes = units.map((u: any) => u.type)

  return (
    <DashboardPageWrapper>

      {/* Back Navigation */}
      <Link
        href="/dashboard/landlord/properties"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group w-fit"
      >
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to my properties
      </Link>

      {/* Property Header — Name, Location, Edit, Delete */}
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

      {/* Status Banner */}
      <StatusBanner
        status={property.status}
        rejectionReason={property.rejection_reason}
        totalScore={property.total_score}
        submittedAt={property.submitted_at}
      />

      <Separator className="my-2" />

      {/* Unit Types Section */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              Unit Types
              {units.length > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {units.length}
                </span>
              )}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {approved
                ? 'Activate units to list them. Adjust availability as units get occupied.'
                : canEdit
                ? 'Add unit types to your property before submitting for review.'
                : 'Unit types are locked while your property is under review.'
              }
            </p>
          </div>

          {/* Add Unit Trigger — Only visible when editable */}
          {canEdit && existingTypes.length < 9 && (
            <AddUnitSheetTriggerClient
              propertyId={propertyId}
              existingTypes={existingTypes}
            />
          )}
        </div>

        {/* Empty State */}
        {units.length === 0 && (
          <div className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center gap-3 text-center bg-card/50">
            <p className="text-base font-medium text-foreground">No unit types yet</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Add at least one unit type (e.g. Bedsitter × 5 @ KES 5,000/mo) before submitting your property for review.
            </p>
          </div>
        )}

        {/* Unit Cards List */}
        {units.length > 0 && (
          <div className="flex flex-col gap-4">
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
        )}
      </div>

      {/* Submit For Review */}
      {canSubmit && (
        <>
          <Separator className="my-2" />
          <SubmitForReview
            propertyId={propertyId}
            hasUnits={units.length > 0}
          />
        </>
      )}

    </DashboardPageWrapper>
  )
}