'use client'

import MaxWidthWrapper from '@/components/UIComponents/layout/MaxWidthWrapper'
import { SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

export type UnitType = 'all' | 'bedsitter' | 'studio' | '1br' | '2br'
export type PriceRange = 'all' | '0-8000' | '8000-15000' | '15000-25000' | '25000+'

interface FiltersProps {
  activeType: UnitType
  activePriceRange: PriceRange
  onTypeChange: (type: UnitType) => void
  onPriceChange: (range: PriceRange) => void
  resultCount: number
}

const UNIT_TYPES: { label: string; value: UnitType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Bedsitter', value: 'bedsitter' },
  { label: 'Studio', value: 'studio' },
  { label: '1 Bedroom', value: '1br' },
  { label: '2 Bedroom', value: '2br' },
]

const PRICE_RANGES: { label: string; value: PriceRange }[] = [
  { label: 'Any price', value: 'all' },
  { label: 'Under KES 8k', value: '0-8000' },
  { label: 'KES 8k – 15k', value: '8000-15000' },
  { label: 'KES 15k – 25k', value: '15000-25000' },
  { label: 'KES 25k+', value: '25000+' },
]

export function Filters({
  activeType,
  activePriceRange,
  onTypeChange,
  onPriceChange,
  resultCount,
}: FiltersProps) {
  return (
    <section className="py-6 border-b border-border bg-background sticky top-16 z-30">
      <MaxWidthWrapper className="py-0">
        <div className="flex flex-col gap-4">

          {/* Row 1 — unit type pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            {UNIT_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => onTypeChange(type.value)}
                className={cn(
                  'flex-shrink-0 h-8 px-4 rounded-full text-sm font-medium transition-all border',
                  activeType === type.value
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background text-foreground border-border hover:border-foreground/40'
                )}
              >
                {type.label}
              </button>
            ))}

            {/* Divider */}
            <div className="w-px h-5 bg-border flex-shrink-0 mx-1" />

            {/* Price range pills */}
            {PRICE_RANGES.map((range) => (
              <button
                key={range.value}
                onClick={() => onPriceChange(range.value)}
                className={cn(
                  'flex-shrink-0 h-8 px-4 rounded-full text-sm font-medium transition-all border',
                  activePriceRange === range.value
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background text-foreground border-border hover:border-foreground/40'
                )}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Row 2 — result count */}
          <p className="text-xs text-muted-foreground">
            {resultCount === 0
              ? 'No units match your filters'
              : `${resultCount} unit${resultCount !== 1 ? 's' : ''} available`}
          </p>

        </div>
      </MaxWidthWrapper>
    </section>
  )
}