import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { connection } from 'next/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, Unlock, ShieldCheck, Star, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export default async function AdminMetricsPage() {
  await connection()

  const now        = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const lastMonth  = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()

  const [
    totalUsers, totalLandlords, totalModerators,
    newUsersMonth, newUsersLastMonth,
    totalProperties, approvedProps, pendingProps,
    newPropsMonth,
    totalUnlocks, monthUnlocks, lastMonthUnlocks,
    topProperties,
    approvedActivities,
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'user'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'landlord'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'moderator'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', monthStart),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', lastMonth).lte('created_at', lastMonthEnd),
    supabase.from('properties').select('id', { count: 'exact', head: true }),
    supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
    supabase.from('properties').select('id', { count: 'exact', head: true }).gte('created_at', monthStart),
    supabase.from('contact_unlocks').select('id', { count: 'exact', head: true }),
    supabase.from('contact_unlocks').select('id', { count: 'exact', head: true }).gte('unlocked_at', monthStart),
    supabase.from('contact_unlocks').select('id', { count: 'exact', head: true }).gte('unlocked_at', lastMonth).lte('unlocked_at', lastMonthEnd),
    supabase.from('properties').select('id, name, county, total_score').eq('status', 'approved').order('total_score', { ascending: false, nullsFirst: false }).limit(5),
    supabase.from('activity_logs').select('id', { count: 'exact', head: true }).eq('action', 'approved_property').gte('created_at', monthStart),
  ])

  const userGrowth   = newUsersLastMonth.count ? Math.round(((newUsersMonth.count ?? 0) - (newUsersLastMonth.count ?? 0)) / (newUsersLastMonth.count ?? 1) * 100) : 0
  const unlockGrowth = lastMonthUnlocks.count  ? Math.round(((monthUnlocks.count ?? 0) - (lastMonthUnlocks.count ?? 0)) / (lastMonthUnlocks.count ?? 1) * 100) : 0

  const stats = [
    {
      title: 'Total users',
      value: (totalUsers.count ?? 0).toLocaleString(),
      sub:   `+${newUsersMonth.count ?? 0} this month`,
      growth: userGrowth,
      icon:   Users,
      color:  'text-blue-600',
      bg:     'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      title: 'Active landlords',
      value: (totalLandlords.count ?? 0).toLocaleString(),
      sub:   `${((totalLandlords.count ?? 0) / Math.max(totalUsers.count ?? 1, 1) * 100).toFixed(1)}% conversion rate`,
      growth: null,
      icon:   Building2,
      color:  'text-primary',
      bg:     'bg-primary/10',
    },
    {
      title: 'Contact unlocks',
      value: (totalUnlocks.count ?? 0).toLocaleString(),
      sub:   `${monthUnlocks.count ?? 0} this month`,
      growth: unlockGrowth,
      icon:   Unlock,
      color:  'text-amber-600',
      bg:     'bg-amber-50 dark:bg-amber-950/30',
    },
    {
      title: 'Properties approved',
      value: (approvedProps.count ?? 0).toLocaleString(),
      sub:   `${approvedActivities.count ?? 0} approved this month`,
      growth: null,
      icon:   ShieldCheck,
      color:  'text-green-600',
      bg:     'bg-green-50 dark:bg-green-950/30',
    },
  ]

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-8 max-w-5xl mx-auto">

      <div className="border-b border-border/50 pb-5">
        <h1 className="text-2xl font-heading font-bold text-foreground">Platform Metrics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of KéjaLink platform performance
        </p>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border/60">
            <CardContent className="p-5">
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</p>
              <p className="text-xs font-semibold text-foreground mt-1">{stat.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
              {stat.growth !== null && (
                <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${stat.growth >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                  <TrendingUp className="h-3 w-3" />
                  {stat.growth >= 0 ? '+' : ''}{stat.growth}% vs last month
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Property breakdown */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Property breakdown</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-6 pb-6">
          {[
            { label: 'Total',    value: totalProperties.count ?? 0, color: 'text-foreground'   },
            { label: 'Approved', value: approvedProps.count   ?? 0, color: 'text-green-600'    },
            { label: 'Pending',  value: pendingProps.count    ?? 0, color: 'text-amber-600'    },
            { label: 'New this month', value: newPropsMonth.count ?? 0, color: 'text-primary'  },
          ].map(item => (
            <div key={item.label} className="text-center">
              <p className={`text-3xl font-bold tabular-nums ${item.color}`}>{item.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top ranked properties */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" />
            Top ranked properties
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {(topProperties.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground px-6 pb-6">No scored properties yet.</p>
          ) : (
            (topProperties.data ?? []).map((p: any, i: number) => (
              <div key={p.id} className={`flex items-center justify-between px-6 py-3.5 ${i !== (topProperties.data?.length ?? 0) - 1 ? 'border-b border-border' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.county}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-primary">
                  <Star className="h-3.5 w-3.5" />
                  {p.total_score}/100
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Platform summary */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Team summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-6 pb-6">
          {[
            { label: 'Moderators', value: totalModerators.count ?? 0, icon: ShieldCheck },
            { label: 'Landlords',  value: totalLandlords.count  ?? 0, icon: Building2   },
            { label: 'Users',      value: totalUsers.count      ?? 0, icon: Users        },
          ].map(item => (
            <div key={item.label} className="text-center">
              <item.icon className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground tabular-nums">{item.value.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  )
}