'use client'

import ThemeToggle from '@/components/theme/ThemeToggle'
import { Star } from 'lucide-react'
import { Logo } from '../logo/logo'

export default function Navbar() {

  return (
    <nav className="border-b border-border sticky top-0 z-50 bg-background/90 backdrop-blur-md">
      <div className="h-16 flex items-center justify-between mx-auto w-full max-w-6xl px-4 md:px-8">
        <div className="flex items-center gap-2">
          <Logo 
                  name="Hello World" 
                  icon={<Star className="w-4 h-4" />}
                />
        </div>
          <ThemeToggle />
      </div>
    </nav>
  )
}
