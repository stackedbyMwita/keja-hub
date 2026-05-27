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

const KENYAN_COUNTIES = [
  'Baringo','Bomet','Bungoma','Busia','Elgeyo-Marakwet','Embu','Garissa',
  'Homa Bay','Isiolo','Kajiado','Kakamega','Kericho','Kiambu','Kilifi',
  'Kirinyaga','Kisii','Kisumu','Kitui','Kwale','Laikipia','Lamu','Machakos',
  'Makueni','Mandera','Marsabit','Meru','Migori','Mombasa',"Murang'a",
  'Nairobi','Nakuru','Nandi','Narok','Nyamira','Nyandarua','Nyeri',
  'Samburu','Siaya','Taita-Taveta','Tana River','Tharaka-Nithi','Trans Nzoia',
  'Turkana','Uasin Gishu','Vihiga','Wajir','West Pokot',
]

interface EditPropertySheetProps {
  open:       boolean
  onClose:    () => void
  propertyId: string
  defaultValues: {
    name:        string
    description: string | null
    county:      string
    location:    string
    address:     string | null
  }
}

export function EditPropertySheet({
  open, onClose, propertyId, defaultValues,
}: EditPropertySheetProps) {
  const router = useRouter()

  const [name, setName]           = useState(defaultValues.name)
  const [description, setDesc]    = useState(defaultValues.description ?? '')
  const [county, setCounty]       = useState(defaultValues.county)
  const [location, setLocation]   = useState(defaultValues.location)
  const [address, setAddress]     = useState(defaultValues.address ?? '')
  const [loading, setLoading]     = useState(false)
  const [errors, setErrors]       = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim())     e.name     = 'Name is required'
    if (!county)          e.county   = 'County is required'
    if (!location.trim()) e.location = 'Location is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/landlord/properties/${propertyId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:        name.trim(),
          description: description.trim() || null,
          county,
          location:    location.trim(),
          address:     address.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed to update'); return }
      toast.success('Property details updated')
      router.refresh()
      onClose()
    } catch { toast.error('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Edit property details</SheetTitle>
          <SheetDescription>
            Update your property information. Changes save immediately.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4">
          <Field label="Property name" error={errors.name} required>
            <Input
              value={name}
              onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })) }}
              disabled={loading}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="County" error={errors.county} required>
              <div className="relative">
                <select
                  value={county}
                  onChange={e => { setCounty(e.target.value); setErrors(p => ({ ...p, county: '' })) }}
                  disabled={loading}
                  className={cn(
                    'w-full h-10 pl-3 pr-8 rounded-md border bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring',
                    errors.county ? 'border-destructive' : 'border-input'
                  )}
                >
                  {KENYAN_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </Field>

            <Field label="Estate / Area" error={errors.location} required>
              <Input
                value={location}
                onChange={e => { setLocation(e.target.value); setErrors(p => ({ ...p, location: '' })) }}
                disabled={loading}
                className={errors.location ? 'border-destructive' : ''}
              />
            </Field>
          </div>

          <Field label="Street address" hint="Optional">
            <Input
              value={address}
              onChange={e => setAddress(e.target.value)}
              disabled={loading}
              placeholder="e.g. Off Kakamega-Kisumu Road"
            />
          </Field>

          <Field label="Description" hint="Optional">
            <Textarea
              value={description}
              onChange={e => setDesc(e.target.value)}
              disabled={loading}
              className="resize-none h-24 text-sm"
              placeholder="What makes your property special..."
            />
          </Field>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : 'Save changes'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function Field({ label, error, hint, required, children }: {
  label: string; error?: string; hint?: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-medium">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {error
        ? <p className="text-xs text-destructive">{error}</p>
        : hint && <p className="text-xs text-muted-foreground">{hint}</p>
      }
    </div>
  )
}