import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { DesktopSidebar } from '@/components/dashboard/DashboardNavigation' // Update import path!
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await connection()
  const { userId, sessionClaims } = await auth()
  
  if (!userId) redirect('/sign-in')

  const meta = (sessionClaims?.publicMetadata ?? {}) as { role?: string }
  const role = meta.role ?? 'user'

  if (role === 'user') redirect('/')

  return (
    <div className="h-screen w-full flex overflow-hidden bg-background selection:bg-primary/20">
      
      {/* Safe in the layout flow. Will completely hide on mobile. */}
      <DesktopSidebar role={role} />

      <div className="flex-1 flex flex-col min-w-0 bg-muted/10">
        
        <DashboardHeader role={role} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          {children}
        </main>

      </div>
    </div>
  )
}