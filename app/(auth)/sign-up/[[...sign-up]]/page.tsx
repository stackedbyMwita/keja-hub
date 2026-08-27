import { SignUp } from '@clerk/nextjs'
import { Suspense } from 'react'

export const metadata = { title: 'Create an Account — KejaLink' }

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="h-[550px] w-full animate-pulse rounded-2xl bg-muted/30" />}>
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
    </Suspense>
  )
}
