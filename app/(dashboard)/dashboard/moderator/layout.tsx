import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/SideBar'
import { DashboardHeader } from '@/components/dashboard/Header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId, sessionClaims } = await auth()

  if (!userId) redirect('/sign-in')

  const meta = (sessionClaims?.publicMetadata ?? {}) as { role?: string }
  const role = meta.role ?? 'user'

  if (role === 'user') redirect('/')

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <DashboardSidebar role={role} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader role={role} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}