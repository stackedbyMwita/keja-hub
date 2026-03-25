import { SignIn } from '@clerk/nextjs'
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense>
      <SignIn
        appearance={{
          elements: {
            footer: 'hidden',
            card: 'shadow-none border-0 bg-transparent',
          },
        }}
      />
    </Suspense>
  )
}