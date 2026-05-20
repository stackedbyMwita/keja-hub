'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, ChevronDown } from 'lucide-react'
import {
  Sheet, SheetContent, SheetHeader,
  SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const UNIT_TYPES = [
  { value: 'single_room', label: 'Single Room'    },
  { value: 'double_room', label: 'Double Room'    },
  { value: 'bedsitter',   label: 'Bedsitter'      },
  { value: 'studio',      label: 'Studio'         },
  { value: '1br',         label: '1 Bedroom'      },
  { value: '2br',         label: '2 Bedrooms'     },
  { value: '3br',         label: '3 Bedrooms'     },
  { value: '4br_plus',    label: '4+ Bedrooms'    },
  { value: 'commercial',  label: 'Shop/Commercial' },
]

const COMMON_AMENITIES = [
  'Water included','Electricity','Security','Parking',
  'WiFi ready','En-suite','Balcony','Generator backup',
  'Borehole water','CCTV','Close to town','Gated compound',
]

interface AddUnitSheetProps {
  open:       boolean
  onClose:    () => void
  propertyId: string
  existingTypes: string[]
}

export function AddUnitSheet({ open, onClose, propertyId, existingTypes }: AddUnitSheetProps) {
  const router = useRouter()

  const [type, setType]               = useState('')
  const [price, setPrice]             = useState('')
  const [totalCount, setTotalCount]   = useState('1')
  const [description, setDesc]        = useState('')
  const [amenities, setAmenities]     = useState<string[]>([])
  const [loading, setLoading]         = useState(false)
  const [errors, setErrors]           = useState<Record<string, string>>({})

  // Filter out already-existing types
  const availableTypes = UNIT_TYPES.filter(t => !existingTypes.includes(t.value))

  function toggleAmenity(amenity: string) {
    setAmenities(p => p.includes(amenity) ? p.filter(a => a !== amenity) : [...p, amenity])
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!type)                         e.type       = 'Unit type is required'
    if (!price || Number(price) < 1)   e.price      = 'Valid price is required'
    if (!totalCount || Number(totalCount) < 1) e.totalCount = 'Must be at least 1'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleAdd() {
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/landlord/properties/${propertyId}/units`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          price:       Number(price),
          total_count: Number(totalCount),
          description: description.trim() || null,
          amenities,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed to add unit type'); return }
      toast.success('Unit type added successfully')
      router.refresh()
      onClose()
      // Reset
      setType(''); setPrice(''); setTotalCount('1')
      setDesc(''); setAmenities([])
    } catch { toast.error('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Add unit type</SheetTitle>
          <SheetDescription>
            Add a new type of unit to this property.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4">

          {/* Type */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium">
              Unit type <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <select
                value={type}
                onChange={e => { setType(e.target.value); setErrors(p => ({ ...p, type: '' })) }}
                disabled={loading}
                className={cn(
                  'w-full h-10 pl-3 pr-8 rounded-md border bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring',
                  errors.type ? 'border-destructive' : 'border-input'
                )}
              >
                <option value="">Select unit type...</option>
                {availableTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
            {availableTypes.length === 0 && (
              <p className="text-xs text-muted-foreground">All unit types have been added.</p>
            )}
          </div>

          {/* Count + Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium">
                Number of units <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number" min={1}
                value={totalCount}
                onChange={e => { setTotalCount(e.target.value); setErrors(p => ({ ...p, totalCount: '' })) }}
                disabled={loading}
                className={errors.totalCount ? 'border-destructive' : ''}
              />
              {errors.totalCount && <p className="text-xs text-destructive">{errors.totalCount}</p>}
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
                  placeholder="5000"
                />
              </div>
              {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea
              value={description}
              onChange={e => setDesc(e.target.value)}
              disabled={loading}
              className="resize-none h-20 text-sm"
              placeholder="Describe these units..."
            />
          </div>

          {/* Amenities */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium">
              Amenities <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
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
                        : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
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
            <Button
              className="flex-1" onClick={handleAdd}
              disabled={loading || availableTypes.length === 0}
            >
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Adding...</> : 'Add unit type'}
            </Button>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  )
}