'use client'

import ThemeToggle from '@/components/theme/ThemeToggle'
import { Button } from '@/components/ui/button'
import { ArrowLeft, HomeIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import MaxWidthWrapper from './MaxWidthWrapper'

export default function Navbar() {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <nav className="border-b border-border sticky top-0 z-50 bg-background/90 backdrop-blur-md">
      <MaxWidthWrapper className="h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!isHome ? (
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Link href="/"><ArrowLeft size={15} /></Link>
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Link href="/"><HomeIcon size={15} /></Link>
            </Button>
          )}
          <Link
            href="/"
            className="font-bold font-serif text-md tracking-wide text-foreground hover:text-foreground/70 transition-colors"
          >
            Outreach Playbook
          </Link>
        </div>
          <ThemeToggle />
      </MaxWidthWrapper>
    </nav>
  )
}