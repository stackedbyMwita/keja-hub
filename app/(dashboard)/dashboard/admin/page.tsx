import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { connection } from 'next/server'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Building2, ShieldCheck, Unlock, Clock, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react'
import { DashboardPageWrapper } from '@/components/dashboard/DashboardPageWrapper'
import { StatsGrid } from '@/components/Components/StatsGrid'
import { StatItem } from '@/types'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export default async function AdminOverviewPage() {
  await connection()
  const { userId } = await auth()

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    totalUsers, totalLandlords, totalModerators, newUsersMonth, approvedProperties, pendingProperties, pendingLandlords, totalUnlocks, monthUnlocks, recentActivity
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'user'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'landlord'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'moderator'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', monthStart),
    supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
    supabase.from('landlord_profiles').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('contact_unlocks').select('id', { count: 'exact', head: true }),
    supabase.from('contact_unlocks').select('id', { count: 'exact', head: true }).gte('unlocked_at', monthStart),
    supabase.from('activity_logs').select('id, action, metadata, created_at, profiles!activity_logs_actor_id_fkey(full_name, role)').order('created_at', { ascending: false }).limit(8),
  ])

  const stats: StatItem[] = [
    { label: 'Total users', value: totalUsers.count ?? 0, sub: `+${newUsersMonth.count ?? 0} this month`, icon: Users },
    { label: 'Landlords', value: totalLandlords.count ?? 0, sub: 'Active landlords', icon: Building2 },
    { label: 'Moderators', value: totalModerators.count ?? 0, sub: 'Active moderators', icon: ShieldCheck },
    { label: 'Contact unlocks', value: totalUnlocks.count ?? 0, sub: `${monthUnlocks.count ?? 0} this month`,   icon: Unlock },
  ]

  const attention = [
    { label: 'Landlord applications pending', value: pendingLandlords.count ?? 0,   href: '/dashboard/admin/moderators', color: 'text-amber-600', icon: Clock },
    { label: 'Properties pending review',     value: pendingProperties.count ?? 0,  href: '/dashboard/admin/properties', color: 'text-blue-600',  icon: Building2 },
    { label: 'Approved properties',           value: approvedProperties.count ?? 0, href: '/dashboard/admin/properties', color: 'text-green-600', icon: CheckCircle2 },
  ]

  function formatAction(action: string, metadata: any): string {
    const map: Record<string, string> = {
      approved_property:             `Approved property: ${metadata?.property_name ?? ''}`,
      rejected_property:             `Rejected property: ${metadata?.property_name ?? ''}`,
      approved_landlord_application: `Approved landlord: ${metadata?.landlord_name ?? ''}`,
      rejected_landlord_application: `Rejected landlord: ${metadata?.landlord_name ?? ''}`,
      banned_user:                   'Banned a user',
      unbanned_user:                 'Unbanned a user',
      suspended_landlord:            'Suspended a landlord',
      unsuspended_landlord:          'Unsuspended a landlord',
      suspended_property:            `Suspended property`,
      scored_property:               `Scored property: ${metadata?.property_name ?? ''}`,
      uploaded_unit_image:           'Uploaded unit image',
      promoted_to_moderator:         `Promoted to moderator: ${metadata?.email ?? ''}`,
    }
    return map[action] ?? action.replace(/_/g, ' ')
  }

  return (
    <DashboardPageWrapper>

      {/* Header */}
      <div className="pb-5">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">Admin Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform activity summary</p>
      </div>

      {/* Stats grid */}
      <StatsGrid cols={4} stats={stats} />

      {/* Attention items */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Items requiring attention
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {attention.map((item, i) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors group ${i !== attention.length - 1 ? 'border-b border-border' : ''}`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`h-4 w-4 ${item.color} shrink-0`} />
                <p className="text-sm font-medium text-foreground">{item.label}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-lg font-bold tabular-nums ${item.color}`}>{item.value}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Recent activity */}
      <Card className="border-border/60">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">Recent platform activity</CardTitle>
          <Button variant="ghost" size="sm" asChild className="text-xs">
            <Link href="/dashboard/admin/activity">View all <ArrowRight className="h-3 w-3 ml-1" /></Link>
          </Button>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {(recentActivity.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground px-6 pb-6">No activity yet.</p>
          ) : (
            (recentActivity.data ?? []).map((log: any, i: number) => (
              <div key={log.id} className={`flex items-start gap-3 px-6 py-3.5 ${i !== (recentActivity.data?.length ?? 0) - 1 ? 'border-b border-border' : ''}`}>
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <div className={`w-2 h-2 rounded-full ${log.action.includes('approved') || log.action.includes('promoted') ? 'bg-green-500' : log.action.includes('rejected') || log.action.includes('banned') || log.action.includes('suspended') ? 'bg-destructive' : 'bg-primary'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground">
                      {formatAction(log.action, log.metadata)}
                    </p>
                    <Badge variant="outline" className="text-xs capitalize">
                      {(log.profiles as any)?.role ?? 'system'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    by {(log.profiles as any)?.full_name ?? 'Unknown'} · {new Date(log.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </DashboardPageWrapper>
  )
}
