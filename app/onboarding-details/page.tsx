import { AppLogo } from '@/components/logo/Logo'
import { DetailsForm } from '@/components/OnboardingDetailsComponents/DetailsForm'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'

export const metadata = {
  title: 'Complete your profile — KejaHub',
}

export default function OnboardingDetailsPage() {
  return (
    <div className="min-h-screen grid md:grid-cols-2">

      {/* Left panel */}
      <div className="hidden md:block relative m-4 lg:m-6 rounded-2xl overflow-hidden">
        <Image
          src="/hero4.jpeg"
          alt="Beautiful Kenyan property"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />
        <div className="absolute bottom-8 left-8 right-8">
          <Link href="/">
            <AppLogo className="text-white mb-3" />
          </Link>
          <p className="text-white/80 text-sm leading-relaxed max-w-xs">
            Verified homes, real landlords. Find your next place with confidence.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-col items-center justify-center gap-6 px-6 py-12 bg-background overflow-y-auto">
        <div className="md:hidden">
          <Link href="/"><AppLogo /></Link>
        </div>
        <div className="w-full max-w-sm">
          <Suspense>
            <DetailsForm />
          </Suspense>
        </div>
      </div>

    </div>
  )
}