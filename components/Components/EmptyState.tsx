import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { EmptyStateProps } from '@/types'
import { Inbox } from 'lucide-react'
import Link from 'next/link'

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  size      = 'md',
  bordered  = false,
  className = '',
}: EmptyStateProps) {
  const padding = size === 'sm' ? 'py-8' : size === 'lg' ? 'py-20' : 'py-14'
  const iconSize = size === 'sm' ? 'w-10 h-10' : size === 'lg' ? 'w-16 h-16' : 'w-12 h-12'
  const iconCls  = size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6'
  const titleCls = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-base' : 'text-sm'

  const inner = (
    <div className={cn(
      'flex flex-col items-center justify-center text-center gap-3',
      padding,
      className,
    )}>
      {/* Icon */}
      <div className={cn('rounded-full bg-muted flex items-center justify-center', iconSize)}>
        <Icon className={cn('text-muted-foreground/50', iconCls)} />
      </div>

      {/* Text */}
      <div className="flex flex-col gap-1">
        <p className={cn('font-semibold text-foreground', titleCls)}>{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Action */}
      {action && (
        action.href ? (
          <Button
            asChild
            variant={action.variant ?? 'outline'}
            size="sm"
            className="mt-1"
          >
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ) : (
          <Button
            variant={action.variant ?? 'outline'}
            size="sm"
            className="mt-1"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )
      )}
    </div>
  )

  if (bordered) {
    return (
      <div className="border-2 border-dashed border-border rounded-xl">
        {inner}
      </div>
    )
  }

  return inner
}