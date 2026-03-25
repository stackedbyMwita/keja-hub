'use client'

import ThemeToggle from '@/components/theme/ThemeToggle'
import { Star } from 'lucide-react'
import { AppLogo } from '../logo/Logo'
import { Header } from './Header'

export default function Navbar() {

  return (
    <nav className="border-b border-border sticky top-0 z-50 bg-background/90 backdrop-blur-md">
      <div className="h-16 flex items-center justify-between mx-auto w-full max-w-6xl px-4 md:px-8">
        <div className="flex items-center gap-2">
          <AppLogo/>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Header />
        </div>
      </div>
    </nav>
  )
}
