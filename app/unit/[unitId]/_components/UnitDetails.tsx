import { MapPin, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Unit {
  id: string
  type: string
  name: string
  property_name: string
  price: number
  county: string
  location: string
  description: string
  amenities: string[]
  available: boolean
}

interface UnitDetailsProps {
  unit: Unit
}

const TYPE_LABELS: Record<string, string> = {
  bedsitter: 'Bedsitter',
  studio: 'Studio',
  '1br': '1 Bedroom',
  '2br': '2 Bedroom',
}

export function UnitDetails({ unit }: UnitDetailsProps) {
  return (
    <div className="flex flex-col gap-8">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 pb-6 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center h-6 px-2.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
            {TYPE_LABELS[unit.type] ?? unit.type}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-xs font-medium',
              unit.available
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            )}
          >
            {unit.available ? (
              <><CheckCircle2 className="h-3 w-3" /> Available</>
            ) : (
              <><XCircle className="h-3 w-3" /> Unavailable</>
            )}
          </span>
        </div>

        <h1 className="font-heading text-3xl md:text-4xl text-foreground leading-tight">
          {unit.property_name}
        </h1>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span>{unit.location}, {unit.county} County</span>
        </div>
      </div>

      {/* ── Description ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 pb-6 border-b border-border">
        <h2 className="text-base font-semibold text-foreground">About this unit</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {unit.description}
        </p>
      </div>

      {/* ── Amenities ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 pb-6 border-b border-border">
        <h2 className="text-base font-semibold text-foreground">What&apos;s included</h2>
        <div className="grid grid-cols-2 gap-2">
          {unit.amenities.map((amenity) => (
            <div
              key={amenity}
              className="flex items-center gap-2 text-sm text-foreground"
            >
              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
              {amenity}
            </div>
          ))}
        </div>
      </div>

      {/* ── Verification notice ──────────────────────────────────────────── */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
          <CheckCircle2 className="h-4 w-4 text-background" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Verified listing</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            A KéjaLink moderator has physically visited this property, confirmed its legitimacy, and uploaded these images.
          </p>
        </div>
      </div>

    </div>
  )
}