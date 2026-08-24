import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  await connection()
  const { userId, sessionClaims } = await auth()
  if (!userId) redirect('/sign-in')
  const role = (sessionClaims?.publicMetadata as any)?.role
  if (role !== 'superadmin') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}