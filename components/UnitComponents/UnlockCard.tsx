'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Lock, Phone, Mail, MapPin, ExternalLink,
  CheckCircle2, Loader2, Home, Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn, formatKenyaPhone, getKenyaPhoneLink } from '@/lib/utils'

interface Contact {
  landlord_name: string
  phone:         string
  email:         string
  full_address:  string
  maps_url:      string
}

interface UnlockCardProps {
  unitTypeId:   string
  price:        number
  type:         string
  location:     string
  county:       string
  available:    boolean
  propertyName: string
}

type State = 'loading' | 'locked' | 'unlocking' | 'unlocked'

export function UnlockCard({
  unitTypeId,
  price,
  type,
  location,
  county,
  available,
  propertyName,
}: UnlockCardProps) {
  const { isSignedIn, isLoaded } = useAuth()
  const router                   = useRouter()

  const [state, setState]       = useState<State>('loading')
  const [contact, setContact]   = useState<Contact | null>(null)

  // ── On mount: check if already unlocked ──────────────────────────────────

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      setState('locked')
      return
    }

    async function checkUnlock() {
      try {
        const res  = await fetch(`/api/unlocks?unitTypeId=${unitTypeId}`)
        const data = await res.json()
        if (data.unlocked) {
          setContact(data.contact)
          setState('unlocked')
        } else {
          setState('locked')
        }
      } catch {
        setState('locked')
      }
    }

    checkUnlock()
  }, [isLoaded, isSignedIn, unitTypeId])

  // ── Unlock handler ────────────────────────────────────────────────────────

  async function handleUnlock() {
    if (!isSignedIn) {
      router.push(`/sign-in?redirectUrl=/unit/${unitTypeId}`)
      return
    }

    setState('unlocking')
    try {
      const res  = await fetch('/api/unlocks', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ unit_type_id: unitTypeId }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Failed to unlock contact')
        setState('locked')
        return
      }

      setContact(data.contact)
      setState('unlocked')

      if (!data.already_unlocked) {
        toast.success('Contact unlocked! You can now reach this landlord.')
      }
    } catch {
      toast.error('Network error. Please try again.')
      setState('locked')
    }
  }

  const typeLabel = type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  return (
    <div className="lg:sticky lg:top-24">
      <Card className="border-border/60 shadow-sm overflow-hidden">

        {/* Header */}
        <Card className="bg-primary m-4 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-primary-foreground/70 text-xs font-medium">Monthly rent</p>
              <p className="text-3xl font-bold text-primary-foreground mt-0.5">
                KES {price.toLocaleString()}
                <span className="text-base font-normal text-primary-foreground/70">/mo</span>
              </p>
            </div>
            <Badge className={cn(
              'shrink-0 mt-1 font-semibold rounded-full',
              available
                ? 'bg-green-500/20 text-green-100 border-green-400/30'
                : 'bg-red-500/20 text-red-100 border-red-400/30'
            )}>
              {available ? '✓ Available' : '✗ Fully occupied'}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5 mt-3 text-primary-foreground/70 text-sm">
            <Home className="h-3.5 w-3.5 shrink-0" />
            {typeLabel} · {location}, {county}
          </div>
        </Card>

        <CardContent className="p-5 flex flex-col gap-4">

          {/* Loading state */}
          {state === 'loading' && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Locked state */}
          {state === 'locked' && (
            <>
              <div className="flex flex-col gap-3 py-2">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Contact locked</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Unlock to view landlord phone, email and exact address
                    </p>
                  </div>
                </div>

                {/* Blurred preview */}
                <div className="flex flex-col gap-2 px-1">
                  {[
                    { icon: Phone, text: '+254 7XX XXX XXX' },
                    { icon: Mail,  text: 'landlord@email.com' },
                    { icon: MapPin,text: 'Full address details' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="blur-sm select-none">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleUnlock}
                className="w-full gap-2"
                size="lg"
                disabled={!available}
              >
                <Eye className="h-4 w-4" />
                {isSignedIn
                  ? 'Unlock contact — Free'
                  : 'Sign in to unlock contact'
                }
              </Button>

              {!available && (
                <p className="text-xs text-center text-muted-foreground">
                  This unit is currently fully occupied
                </p>
              )}
            </>
          )}

          {/* Unlocking state */}
          {state === 'unlocking' && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Unlocking contact...</p>
            </div>
          )}

          {/* Unlocked state */}
          {state === 'unlocked' && contact && (
            <>
              {/* Success badge */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                    Contact unlocked
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    by {contact.landlord_name}
                  </p>
                </div>
              </div>

              {/* Contact details */}
              <div className="flex flex-col gap-3">

                {/* Phone */}
                {contact.phone && (
                  <a
                    href={getKenyaPhoneLink(contact.phone, 'tel')}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/30 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center shrink-0">
                      <Phone className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatKenyaPhone(contact.phone)}
                      </p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </a>
                )}

                {/* WhatsApp */}
                {contact.phone && (
                  <a
                    href={getKenyaPhoneLink(contact.phone, 'wa')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-green-400/40 hover:bg-green-50/50 dark:hover:bg-green-950/10 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center shrink-0 text-base">
                      💬
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">WhatsApp</p>
                      <p className="text-sm font-semibold text-foreground">
                        Chat with landlord
                      </p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-green-600 transition-colors shrink-0" />
                  </a>
                )}

                {/* Email */}
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/30 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center shrink-0">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {contact.email}
                      </p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </a>
                )}

                {/* Address */}
                {contact.full_address && (
                  <a
                    href={contact.maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/30 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center shrink-0">
                      <MapPin className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {contact.full_address}
                      </p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </a>
                )}

              </div>

              <p className="text-xs text-center text-muted-foreground">
                This contact is saved to your account — you can view it anytime
              </p>
            </>
          )}

        </CardContent>
      </Card>
    </div>
  )
}