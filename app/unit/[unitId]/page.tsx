import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import MaxWidthWrapper from '@/components/UIComponents/layout/MaxWidthWrapper'
import { ImageGallery } from '@/components/UnitComponents/ImageGallery'
import { UnitDetails } from '@/components/UnitComponents/UnitDetails'
import { UnlockCard } from '@/components/UnitComponents/UnlockCard'
import { fetchUnitById } from '@/lib/api/unitDetail'
import { Navbar } from '@/components/LandlordComponents/navbar/Navbar'
import { UnitNavbar } from '@/components/LandlordComponents/navbar/UnitNavbar'


export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ unitId: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { unitId } = await params
  const unit = await fetchUnitById(unitId)
  if (!unit) return { title: 'Unit not found — KéjaLink' }
  return {
    title: `${unit.property_name} — ${unit.location} | KéjaLink`,
    description: unit.description,
  }
}

export default async function UnitPage({ params }: PageProps) {
  await connection()
  const { unitId } = await params
  const unit = await fetchUnitById(unitId)

  if (!unit) notFound()

  return (
    <>
      <UnitNavbar />
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
    </>
  )
}