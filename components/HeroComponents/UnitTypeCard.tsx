'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Minus, Plus, Home, Loader2, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { EditUnitSheet } from '../LandlordComponents/properties/EditUnitSheet'

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
  canEdit:          boolean
}

export function UnitTypeCard({
  unit, propertyId, propertyApproved, canEdit,
}: UnitTypeCardProps) {
  const router                        = useRouter()
  const [available, setAvailable]     = useState(unit.available_count)
  const [activating, setActivating]   = useState(false)
  const [updating, setUpdating]       = useState(false)
  const [deleting, setDeleting]       = useState(false)
  const [editOpen, setEditOpen]       = useState(false)
  const isActive                      = unit.status === 'active'

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
    const prev = available
    setAvailable(newCount)
    setUpdating(true)
    try {
      const res = await fetch(`/api/landlord/properties/${propertyId}/units/${unit.id}/availability`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available_count: newCount }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); setAvailable(prev) }
    } catch { toast.error('Network error'); setAvailable(prev) }
    finally { setUpdating(false) }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/landlord/properties/${propertyId}/units/${unit.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed to delete'); return }
      toast.success('Unit type deleted')
      router.refresh()
    } catch { toast.error('Network error') }
    finally { setDeleting(false) }
  }

  return (
    <>
      <Card className={cn(
        'transition-all duration-200',
        isActive ? 'border-primary/30 shadow-sm' : 'border-border'
      )}>
        <CardContent className="p-4 flex flex-col gap-3">

          {/* Top row */}
          <div className="flex items-start justify-between gap-3">
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
                  KES {unit.price.toLocaleString()}/mo · {unit.total_count} total unit{unit.total_count !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Badge variant={isActive ? 'default' : 'secondary'} className="text-xs">
                {isActive ? 'Active' : 'Draft'}
              </Badge>

              {/* Edit */}
              {canEdit && (
                <Button
                  variant="ghost" size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}

              {/* Delete — only draft */}
              {canEdit && !isActive && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost" size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      disabled={deleting}
                    >
                      {deleting
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Trash2 className="h-3.5 w-3.5" />
                      }
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this unit type?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the {TYPE_LABELS[unit.type]} unit type and cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>

          {/* Activate/Deactivate — only when approved */}
          {propertyApproved && (
            <Button
              variant={isActive ? 'outline' : 'default'}
              size="sm"
              onClick={toggleActivation}
              disabled={activating}
              className="w-full rounded-full"
            >
              {activating
                ? <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />Processing...</>
                : isActive ? 'Deactivate — remove from listings' : 'Activate — list on KéjaLink'
              }
            </Button>
          )}

          {/* Availability counter — only when active */}
          {isActive && (
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-border">
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground">Available units</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {available === 0 ? 'All units occupied — hidden from listings' : `${available} of ${unit.total_count} available`}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => updateAvailability(available - 1)}
                  disabled={available <= 0 || updating}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/40 disabled:opacity-30 transition-all"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>

                <div className="w-14 text-center">
                  <span className={cn(
                    'text-xl font-bold tabular-nums',
                    available === 0 ? 'text-muted-foreground' : 'text-foreground'
                  )}>
                    {available}
                  </span>
                  <p className="text-xs text-muted-foreground leading-none mt-0.5">/ {unit.total_count}</p>
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

      <EditUnitSheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        propertyId={propertyId}
        unit={unit}
      />
    </>
  )
}