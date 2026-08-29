import { cn } from '@/lib/utils'

interface DashboardPageWrapperProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardPageWrapper({ 
  children, 
  className, 
  ...props 
}: DashboardPageWrapperProps) {
  return (
    <div 
      // w-full ensures it shrinks on mobile, max-w-7xl caps it at 1280px on desktop
      className={cn("flex flex-col gap-6 w-full max-w-7xl m-2 mx-auto", className)} 
      {...props}
    >
      {children}
    </div>
  )
}