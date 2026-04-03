'use client'

import { SignUp } from '@clerk/nextjs'

export default function SignInClient() {
  return (
    <SignUp
        appearance={{
          elements: {
            footer: 'hidden',
            card: 'shadow-none border-0 bg-transparent',
          },
        }}
      />
  )
}