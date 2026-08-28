'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Loader2, Settings, ShieldAlert, Users,
  Building2, Megaphone, Save, Construction,
  Info, AlertTriangle, CheckCircle2, XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DashboardPageWrapper } from '@/components/dashboard/DashboardPageWrapper'

interface SystemConfig {
  maintenance_mode:              boolean
  maintenance_message:           string
  disable_signups:               boolean
  disable_signups_message:       string
  disable_landlord_applications: boolean
  disable_landlord_message:      string
  announcement_active:           boolean
  announcement_text:             string
  announcement_type:             'info' | 'warning' | 'success' | 'error'
}

const DEFAULT: SystemConfig = {
  maintenance_mode:              false,
  maintenance_message:           'KéjaLink is currently undergoing scheduled maintenance. We will be back shortly.',
  disable_signups:               false,
  disable_signups_message:       'New registrations are temporarily disabled. Please check back later.',
  disable_landlord_applications: false,
  disable_landlord_message:      'Landlord applications are temporarily closed.',
  announcement_active:           false,
  announcement_text:             '',
  announcement_type:             'info',
}

const ANNOUNCEMENT_TYPES = [
  { value: 'info',    label: 'Info',    icon: Info,          color: 'text-blue-600'  },
  { value: 'warning', label: 'Warning', icon: AlertTriangle, color: 'text-amber-600' },
  { value: 'success', label: 'Success', icon: CheckCircle2,  color: 'text-green-600' },
  { value: 'error',   label: 'Error',   icon: XCircle,       color: 'text-destructive'},
]

const BANNER_PREVIEW = {
  info:    'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
  warning: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
  success: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
  error:   'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
}

async function fetchConfig(): Promise<SystemConfig> {
  const res = await fetch('/api/superadmin/system')
  if (!res.ok) throw new Error('Failed to fetch')
  return (await res.json()).data ?? DEFAULT
}

function Toggle({ label, description, checked, onChange, danger = false }: {
  label: string; description: string; checked: boolean
  onChange: (v: boolean) => void; danger?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-4">
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-semibold', danger && checked ? 'text-destructive' : 'text-foreground')}>
          {label}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          checked ? danger ? 'bg-destructive' : 'bg-primary' : 'bg-muted'
        )}
      >
        <span className={cn(
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200',
          checked ? 'translate-x-5' : 'translate-x-0'
        )} />
      </button>
    </div>
  )
}

export default function SuperadminSystemPage() {
  const queryClient               = useQueryClient()
  const [config, setConfig]       = useState<SystemConfig>(DEFAULT)
  const [isDirty, setIsDirty]     = useState(false)
  const [savedConfig, setSaved]   = useState<SystemConfig>(DEFAULT)

  useQuery({
    queryKey: ['superadmin-system'],
    queryFn:  fetchConfig,
    onSuccess: (data: SystemConfig) => { setConfig(data); setSaved(data) },
  } as any)

  function set<K extends keyof SystemConfig>(key: K, value: SystemConfig[K]) {
    setConfig(prev => ({ ...prev, [key]: value }))
    setIsDirty(true)
  }

  const saveMutation = useMutation({
    mutationFn: async (cfg: SystemConfig) => {
      const res = await fetch('/api/superadmin/system', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(cfg),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return data.data
    },
    onSuccess: (saved: SystemConfig) => {
      toast.success('System configuration saved')
      setSaved(saved)
      setConfig(saved)
      setIsDirty(false)
      queryClient.invalidateQueries({ queryKey: ['superadmin-system'] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const activeFlags = [
    config.maintenance_mode,
    config.disable_signups,
    config.disable_landlord_applications,
  ].filter(Boolean).length

  const BannerIcon = ANNOUNCEMENT_TYPES.find(t => t.value === config.announcement_type)?.icon ?? Info

  return (
    <DashboardPageWrapper>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border/50 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-2xl font-heading font-bold text-foreground">System Config</h1>
          </div>
          <p className="text-sm text-muted-foreground">Platform-wide feature flags and announcements</p>
        </div>
        <Button onClick={() => saveMutation.mutate(config)} disabled={!isDirty || saveMutation.isPending} className="gap-2">
          {saveMutation.isPending
            ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</>
            : <><Save className="h-4 w-4" />Save changes</>
          }
        </Button>
      </div>

      {/* Active flags warning */}
      {activeFlags > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
          <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
              {activeFlags} active system flag{activeFlags !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
              Some platform features are currently restricted.
            </p>
          </div>
        </div>
      )}

      {/* Maintenance mode */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Construction className="h-4 w-4" />
            Maintenance mode
          </CardTitle>
          <CardDescription className="text-xs">
            Take the platform offline. Only superadmins can access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-6 pb-6 divide-y divide-border/60">
          <Toggle
            label="Enable maintenance mode"
            description="All public pages show a maintenance message. Superadmins bypass this."
            checked={config.maintenance_mode}
            onChange={v => set('maintenance_mode', v)}
            danger
          />
          <div className="flex flex-col gap-1.5 pt-4">
            <Label className="text-xs font-medium">Maintenance message</Label>
            <Textarea
              value={config.maintenance_message}
              onChange={e => set('maintenance_message', e.target.value)}
              className="resize-none h-20 text-sm"
              disabled={!config.maintenance_mode}
            />
          </div>
        </CardContent>
      </Card>

      {/* Access control */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Access control
          </CardTitle>
          <CardDescription className="text-xs">
            Control signups and landlord applications.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 divide-y divide-border/60">
          <Toggle
            label="Disable new signups"
            description="Prevent new users from creating accounts. Existing users are unaffected."
            checked={config.disable_signups}
            onChange={v => set('disable_signups', v)}
            danger
          />
          {config.disable_signups && (
            <div className="flex flex-col gap-1.5 pt-4 pb-2">
              <Label className="text-xs font-medium">Disabled signups message</Label>
              <Input value={config.disable_signups_message} onChange={e => set('disable_signups_message', e.target.value)} className="text-sm" />
            </div>
          )}
          <Toggle
            label="Disable landlord applications"
            description="Prevent users from submitting new landlord applications."
            checked={config.disable_landlord_applications}
            onChange={v => set('disable_landlord_applications', v)}
            danger
          />
          {config.disable_landlord_applications && (
            <div className="flex flex-col gap-1.5 pt-4">
              <Label className="text-xs font-medium">Disabled applications message</Label>
              <Input value={config.disable_landlord_message} onChange={e => set('disable_landlord_message', e.target.value)} className="text-sm" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Announcement banner */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Announcement banner
          </CardTitle>
          <CardDescription className="text-xs">
            Show a banner at the top of the homepage for all users.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-6 pb-6 divide-y divide-border/60">
          <Toggle
            label="Show announcement banner"
            description="Display the banner on the public homepage."
            checked={config.announcement_active}
            onChange={v => set('announcement_active', v)}
          />
          <div className="flex flex-col gap-4 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5 col-span-2">
                <Label className="text-xs font-medium">Banner message</Label>
                <Input
                  value={config.announcement_text}
                  onChange={e => set('announcement_text', e.target.value)}
                  placeholder="e.g. We are currently experiencing some issues..."
                  maxLength={200}
                  disabled={!config.announcement_active}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">{config.announcement_text.length}/200</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium">Banner type</Label>
                <Select
                  value={config.announcement_type}
                  onValueChange={v => set('announcement_type', v as any)}
                  disabled={!config.announcement_active}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ANNOUNCEMENT_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>
                        <span className="flex items-center gap-2">
                          <t.icon className={`h-3.5 w-3.5 ${t.color}`} />
                          {t.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Live preview */}
            {config.announcement_active && config.announcement_text && (
              <div className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium ${BANNER_PREVIEW[config.announcement_type]}`}>
                <BannerIcon className="h-4 w-4 shrink-0" />
                {config.announcement_text}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Unsaved changes bar */}
      {isDirty && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border sticky bottom-4 shadow-lg">
          <p className="text-sm text-muted-foreground font-medium">Unsaved changes</p>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={() => { setConfig(savedConfig); setIsDirty(false) }} disabled={saveMutation.isPending}>
              Discard
            </Button>
            <Button size="sm" onClick={() => saveMutation.mutate(config)} disabled={saveMutation.isPending} className="gap-1.5">
              {saveMutation.isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Saving...</> : <><Save className="h-3.5 w-3.5" />Save</>}
            </Button>
          </div>
        </div>
      )}

    </DashboardPageWrapper>
  )
}