import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: string
  iconBg?: string
  iconColor?: string
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  iconBg = 'bg-primary/10', 
  iconColor = 'text-primary' 
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
        </div>
        
        {/* Icon Container */}
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm text-muted-foreground">
          <span>{trend}</span>
        </div>
      )}
    </div>
  )
}