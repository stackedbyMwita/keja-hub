'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const KENYAN_COUNTIES = [
  'Baringo','Bomet','Bungoma','Busia','Elgeyo-Marakwet','Embu','Garissa',
  'Homa Bay','Isiolo','Kajiado','Kakamega','Kericho','Kiambu','Kilifi',
  'Kirinyaga','Kisii','Kisumu','Kitui','Kwale','Laikipia','Lamu','Machakos',
  'Makueni','Mandera','Marsabit','Meru','Migori','Mombasa','Murang\'a',
  'Nairobi','Nakuru','Nandi','Narok','Nyamira','Nyandarua','Nyeri',
  'Samburu','Siaya','Taita-Taveta','Tana River','Tharaka-Nithi','Trans Nzoia',
  'Turkana','Uasin Gishu','Vihiga','Wajir','West Pokot',
]

interface DefaultValues {
  full_name: string
  phone_number: string
  whatsapp_number: string | null
  county: string
  location: string
  number_of_properties: number
  number_of_units: number
  property_names: string[]
  notes: string | null
}

interface LandlordFormProps {
  mode: 'apply' | 'reapply'
  defaultValues?: DefaultValues
}

export function LandlordForm({ mode, defaultValues }: LandlordFormProps) {
  const router = useRouter()

  const [fullName, setFullName]           = useState(defaultValues?.full_name ?? '')
  const [phone, setPhone]                 = useState(defaultValues?.phone_number ?? '')
  const [whatsapp, setWhatsapp]           = useState(defaultValues?.whatsapp_number ?? '')
  const [sameAsPhone, setSameAsPhone]     = useState(false)
  const [county, setCounty]               = useState(defaultValues?.county ?? '')
  const [location, setLocation]           = useState(defaultValues?.location ?? '')
  const [numProperties, setNumProperties] = useState(defaultValues?.number_of_properties?.toString() ?? '1')
  const [numUnits, setNumUnits]           = useState(defaultValues?.number_of_units?.toString() ?? '1')
  const [propertyNames, setPropertyNames] = useState<string[]>(defaultValues?.property_names ?? [''])
  const [notes, setNotes]                 = useState(defaultValues?.notes ?? '')
  const [loading, setLoading]             = useState(false)
  const [errors, setErrors]               = useState<Record<string, string>>({})

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!fullName.trim())    e.fullName    = 'Full name is required'
    if (!phone.trim())       e.phone       = 'Phone number is required'
    if (!county)             e.county      = 'County is required'
    if (!location.trim())    e.location    = 'Location / estate is required'
    if (!numProperties || Number(numProperties) < 1)
                             e.numProperties = 'Enter number of properties'
    if (!numUnits || Number(numUnits) < 1)
                             e.numUnits    = 'Enter number of units'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)

    const endpoint = mode === 'apply'
      ? '/api/landlord/apply'
      : '/api/landlord/reapply'

    try {
      const res = await fetch(endpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name:            fullName.trim(),
          phone_number:         phone.trim(),
          whatsapp_number:      sameAsPhone ? phone.trim() : whatsapp.trim() || null,
          county,
          location:             location.trim(),
          number_of_properties: Number(numProperties),
          number_of_units:      Number(numUnits),
          property_names:       propertyNames.filter(n => n.trim()),
          notes:                notes.trim() || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      toast.success(
        mode === 'apply'
          ? 'Application submitted! We\'ll review it within 1–3 business days.'
          : 'Reapplication submitted! We\'ll review your updated details.'
      )

      router.push('/')
      router.refresh()

    } catch {
      toast.error('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  function addPropertyName() {
    setPropertyNames(p => [...p, ''])
  }

  function updatePropertyName(index: number, value: string) {
    setPropertyNames(p => p.map((n, i) => i === index ? value : n))
  }

  function removePropertyName(index: number) {
    setPropertyNames(p => p.filter((_, i) => i !== index))
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* ── Personal details ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 pb-5 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-widest">
          Personal details
        </h2>

        {/* Full name */}
        <Field label="Full name" error={errors.fullName} required>
          <input
            type="text"
            value={fullName}
            onChange={e => { setFullName(e.target.value); clearError('fullName') }}
            placeholder="James Omondi"
            disabled={loading}
            className={inputClass(errors.fullName)}
          />
        </Field>

        {/* Phone */}
        <Field label="Phone number" error={errors.phone} required>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-muted-foreground border-r border-border pr-3 pointer-events-none">
              🇰🇪 +254
            </div>
            <input
              type="tel"
              value={phone}
              onChange={e => { setPhone(e.target.value); clearError('phone') }}
              placeholder="7XX XXX XXX"
              disabled={loading}
              className={cn(inputClass(errors.phone), 'pl-24')}
            />
          </div>
        </Field>

        {/* WhatsApp */}
        <Field label="WhatsApp number" hint="Leave blank if same as phone">
          <label className="flex items-center gap-2 mb-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sameAsPhone}
              onChange={e => setSameAsPhone(e.target.checked)}
              className="w-3.5 h-3.5 accent-primary"
            />
            <span className="text-xs text-muted-foreground">Same as phone number</span>
          </label>
          {!sameAsPhone && (
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-muted-foreground border-r border-border pr-3 pointer-events-none">
                🇰🇪 +254
              </div>
              <input
                type="tel"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                placeholder="7XX XXX XXX"
                disabled={loading}
                className={cn(inputClass(), 'pl-24')}
              />
            </div>
          )}
        </Field>
      </div>

      {/* ── Property details ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 pb-5 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-widest">
          Property details
        </h2>

        {/* County */}
        <Field label="County" error={errors.county} required>
          <select
            value={county}
            onChange={e => { setCounty(e.target.value); clearError('county') }}
            disabled={loading}
            className={cn(inputClass(errors.county), 'appearance-none cursor-pointer')}
          >
            <option value="">Select county...</option>
            {KENYAN_COUNTIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>

        {/* Location */}
        <Field label="Estate / Area" error={errors.location} required hint="e.g. Milimani Estate, Bukhungu">
          <input
            type="text"
            value={location}
            onChange={e => { setLocation(e.target.value); clearError('location') }}
            placeholder="Milimani Estate"
            disabled={loading}
            className={inputClass(errors.location)}
          />
        </Field>

        {/* Number of properties + units */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="No. of properties" error={errors.numProperties} required>
            <input
              type="number"
              min={1}
              value={numProperties}
              onChange={e => { setNumProperties(e.target.value); clearError('numProperties') }}
              disabled={loading}
              className={inputClass(errors.numProperties)}
            />
          </Field>

          <Field label="No. of units total" error={errors.numUnits} required>
            <input
              type="number"
              min={1}
              value={numUnits}
              onChange={e => { setNumUnits(e.target.value); clearError('numUnits') }}
              disabled={loading}
              className={inputClass(errors.numUnits)}
            />
          </Field>
        </div>

        {/* Property names */}
        <Field label="Property names" hint="Optional — add names of your properties">
          <div className="flex flex-col gap-2">
            {propertyNames.map((name, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={e => updatePropertyName(i, e.target.value)}
                  placeholder={`Property ${i + 1} name`}
                  disabled={loading}
                  className={cn(inputClass(), 'flex-1')}
                />
                {propertyNames.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePropertyName(i)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addPropertyName}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors w-fit mt-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Add another property
            </button>
          </div>
        </Field>
      </div>

      {/* ── Additional notes ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-widest">
          Additional info
        </h2>

        <Field label="Notes" hint="Anything else our team should know about your properties">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. All units are self-contained, water available 24/7..."
            disabled={loading}
            rows={3}
            className={cn(inputClass(), 'resize-none h-auto py-3')}
          />
        </Field>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
      >
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin" />
            {mode === 'apply' ? 'Submitting...' : 'Resubmitting...'}
          </>
        ) : (
          mode === 'apply' ? 'Submit application' : 'Resubmit application'
        )}
      </button>

    </form>
  )

  function clearError(key: string) {
    setErrors(p => { const n = { ...p }; delete n[key]; return n })
  }
}

// ── Shared components ─────────────────────────────────────────────────────────
function Field({
  label, error, hint, required, children,
}: {
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {error
        ? <p className="text-xs text-destructive">{error}</p>
        : hint && <p className="text-xs text-muted-foreground">{hint}</p>
      }
    </div>
  )
}

function inputClass(error?: string) {
  return cn(
    'w-full h-11 px-3 rounded-xl border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50',
    error ? 'border-destructive focus:ring-destructive/30' : 'border-border'
  )
}