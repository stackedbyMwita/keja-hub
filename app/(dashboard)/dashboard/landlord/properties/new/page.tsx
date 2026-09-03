'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Trash2, Loader2, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { DashboardPageWrapper } from '@/components/dashboard/DashboardPageWrapper'
import { UNIT_TYPES } from '@/lib/constants/units'

const KENYAN_COUNTIES = [
  'Baringo','Bomet','Bungoma','Busia','Elgeyo-Marakwet','Embu','Garissa',
  'Homa Bay','Isiolo','Kajiado','Kakamega','Kericho','Kiambu','Kilifi',
  'Kirinyaga','Kisii','Kisumu','Kitui','Kwale','Laikipia','Lamu','Machakos',
  'Makueni','Mandera','Marsabit','Meru','Migori','Mombasa','Murang\'a',
  'Nairobi','Nakuru','Nandi','Narok','Nyamira','Nyandarua','Nyeri',
  'Samburu','Siaya','Taita-Taveta','Tana River','Tharaka-Nithi','Trans Nzoia',
  'Turkana','Uasin Gishu','Vihiga','Wajir','West Pokot',
]

const COMMON_AMENITIES = [
  'Water included', 'Electricity', 'Security', 'Parking',
  'WiFi ready', 'En-suite', 'Balcony', 'Generator backup',
  'Borehole water', 'CCTV', 'Close to town', 'Gated compound',
]

interface UnitTypeForm {
  type:        string
  price:       string
  total_count: string
  description: string
  amenities:   string[]
}

const emptyUnit = (): UnitTypeForm => ({
  type: '', price: '', total_count: '1', description: '', amenities: [],
})

export default function AddPropertyPage() {
  const router = useRouter()

  // Property fields
  const [name, setName]           = useState('')
  const [description, setDesc]    = useState('')
  const [county, setCounty]       = useState('')
  const [location, setLocation]   = useState('')
  const [address, setAddress]     = useState('')

  // Unit types
  const [units, setUnits] = useState<UnitTypeForm[]>([emptyUnit()])

  const [loading, setLoading]   = useState(false)
  const [errors, setErrors]     = useState<Record<string, string>>({})

  function updateUnit(index: number, field: keyof UnitTypeForm, value: any) {
    setUnits(prev => prev.map((u, i) => i === index ? { ...u, [field]: value } : u))
    setErrors(prev => { const n = { ...prev }; delete n[`unit_${index}_${field}`]; return n })
  }

  function toggleAmenity(index: number, amenity: string) {
    setUnits(prev => prev.map((u, i) => {
      if (i !== index) return u
      const has = u.amenities.includes(amenity)
      return { ...u, amenities: has ? u.amenities.filter(a => a !== amenity) : [...u.amenities, amenity] }
    }))
  }

  function addUnit() { setUnits(prev => [...prev, emptyUnit()]) }

  function removeUnit(index: number) {
    if (units.length === 1) return
    setUnits(prev => prev.filter((_, i) => i !== index))
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!name.trim())     e.name     = 'Property name is required'
    if (!county)          e.county   = 'County is required'
    if (!location.trim()) e.location = 'Location is required'

    units.forEach((u, i) => {
      if (!u.type)                         e[`unit_${i}_type`]        = 'Unit type is required'
      if (!u.price || Number(u.price) < 1) e[`unit_${i}_price`]       = 'Valid price required'
      if (!u.total_count || Number(u.total_count) < 1) e[`unit_${i}_total_count`] = 'Count must be at least 1'
    })

    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    try {
      const res = await fetch('/api/landlord/properties', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:        name.trim(),
          description: description.trim() || null,
          county,
          location:    location.trim(),
          address:     address.trim() || null,
          unit_types:  units.map(u => ({
            type:        u.type,
            price:       Number(u.price),
            total_count: Number(u.total_count),
            description: u.description.trim() || null,
            amenities:   u.amenities,
          })),
        }),
      })

      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed to create property'); return }

      toast.success('Property saved as draft! Review it before submitting.')
      router.push(`/dashboard/landlord/properties/${data.propertyId}`)
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardPageWrapper>
      <div className="flex flex-col gap-6">
        {/* Back */}
        <Link
          href="/dashboard/landlord/properties"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group w-fit"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          My properties
        </Link>

        <div>
          <h1 className="text-xl font-semibold text-foreground">Add a new property</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Fill in the details below. Your property will be saved as a draft until you submit it for review.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* ── Property details ─────────────────────────────────────── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Property details
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">

              <Field label="Property name" error={errors.name} required>
                <Input
                  value={name}
                  onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })) }}
                  placeholder="e.g. Tingo Apartments"
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
                        'w-full h-10 pl-3 pr-8 rounded-md border bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring transition-all',
                        errors.county ? 'border-destructive' : 'border-input'
                      )}
                    >
                      <option value="">Select county</option>
                      {KENYAN_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </Field>

                <Field label="Estate / Area" error={errors.location} required>
                  <Input
                    value={location}
                    onChange={e => { setLocation(e.target.value); setErrors(p => ({ ...p, location: '' })) }}
                    placeholder="e.g. Milimani Estate"
                    disabled={loading}
                    className={errors.location ? 'border-destructive' : ''}
                  />
                </Field>
              </div>

              <Field label="Street address" hint="Optional — helps moderators find the property">
                <Input
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. Off Kakamega-Kisumu Road"
                  disabled={loading}
                />
              </Field>

              <Field label="Description" hint="Optional — describe what makes your property special">
                <Textarea
                  value={description}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="e.g. A quiet, well-maintained compound with 24-hour security..."
                  disabled={loading}
                  className="resize-none h-20 text-sm"
                />
              </Field>

            </CardContent>
          </Card>

          {/* ── Unit types ────────────────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Unit types</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Add each type of unit your property has.
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addUnit} disabled={loading}>
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add unit type
              </Button>
            </div>

            {units.map((unit, i) => (
              <Card key={i} className="relative">
                <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    Unit type {i + 1}
                  </CardTitle>
                  {units.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeUnit(i)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="px-4 pb-4 flex flex-col gap-3">

                  <div className="grid grid-cols-2 gap-3">
                    {/* Type */}
                    <Field label="Type" error={errors[`unit_${i}_type`]} required>
                      <div className="relative">
                        <select
                          value={unit.type}
                          onChange={e => updateUnit(i, 'type', e.target.value)}
                          disabled={loading}
                          className={cn(
                            'w-full h-10 pl-3 pr-8 rounded-md border bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring transition-all',
                            errors[`unit_${i}_type`] ? 'border-destructive' : 'border-input'
                          )}
                        >
                          <option value="">Select type</option>
                          {UNIT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </Field>

                    {/* Count */}
                    <Field label="Number of units" error={errors[`unit_${i}_total_count`]} required>
                      <Input
                        type="number"
                        min={1}
                        value={unit.total_count}
                        onChange={e => updateUnit(i, 'total_count', e.target.value)}
                        disabled={loading}
                        className={errors[`unit_${i}_total_count`] ? 'border-destructive' : ''}
                      />
                    </Field>
                  </div>

                  {/* Price */}
                  <Field label="Monthly rent (KES)" error={errors[`unit_${i}_price`]} required>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">KES</span>
                      <Input
                        type="number"
                        min={1}
                        value={unit.price}
                        onChange={e => updateUnit(i, 'price', e.target.value)}
                        disabled={loading}
                        className={cn('pl-12', errors[`unit_${i}_price`] ? 'border-destructive' : '')}
                        placeholder="5000"
                      />
                    </div>
                  </Field>

                  {/* Description */}
                  <Field label="Unit description" hint="Optional">
                    <Textarea
                      value={unit.description}
                      onChange={e => updateUnit(i, 'description', e.target.value)}
                      placeholder="e.g. Bright, well-ventilated units on the second floor..."
                      disabled={loading}
                      className="resize-none h-16 text-sm"
                    />
                  </Field>

                  {/* Amenities */}
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-medium text-foreground">
                      Amenities <span className="text-muted-foreground font-normal">(select all that apply)</span>
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_AMENITIES.map(amenity => {
                        const selected = unit.amenities.includes(amenity)
                        return (
                          <button
                            key={amenity}
                            type="button"
                            onClick={() => toggleAmenity(i, amenity)}
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

                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          {/* Submit */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" asChild className="flex-1">
              <Link href="/dashboard/landlord/properties">Cancel</Link>
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                : 'Save as draft'
              }
            </Button>
          </div>

        </form>
      </div>
    </DashboardPageWrapper>
  )
}

function Field({
  label, error, hint, required, children,
}: {
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