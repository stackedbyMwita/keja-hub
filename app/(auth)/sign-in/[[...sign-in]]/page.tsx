import { SignIn } from '@clerk/nextjs'
import { Suspense } from 'react'

export const metadata = {
  title: 'Sign In — KejaLink',
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="h-[450px] w-full animate-pulse rounded-2xl bg-muted/30" />}>
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
    </Suspense>
  )
}