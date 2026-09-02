'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import {
  Sheet, SheetContent, SheetHeader,
  SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { getPropertyTypeLabel } from '@/lib/constants/propertyTypes'

const COMMON_AMENITIES = [
  'Water included','Electricity','Security','Parking',
  'WiFi ready','En-suite','Balcony','Generator backup',
  'Borehole water','CCTV','Close to town','Gated compound',
]

interface EditUnitSheetProps {
  open:       boolean
  onClose:    () => void
  propertyId: string
  unit: {
    id:          string
    type:        string
    price:       number
    total_count: number
    description: string | null
    amenities:   string[]
  }
}

export function EditUnitSheet({ open, onClose, propertyId, unit }: EditUnitSheetProps) {
  const router = useRouter()

  const [price, setPrice]           = useState(String(unit.price))
  const [totalCount, setTotalCount] = useState(String(unit.total_count))
  const [description, setDesc]      = useState(unit.description ?? '')
  const [amenities, setAmenities]   = useState<string[]>(unit.amenities ?? [])
  const [loading, setLoading]       = useState(false)
  const [errors, setErrors]         = useState<Record<string, string>>({})

  function toggleAmenity(amenity: string) {
    setAmenities(p => p.includes(amenity) ? p.filter(a => a !== amenity) : [...p, amenity])
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!price || Number(price) < 1)            e.price      = 'Valid price is required'
    if (!totalCount || Number(totalCount) < 1)  e.totalCount = 'Must be at least 1'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/landlord/properties/${propertyId}/units/${unit.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price:       Number(price),
          total_count: Number(totalCount),
          description: description.trim() || null,
          amenities,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed to update'); return }
      toast.success('Unit type updated')
      router.refresh()
      onClose()
    } catch { toast.error('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Edit {getPropertyTypeLabel(unit.type)}</SheetTitle>
          <SheetDescription>
            Update price, count, and details. Unit type cannot be changed.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4">

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium">
                Total units <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number" min={1}
                value={totalCount}
                onChange={e => { setTotalCount(e.target.value); setErrors(p => ({ ...p, totalCount: '' })) }}
                disabled={loading}
                className={errors.totalCount ? 'border-destructive' : ''}
              />
              {errors.totalCount
                ? <p className="text-xs text-destructive">{errors.totalCount}</p>
                : <p className="text-xs text-muted-foreground">Adjust availability separately</p>
              }
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium">
                Monthly rent <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">KES</span>
                <Input
                  type="number" min={1}
                  value={price}
                  onChange={e => { setPrice(e.target.value); setErrors(p => ({ ...p, price: '' })) }}
                  disabled={loading}
                  className={cn('pl-10', errors.price ? 'border-destructive' : '')}
                />
              </div>
              {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea
              value={description}
              onChange={e => setDesc(e.target.value)}
              disabled={loading}
              className="resize-none h-20 text-sm"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium">Amenities</Label>
            <div className="flex flex-wrap gap-2">
              {COMMON_AMENITIES.map(amenity => {
                const selected = amenities.includes(amenity)
                return (
                  <button
                    key={amenity} type="button"
                    onClick={() => toggleAmenity(amenity)}
                    disabled={loading}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                      selected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                    )}
                  >
                    {amenity}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave} disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : 'Save changes'}
            </Button>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  )
}