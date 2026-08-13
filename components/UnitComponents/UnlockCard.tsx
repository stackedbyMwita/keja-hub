'use client'

import { useState } from 'react'
import { Lock, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
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
const UNLOCK_PRICE = 0

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
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, type: 'spring', bounce: 0.4 }}
        className="sticky top-28 rounded-3xl border border-border/60 bg-background/80 backdrop-blur-xl shadow-lg p-7 flex flex-col gap-6"
      >
        {/* Price */}
        <div className="pb-5 border-b border-border/60">
          <p className="text-4xl font-bold text-foreground tabular-nums tracking-tight">
            KES {price.toLocaleString()}
            <span className="text-lg font-medium text-muted-foreground"> / mo</span>
          </p>
        </div>

        {/* Unit info summary */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">Type</span>
            <span className="font-semibold text-foreground">
              {TYPE_LABELS[type] ?? type}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">Location</span>
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              {location}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">County</span>
            <span className="font-semibold text-foreground">{county}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">Availability</span>
            <span
              className={
                available
                  ? 'font-bold text-primary'
                  : 'font-bold text-destructive'
              }
            >
              {available ? 'Available' : 'Taken'}
            </span>
          </div>
        </div>

        {/* Unlock button */}
        <motion.button
          whileHover={available ? { scale: 1.02 } : {}}
          whileTap={available ? { scale: 0.98 } : {}}
          onClick={handleUnlockClick}
          disabled={!available}
          className="relative flex items-center justify-center gap-2 h-14 mt-2 rounded-xl bg-foreground text-background text-sm font-bold shadow-md hover:shadow-lg hover:bg-foreground/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full group overflow-hidden"
        >
          {/* Subtle button shine effect */}
          {available && (
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-background/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
          )}
          <Lock className="h-4 w-4" />
          {available
            ? `Unlock Contact — KES ${UNLOCK_PRICE}`
            : 'Unit Unavailable'}
        </motion.button>

        {/* Sub-note */}
        <p className="text-xs font-medium text-muted-foreground text-center leading-relaxed -mt-2">
          {isSignedIn
            ? 'Unlocking reveals landlord contact and exact location.'
            : 'Sign in to unlock contact and location details.'}
        </p>

        {/* Trust badge */}
        <div className="flex items-center justify-center gap-2 pt-4 border-t border-border/60">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </div>
          <p className="text-xs font-semibold text-foreground">
            Verified by a KejaLink moderator
          </p>
        </div>
      </motion.div>

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