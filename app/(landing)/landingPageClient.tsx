'use client'

import { Filters, PriceRange, UnitType } from '@/components/HeroComponents/Filters'
import { HeroSection } from '@/components/HeroComponents/HeroSection'
import { ListingsGridGemini } from '@/components/HeroComponents/ListingsGridGemini'
import { FooterMinimal } from '@/components/LandlordComponents/footer/footer-minimal'
import { Navbar } from '@/components/LandlordComponents/navbar/Navbar'
import MaxWidthWrapper from '@/components/UIComponents/layout/MaxWidthWrapper'
import type { ListingUnit } from '@/lib/api/listings'
import { useAuth } from '@clerk/nextjs'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { AuthModal } from '../(auth)/AuthModal'

interface LandingPageProps {
  initialListings: ListingUnit[]
}

async function fetchListingsClient(): Promise<ListingUnit[]> {
  const res = await fetch('/api/listings')
  if (!res.ok) throw new Error('Failed to fetch listings')
  const data = await res.json()
  return data.units
}

export default function LandingPage({ initialListings }: LandingPageProps) {
  const router = useRouter()
  const { isSignedIn } = useAuth()

  // TanStack Query — hydrated with server-fetched data
  const { data: units = initialListings } = useQuery({
    queryKey:     ['listings'],
    queryFn:      fetchListingsClient,
    initialData:  initialListings,
    staleTime:    60 * 1000,       // 1 minute — data is fresh, no refetch needed
    refetchOnWindowFocus: true,    // refetch when user tabs back in
    refetchInterval: 5 * 60 * 1000, // background refetch every 5 minutes
  })

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [activeType, setActiveType]   = useState<UnitType>('all')
  const [activePriceRange, setActivePriceRange] = useState<PriceRange>('all')

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [pendingUnitId, setPendingUnitId] = useState<string | null>(null)

  // ── Filter logic — unchanged, operates on `units` from TanStack Query ───
  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchesSearch =
          unit.property_name.toLowerCase().includes(q) ||
          unit.location.toLowerCase().includes(q) ||
          unit.name.toLowerCase().includes(q)
        if (!matchesSearch) return false
      }

      if (activeType !== 'all' && unit.type !== activeType) return false

      if (activePriceRange !== 'all') {
        const [min, max] = activePriceRange === '25000+'
          ? [25000, Infinity]
          : activePriceRange.split('-').map(Number)
        if (unit.price < min || unit.price > max) return false
      }

      return true
    })
  }, [units, searchQuery, activeType, activePriceRange])

  // ── Unit click handler ───────────────────────────────────────────────────
  function handleUnitClick(unitId: string) {
    if (!isSignedIn) {
      setPendingUnitId(unitId)
      setAuthModalOpen(true)
      return
    }
    router.push(`/unit/${unitId}`)
  }

  function handleAuthClose() {
    setAuthModalOpen(false)
    setPendingUnitId(null)
  }

  return (
    <>
      <Navbar
        onSignInClick={() => setAuthModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <HeroSection />

      <Filters
        activeType={activeType}
        activePriceRange={activePriceRange}
        onTypeChange={setActiveType}
        onPriceChange={setActivePriceRange}
        resultCount={filteredUnits.length}
      />

      <MaxWidthWrapper>
        <ListingsGridGemini
          units={filteredUnits}
          onUnitClick={handleUnitClick}
        />
      </MaxWidthWrapper>

      <AuthModal
        isOpen={authModalOpen}
        onClose={handleAuthClose}
        redirectUrl={pendingUnitId ? `/unit/${pendingUnitId}` : undefined}
      />

      <FooterMinimal />
    </>
  )
}