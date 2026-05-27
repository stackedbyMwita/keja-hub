'use client'

import { SlidersHorizontal } from 'lucide-react'
import MaxWidthWrapper from '@/components/UIComponents/layout/MaxWidthWrapper'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

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

export function Filters2({
  activeType,
  activePriceRange,
  onTypeChange,
  onPriceChange,
  resultCount,
}: FiltersProps) {
  return (
    <section className="py-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-16 z-30 transition-all">
      <MaxWidthWrapper className="py-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          
          {/* Filters Area */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex items-center gap-2 text-muted-foreground flex-shrink-0 mr-1">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="text-sm font-medium hidden sm:inline-block">Filters</span>
            </div>

            {/* Unit Type Pills */}
            <div className="flex items-center gap-2">
              {UNIT_TYPES.map((type) => (
                <Button
                  key={type.value}
                  variant={activeType === type.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onTypeChange(type.value)}
                  className="rounded-full flex-shrink-0 h-8 px-4 text-xs font-medium"
                >
                  {type.label}
                </Button>
              ))}
            </div>

            <Separator orientation="vertical" className="h-6 mx-1 flex-shrink-0" />

            {/* Price Range Pills */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {PRICE_RANGES.map((range) => (
                <Button
                  key={range.value}
                  variant={activePriceRange === range.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPriceChange(range.value)}
                  className="rounded-full flex-shrink-0 h-8 px-4 text-xs font-medium"
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Result Count Status */}
          <div className="flex items-center lg:justify-end flex-shrink-0">
            <Badge 
              variant={resultCount === 0 ? "destructive" : "secondary"}
              className="px-3 py-1 text-xs rounded-full font-normal"
            >
              {resultCount === 0
                ? 'No units match your filters'
                : `${resultCount} unit${resultCount !== 1 ? 's' : ''} available`}
            </Badge>
          </div>

        </div>
      </MaxWidthWrapper>
    </section>
  )
}