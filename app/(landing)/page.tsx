import { connection } from 'next/server'
import { fetchListings } from '@/lib/api/listings'
import LandingPage from './landingPageClient'

export const dynamic = 'force-dynamic'

export default async function Page() {
  await connection()
  const initialListings = await fetchListings()

  return <LandingPage initialListings={initialListings} />
}