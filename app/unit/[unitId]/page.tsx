import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import MaxWidthWrapper from '@/components/layout/MaxWidthWrapper'
import data from '@/public/Dummy.json'
import { ImageGallery } from './_components/ImageGallery'
import { UnitDetails } from './_components/UnitDetails'
import { UnlockCard } from './_components/UnlockCard'

interface PageProps {
  params: Promise<{ unitId: string }>
}

export async function generateStaticParams() {
  return data.units.map((unit) => ({ unitId: unit.id }))
}

export async function generateMetadata({ params }: PageProps) {
  const { unitId } = await params
  const unit = data.units.find((u) => u.id === unitId)
  if (!unit) return { title: 'Unit not found — KéjaLink' }
  return {
    title: `${unit.property_name} — ${unit.location} | KéjaLink`,
    description: unit.description,
  }
}

export default async function UnitPage({ params }: PageProps) {
  const { unitId } = await params
  const unit = data.units.find((u) => u.id === unitId)

  if (!unit) notFound()

  return (
    <div className="min-h-screen bg-background">
      <MaxWidthWrapper className="py-6 md:py-10">

        {/* ── Back link ───────────────────────────────────────────────── */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to listings
        </Link>

        {/* ── Image gallery — full width ───────────────────────────── */}
        <div className="mb-8">
          <ImageGallery images={unit.images} alt={unit.property_name} />
        </div>

        {/* ── Two-column layout ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 xl:gap-16">

          {/* Left — details */}
          <UnitDetails unit={unit} />

          {/* Right — sticky unlock card */}
          <div>
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