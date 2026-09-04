'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Tooltip, TooltipContent,
  TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import { useQuery } from '@tanstack/react-query'
import {
  ActivitySquare, ChevronLeft,
  ChevronRight,
  Inbox,
  Loader2,
  RefreshCw,
  Search,
} from 'lucide-react'
import { useState } from 'react'
import { useDebounce } from 'use-debounce'
import { UserAvatar } from '../Components/UserAvatar'
import {
  CATEGORIES, DATE_RANGES,
  formatAbsoluteTime,
  formatRelativeTime,
  getActionConfig,
  getTarget,
} from './ActivityUtils'
import { ActivityLogProps, ActivityResponse, LogEntry } from '@/types'

function buildUrl(params: Record<string, string | number | undefined | null>): string {
  const url = new URLSearchParams()
  for (const [key, val] of Object.entries(params)) {
    if (val != null && val !== '') url.set(key, String(val))
  }
  return `/api/activity?${url}`
}

async function fetchActivity(params: Record<string, any>): Promise<ActivityResponse> {
  const res = await fetch(buildUrl(params))
  if (!res.ok) throw new Error('Failed to fetch activity')
  return res.json()
}

// ── Main component
export function ActivityLog({
  actorId,
  targetId,
  targetType,
  actions,
  compact    = false,
  showActor  = true,
  title      = 'Activity log',
  limit,
}: ActivityLogProps) {

  const [page, setPage]         = useState(1)
  const [category, setCategory] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const [search, setSearch]     = useState('')
  const [debouncedSearch]       = useDebounce(search, 400)

  const params = {
    page,
    category,
    dateRange,
    search:     debouncedSearch || null,
    actorId:    actorId    || null,
    targetId:   targetId   || null,
    targetType: targetType || null,
  }

  const queryKey = ['activity', params]

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchActivity(params),
    staleTime: 30_000,
    placeholderData: (prev: any) => prev,
  })

  const logs       = data?.data       ?? []
  const total      = data?.total      ?? 0
  const totalPages = data?.totalPages ?? 1

  function resetFilters() {
    setPage(1)
    setCategory('all')
    setDateRange('all')
    setSearch('')
  }

  const hasFilters = category !== 'all' || dateRange !== 'all' || search !== ''

  // ── Compact mode ──────────────────────────────────────────────────────────
  if (compact) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ActivitySquare className="h-4 w-4" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {isLoading ? (
            <LogSkeleton rows={5} />
          ) : logs.length === 0 ? (
            <EmptyState />
          ) : (
            <LogList logs={logs} showActor={showActor} />
          )}
        </CardContent>
      </Card>
    )
  }

  // Full mode
  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <ActivitySquare className="h-5 w-5 text-muted-foreground" />
            {title}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading ? '—' : `${total} total entries`}
          </p>
        </div>
        <Button
          variant="outline" size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2 rounded-full bg-primary/10 text-primary border-primary/20"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, action..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="pl-9 h-9 text-sm"
          />
        </div>

        {/* Category */}
        <Select value={category} onValueChange={v => { setCategory(v); setPage(1) }}>
          <SelectTrigger className="w-[155px] h-9 text-sm">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date range */}
        <Select value={dateRange} onValueChange={v => { setDateRange(v); setPage(1) }}>
          <SelectTrigger className="w-[130px] h-9 text-sm">
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGES.map(d => (
              <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear filters */}
        {hasFilters && (
          <Button
            variant="ghost" size="sm"
            onClick={resetFilters}
            className="text-xs text-muted-foreground hover:text-foreground h-9 rounded-full"
          >
            Clear filters
          </Button>
        )}

        {/* Fetching indicator */}
        {isFetching && !isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
          <p className="text-sm text-destructive font-medium">Failed to load activity</p>
          <p className="text-xs text-muted-foreground mt-1">{(error as Error).message}</p>
        </div>
      )}

      {/* Log table */}
      <Card className="border-border/60 overflow-hidden">
        <CardContent className="px-0 pb-0">
          {isLoading ? (
            <LogSkeleton rows={8} />
          ) : logs.length === 0 ? (
            <EmptyState hasFilters={hasFilters} onClear={resetFilters} />
          ) : (
            <LogList logs={logs} showActor={showActor} />
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-muted-foreground">
            Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline" size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isFetching}
              className="h-8 gap-1.5"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = totalPages <= 5
                  ? i + 1
                  : page <= 3
                  ? i + 1
                  : page >= totalPages - 2
                  ? totalPages - 4 + i
                  : page - 2 + i
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    disabled={isFetching}
                    className="h-8 w-8 p-0 text-xs"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline" size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isFetching}
              className="h-8 gap-1.5"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

    </div>
  )
}

// Log list
function LogList({ logs, showActor }: { logs: LogEntry[]; showActor: boolean }) {
  return (
    <div className="flex flex-col divide-y divide-border">
      {logs.map(log => (
        <LogRow key={log.id} log={log} showActor={showActor} />
      ))}
    </div>
  )
}

function LogRow({ log, showActor }: { log: LogEntry; showActor: boolean }) {
  const cfg    = getActionConfig(log.action)
  const target = getTarget(log.action, log.metadata)
  const actor  = log.profiles

  return (
    <div className="flex items-start gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">

      {/* Colored dot */}
      <span className={`w-2 h-2 rounded-full mt-2 shrink-0 ${cfg.dot}`} />

      {/* Actor avatar — only in full mode */}
      {showActor && actor && (
        <UserAvatar
          name={actor.full_name}
          imageUrl={actor.avatar_url}
          userId={actor.id}
          size="md"
        />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">

          {/* Action badge */}
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.badge}`}>
            {cfg.label}
          </span>

          {/* Target */}
          {target !== '—' && (
            <span className="text-sm text-foreground font-medium truncate">
              — {target}
            </span>
          )}
        </div>

        {/* Actor info */}
        {showActor && actor && (
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-muted-foreground">
              by <span className="font-medium text-foreground">{actor.full_name ?? actor.email}</span>
            </p>
            <Badge variant="outline" className="text-xs rounded-full capitalize py-0 h-4">
              {actor.role}
            </Badge>
          </div>
        )}

        {/* Reason / notes */}
        {log.metadata?.reason && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            Reason: {log.metadata.reason}
          </p>
        )}
        {log.metadata?.notes && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            Notes: {log.metadata.notes}
          </p>
        )}
      </div>

      {/* Timestamp */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <time
              className="text-xs text-muted-foreground whitespace-nowrap shrink-0 mt-0.5 cursor-default"
              dateTime={log.created_at}
            >
              {formatRelativeTime(log.created_at)}
            </time>
          </TooltipTrigger>
          <TooltipContent side="left">
            {formatAbsoluteTime(log.created_at)}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

    </div>
  )
}

// Skeleton
function LogSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col divide-y divide-border animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-start gap-4 px-5 py-4">
          <div className="w-2 h-2 rounded-full bg-muted mt-2 shrink-0" />
          <div className="w-7 h-7 rounded-full bg-muted shrink-0" />
          <div className="flex-1 flex flex-col gap-2 pt-0.5">
            <div className="flex items-center gap-2">
              <div className="h-5 w-28 bg-muted rounded-full" />
              <div className="h-4 w-36 bg-muted/60 rounded" />
            </div>
            <div className="h-3 w-48 bg-muted/50 rounded" />
          </div>
          <div className="h-3 w-12 bg-muted rounded shrink-0 mt-1" />
        </div>
      ))}
    </div>
  )
}

// Empty state
function EmptyState({ hasFilters, onClear }: { hasFilters?: boolean; onClear?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
        <Inbox className="h-6 w-6 text-muted-foreground/50" />
      </div>
      <p className="text-sm font-medium text-foreground">No activity found</p>
      {hasFilters ? (
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-muted-foreground">
            No results match your current filters
          </p>
          {onClear && (
            <Button variant="outline" size="sm" onClick={onClear} className="h-8 rounded-full text-xs">
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No actions have been logged yet</p>
      )}
    </div>
  )
}
