import { NextResponse } from 'next/server'
import { fetchListings } from '@/lib/api/listings'

export async function GET() {
  try {
    const listings = await fetchListings()
    return NextResponse.json({ units: listings })
  } catch (err) {
    console.error('❌ Listings API error:', err)
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }
}