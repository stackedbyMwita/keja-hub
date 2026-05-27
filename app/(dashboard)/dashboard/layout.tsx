import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
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

  // If a standard user ends up here, boot them to the homepage
  if (role === 'user') redirect('/')

  return (
    // STRICT BOUNDING BOX: Fixed screen height, no outer scrolling allowed
    <div className="h-screen w-full flex overflow-hidden bg-background selection:bg-primary/20">
      
      {/* Sidebar is fixed naturally by the parent flex container */}
      <DashboardSidebar role={role} />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 bg-muted/10">
        
        {/* Header is fixed at the top (shrink-0 prevents it from squishing) */}
        <DashboardHeader role={role} />
        
        {/* SCROLLABLE AREA: Only the main content is allowed to scroll */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          {children}
        </main>

      </div>
    </div>
  )
}