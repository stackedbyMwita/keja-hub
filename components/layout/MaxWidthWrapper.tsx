import { cn } from '@/lib/utils'

interface MaxWidthWrapperProps {
  children: React.ReactNode
  className?: string
}

export default function MaxWidthWrapper({ children, className }: MaxWidthWrapperProps) {
  return (
    <div className={cn(
      'mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-12 lg:py-16',
      className
    )}>
      {children}
    </div>
  )
}