import MaxWidthWrapper from '@/components/layout/MaxWidthWrapper'
import { UserProfile } from '@clerk/nextjs'
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense>
      <MaxWidthWrapper>
        <UserProfile
        appearance={{
          elements: {
            footer: 'hidden',
            rootBox: 'w-full h-full',
            cardBox: 'w-full h-full shadow-none border-0 rounded-none',
            card: 'bg-background rounded-none',
            navbar: 'border-r border-border bg-background',
            navbarButton: 'text-muted-foreground hover:text-foreground',
            navbarButtonActive: 'text-foreground bg-accent',
            pageScrollBox: 'bg-background',
            formButtonPrimary: 'bg-primary text-primary-foreground hover:opacity-90',
            formFieldInput: 'bg-input border-border',
            badge: 'hidden',
          },
        }}
      />
      </MaxWidthWrapper>
    </Suspense>
  )
}