import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'

import { UserButton } from '@clerk/nextjs'
import { LandlordSidebar } from '@/components/landlord/LandlordSidebar'
import { LandlordMobileNav } from '@/components/landlord/LandlordMobileNav'
import ThemeSwitch from '@/components/theme/ThemeToggle'
import { AuthButton } from '@/app/(landing)/_components/navbar/AuthButton'

export default async function LandlordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await connection()
  const { userId, sessionClaims } = await auth()
  if (!userId) redirect('/sign-in')

  const meta = (sessionClaims?.publicMetadata ?? {}) as { role?: string }
  if (meta.role !== 'landlord') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-background flex">
      <LandlordSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur flex items-center px-4 md:px-6 gap-4 sticky top-0 z-30">
          <LandlordMobileNav />
          <div className="flex-1" />
          <AuthButton />
          <ThemeSwitch />
        </header>

        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}