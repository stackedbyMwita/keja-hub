import { Card, CardContent } from '@/components/ui/card'
import { ChevronRight, ChevronRightCircle, LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Types

type StatColor = 'default' | 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'primary'

export interface StatItem {
  label:    string
  value:    number | string
  icon:     LucideIcon
  color?:   StatColor
  sub?:     string
  href?:    string           // makes the card clickable
  trend?:   number           // positive = growth %, negative = decline %
}

interface StatsGridProps {
  stats:    StatItem[]
  cols?:    2 | 3 | 4 | 6    // grid columns — default 4
  compact?: boolean // smaller padding
}

// Color map
const COLOR_MAP: Record<StatColor, { icon: string; bg: string; border: string }> = {
  default: { icon: 'text-foreground',  bg: 'bg-muted',                                     border: 'border-border'                                     },
  primary: { icon: 'text-primary',     bg: 'bg-primary/10',                                border: 'border-primary/20'                                 },
  blue:    { icon: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-950/30',               border: 'border-blue-200 dark:border-blue-800'               },
  green:   { icon: 'text-green-600',   bg: 'bg-green-50 dark:bg-green-950/30',             border: 'border-green-200 dark:border-green-800'             },
  amber:   { icon: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-950/30',             border: 'border-amber-200 dark:border-amber-800'             },
  red:     { icon: 'text-destructive', bg: 'bg-destructive/5',                             border: 'border-destructive/20'                             },
  purple:  { icon: 'text-purple-600',  bg: 'bg-purple-50 dark:bg-purple-950/30',           border: 'border-purple-200 dark:border-purple-800'           },
}

const COLS_MAP: Record<number, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
}

// ── Component ─────────────────────────────────────────────────────────────────

export function StatsGrid({ stats, cols = 4, compact = false }: StatsGridProps) {
  return (
    <div className={cn('grid gap-4', COLS_MAP[cols] ?? COLS_MAP[4])}>
      {stats.map((stat) => {
        const colors  = COLOR_MAP[stat.color ?? 'default']
        const padding = compact ? 'p-4' : 'p-5'

        const content = (
          <CardContent className={`${padding} flex flex-col gap-2`}>
            {/* Icon */}
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', colors.bg)}>
              <stat.icon className={cn('h-4 w-4', colors.icon)} />
            </div>

            {/* Value */}
            <div>
              <p className="text-2xl font-bold text-foreground tabular-nums leading-none">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </p>

              {/* Trend */}
              {stat.trend != null && (
                <span className={cn(
                  'text-xs font-semibold ml-1',
                  stat.trend >= 0 ? 'text-green-600' : 'text-destructive'
                )}>
                  {stat.trend >= 0 ? '+' : ''}{stat.trend}%
                </span>
              )}
            </div>

            {/* Labels */}
            <div>
              <p className="text-xs font-semibold text-foreground leading-tight">{stat.label}</p>
              {stat.sub && (
                <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{stat.sub}</p>
              )}
            </div>

            {/* Clickable hint */}
            {stat.href && (
              <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1 mt-auto pt-1">
                View
                <ChevronRightCircle size={16}/>
              </p>
            )}
          </CardContent>
        )

        if (stat.href) {
          return (
            <Link key={stat.label} href={stat.href} className="block group">
              <Card className={cn(
                'transition-all hover:shadow-md group-hover:border-opacity-60 h-full',
                colors.border
              )}>
                {content}
              </Card>
            </Link>
          )
        }

        return (
          <Card key={stat.label} className={cn('h-full', colors.border)}>
            {content}
          </Card>
        )
      })}
    </div>
  )
}