import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const TYPE_DISPLAY_NAMES: Record<string, string> = {
  single_room: 'Single Room',
  double_room: 'Double Room',
  bedsitter:   'Bedsitter',
  studio:      'Studio',
  '1br':       '1 Bedroom Apartment',
  '2br':       '2 Bedroom Apartment',
  '3br':       '3 Bedroom Apartment',
  '4br_plus':  '4+ Bedroom House',
  commercial:  'Shop/Commercial Space',
}

// ── Public unit data — NO contact info ───────────────────────────────────────
export interface PublicUnit {
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
  // contact is intentionally excluded
}

export async function fetchUnitById(unitId: string): Promise<PublicUnit | null> {
  const { data: unitType, error } = await supabase
    .from('unit_types')
    .select(`
      id, type, price, description, amenities,
      total_count, available_count, status,
      property_id,
      properties!inner (
        id, name, county, location, address, status, total_score
      ),
      unit_images ( image_url, is_cover )
    `)
    .eq('id', unitId)
    .single()

  if (error || !unitType) {
    console.error('❌ fetchUnitById error:', error)
    return null
  }

  const property = (unitType as any).properties

  // Only return approved + active units
  if (property.status !== 'approved' || unitType.status !== 'active') {
    return null
  }

  const images = ((unitType as any).unit_images ?? [])
    .sort((a: any, b: any) => (b.is_cover ? 1 : 0) - (a.is_cover ? 1 : 0))
    .map((img: any) => img.image_url)

  return {
    id:            unitType.id,
    type:          unitType.type,
    name:          TYPE_DISPLAY_NAMES[unitType.type] ?? unitType.type,
    property_name: property.name,
    price:         unitType.price,
    county:        property.county,
    location:      property.location,
    description:   unitType.description ?? '',
    amenities:     unitType.amenities ?? [],
    available:     unitType.available_count > 0,
    cover_image:   images[0] ?? '/placeholder-unit.jpg',
    images:        images.length > 0 ? images : ['/placeholder-unit.jpg'],
  }
}