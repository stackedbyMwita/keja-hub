'use client'

import { X } from 'lucide-react'
import Link from 'next/link'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  redirectUrl?: string
}

export function AuthModal({ isOpen, onClose, redirectUrl }: AuthModalProps) {
  if (!isOpen) return null

  const params = redirectUrl ? `?redirectUrl=${encodeURIComponent(redirectUrl)}` : ''

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose}/>

      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-background border border-border shadow-xl p-8">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <h2 className="font-heading text-2xl text-foreground">
              View this listing
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Create a free account or sign in to view full unit details and unlock landlord contacts.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href={`/sign-up${params}`}
              onClick={onClose}
              className="w-full h-11 rounded-xl bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors flex items-center justify-center"
            >
              Create a free account
            </Link>

            <Link
              href={`/sign-in${params}`}
              onClick={onClose}
              className="w-full h-11 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center"
            >
              Sign in
            </Link>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Free to join. No spam, ever.
          </p>
        </div>

      </div>
    </>
  )
}
