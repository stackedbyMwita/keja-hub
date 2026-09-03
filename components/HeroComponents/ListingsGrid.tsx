'use client'

import { ListingCard } from './ListingsCard'

interface Unit {
  id: string
  type: string
  name: string
  property_name: string
  price: number
  county: string
  location: string
  cover_image: string
  available: boolean
}

interface ListingsGridProps {
  units: Unit[]
  onUnitClick: (id: string) => void
}

export function ListingsGrid({ units, onUnitClick }: ListingsGridProps) {
  if (units.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-4">
        <h3 className="text-2xl font-semibold text-foreground mb-3">No exact matches</h3>
        <p className="text-base text-muted-foreground max-w-md">
          Try changing or removing some of your filters or adjusting your search area to find more homes.
        </p>
      </div>
    )
  }

  return (
    <div className="grid py-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-10">
      {units.map((unit) => (
        <ListingCard
          key={unit.id}
          unit={unit}
          onClick={onUnitClick}
        />
      ))}
    </div>
  )
}