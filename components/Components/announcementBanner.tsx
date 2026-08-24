import { createClient } from '@supabase/supabase-js'
import { X, Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const TYPE_CONFIG = {
  info:    { icon: Info,         bg: 'bg-blue-50 dark:bg-blue-950/30',   border: 'border-blue-200 dark:border-blue-800',   text: 'text-blue-800 dark:text-blue-200'   },
  warning: { icon: AlertTriangle, bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-800 dark:text-amber-200' },
  success: { icon: CheckCircle2,  bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-800', text: 'text-green-800 dark:text-green-200' },
  error:   { icon: XCircle,       bg: 'bg-red-50 dark:bg-red-950/30',     border: 'border-red-200 dark:border-red-800',     text: 'text-red-800 dark:text-red-200'     },
} as const

export async function AnnouncementBanner() {
  const { data: config } = await supabase
    .from('system_config')
    .select('announcement_active, announcement_text, announcement_type')
    .eq('id', 1)
    .single()

  if (!config?.announcement_active || !config?.announcement_text) return null

  const type   = (config.announcement_type ?? 'info') as keyof typeof TYPE_CONFIG
  const cfg    = TYPE_CONFIG[type] ?? TYPE_CONFIG.info
  const Icon   = cfg.icon

  return (
    <div className={`w-full border-b ${cfg.bg} ${cfg.border}`}>
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3">
        <Icon className={`h-4 w-4 shrink-0 ${cfg.text}`} />
        <p className={`text-sm font-medium text-center ${cfg.text}`}>
          {config.announcement_text}
        </p>
      </div>
    </div>
  )
}