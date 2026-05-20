import Image from 'next/image'
import Link from 'next/link'
import { AppLogo } from '@/components/logo/Logo'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen grid md:grid-cols-2">

      {/* ── Left panel — hero image ────────────────────────────────────── */}
      <div className="hidden md:block relative m-4 lg:m-6 rounded-2xl overflow-hidden">
        <Image
          src="/hero2.jpeg"
          alt="Beautiful Kenyan property"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />

        {/* Logo + tagline pinned to bottom */}
        <div className="absolute bottom-8 left-8 right-8">
          <Link href="/">
            <AppLogo className="text-white mb-3" />
          </Link>
          <p className="text-white/80 text-sm leading-relaxed max-w-xs">
            Verified homes, real landlords. Find your next place with confidence.
          </p>
        </div>
      </div>

      {/* ── Right panel — form ────────────────────────────────────────── */}
      <div className="flex flex-col items-center justify-center gap-6 px-6 py-12 bg-background overflow-y-auto">
        {/* Mobile logo */}
        <div className="md:hidden">
          <Link href="/">
            <AppLogo />
          </Link>
        </div>

        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>

    </div>
  )
}