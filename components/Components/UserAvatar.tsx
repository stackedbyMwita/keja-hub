/**
 * KéjaLink UserAvatar
 * Consistent avatar across the entire app.
 * Shows real photo if available, falls back to styled initials.
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

// ── Color palette — deterministic from name/id ────────────────────────────────

const COLORS = [
  { bg: 'bg-blue-100 dark:bg-blue-950/60',   text: 'text-blue-700 dark:text-blue-300'   },
  { bg: 'bg-green-100 dark:bg-green-950/60', text: 'text-green-700 dark:text-green-300' },
  { bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-300' },
  { bg: 'bg-rose-100 dark:bg-rose-950/60',   text: 'text-rose-700 dark:text-rose-300'   },
  { bg: 'bg-purple-100 dark:bg-purple-950/60',text:'text-purple-700 dark:text-purple-300'},
  { bg: 'bg-teal-100 dark:bg-teal-950/60',   text: 'text-teal-700 dark:text-teal-300'   },
  { bg: 'bg-orange-100 dark:bg-orange-950/60',text:'text-orange-700 dark:text-orange-300'},
  { bg: 'bg-cyan-100 dark:bg-cyan-950/60',   text: 'text-cyan-700 dark:text-cyan-300'   },
  { bg: 'bg-pink-100 dark:bg-pink-950/60',   text: 'text-pink-700 dark:text-pink-300'   },
  { bg: 'bg-indigo-100 dark:bg-indigo-950/60',text:'text-indigo-700 dark:text-indigo-300'},
]

function getColor(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return '?'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

// ── Size map ──────────────────────────────────────────────────────────────────

const SIZE_MAP = {
  xs:  { avatar: 'w-6 h-6',   text: 'text-[10px] font-bold' },
  sm:  { avatar: 'w-8 h-8',   text: 'text-xs font-bold'     },
  md:  { avatar: 'w-10 h-10', text: 'text-sm font-bold'     },
  lg:  { avatar: 'w-12 h-12', text: 'text-base font-bold'   },
  xl:  { avatar: 'w-16 h-16', text: 'text-xl font-bold'     },
  '2xl':{ avatar: 'w-20 h-20',text: 'text-2xl font-bold'    },
}

type AvatarSize = keyof typeof SIZE_MAP

// ── Component ─────────────────────────────────────────────────────────────────

interface UserAvatarProps {
  name?:      string | null
  imageUrl?:  string | null
  userId?:    string        // used as color seed if no name
  size?:      AvatarSize
  className?: string
}

export function UserAvatar({
  name,
  imageUrl,
  userId,
  size      = 'md',
  className = '',
}: UserAvatarProps) {
  const sizes    = SIZE_MAP[size]
  const initials = getInitials(name)
  const seed     = name?.trim() || userId || '?'
  const color    = getColor(seed)

  // Strip DiceBear URLs — treat them as no image
  const hasRealImage = imageUrl
    && !imageUrl.includes('dicebear.com')
    && !imageUrl.includes('placeholder')

  return (
    <Avatar className={cn(sizes.avatar, 'shrink-0', className)}>
      {hasRealImage && (
        <AvatarImage
          src={imageUrl!}
          alt={name ?? 'User avatar'}
          className="object-cover"
        />
      )}
      <AvatarFallback
        className={cn(
          'rounded-full border-0 select-none',
          color.bg,
          color.text,
          sizes.text,
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}