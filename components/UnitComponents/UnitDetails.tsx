'use client'

import { MapPin, CheckCircle2, XCircle } from 'lucide-react'
import { motion, Variants } from 'framer-motion'
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

// Explicitly type the variants to fix the TypeScript error
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

export function UnitDetails({ unit }: UnitDetailsProps) {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-10"
    >

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 pb-8 border-b border-border/60">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center h-7 px-3 rounded-full text-xs font-semibold bg-muted text-foreground border border-border shadow-sm">
            {TYPE_LABELS[unit.type] ?? unit.type}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs font-semibold shadow-sm',
              unit.available
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-destructive/10 text-destructive border border-destructive/20'
            )}
          >
            {unit.available ? (
              <><CheckCircle2 className="h-3.5 w-3.5" /> Available Now</>
            ) : (
              <><XCircle className="h-3.5 w-3.5" /> Unavailable</>
            )}
          </span>
        </div>

        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight tracking-tight">
          {unit.property_name}
        </h1>

        <div className="flex items-center gap-2 text-base text-muted-foreground font-medium mt-1">
          <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
          <span>{unit.location}, {unit.county} County</span>
        </div>
      </motion.div>

      {/* ── Description ─────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 pb-8 border-b border-border/60">
        <h2 className="text-xl font-bold text-foreground">About this unit</h2>
        <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-line">
          {unit.description}
        </p>
      </motion.div>

      {/* ── Amenities ───────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex flex-col gap-5 pb-8 border-b border-border/60">
        <h2 className="text-xl font-bold text-foreground">What&apos;s included</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {unit.amenities.map((amenity) => (
            <div
              key={amenity}
              className="flex items-center gap-3 text-base text-foreground font-medium bg-muted/30 p-3 rounded-xl border border-border/40"
            >
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
              {amenity}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Verification notice ──────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex items-start gap-4 p-5 rounded-2xl bg-primary/5 border border-primary/15 shadow-sm">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <CheckCircle2 className="h-5 w-5 text-primary" />
        </div>
        <div className="pt-0.5">
          <p className="text-base font-bold text-foreground">Physically Verified Listing</p>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            A KejaLink moderator has physically visited this property, confirmed its legitimacy, and uploaded these exact images.
          </p>
        </div>
      </motion.div>

    </motion.div>
  )
}