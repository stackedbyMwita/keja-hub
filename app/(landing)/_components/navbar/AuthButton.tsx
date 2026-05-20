'use client'

import {
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
  Show,
} from '@clerk/nextjs'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { ChevronsUpDown, LogIn } from 'lucide-react'

type AuthButtonProps = {
  variant?: 'default' | 'expanded'
}

function SignedOutDefault() {
  return (
    <div className="flex items-center gap-2">


      <SignUpButton forceRedirectUrl="/sign-up">
        <Button>Sign up <LogIn /></Button>
      </SignUpButton>
    </div>
  )
}

function SignedOutExpanded() {
  return (
    <div className="flex flex-col gap-3 w-full">
      <SignInButton forceRedirectUrl="/sign-in">
        <Button variant="outline" className="w-full">
          Sign in
        </Button>
      </SignInButton>

      <SignUpButton forceRedirectUrl="/sign-up">
        <Button className="w-full">
          Create account
        </Button>
      </SignUpButton>
    </div>
  )
}

function SignedInDefault() {
  return (
    <UserButton
      appearance={{
        elements: {
          userButtonPopoverFooter: 'hidden',
          userProfileFooter: 'hidden',
          badge: 'hidden',
        },
      }}
    />
  )
}

function SignedInExpanded() {
  const { user } = useUser()

  if (!user) return null

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/40 w-full">
      {/* Avatar */}
      <Image
        src={user.imageUrl}
        alt="avatar"
        width={40}
        height={40}
        className="rounded-full"
      />

      {/* User info */}
      <div className="flex flex-col text-sm">
        <span className="font-medium">
          {user.fullName || 'User'}
        </span>
        <span className="text-muted-foreground text-xs">
          {user.primaryEmailAddress?.emailAddress}
        </span>
      </div>

      {/* Right side action */}
      <div className="ml-auto">
        <ChevronsUpDown size={20} className='text-muted-foreground/50' />
      </div>
    </div>
  )
}

function Skeleton({ variant }: { variant: 'default' | 'expanded' }) {
  return variant === 'default' ? (
    <div className="h-9 w-24 rounded-md bg-muted animate-pulse" />
  ) : (
    <div className="h-16 w-full rounded-lg bg-muted animate-pulse" />
  )
}

export function AuthButton({ variant = 'default' }: AuthButtonProps) {
  return (
    <Suspense fallback={<Skeleton variant={variant} />}>
      <Show when="signed-out">
        {variant === 'default' ? <SignedOutDefault /> : <SignedOutExpanded />}
      </Show>

      <Show when="signed-in">
        {variant === 'default' ? <SignedInDefault /> : <SignedInExpanded />}
      </Show>
    </Suspense>
  )
}