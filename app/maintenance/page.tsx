import { createClient } from '@supabase/supabase-js'
import { connection } from 'next/server'
import { AppLogo } from '@/components/logo/Logo'
import { Construction } from 'lucide-react'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export default async function MaintenancePage() {
  await connection()

  const { data: config } = await supabase
    .from('system_config')
    .select('maintenance_message')
    .eq('id', 1)
    .single()

  const message = config?.maintenance_message ?? 'KéjaLink is currently undergoing scheduled maintenance. We will be back shortly.'

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center gap-8">
      <AppLogo />
      <div className="w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center justify-center">
        <Construction className="h-10 w-10 text-amber-600" />
      </div>
      <div className="max-w-md flex flex-col gap-3">
        <h1 className="text-2xl font-heading font-bold text-foreground">Under Maintenance</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
      </div>
      <p className="text-xs text-muted-foreground">
        Follow us on social media for updates.
      </p>
    </div>
  )
}