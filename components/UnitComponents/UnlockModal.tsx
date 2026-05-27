'use client'

import { X, ShieldCheck } from 'lucide-react'
import { ContactDetails } from './ContactDetails'

interface Contact {
  landlord_name: string
  phone: string
  email: string
  full_address: string
  maps_url: string
}

interface UnlockModalProps {
  isOpen: boolean
  onClose: () => void
  contact: Contact
  propertyName: string
}

export function UnlockModal({
  isOpen,
  onClose,
  contact,
  propertyName,
}: UnlockModalProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-background border border-border shadow-xl p-6">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Contact unlocked</p>
            <p className="text-xs text-muted-foreground">{propertyName}</p>
          </div>
        </div>

        {/* Contact details */}
        <ContactDetails contact={contact} />

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground mt-4 text-center leading-relaxed">
          Please report any suspicious behaviour to{' '}
          <span className="text-foreground font-medium">support@kejalink.co.ke</span>
        </p>
      </div>
    </>
  )
}