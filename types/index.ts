import { LucideIcon } from "lucide-react"

export interface Unit {
  id: string
  type: string
  name: string
  property_name: string
  price: number
  county: string
  location: string
  cover_image: string
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

export interface UnitContact {
  landlord_name: string
  phone: string
  email: string
  full_address: string
  maps_url: string
}

export interface UnlockCardProps {
  price: number
  type: string
  location: string
  county: string
  available: boolean
  propertyName: string
  contact: UnitContact
}

export type PropertyStatus = 'Approved' | 'Pending' | 'Rejected'

export interface Property {
  id: string
  name: string
  location: string
  totalUnits: number
  availableUnits: number
  status: PropertyStatus
}

export interface EmptyStateAction {
  label: string
  href?: string
  onClick?: () => void
  variant?: 'default' | 'outline'
}

export interface EmptyStateProps {
  icon?:        LucideIcon
  title:        string
  description?: string
  action?:      EmptyStateAction
  size?:        'sm' | 'md' | 'lg'
  bordered?:    boolean   // wrap in dashed border card
  className?:   string
}

export interface ActivityLogProps {
  actorId?:    string
  targetId?:   string
  targetType?: string
  actions?:    string[]
  compact?:    boolean
  showActor?:  boolean
  title?:      string
  limit?:      number
}

export interface LogEntry {
  id:          string
  action:      string
  target_type: string
  target_id:   string
  metadata:    any
  created_at:  string
  profiles:    {
    id:        string
    full_name: string | null
    email:     string
    role:      string
    avatar_url:string | null
  } | null
}

export interface ActivityResponse {
  data:       LogEntry[]
  total:      number
  page:       number
  pageSize:   number
  totalPages: number
}
