'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Building2, MapPin, Clock, ArrowRight,
  Inbox, Home, CheckCircle2, XCircle, Images,
  Search, XCircle as XCircleIcon
} from 'lucide-react'
import { getPropertyTypeLabel } from '@/lib/constants/propertyTypes'

// These constants need to be accessible here
const TYPE_LABELS: Record<string, string> = {
  single_room: 'Single Room', double_room: 'Double Room',
  bedsitter: 'Bedsitter', studio: 'Studio',
  '1br': '1 Bed', '2br': '2 Bed', '3br': '3 Bed',
  '4br_plus': '4+ Bed', commercial: 'Commercial',
}

const STATUS_CONFIG = {
  pending_review: { label: 'Pending', variant: 'outline', icon: Clock },
  approved: { label: 'Approved', variant: 'default', icon: CheckCircle2 },
  rejected: { label: 'Rejected', variant: 'destructive', icon: XCircle },
} as const

type SortOption = 'newest' | 'oldest' | 'name_asc' | 'name_desc'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name_asc', label: 'Name A→Z' },
  { value: 'name_desc', label: 'Name Z→A' },
]

function getRelativeTime(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })
}

function sortProperties(properties: any[], sortBy: SortOption): any[] {
  const sorted = [...properties]
  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => 
        new Date(b.submitted_at || b.created_at).getTime() - 
        new Date(a.submitted_at || a.created_at).getTime()
      )
    case 'oldest':
      return sorted.sort((a, b) => 
        new Date(a.submitted_at || a.created_at).getTime() - 
        new Date(b.submitted_at || b.created_at).getTime()
      )
    case 'name_asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    case 'name_desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name))
    default:
      return sorted
  }
}

function filterPropertiesBySearch(properties: any[], searchTerm: string): any[] {
  if (!searchTerm.trim()) return properties
  const term = searchTerm.toLowerCase().trim()
  return properties.filter(p => 
    p.name.toLowerCase().includes(term) ||
    p.location?.toLowerCase().includes(term) ||
    p.county?.toLowerCase().includes(term) ||
    p.profiles?.full_name?.toLowerCase().includes(term)
  )
}

export function PropertyList({
  properties,
  emptyMessage,
  emptyDescription,
  showImageButton,
}: {
  properties: any[]
  emptyMessage: string
  emptyDescription: string
  showImageButton: boolean
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const filtered = filterPropertiesBySearch(properties, searchTerm)
  const sorted = sortProperties(filtered, sortBy)
  const hasFilters = searchTerm.trim().length > 0

  if (properties.length === 0) {
    return (
      <Card className="border-dashed border-border/60 bg-transparent shadow-none w-full">
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center">
            <Inbox className="h-6 w-6 text-muted-foreground/70" />
          </div>
          <p className="text-base font-semibold text-foreground mt-2">{emptyMessage}</p>
          <p className="text-sm text-muted-foreground text-center max-w-xs">{emptyDescription}</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search & Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-2">
        <div className="relative w-full sm:w-80">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${
            isSearchFocused ? 'text-primary' : 'text-muted-foreground'
          }`} />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-background/50 transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/40
              placeholder:text-muted-foreground/60"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <XCircleIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
            Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="flex-1 sm:flex-none text-sm rounded-lg border bg-background/50 px-3 py-2 
              focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
              hover:border-primary/40 transition-colors cursor-pointer"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      {hasFilters && (
        <p className="text-xs text-muted-foreground -mt-1">
          Showing {sorted.length} of {properties.length} properties
        </p>
      )}

      {/* Property Cards */}
      {sorted.length === 0 && hasFilters ? (
        <Card className="border-dashed border-border/60 bg-transparent shadow-none w-full">
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Search className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm font-semibold text-foreground">No matching properties</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search terms</p>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {sorted.map((property: any) => {
            const units = property.unit_types ?? []
            const totalUnits = units.reduce((a: number, u: any) => a + u.total_count, 0)
            const unitTypes = units.map((u: any) => getPropertyTypeLabel(u.type, { short: true }))
            const landlord = property.profiles
            const imageCount = property.unit_images?.length ?? 0
            const config = STATUS_CONFIG[property.status as keyof typeof STATUS_CONFIG]
              ?? STATUS_CONFIG.pending_review
            const Icon = config.icon

            return (
              <Card 
                key={property.id} 
                className="hover:shadow-md transition-all duration-200 border-border/60 rounded-2xl overflow-hidden w-full group"
              >
                <Link href={`/dashboard/moderator/properties/${property.id}`}>
                  <CardContent className="p-5 md:p-6 bg-card">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors duration-200">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <p className="text-base font-bold text-foreground truncate group-hover:text-primary transition-colors duration-200">
                            {property.name}
                          </p>
                          <Badge variant={config.variant as any} className="flex items-center gap-1.5 shrink-0 text-xs px-2 py-1 shadow-sm rounded-full">
                            <Icon className="h-3.5 w-3.5" />
                            {config.label}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                          <MapPin className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                          {property.location}, {property.county}
                        </div>

                        <div className="flex items-center gap-4 flex-wrap mt-1">
                          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                            <Home className="h-3.5 w-3.5 text-muted-foreground/70" />
                            {totalUnits} units · {unitTypes.slice(0, 2).join(', ')}
                            {unitTypes.length > 2 && ` +${unitTypes.length - 2}`}
                          </span>
                          {showImageButton && (
                            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                              <Images className="h-3.5 w-3.5 text-muted-foreground/70" />
                              {imageCount} image{imageCount !== 1 ? 's' : ''}
                            </span>
                          )}
                          {landlord && (
                            <span className="text-xs font-medium text-muted-foreground">
                              by <span className="font-semibold text-foreground">{landlord.full_name}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mt-1">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                          {property.status === 'pending_review'
                            ? `Submitted ${getRelativeTime(property.submitted_at ?? property.created_at)}`
                            : `Reviewed ${getRelativeTime(property.approved_at ?? property.submitted_at ?? property.created_at)}`
                          }
                        </div>
                      </div>

                      <div className="shrink-0 self-center ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <ArrowRight className="h-4 w-4 text-primary/60" />
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}