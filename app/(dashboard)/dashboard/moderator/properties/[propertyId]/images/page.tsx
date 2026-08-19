'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft, ImageIcon, Building2,
  Home, AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ImagePreviewGrid } from './_components/ImagePreviewGrid'
import { ImageUploadZone } from './_components/ImageUploadZone'
import { UploadConfirmButton } from './_components/UploadConfirmButton'
import { DashboardPageWrapper } from '@/components/dashboard/DashboardPageWrapper'

const TYPE_LABELS: Record<string, string> = {
  single_room: 'Single Room', double_room: 'Double Room',
  bedsitter: 'Bedsitter', studio: 'Studio',
  '1br': '1 Bedroom', '2br': '2 Bedrooms', '3br': '3 Bedrooms',
  '4br_plus': '4+ Bedrooms', commercial: 'Shop/Commercial',
}

interface PendingImage {
  id: string; file: File; preview: string
}

interface PendingUpload {
  unitTypeId: string
  images:     PendingImage[]
}

interface UnitType {
  id:          string
  type:        string
  price:       number
  total_count: number
  unit_images: any[]
}

interface Property {
  id:   string
  name: string
}

export default function ModeratorImagesPage() {
  const params     = useParams()
  const propertyId = params.propertyId as string

  const [unitTypes, setUnitTypes]         = useState<UnitType[]>([])
  const [property, setProperty]           = useState<Property | null>(null)
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState<string | null>(null)

  async function fetchData() {
    try {
      const res  = await fetch(`/api/moderator/properties/${propertyId}/images`)
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to load'); return }
      setUnitTypes(data.data ?? [])
      setProperty(data.property)
    } catch { setError('Network error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [propertyId])

  function handleImagesReady(unitTypeId: string, images: PendingImage[]) {
    setPendingUploads(prev => {
      const filtered = prev.filter(p => p.unitTypeId !== unitTypeId)
      if (images.length === 0) return filtered
      return [...filtered, { unitTypeId, images }]
    })
  }

  function handleUploadSuccess() {
    setPendingUploads([])
    fetchData()
  }

  const totalImages   = unitTypes.reduce((a, u) => a + u.unit_images.length, 0)
  const totalPending  = pendingUploads.reduce((a, p) => a + p.images.length, 0)

  if (loading) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading property images...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <DashboardPageWrapper>
        <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">Access denied</p>
            <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
            <Link
              href="/dashboard/moderator/properties"
              className="text-xs text-primary hover:underline mt-2 inline-block"
            >
              Back to property queue
            </Link>
          </div>
        </div>
      </DashboardPageWrapper>
    )
  }

  return (
    <DashboardPageWrapper>

      {/* Back */}
      <Link
        href={`/dashboard/moderator/properties/${propertyId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group w-fit"
      >
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to review
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <ImageIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Image Management
            </h1>
            {property && (
              <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                {property.name}
              </p>
            )}
          </div>
        </div>
        <Badge variant="secondary" className='rounded-full'>
          {totalImages} image{totalImages !== 1 ? 's' : ''} uploaded
        </Badge>
      </div>

      {/* Info notice */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/20">
        <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Upload images for each unit type below. The first image automatically becomes the cover.
          You can change the cover anytime. Images are displayed to tenants when they view the listing.
        </p>
      </div>

      <Separator />

      {/* Unit type sections */}
      {unitTypes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">No unit types found for this property.</p>
        </div>
      )}

      {unitTypes.map((unit) => {
        const pendingForUnit = pendingUploads.find(p => p.unitTypeId === unit.id)?.images ?? []

        return (
          <Card key={unit.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Home className="h-4 w-4 text-primary" />
                  {TYPE_LABELS[unit.type] ?? unit.type}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    KES {unit.price.toLocaleString()}/mo · {unit.total_count} units
                  </span>
                  <Badge variant="outline" className="text-xs rounded-full">
                    {unit.unit_images.length} image{unit.unit_images.length !== 1 ? 's' : ''}
                  </Badge>
                  {pendingForUnit.length > 0 && (
                    <Badge className="text-xs rounded-full bg-amber-500 text-white hover:bg-amber-500">
                      +{pendingForUnit.length} pending
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">

              {/* Existing uploaded images */}
              <ImagePreviewGrid
                images={unit.unit_images}
                propertyId={propertyId}
                unitTypeId={unit.id}
              />

              {unit.unit_images.length > 0 && pendingForUnit.length === 0 && (
                <Separator />
              )}

              {/* Upload zone */}
              <ImageUploadZone
                unitTypeId={unit.id}
                unitTypeLabel={TYPE_LABELS[unit.type] ?? unit.type}
                onImagesReady={handleImagesReady}
                existingCount={unit.unit_images.length}
              />

            </CardContent>
          </Card>
        )
      })}

      {/* Floating confirm button */}
      <UploadConfirmButton
        propertyId={propertyId}
        pendingUploads={pendingUploads}
        onSuccess={handleUploadSuccess}
      />

    </DashboardPageWrapper>
  )
}