'use client'

import Image from 'next/image'
import { MapPin } from 'lucide-react'
import { getPropertyTypeLabel } from '@/lib/constants/propertyTypes'
import { Unit } from '@/types'

interface ListingCardProps {
  unit: Unit
  onClick: (id: string) => void
}

export function ListingCard({ unit, onClick }: ListingCardProps) {
  return (
    <button
      onClick={() => onClick(unit.id)}
      className="group w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
        <Image
          src={unit.cover_image}
          alt={unit.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Unit type badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center h-6 px-2.5 rounded-full text-xs font-medium bg-background/90 backdrop-blur-sm text-foreground border border-border/50">
            {getPropertyTypeLabel(unit.type)}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="pt-3 pb-1 space-y-1">
        {/* Property name + location */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-foreground leading-snug line-clamp-1">
            {unit.property_name}
          </p>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span className="line-clamp-1">{unit.location}, {unit.county}</span>
        </div>

        {/* Price */}
        <p className="text-sm pt-1">
          <span className="font-semibold text-foreground">
            KES {unit.price.toLocaleString()}
          </span>
          <span className="text-muted-foreground font-normal"> / month</span>
        </p>
      </div>
    </button>
  )
}
