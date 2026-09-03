'use client'

import { cn } from '@/lib/utils'
import * as SwitchPrimitives from '@radix-ui/react-switch'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) {
    return (
      <div className="relative inline-flex h-8 w-14 items-center rounded-full bg-muted">
        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-background shadow-sm translate-x-1">
          <Sun size={13} />
        </div>
      </div>
    )
  }

  const isDark = theme === 'dark'

  return (
    <SwitchPrimitives.Root
      checked={isDark}
      onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
      className={cn(
        'relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300',
        'bg-muted hover:bg-muted/70',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      )}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          'flex items-center justify-center h-6 w-6 rounded-full bg-background shadow-sm',
          'transition-transform duration-300 ease-spring',
          'data-[state=checked]:translate-x-7 data-[state=unchecked]:translate-x-1'
        )}
      >
        {isDark
          ? <Moon size={13} className="" />
          : <Sun size={13} className="" />
        }
      </SwitchPrimitives.Thumb>
    </SwitchPrimitives.Root>
  )
}