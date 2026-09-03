export interface Unit {
  id: string
  type: string
  name: string
  property_name: string
  price: number
  county: string
  location: string
  description: string
  amenities: string[]
  available: boolean
}

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