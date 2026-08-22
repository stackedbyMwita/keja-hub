import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export interface ListingUnit {
  id:            string
  type:          string
  name:          string
  property_name: string
  price:         number
  county:        string
  location:      string
  description:   string
  amenities:     string[]
  available:     boolean
  cover_image:   string
  images:        string[]
  contact: {
    landlord_name: string
    phone:         string
    email:         string
    full_address:  string
    maps_url:      string
  }
}

const TYPE_DISPLAY_NAMES: Record<string, string> = {
  single_room: 'Single Room',
  double_room: 'Double Room',
  bedsitter: 'Bedsitter',
  studio: 'Studio',
  '1br':       '1 Bedroom Apartment',
  '2br':       '2 Bedroom Apartment',
  '3br':       '3 Bedroom Apartment',
  '4br_plus':  '4+ Bedroom House',
  commercial:  'Shop/Commercial Space',
}

/**
 * Fetches listings from the public_listings.
 */
export async function fetchListings(): Promise<ListingUnit[]> {
  const { data, error } = await supabase
    .from('public_listings')
    .select(`
      unit_type_id,
      type,
      price,
      description,
      amenities,
      total_count,
      available_count,
      property_id,
      property_name,
      county,
      location,
      address,
      total_score,
      cover_image_url,
      image_count
    `)
    .order('total_score', { ascending: false, nullsFirst: false })

  if (error) {
    console.error('❌ fetchListings error:', error)
    return []
  }

  if (!data) return []

  // Fetch landlord contact details for each property in one batch
  const propertyIds = [...new Set(data.map((d: any) => d.property_id))]

  const { data: properties } = await supabase
    .from('properties')
    .select(`
      id,
      landlord_id,
      profiles!landlord_id ( full_name, phone_number, email )
    `)
    .in('id', propertyIds)

  const propertyMap = new Map(
    (properties ?? []).map((p: any) => [p.id, p.profiles])
  )

  // Fetch all images for each unit type (not just cover) for the gallery
  const unitTypeIds = data.map((d: any) => d.unit_type_id)
  const { data: allImages } = await supabase
    .from('unit_images')
    .select('unit_type_id, image_url, is_cover')
    .in('unit_type_id', unitTypeIds)
    .order('is_cover', { ascending: false })

  const imagesByUnitType = new Map<string, string[]>()
  for (const img of allImages ?? []) {
    const existing = imagesByUnitType.get(img.unit_type_id) ?? []
    existing.push(img.image_url)
    imagesByUnitType.set(img.unit_type_id, existing)
  }

  // Map to dummy.json shape
  return data.map((row: any): ListingUnit => {
    const landlord = propertyMap.get(row.property_id)
    const images   = imagesByUnitType.get(row.unit_type_id) ?? []

    return {
      id:            row.unit_type_id,
      type:          row.type,
      name:          TYPE_DISPLAY_NAMES[row.type] ?? row.type,
      property_name: row.property_name,
      price:         row.price,
      county:        row.county,
      location:      row.location,
      description:   row.description ?? '',
      amenities:     row.amenities ?? [],
      available:     row.available_count > 0,
      cover_image:   row.cover_image_url ?? images[0] ?? '/placeholder-unit.jpg',
      images:        images.length > 0 ? images : ['/placeholder-unit.jpg'],
      contact: {
        landlord_name: landlord?.full_name    ?? 'KéjaLink Landlord',
        phone:         landlord?.phone_number ?? '',
        email:         landlord?.email        ?? '',
        full_address:  row.address ?? row.location,
        maps_url:      `https://maps.google.com/?q=${encodeURIComponent(row.location + ', ' + row.county)}`,
      },
    }
  })
}