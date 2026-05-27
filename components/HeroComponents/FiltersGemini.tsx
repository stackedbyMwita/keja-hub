'use client'

import { SlidersHorizontal, ChevronRight } from 'lucide-react'
import MaxWidthWrapper from '@/components/UIComponents/layout/MaxWidthWrapper'

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
  { label: 'All types', value: 'all' },
  { label: 'Bedsitter', value: 'bedsitter' },
  { label: 'Studio', value: 'studio' },
  { label: '1 Bedroom', value: '1br' },
  { label: '2 Bedrooms', value: '2br' },
]

const PRICE_RANGES: { label: string; value: PriceRange }[] = [
  { label: 'Any price', value: 'all' },
  { label: 'Under 8k', value: '0-8000' },
  { label: '8k – 15k', value: '8000-15000' },
  { label: '15k – 25k', value: '15000-25000' },
  { label: '25k+', value: '25000+' },
]

export function FiltersGemini({
  activeType,
  activePriceRange,
  onTypeChange,
  onPriceChange,
  resultCount,
}: FiltersProps) {
  return (
    <section className="sticky top-16 z-30 w-full bg-background/80 backdrop-blur-xl border-b border-border/30 py-4 shadow-sm transition-all">
      <MaxWidthWrapper>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          
          {/* Main Filters Container */}
          <div className="flex flex-1 items-center gap-3 overflow-x-auto pb-2 lg:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] [mask-image:linear-gradient(to_right,black_90%,transparent)]">
            
            {/* Filter Icon & Label */}
            <div className="flex items-center justify-center h-10 w-10 md:w-auto md:px-4 rounded-full bg-muted/50 text-foreground flex-shrink-0 border border-border/50">
              <SlidersHorizontal className="h-4 w-4 md:mr-2" />
              <span className="text-sm font-semibold hidden md:inline-block">Filters</span>
            </div>

            {/* Type Segmented Control */}
            <div className="flex items-center p-1 bg-muted/30 rounded-full border border-border/40 flex-shrink-0">
              {UNIT_TYPES.map((type) => {
                const isActive = activeType === type.value
                return (
                  <button
                    key={type.value}
                    onClick={() => onTypeChange(type.value)}
                    className={`relative rounded-full h-8 px-4 text-xs font-semibold tracking-wide transition-all duration-300 ${
                      isActive 
                        ? 'bg-foreground text-background shadow-sm transform scale-[1.02]' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {type.label}
                  </button>
                )
              })}
            </div>

            <ChevronRight className="h-4 w-4 text-muted-foreground/40 flex-shrink-0 hidden sm:block" />

            {/* Price Segmented Control */}
            <div className="flex items-center p-1 bg-muted/30 rounded-full border border-border/40 flex-shrink-0">
              {PRICE_RANGES.map((range) => {
                const isActive = activePriceRange === range.value
                return (
                  <button
                    key={range.value}
                    onClick={() => onPriceChange(range.value)}
                    className={`relative rounded-full h-8 px-4 text-xs font-semibold tracking-wide transition-all duration-300 ${
                      isActive 
                        ? 'bg-foreground text-background shadow-sm transform scale-[1.02]' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {range.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Result Count Indicator */}
          <div className="flex items-center lg:justify-end flex-shrink-0">
            <div className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide border transition-colors ${
              resultCount === 0 
                ? 'bg-destructive/10 text-destructive border-destructive/20' 
                : 'bg-card border-border shadow-xs text-foreground'
            }`}>
              {resultCount === 0 ? (
                'No exact matches'
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/75 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  {resultCount} {resultCount !== 1 ? 'Homes Available' : 'Home Available'}
                </span>
              )}
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  )
}