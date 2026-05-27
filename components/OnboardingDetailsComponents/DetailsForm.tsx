'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Phone, Loader2, ChevronDown, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const HEARD_FROM_OPTIONS = [
  'Social media (Facebook, Instagram, TikTok)',
  'Friend or family referral',
  'Google search',
  'WhatsApp group',
  'Newspaper or radio',
  'Other',
]

export function DetailsForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl  = searchParams.get('redirectUrl') ?? '/'
  const { user }     = useUser()

  const [phone, setPhone]         = useState('')
  const [heardFrom, setHeardFrom] = useState('')
  const [agreed, setAgreed]       = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [termsError, setTermsError] = useState<string | null>(null)

  function validate(): boolean {
    let valid = true
    if (!phone.trim()) {
      setPhoneError('Phone number is required')
      valid = false
    } else {
      setPhoneError(null)
    }
    if (!agreed) {
      setTermsError('You must agree to the Terms of Service')
      valid = false
    } else {
      setTermsError(null)
    }
    return valid
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!validate()) return

    setLoading(true)

    try {
      const res = await fetch('/api/onboarding', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phone.trim(),
          heard_from:   heardFrom || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      // Redirect to where they wanted to go
      router.push(redirectUrl)

    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const firstName = user?.firstName ?? 'there'

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl text-foreground">
          One last step, {firstName}.
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We need a few more details to complete your account setup.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Phone */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground">
            Phone number <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-sm text-muted-foreground border-r border-border pr-3 pointer-events-none">
              <span>🇰🇪</span>
              <span className="text-xs">+254</span>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={e => { setPhone(e.target.value); setPhoneError(null) }}
              placeholder="7XX XXX XXX"
              disabled={loading}
              className={cn(
                inputClass,
                'pl-24',
                phoneError && 'border-destructive focus:ring-destructive/30'
              )}
            />
            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          {phoneError
            ? <p className="text-xs text-destructive">{phoneError}</p>
            : <p className="text-xs text-muted-foreground">Format: 07XX XXX XXX or 01XX XXX XXX</p>
          }
        </div>

        {/* How did you hear */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground">
            How did you hear about KejaHub?{' '}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <div className="relative">
            <select
              value={heardFrom}
              onChange={e => setHeardFrom(e.target.value)}
              disabled={loading}
              className={cn(inputClass, 'pr-10 appearance-none cursor-pointer')}
            >
              <option value="">Select an option...</option>
              {HEARD_FROM_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Terms */}
        <label className="flex items-start gap-3 cursor-pointer">
          <div className="relative mt-0.5 flex-shrink-0">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => { setAgreed(e.target.checked); setTermsError(null) }}
              className="sr-only"
            />
            <div className={cn(
              'w-4 h-4 rounded border transition-all flex items-center justify-center',
              agreed ? 'bg-foreground border-foreground' : 'bg-background border-border',
              termsError && 'border-destructive'
            )}>
              {agreed && (
                <CheckCircle2 className="h-3 w-3 text-background" />
              )}
            </div>
          </div>
          <span className="text-xs text-muted-foreground leading-relaxed">
            I agree to KejaHub&apos;s{' '}
            <Link
              href="/terms"
              target="_blank"
              className="text-foreground font-medium underline underline-offset-2 hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link
              href="/privacy"
              target="_blank"
              className="text-foreground font-medium underline underline-offset-2 hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            . I understand my phone number will be used for account security
            and contact unlock features.
          </span>
        </label>
        {termsError && <p className="text-xs text-destructive -mt-2">{termsError}</p>}

        {/* Global error */}
        {error && (
          <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
        >
          {loading
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
            : 'Complete setup'
          }
        </button>

      </form>

      <p className="text-xs text-muted-foreground text-center leading-relaxed">
        Your phone number is stored securely and never shared with third parties.
      </p>

    </div>
  )
}

const inputClass = 'w-full h-11 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50'