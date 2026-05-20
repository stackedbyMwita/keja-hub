'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Minus, Plus, Home, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const TYPE_LABELS: Record<string, string> = {
  single_room: 'Single Room', double_room: 'Double Room',
  bedsitter: 'Bedsitter', studio: 'Studio',
  '1br': '1 Bedroom', '2br': '2 Bedrooms', '3br': '3 Bedrooms',
  '4br_plus': '4+ Bedrooms', commercial: 'Shop/Commercial',
}

interface UnitTypeCardProps {
  unit:             any
  propertyId:       string
  propertyApproved: boolean
}

export function UnitTypeCard({ unit, propertyId, propertyApproved }: UnitTypeCardProps) {
  const router                      = useRouter()
  const [available, setAvailable]   = useState(unit.available_count)
  const [activating, setActivating] = useState(false)
  const [updating, setUpdating]     = useState(false)
  const isActive                    = unit.status === 'active'

  async function toggleActivation() {
    setActivating(true)
    const newStatus = isActive ? 'draft' : 'active'
    try {
      const res = await fetch(`/api/landlord/properties/${propertyId}/units/${unit.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      toast.success(isActive ? 'Unit deactivated — removed from listings' : 'Unit activated — now visible on listings!')
      router.refresh()
    } catch { toast.error('Network error') }
    finally { setActivating(false) }
  }

  async function updateAvailability(newCount: number) {
    if (newCount < 0 || newCount > unit.total_count) return
    setAvailable(newCount)
    setUpdating(true)
    try {
      const res = await fetch(`/api/landlord/properties/${propertyId}/units/${unit.id}/availability`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available_count: newCount }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); setAvailable(unit.available_count); return }
    } catch { toast.error('Network error'); setAvailable(unit.available_count) }
    finally { setUpdating(false) }
  }

  return (
    <Card className={cn('transition-all', isActive && 'border-primary/30')}>
      <CardContent className="p-4 flex flex-col gap-3">

        {/* Top row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
              isActive ? 'bg-primary/10' : 'bg-muted'
            )}>
              <Home className={cn('h-4 w-4', isActive ? 'text-primary' : 'text-muted-foreground')} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {TYPE_LABELS[unit.type] ?? unit.type}
              </p>
              <p className="text-xs text-muted-foreground">
                KES {unit.price.toLocaleString()}/mo · {unit.total_count} total
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={isActive ? 'default' : 'secondary'} className="text-xs">
              {isActive ? 'Active' : 'Draft'}
            </Badge>
            {propertyApproved && (
              <Button
                size="sm"
                variant={isActive ? 'outline' : 'default'}
                onClick={toggleActivation}
                disabled={activating}
                className="h-8 text-xs"
              >
                {activating
                  ? <Loader2 className="h-3 w-3 animate-spin" />
                  : isActive ? 'Deactivate' : 'Activate'
                }
              </Button>
            )}
          </div>
        </div>

        {/* Availability counter — only when active */}
        {isActive && (
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-border">
            <div>
              <p className="text-xs font-medium text-foreground">Available units</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Adjust as units get occupied or become vacant
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateAvailability(available - 1)}
                disabled={available <= 0 || updating}
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/40 disabled:opacity-30 transition-all"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>

              <div className="w-12 text-center">
                <span className={cn(
                  'text-lg font-bold tabular-nums',
                  available === 0 ? 'text-muted-foreground' : 'text-foreground'
                )}>
                  {available}
                </span>
                <p className="text-xs text-muted-foreground leading-none mt-0.5">
                  / {unit.total_count}
                </p>
              </div>

              <button
                onClick={() => updateAvailability(available + 1)}
                disabled={available >= unit.total_count || updating}
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/40 disabled:opacity-30 transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Amenities */}
        {unit.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {unit.amenities.map((a: string) => (
              <span key={a} className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">
                {a}
              </span>
            ))}
          </div>
        )}

      </CardContent>
    </Card>
  )
}