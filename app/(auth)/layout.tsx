import Image from 'next/image'
import { AppLogo } from '@/components/logo/Logo'
import { Suspense } from 'react'
import { AuthFooter } from './_components/auth-footer'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen grid md:grid-cols-2">

      {/* ── Left panel — hero image ── */}
      <div className="hidden md:block relative m-4 lg:m-6 rounded-2xl overflow-hidden">
        <Image
          src="/hero.png"
          alt="Beautiful Kenyan property"
          fill
          priority
          className="object-cover"
        />
        {/* Subtle dark gradient so logo is legible */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />

        {/* Logo + tagline pinned to bottom-left */}
        <div className="absolute bottom-8 left-8 right-8">
          <AppLogo className="text-white mb-3" />
          <p className="text-white/80 text-sm leading-relaxed max-w-xs">
            Verified homes, real landlords. Find your next place with confidence.
          </p>
        </div>
      </div>

      {/* ── Right panel — auth form ── */}
      <div className="flex flex-col items-center justify-center gap-6 p-8 bg-background">
        {/* Logo visible on mobile only */}
        <div className="md:hidden">
          <AppLogo />
        </div>

        <div className="w-full max-w-sm">
          {children}
        </div>

        <Suspense>
          <AuthFooter />
        </Suspense>
      </div>
    </div>
  )
}