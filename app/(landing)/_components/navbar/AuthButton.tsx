import { SignInButton, SignUpButton, UserButton, Show } from '@clerk/nextjs'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'

export function AuthButton() {
  return (
    <Suspense fallback={<div className="h-9 w-24 rounded-md bg-muted animate-pulse" />}>
      <Show when="signed-out">
        <SignInButton forceRedirectUrl="/sign-in">
          <Button variant="ghost" >Sign in</Button>
        </SignInButton>
        <SignUpButton forceRedirectUrl="/sign-up">
          <Button>Sign Up</Button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <UserButton
          userProfileUrl="/account"
          userProfileMode="navigation"
          appearance={{
            elements: {
              userButtonPopoverFooter: 'hidden',
              userProfileFooter: 'hidden',
              badge: 'hidden',
            },
          }}
        />
      </Show>
    </Suspense>
  )
}