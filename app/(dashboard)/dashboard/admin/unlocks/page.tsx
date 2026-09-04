'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, Unlock, TrendingUp, AlertTriangle, Home, Users } from 'lucide-react'
import { StatsGrid } from '@/components/Components/StatsGrid'
import { EmptyState } from '@/components/Components/EmptyState'
import { getPropertyTypeLabel } from '@/lib/constants/propertyTypes'
import { DashboardPageWrapper } from '@/components/dashboard/DashboardPageWrapper'

async function fetchUnlockOverview() {
  const res = await fetch('/api/admin/unlocks?view=overview')
  if (!res.ok) throw new Error('Failed to fetch')
  return (await res.json()).data
}

export default function AdminUnlocksPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-unlocks'],
    queryFn:  fetchUnlockOverview,
    refetchInterval: 60_000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
          <p className="text-sm font-semibold text-destructive">Failed to load unlock data</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      label: 'Total unlocks',
      value: data?.total ?? 0,
      icon:  Unlock,
      color: 'primary' as const,
      sub:   'All time',
    },
    {
      label: 'This month',
      value: data?.monthly ?? 0,
      icon:  TrendingUp,
      color: 'green' as const,
      sub:   'Contact reveals',
    },
    {
      label: 'Top users',
      value: data?.top_users?.length ?? 0,
      icon:  Users,
      color: 'blue' as const,
      sub:   'Most active unlockers',
    },
    {
      label: 'Suspicious',
      value: data?.suspicious?.length ?? 0,
      icon:  AlertTriangle,
      color: data?.suspicious?.length > 0 ? 'red' as const : 'default' as const,
      sub:   '50+ unlocks/hour',
    },
  ]

  return (
    <DashboardPageWrapper>

      {/* Header */}
      <div className="pb-5">
        <h1 className="text-2xl font-heading font-bold text-foreground">Contact Unlocks</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track contact reveals, popularity and suspicious activity
        </p>
      </div>

      {/* Stats */}
      <StatsGrid stats={stats} cols={4} />

      {/* Suspicious users alert */}
      {data?.suspicious?.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex flex-col gap-2 flex-1">
            <p className="text-sm font-semibold text-foreground">
              {data.suspicious.length} suspicious user{data.suspicious.length !== 1 ? 's' : ''} detected
            </p>
            <p className="text-xs text-muted-foreground">
              These users have unlocked 50+ contacts in the last hour. Consider reviewing their accounts.
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              {data.suspicious.map((s: any) => (
                <a
                  key={s.user_id}
                  href={`/dashboard/admin/users`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition-colors"
                >
                  <AlertTriangle className="h-3 w-3" />
                  {s.unlock_count_last_hour} unlocks — {s.user_id.slice(0, 12)}...
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Most unlocked units */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Home className="h-4 w-4 text-primary" />
              Most unlocked units
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {(data?.top_units ?? []).length === 0 ? (
              <EmptyState
                icon={Unlock}
                title="No unlocks yet"
                description="Unit contact reveals will appear here"
                size="sm"
              />
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {(data?.top_units ?? []).map((unit: any, i: number) => {
                  const property = unit.properties
                  return (
                    <div key={unit.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/20 transition-colors">
                      <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {property?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getPropertyTypeLabel(unit.type)} · {property?.location}, {property?.county}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          KES {unit.price?.toLocaleString()}/mo
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-primary tabular-nums">
                          {unit.unlock_count}
                        </p>
                        <p className="text-xs text-muted-foreground">unlocks</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top users by unlock count */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Most active users
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {(data?.top_users ?? []).length === 0 ? (
              <EmptyState
                icon={Users}
                title="No unlock activity"
                description="User activity will appear here"
                size="sm"
              />
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {(data?.top_users ?? []).map((user: any, i: number) => {
                  const profile = user.profile
                  const isSuspicious = data?.suspicious?.some(
                    (s: any) => s.user_id === user.user_id
                  )
                  return (
                    <div key={user.user_id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/20 transition-colors">
                      <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                        {i + 1}
                      </span>
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                          {profile?.full_name?.charAt(0) ?? '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {profile?.full_name ?? 'Unknown user'}
                          </p>
                          {isSuspicious && (
                            <Badge variant="destructive" className="text-xs gap-1 py-0 h-4">
                              <AlertTriangle className="h-2.5 w-2.5" />
                              Suspicious
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {profile?.email}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {profile?.phone_number}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-foreground tabular-nums">
                          {user.unlock_count}
                        </p>
                        <p className="text-xs text-muted-foreground">unlocks</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </DashboardPageWrapper>
  )
}