import { SignUp } from '@clerk/nextjs'
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense>
      <SignUp
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