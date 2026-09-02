'use client'

import { SlidersHorizontal } from 'lucide-react'
import MaxWidthWrapper from '@/components/UIComponents/layout/MaxWidthWrapper'

export type UnitType = 'all' | 'single' | 'bedsitter' | 'double' | '1br' | '2br'
export type PriceRange = 'all' | '0-5000' | '5000-8000' | '8000-15000' | '15000-25000' | '25000+'

interface FiltersProps {
  activeType: UnitType
  activePriceRange: PriceRange
  onTypeChange: (type: UnitType) => void
  onPriceChange: (range: PriceRange) => void
  resultCount: number
}

const UNIT_TYPES: { label: string; value: UnitType }[] = [
  { label: 'All types', value: 'all' },
  { label: 'Singles', value: 'single' },
  { label: 'Bedsitter', value: 'bedsitter' },
  { label: 'Double', value: 'double' },
  { label: '1 Bedroom', value: '1br' },
  { label: '2 Bedrooms', value: '2br' },
]

const PRICE_RANGES: { label: string; value: PriceRange }[] = [
  { label: 'Any price', value: 'all' },
  { label: 'Under 5k', value: '0-5000' },
  { label: '5k – 8k', value: '5000-8000' },
  { label: '8k – 15k', value: '8000-15000' },
  { label: '15k – 25k', value: '15000-25000' },
  { label: '25k+', value: '25000+' },
]

export function Filters({
  activeType,
  activePriceRange,
  onTypeChange,
  onPriceChange,
  resultCount,
}: FiltersProps) {
  return (
    <section className="sticky top-16 z-30 w-full bg-background/90 backdrop-blur-xl border-b border-border/60 py-3 shadow-xs transition-all">
      <MaxWidthWrapper>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

          {/* Controls Stack */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 flex-1 min-w-0">

            {/* Filter Label */}
            <div className="hidden lg:flex items-center justify-center h-8 px-3 rounded-full bg-primary/10 text-primary flex-shrink-0 border border-primary/20 text-xs font-semibold">
              <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5 text-primary" />
              <span>Filters</span>
            </div>

            {/* Row 1: Unit Types */}
            <div className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="inline-flex items-center p-1 bg-muted/60 dark:bg-muted/30 rounded-full border border-border/60 shrink-0">
                {UNIT_TYPES.map((type) => {
                  const isActive = activeType === type.value
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => onTypeChange(type.value)}
                      className={`rounded-full h-7 px-3 text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                        isActive
                          ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                      }`}
                    >
                      {type.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Desktop Divider */}
            <div className="hidden lg:block w-px h-4 bg-border shrink-0" />

            {/* Row 2: Price Ranges */}
            <div className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="inline-flex items-center p-1 bg-muted/60 dark:bg-muted/30 rounded-full border border-border/60 shrink-0">
                {PRICE_RANGES.map((range) => {
                  const isActive = activePriceRange === range.value
                  return (
                    <button
                      key={range.value}
                      type="button"
                      onClick={() => onPriceChange(range.value)}
                      className={`rounded-full h-7 px-3 text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                        isActive
                          ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                      }`}
                    >
                      {range.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between lg:justify-end shrink-0 pt-1 lg:pt-0 border-t border-border/30 lg:border-none">
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                resultCount === 0
                  ? 'bg-destructive/10 text-destructive border-destructive/20'
                  : 'bg-card border-border/80 shadow-2xs text-muted-foreground'
              }`}
            >
              {resultCount === 0 ? (
                'No exact matches'
              ) : (
                <span className="flex items-center gap-1.5 text-foreground font-semibold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  {resultCount} {resultCount === 1 ? 'Home' : 'Homes'} Available
                </span>
              )}
            </div>
          </div>

        </div>
      </MaxWidthWrapper>
    </section>
  )
}