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
      <div className="hidden md:block relative m-4 lg:m-6 rounded-2xl overflow-hidden sticky top-4 lg:top-6 h-[calc(100vh-2rem)] lg:h-[calc(100vh-3rem)]">
        <Image
          src="/hero2.jpeg"
          alt="Beautiful Kenyan property"
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />

        {/* Logo + tagline pinned to bottom */}
        <div className="absolute bottom-8 left-8 right-8 z-10">
          <Link href="/" className="inline-block">
            <AppLogo className="text-white mb-3" />
          </Link>
          <p className="text-white/80 text-sm leading-relaxed max-w-xs">
            Verified homes, real landlords. Find your next place with confidence.
          </p>
        </div>
      </div>

      {/* ── Right panel — form ────────────────────────────────────────── */}
      <main className="flex flex-col items-center justify-center gap-6 px-6 py-12 bg-background min-h-screen md:min-h-0">
        {/* Mobile logo */}
        <div className="md:hidden">
          <Link href="/">
            <AppLogo />
          </Link>
        </div>

        <div className="w-full max-w-sm">
          {children}
        </div>
      </main>

    </div>
  )
}