'use client'

import { XCircle } from 'lucide-react'
import { LandlordForm } from './LandlordForm'

interface RejectedProps {
  rejectionReason: string | null
  existingData: {
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
}

export function Rejected({ rejectionReason, existingData }: RejectedProps) {
  return (
    <div className="flex flex-col gap-6">

      {/* Rejection notice */}
      <div className="flex items-start gap-4 p-5 rounded-xl bg-destructive/5 border border-destructive/20">
        <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
          <XCircle className="h-5 w-5 text-destructive" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-foreground">
            Your application was not approved
          </p>
          {rejectionReason ? (
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Reason: </span>
              {rejectionReason}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              No specific reason was provided. Please review your details and resubmit.
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            You can update your details below and resubmit for review.
          </p>
        </div>
      </div>

      {/* Resubmit form — pre-filled with existing data */}
      <LandlordForm
        mode="reapply"
        defaultValues={existingData}
      />

    </div>
  )
}