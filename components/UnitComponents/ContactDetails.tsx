'use client'

import { formatKenyaPhone } from '@/lib/utils'
import { UnitContact } from '@/types'
import { ExternalLink, Mail, MapPin, Phone } from 'lucide-react'

interface ContactDetailsProps {
  contact: UnitContact
}

export function ContactDetails({ contact }: ContactDetailsProps) {
  return (
    <div className="flex flex-col gap-3 pt-4 border-t border-border">
      <p className="text-xs font-semibold text-muted-foreground tracking-widest">
        Landlord Contact
      </p>

      {/* Name */}
      <p className="text-sm font-semibold text-foreground">
        {contact.landlord_name}
      </p>

      {/* Phone */}
      <a
        href={`tel:+${contact.phone}`}
        className="flex items-center gap-2.5 text-sm text-foreground hover:text-primary transition-colors group"
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
          <Phone className="h-3.5 w-3.5" />
        </div>
        <p>{formatKenyaPhone(contact.phone)}</p>
      </a>

      {/* Email */}
      <a
        href={`mailto:${contact.email}`}
        className="flex items-center gap-2.5 text-sm text-foreground hover:text-primary transition-colors group"
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
          <Mail className="h-3.5 w-3.5" />
        </div>
        {contact.email}
      </a>

      {/* Address */}
      <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center mt-0.5">
          <MapPin className="h-3.5 w-3.5" />
        </div>
        <span className="leading-relaxed">{contact.full_address}</span>
      </div>

      {/* Google Maps link */}
      <a
        href={contact.maps_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 h-10 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors mt-1"
      >
        <ExternalLink className="h-4 w-4" />
        Open in Google Maps
      </a>
    </div>
  )
}