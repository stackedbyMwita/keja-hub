'use client'

import { Button } from '@/components/ui/button'
import { Images, Trophy } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { ScoringSheet } from './ScoringSheet'

interface PropertyApprovedActionsProps {
  propertyId: string
  propertyName: string
  imageCount: number
  hasScores: boolean
  existingScores: Record<string, number>
}

export function PropertyApprovedActions({
  propertyId,
  propertyName,
  imageCount,
  hasScores,
  existingScores,
}: PropertyApprovedActionsProps) {
  const [scoringOpen, setScoringOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col gap-3 p-4 rounded-xl bg-muted/40 border border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Management actions
        </p>

        <div className="flex gap-3 flex-wrap">

          {/* Image management */}
          <Button asChild variant="outline" className="gap-2 flex-1 sm:flex-none">
            <Link href={`/dashboard/moderator/properties/${propertyId}/images`}>
              <Images className="h-4 w-4" />
              Manage images
              {imageCount === 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold leading-none">
                  !
                </span>
              )}
              {imageCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-muted-foreground/20 text-foreground text-xs font-medium">
                  {imageCount}
                </span>
              )}
            </Link>
          </Button>

          {/* Score property */}
          <Button
            variant={hasScores ? 'outline' : 'default'}
            className="gap-2 flex-1 sm:flex-none"
            onClick={() => setScoringOpen(true)}
          >
            <Trophy className="h-4 w-4" />
            {hasScores ? 'Update score' : 'Score property'}
          </Button>

        </div>

        {imageCount === 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            ⚠️ No images uploaded yet — this property won&apos;t appear in listings until images are added.
          </p>
        )}

        {!hasScores && (
          <p className="text-xs text-muted-foreground">
            💡 Score this property to improve its ranking in search results.
          </p>
        )}
      </div>

      <ScoringSheet
        open={scoringOpen}
        onClose={() => setScoringOpen(false)}
        propertyId={propertyId}
        propertyName={propertyName}
        existingScores={existingScores}
      />
    </>
  )
}