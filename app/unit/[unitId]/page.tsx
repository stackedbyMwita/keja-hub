import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import MaxWidthWrapper from '@/components/UIComponents/layout/MaxWidthWrapper'
import data from '@/public/Dummy.json'
import { ImageGallery } from '@/components/UnitComponents/ImageGallery'
import { UnitDetails } from '@/components/UnitComponents/UnitDetails'
import { UnlockCard } from '@/components/UnitComponents/UnlockCard'

interface PageProps {
  params: Promise<{ unitId: string }>
}

export async function generateStaticParams() {
  return data.units.map((unit) => ({ unitId: unit.id }))
}

export async function generateMetadata({ params }: PageProps) {
  const { unitId } = await params
  const unit = data.units.find((u) => u.id === unitId)
  if (!unit) return { title: 'Unit not found — KejaHub' }
  return {
    title: `${unit.property_name} — ${unit.location} | KejaHub`,
    description: unit.description,
  }
}

export default async function UnitPage({ params }: PageProps) {
  const { unitId } = await params
  const unit = data.units.find((u) => u.id === unitId)

  if (!unit) notFound()

  return (
    <div className="min-h-screen bg-background pb-20">
      <MaxWidthWrapper className="py-6 md:py-10">

        {/* ── Back link ───────────────────────────────────────────────── */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-all mb-6 group"
        >
          <div className="p-1 rounded-full bg-muted group-hover:bg-border transition-colors">
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          </div>
          Back to listings
        </Link>

        {/* ── Image gallery — full width ───────────────────────────── */}
        <div className="mb-10 lg:mb-12">
          <ImageGallery images={unit.images} alt={unit.property_name} />
        </div>

        {/* ── Two-column layout ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 xl:gap-20">

          {/* Left — details */}
          <div className="min-w-0">
            <UnitDetails unit={unit} />
          </div>

          {/* Right — sticky unlock card */}
          <div className="relative">
            <UnlockCard
              price={unit.price}
              type={unit.type}
              location={unit.location}
              county={unit.county}
              available={unit.available}
              propertyName={unit.property_name}
              contact={unit.contact}
            />
          </div>

        </div>
      </MaxWidthWrapper>
    </div>
  )
}