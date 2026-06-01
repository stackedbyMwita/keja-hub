'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Star, Trophy } from 'lucide-react'
import {
  Sheet, SheetContent, SheetHeader,
  SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const METRICS = [
  { key: 'score_security',    label: 'Security',                   description: 'Guards, lighting, perimeter' },
  { key: 'score_water',       label: 'Water availability',         description: 'Reliable supply, pressure, tanks' },
  { key: 'score_electricity', label: 'Electricity reliability',    description: 'Power consistency, backup' },
  { key: 'score_road_access', label: 'Road access',                description: 'Tarmac, accessibility, parking' },
  { key: 'score_amenities',   label: 'Proximity to amenities',     description: 'Shops, schools, hospitals nearby' },
  { key: 'score_cleanliness', label: 'Cleanliness & maintenance',  description: 'Compound, walls, common areas' },
  { key: 'score_lighting',    label: 'Lighting & ventilation',     description: 'Natural light, airflow, windows' },
  { key: 'score_sanitation',  label: 'Bathroom & sanitation',      description: 'Toilets, drainage, hygiene' },
  { key: 'score_value',       label: 'Value for money',            description: 'Fair pricing for what is offered' },
  { key: 'score_landlord',    label: 'Landlord responsiveness',    description: 'Communication, professionalism' },
] as const

type ScoreKey = typeof METRICS[number]['key']
type Scores   = Record<ScoreKey, number>

const DEFAULT_SCORES: Scores = {
  score_security: 5, score_water: 5, score_electricity: 5,
  score_road_access: 5, score_amenities: 5, score_cleanliness: 5,
  score_lighting: 5, score_sanitation: 5, score_value: 5, score_landlord: 5,
}

function getScoreColor(score: number): string {
  if (score >= 8) return 'text-green-600 dark:text-green-400'
  if (score >= 6) return 'text-primary'
  if (score >= 4) return 'text-amber-600 dark:text-amber-400'
  return 'text-destructive'
}

function getScoreLabel(total: number): { label: string; icon: string } {
  if (total >= 80) return { label: 'Excellent', icon: '🏆' }
  if (total >= 65) return { label: 'Good',      icon: '⭐' }
  if (total >= 50) return { label: 'Average',   icon: '📍' }
  return              { label: 'Below avg',  icon: '⚠️' }
}

interface ScoringSheetProps {
  open:         boolean
  onClose:      () => void
  propertyId:   string
  propertyName: string
  existingScores?: Partial<Scores>
}

export function ScoringSheet({
  open, onClose, propertyId, propertyName, existingScores,
}: ScoringSheetProps) {
  const router = useRouter()

  const [scores, setScores] = useState<Scores>({
    ...DEFAULT_SCORES,
    ...existingScores,
  })
  const [loading, setLoading] = useState(false)

  const total      = Object.values(scores).reduce((a, b) => a + b, 0)
  const scoreInfo  = getScoreLabel(total)

  function setScore(key: ScoreKey, val: number) {
    setScores(prev => ({ ...prev, [key]: val }))
  }

  async function handleSave() {
    setLoading(true)
    try {
      const res = await fetch(`/api/moderator/properties/${propertyId}/score`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(scores),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed to save scores'); return }
      toast.success(`Property scored ${total}/100 — ${scoreInfo.icon} ${scoreInfo.label}`)
      router.refresh()
      onClose()
    } catch { toast.error('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto flex flex-col">

        <SheetHeader className="shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Score property
          </SheetTitle>
          <SheetDescription>
            Rate {propertyName} across 10 metrics. Each metric is scored 1–10.
          </SheetDescription>
        </SheetHeader>

        {/* Live total */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border my-4 shrink-0">
          <div>
            <p className="text-xs text-muted-foreground">KéjaLink Score</p>
            <p className="text-3xl font-bold text-foreground tabular-nums mt-0.5">
              {total}
              <span className="text-sm font-normal text-muted-foreground">/100</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl">{scoreInfo.icon}</p>
            <p className="text-sm font-semibold text-foreground mt-0.5">{scoreInfo.label}</p>
          </div>
        </div>

        {/* Metrics */}
        <div className="flex flex-col gap-5 flex-1 overflow-y-auto pr-1">
          {METRICS.map((metric, i) => {
            const val = scores[metric.key]
            return (
              <div key={metric.key} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{metric.label}</p>
                    <p className="text-xs text-muted-foreground">{metric.description}</p>
                  </div>
                  <span className={cn('text-xl font-bold tabular-nums w-8 text-right', getScoreColor(val))}>
                    {val}
                  </span>
                </div>

                {/* Score buttons 1-10 */}
                <div className="flex gap-1">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      onClick={() => setScore(metric.key, n)}
                      className={cn(
                        'flex-1 h-8 rounded-lg text-xs font-semibold transition-all border',
                        val === n
                          ? n >= 8
                            ? 'bg-green-600 text-white border-green-600'
                            : n >= 6
                            ? 'bg-primary text-primary-foreground border-primary'
                            : n >= 4
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-destructive text-destructive-foreground border-destructive'
                          : n <= val
                          ? 'bg-muted border-border text-muted-foreground'
                          : 'bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                {i < METRICS.length - 1 && <Separator className="mt-1" />}
              </div>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border shrink-0 mt-4">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSave} disabled={loading}>
            {loading
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
              : `Save score · ${total}/100`
            }
          </Button>
        </div>

      </SheetContent>
    </Sheet>
  )
}