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
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-2xl font-heading text-foreground mb-2">No units found</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Try adjusting your filters or search query to see more results.
        </p>
      </div>
    )
  }

  return (
    <div className="grid py-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
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