/**
 * KéjaLink Activity Log Utilities
 * Single source of truth for all action configs, labels, colors
 */

export interface ActivityAction {
  label:    string
  category: 'approval' | 'rejection' | 'images' | 'scoring' | 'admin' | 'landlord' | 'system'
  dot:      string
  badge:    string
}

export const ACTION_CONFIG: Record<string, ActivityAction> = {
  // ── Property actions ───────────────────────────────────────────────────────
  approved_property: {
    label: 'Approved property', category: 'approval',
    dot: 'bg-green-500', badge: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
  },
  rejected_property: {
    label: 'Rejected property', category: 'rejection',
    dot: 'bg-destructive', badge: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  },
  admin_approved_property: {
    label: 'Admin approved property', category: 'admin',
    dot: 'bg-green-600', badge: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
  },
  admin_rejected_property: {
    label: 'Admin rejected property', category: 'admin',
    dot: 'bg-destructive', badge: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  },
  suspended_property: {
    label: 'Suspended property', category: 'admin',
    dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400',
  },
  unsuspended_property: {
    label: 'Unsuspended property', category: 'admin',
    dot: 'bg-green-500', badge: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
  },
  reassigned_property_moderator: {
    label: 'Reassigned moderator', category: 'admin',
    dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  },

  // ── Landlord application actions ───────────────────────────────────────────
  approved_landlord_application: {
    label: 'Approved landlord', category: 'approval',
    dot: 'bg-green-500', badge: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
  },
  rejected_landlord_application: {
    label: 'Rejected landlord', category: 'rejection',
    dot: 'bg-destructive', badge: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  },
  admin_approved_landlord_application: {
    label: 'Admin approved landlord', category: 'admin',
    dot: 'bg-green-600', badge: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
  },
  admin_rejected_landlord_application: {
    label: 'Admin rejected landlord', category: 'admin',
    dot: 'bg-destructive', badge: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  },

  // ── User/landlord management ───────────────────────────────────────────────
  suspended_landlord: {
    label: 'Suspended landlord', category: 'admin',
    dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400',
  },
  unsuspended_landlord: {
    label: 'Unsuspended landlord', category: 'admin',
    dot: 'bg-green-500', badge: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
  },
  banned_landlord: {
    label: 'Banned landlord', category: 'admin',
    dot: 'bg-destructive', badge: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  },
  unbanned_landlord: {
    label: 'Unbanned landlord', category: 'admin',
    dot: 'bg-green-500', badge: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
  },
  downgraded_landlord: {
    label: 'Downgraded landlord', category: 'admin',
    dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400',
  },
  banned_user: {
    label: 'Banned user', category: 'admin',
    dot: 'bg-destructive', badge: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  },
  unbanned_user: {
    label: 'Unbanned user', category: 'admin',
    dot: 'bg-green-500', badge: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
  },

  // ── Moderator management ───────────────────────────────────────────────────
  promoted_to_moderator: {
    label: 'Promoted to moderator', category: 'admin',
    dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  },
  deactivated_moderator: {
    label: 'Deactivated moderator', category: 'admin',
    dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400',
  },
  reactivated_moderator: {
    label: 'Reactivated moderator', category: 'admin',
    dot: 'bg-green-500', badge: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
  },

  // ── Admin management ───────────────────────────────────────────────────────
  promoted_to_admin: {
    label: 'Promoted to admin', category: 'admin',
    dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  },
  demoted_admin: {
    label: 'Demoted admin', category: 'admin',
    dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400',
  },
  deactivated_admin: {
    label: 'Deactivated admin', category: 'admin',
    dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400',
  },
  reactivated_admin: {
    label: 'Reactivated admin', category: 'admin',
    dot: 'bg-green-500', badge: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
  },

  // ── Scoring & images ───────────────────────────────────────────────────────
  scored_property: {
    label: 'Scored property', category: 'scoring',
    dot: 'bg-primary', badge: 'bg-primary/10 text-primary',
  },
  uploaded_unit_image: {
    label: 'Uploaded image', category: 'images',
    dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  },

  // ── Landlord self-actions ──────────────────────────────────────────────────
  created_property: {
    label: 'Created property', category: 'landlord',
    dot: 'bg-muted-foreground', badge: 'bg-muted text-muted-foreground',
  },
  submitted_property_for_review: {
    label: 'Submitted for review', category: 'landlord',
    dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  },

  // ── System ────────────────────────────────────────────────────────────────
  system_config_update: {
    label: 'System config updated', category: 'system',
    dot: 'bg-muted-foreground', badge: 'bg-muted text-muted-foreground',
  },
}

export const CATEGORIES = [
  { value: 'all',      label: 'All actions'   },
  { value: 'approval', label: 'Approvals'     },
  { value: 'rejection',label: 'Rejections'    },
  { value: 'images',   label: 'Images'        },
  { value: 'scoring',  label: 'Scoring'       },
  { value: 'admin',    label: 'Admin actions' },
  { value: 'landlord', label: 'Landlord'      },
  { value: 'system',   label: 'System'        },
] as const

export const DATE_RANGES = [
  { value: 'all',   label: 'All time'   },
  { value: 'today', label: 'Today'      },
  { value: 'week',  label: 'This week'  },
  { value: 'month', label: 'This month' },
] as const

export function getActionConfig(action: string): ActivityAction {
  return ACTION_CONFIG[action] ?? {
    label:    action.replace(/_/g, ' '),
    category: 'system',
    dot:      'bg-muted-foreground',
    badge:    'bg-muted text-muted-foreground',
  }
}

export function getTarget(action: string, metadata: any): string {
  if (metadata?.property_name) return metadata.property_name
  if (metadata?.landlord_name) return metadata.landlord_name
  if (metadata?.full_name)     return metadata.full_name
  if (metadata?.email)         return metadata.email
  if (metadata?.new_mod_name)  return metadata.new_mod_name
  return '—'
}

export function getDateRangeFilter(range: string): string | null {
  const now = new Date()
  switch (range) {
    case 'today':
      return new Date(now.setHours(0,0,0,0)).toISOString()
    case 'week':
      return new Date(now.setDate(now.getDate() - 7)).toISOString()
    case 'month':
      return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    default:
      return null
  }
}

export function getActionsForCategory(category: string): string[] {
  if (category === 'all') return []
  return Object.entries(ACTION_CONFIG)
    .filter(([, cfg]) => cfg.category === category)
    .map(([action]) => action)
}

export function formatRelativeTime(date: string): string {
  const diff  = Date.now() - new Date(date).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'Just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7)   return `${days}d ago`
  return new Date(date).toLocaleDateString('en-KE', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export function formatAbsoluteTime(date: string): string {
  return new Date(date).toLocaleDateString('en-KE', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}