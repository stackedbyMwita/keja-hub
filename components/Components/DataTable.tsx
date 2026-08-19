import { ArrowRight, Building2, CheckCircle2, Clock, MapPin, XCircle } from 'lucide-react'
import Link from 'next/link'

// You can move these types to a shared types file later
export type PropertyStatus = 'Approved' | 'Pending' | 'Rejected'

export interface Property {
  id: string
  name: string
  location: string
  totalUnits: number
  availableUnits: number
  status: PropertyStatus
}

interface PropertyListProps {
  title?: string
  properties: Property[]
  viewAllLink?: string
}

export function PropertyList({ 
  title = "Your Properties", 
  properties, 
  viewAllLink = "/dashboard/properties" 
}: PropertyListProps) {
  
  // Helper to quickly style badges based on status
  const getStatusStyles = (status: PropertyStatus) => {
    switch (status) {
      case 'Approved':
        return { bg: 'bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-400', icon: CheckCircle2 }
      case 'Pending':
        return { bg: 'bg-amber-500/15', text: 'text-amber-700 dark:text-amber-400', icon: Clock }
      case 'Rejected':
        return { bg: 'bg-red-500/15', text: 'text-red-700 dark:text-red-400', icon: XCircle }
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-5">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {viewAllLink && (
          <Link
            href={viewAllLink}
            className="group flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            View all 
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>

      {/* List Area */}
      <div className="divide-y divide-border">
        {properties.map((prop) => {
          const statusStyle = getStatusStyles(prop.status)
          const StatusIcon = statusStyle.icon

          return (
            <Link href={`http://localhost:3000/dashboard/landlord/properties/${prop.id}`}
              key={prop.id} 
              className="flex flex-col gap-4 px-6 py-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
            >
              {/* Left Side: Icon & Details */}
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="h-6 w-6" />
                </div>

                <div>
                  <p className="font-semibold text-foreground">{prop.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {prop.location}
                    </span>
                    <span className="hidden sm:inline">&bull;</span>
                    <span>{prop.totalUnits} units</span>
                    <span className="hidden sm:inline">&bull;</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {prop.availableUnits} available
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: Status Badge */}
              <div className="sm:ml-auto">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {prop.status}
                </span>
              </div>
            </Link>
          )
        })}
        
        {properties.length === 0 && (
          <div className="px-6 py-8 text-center text-sm text-muted-foreground">
            No properties found.
          </div>
        )}
      </div>
    </div>
  )
}