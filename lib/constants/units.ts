export const UNIT_TYPES = [
  { value: 'single_room', label: 'Single Room' },
  { value: 'double_room', label: 'Double Room' },
  { value: 'bedsitter',   label: 'Bedsitter' },
  { value: 'studio',      label: 'Studio' },
  { value: '1br',         label: '1 Bedroom' },
  { value: '2br',         label: '2 Bedrooms' },
  { value: '3br',         label: '3 Bedrooms' },
  { value: '4br_plus',    label: '4+ Bedrooms' },
  { value: 'commercial',  label: 'Shop/Commercial' },
] as const

export type UnitTypeValue = (typeof UNIT_TYPES)[number]['value']
export type BaseUnitType = (typeof UNIT_TYPES)[number]['value']

export const UNIT_FILTER_OPTIONS = [
  { value: 'all', label: 'All types' },
  ...UNIT_TYPES,
] as const

export type UnitFilterValue = (typeof UNIT_FILTER_OPTIONS)[number]['value']

// Helper lookup map for fast label retrieval: UNIT_TYPE_LABELS['bedsitter'] -> 'Bedsitter'
export const UNIT_TYPE_LABELS = Object.fromEntries(
  UNIT_TYPES.map((u) => [u.value, u.label])
) as Record<UnitTypeValue, string>

export type UnitType = (typeof UNIT_FILTER_OPTIONS)[number]['value']