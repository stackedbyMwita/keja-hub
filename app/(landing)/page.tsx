'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { Navbar } from './_components/Navbar'
import { Hero } from './_components/Hero'
import { Filters, UnitType, PriceRange } from './_components/Filters'
import { AuthModal } from '../(auth)/AuthModal' 
import MaxWidthWrapper from '@/components/layout/MaxWidthWrapper'
import data from '@/public/Dummy.json'
import { ListingsGrid } from './_components/ListingsGrid'
import { FooterMinimal } from './_components/footer/footer-minimal'

export default function LandingPage() {
  const router = useRouter()
  const { isSignedIn } = useAuth()

  // ── Filter state ────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [activeType, setActiveType] = useState<UnitType>('all')
  const [activePriceRange, setActivePriceRange] = useState<PriceRange>('all')

  // ── Auth modal state ─────────────────────────────────────────────────────
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [pendingUnitId, setPendingUnitId] = useState<string | null>(null)

  // ── Filter logic ─────────────────────────────────────────────────────────
  const filteredUnits = useMemo(() => {
    return data.units.filter((unit) => {
      // Search — matches property name or location
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchesSearch =
          unit.property_name.toLowerCase().includes(q) ||
          unit.location.toLowerCase().includes(q) ||
          unit.name.toLowerCase().includes(q)
        if (!matchesSearch) return false
      }

      // Unit type
      if (activeType !== 'all' && unit.type !== activeType) return false

      // Price range
      if (activePriceRange !== 'all') {
        const [min, max] = activePriceRange === '25000+'
          ? [25000, Infinity]
          : activePriceRange.split('-').map(Number)
        if (unit.price < min || unit.price > max) return false
      }

      return true
    })
  }, [searchQuery, activeType, activePriceRange])

  // ── Unit click handler ───────────────────────────────────────────────────
  function handleUnitClick(unitId: string) {
    if (!isSignedIn) {
      // Store the unit they wanted, open auth modal
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
      {/* Navbar */}
      <Navbar
        onSignInClick={() => setAuthModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Hero */}
      <Hero />

      {/* Filters */}
      <Filters
        activeType={activeType}
        activePriceRange={activePriceRange}
        onTypeChange={setActiveType}
        onPriceChange={setActivePriceRange}
        resultCount={filteredUnits.length}
      />

      {/* Listings */}
      <MaxWidthWrapper>
        <ListingsGrid
          units={filteredUnits}
          onUnitClick={handleUnitClick}
        />
      </MaxWidthWrapper>

      {/* Auth modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={handleAuthClose}
        redirectUrl={pendingUnitId ? `/unit/${pendingUnitId}` : undefined}
      />
      <FooterMinimal />
    </>
  )
}
