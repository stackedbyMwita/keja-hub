'use client'

import { useState } from 'react'
import { Lock, MapPin } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'
import { UnlockModal } from './UnlockModal'
import { AuthModal } from '@/app/(auth)/AuthModal'

interface Contact {
  landlord_name: string
  phone: string
  email: string
  full_address: string
  maps_url: string
}

interface UnlockCardProps {
  price: number
  type: string
  location: string
  county: string
  available: boolean
  propertyName: string
  contact: Contact
}

const TYPE_LABELS: Record<string, string> = {
  bedsitter: 'Bedsitter',
  studio: 'Studio',
  '1br': '1 Bedroom',
  '2br': '2 Bedroom',
}

// MVP unlock price — will be real Mpesa amount later
const UNLOCK_PRICE = 50

export function UnlockCard({
  price,
  type,
  location,
  county,
  available,
  propertyName,
  contact,
}: UnlockCardProps) {
  const { isSignedIn } = useAuth()
  const [unlockModalOpen, setUnlockModalOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  function handleUnlockClick() {
    if (!isSignedIn) {
      setAuthModalOpen(true)
      return
    }
    // Signed in — reveal contact immediately (free for MVP)
    setUnlockModalOpen(true)
  }

  return (
    <>
      {/* ── Sticky card ─────────────────────────────────────────────────── */}
      <div className="sticky top-24 rounded-2xl border border-border bg-background shadow-sm p-6 flex flex-col gap-5">

        {/* Price */}
        <div className="pb-4 border-b border-border">
          <p className="text-3xl font-semibold text-foreground tabular-nums">
            KES {price.toLocaleString()}
            <span className="text-base font-normal text-muted-foreground"> / mo</span>
          </p>
        </div>

        {/* Unit info summary */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Type</span>
            <span className="font-medium text-foreground">
              {TYPE_LABELS[type] ?? type}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Location</span>
            <span className="font-medium text-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {location}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">County</span>
            <span className="font-medium text-foreground">{county}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Availability</span>
            <span
              className={
                available
                  ? 'font-medium text-green-600'
                  : 'font-medium text-red-500'
              }
            >
              {available ? 'Available' : 'Taken'}
            </span>
          </div>
        </div>

        {/* Unlock button */}
        <button
          onClick={handleUnlockClick}
          disabled={!available}
          className="flex items-center justify-center gap-2 h-12 rounded-xl bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed w-full"
        >
          <Lock className="h-4 w-4" />
          {available
            ? `Unlock Contact — KES ${UNLOCK_PRICE}`
            : 'Unit Unavailable'}
        </button>

        {/* Sub-note */}
        <p className="text-xs text-muted-foreground text-center leading-relaxed -mt-2">
          {isSignedIn
            ? 'Unlocking reveals landlord contact and exact location.'
            : 'Sign in to unlock contact and location details.'}
        </p>

        {/* Trust badge */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <p className="text-xs text-muted-foreground">
            Verified by a KéjaLink moderator
          </p>
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      <UnlockModal
        isOpen={unlockModalOpen}
        onClose={() => setUnlockModalOpen(false)}
        contact={contact}
        propertyName={propertyName}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        redirectUrl={undefined}
      />
    </>
  )
}