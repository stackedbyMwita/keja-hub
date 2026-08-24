import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { connection } from 'next/server'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Crown, Users, ShieldCheck, Building2, Unlock, ArrowRight, Settings } from 'lucide-react'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export default async function SuperadminOverviewPage() {
  await connection()
  const { userId } = await auth()

  const now        = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    totalUsers, totalLandlords, totalModerators, totalAdmins,
    newUsersMonth, totalProperties, approvedProperties,
    pendingProperties, totalUnlocks, monthUnlocks,
    recentActivity, systemConfig,
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'user'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'landlord'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'moderator'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'admin'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', monthStart),
    supabase.from('properties').select('id', { count: 'exact', head: true }),
    supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
    supabase.from('contact_unlocks').select('id', { count: 'exact', head: true }),
    supabase.from('contact_unlocks').select('id', { count: 'exact', head: true }).gte('unlocked_at', monthStart),
    supabase.from('activity_logs')
      .select('id, action, metadata, created_at, profiles!activity_logs_actor_id_fkey(full_name, role)')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase.from('activity_logs')
      .select('metadata')
      .eq('action', 'system_config_update')
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
  ])

  const config = systemConfig.data?.metadata ?? {}

  const stats = [
    { label: 'Total users',    value: totalUsers.count      ?? 0, sub: `+${newUsersMonth.count ?? 0} this month`, icon: Users,       color: 'text-blue-600',  bg: 'bg-blue-50 dark:bg-blue-950/30'   },
    { label: 'Landlords',      value: totalLandlords.count  ?? 0, sub: 'Registered landlords',                    icon: Building2,   color: 'text-primary',   bg: 'bg-primary/10'                     },
    { label: 'Moderators',     value: totalModerators.count ?? 0, sub: 'Active moderators',                       icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
    { label: 'Admins',         value: totalAdmins.count     ?? 0, sub: 'Platform administrators',                 icon: Crown,       color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    { label: 'Properties',     value: totalProperties.count ?? 0, sub: `${approvedProperties.count ?? 0} approved`, icon: Building2, color: 'text-primary',   bg: 'bg-primary/10'                     },
    { label: 'Contact unlocks',value: totalUnlocks.count    ?? 0, sub: `${monthUnlocks.count ?? 0} this month`,  icon: Unlock,      color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
  ]

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border/50 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Crown className="h-5 w-5 text-amber-500" />
            <h1 className="text-2xl font-heading font-bold text-foreground">Superadmin Overview</h1>
          </div>
          <p className="text-sm text-muted-foreground">Full platform control and visibility</p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/dashboard/superadmin/system">
            <Settings className="h-4 w-4" />
            System config
          </Link>
        </Button>
      </div>

      {/* System flags warning */}
      {(config.maintenance_mode || config.disable_signups || config.disable_landlord_applications) && (
        <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 w-full">⚠️ Active system flags:</p>
          {config.maintenance_mode && <Badge className="bg-amber-500 text-white">Maintenance mode ON</Badge>}
          {config.disable_signups && <Badge className="bg-amber-500 text-white">Signups disabled</Badge>}
          {config.disable_landlord_applications && <Badge className="bg-amber-500 text-white">Landlord applications disabled</Badge>}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/60">
            <CardContent className="p-5">
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground tabular-nums">{stat.value.toLocaleString()}</p>
              <p className="text-xs font-semibold text-foreground mt-1">{stat.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-border/60 hover:shadow-md transition-shadow">
          <Link href="/dashboard/superadmin/admins">
            <CardContent className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Manage Admins</p>
                  <p className="text-xs text-muted-foreground">{totalAdmins.count ?? 0} admins · Promote or demote</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </CardContent>
          </Link>
        </Card>

        <Card className="border-border/60 hover:shadow-md transition-shadow">
          <Link href="/dashboard/superadmin/system">
            <CardContent className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">System Config</p>
                  <p className="text-xs text-muted-foreground">Feature flags · Maintenance mode</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Recent activity */}
      <Card className="border-border/60">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">Recent platform activity</CardTitle>
          <Button variant="ghost" size="sm" asChild className="text-xs">
            <Link href="/dashboard/admin/activity">View all <ArrowRight className="h-3 w-3 ml-1" /></Link>
          </Button>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {(recentActivity.data ?? []).map((log: any, i: number) => (
            <div key={log.id} className={`flex items-start gap-3 px-6 py-3.5 ${i !== (recentActivity.data?.length ?? 0) - 1 ? 'border-b border-border' : ''}`}>
              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                log.action.includes('approved') || log.action.includes('promoted') ? 'bg-green-500'
                : log.action.includes('rejected') || log.action.includes('banned') || log.action.includes('suspended') ? 'bg-destructive'
                : 'bg-primary'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {log.action.replace(/_/g, ' ')}
                  {log.metadata?.property_name ? ` — ${log.metadata.property_name}` : ''}
                  {log.metadata?.landlord_name ? ` — ${log.metadata.landlord_name}` : ''}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  by <span className="font-medium">{(log.profiles as any)?.full_name ?? 'Unknown'}</span>
                  {' · '}{new Date(log.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  )
}