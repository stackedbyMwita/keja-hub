export const TYPE_LABELS = {
  single_room: 'Single Room',
  double_room: 'Double Room',
  bedsitter: 'Bedsitter',
  studio: 'Studio',
  '1br': '1 Bedroom',
  '2br': '2 Bedrooms',
  '3br': '3 Bedrooms',
  '4br_plus': '4+ Bedrooms',
  commercial: 'Shop / Commercial',
} as const;

export const SHORT_TYPE_LABELS: Record<keyof typeof TYPE_LABELS, string> = {
  single_room: 'Single Room',
  double_room: 'Double Room',
  bedsitter: 'Bedsitter',
  studio: 'Studio',
  '1br': '1 Bed',
  '2br': '2 Bed',
  '3br': '3 Bed',
  '4br_plus': '4+ Bed',
  commercial: 'Commercial',
};

export function getPropertyTypeLabel(
  type: string | null | undefined,
  options?: { short?: boolean; fallback?: string }
): string {
  const { short = false, fallback = 'Unknown Type' } = options || {};
  if (!type) return fallback;
  
  const map = short ? SHORT_TYPE_LABELS : TYPE_LABELS;
  return map[type as keyof typeof map] ?? type;
}