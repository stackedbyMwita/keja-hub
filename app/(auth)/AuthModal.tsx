'use client'

import { SignIn, SignUp } from '@clerk/nextjs'
import { X } from 'lucide-react'
import { useState } from 'react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  // If triggered from unit click, we redirect back after auth
  redirectUrl?: string
}

export function AuthModal({ isOpen, onClose, redirectUrl }: AuthModalProps) {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')

  if (!isOpen) return null

  const clerkAppearance = {
    elements: {
      card: 'shadow-none border-0 bg-transparent p-0 w-full',
      footer: 'hidden',
      headerTitle: 'text-foreground font-heading text-2xl font-semibold',
      headerSubtitle: 'text-muted-foreground text-sm',
      socialButtonsBlockButton:
        'border border-border bg-background text-foreground hover:bg-muted transition-colors rounded-lg h-11',
      socialButtonsBlockButtonText: 'text-sm font-medium',
      dividerLine: 'bg-border',
      dividerText: 'text-muted-foreground text-xs',
      formFieldLabel: 'text-sm text-foreground font-medium',
      formFieldInput:
        'border border-border bg-background text-foreground rounded-lg h-11 px-3 text-sm focus:ring-2 focus:ring-ring focus:border-transparent transition-all',
      formFieldInputShowPasswordButton: 'text-muted-foreground',
      formFieldErrorText: 'text-destructive text-xs',
      alertText: 'text-destructive text-sm',
      formButtonPrimary:
        'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-lg h-11 text-sm font-medium shadow-none',
      footerActionLink: 'text-primary hover:text-primary/80 font-medium',
      identityPreviewEditButton: 'text-primary',
    },
    layout: {
      socialButtonsPlacement: 'top' as const,
    },
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-background p-8 shadow-xl border border-border">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Prompt message — shown when triggered by unit click */}
        {redirectUrl && (
          <div className="mb-6 p-3 rounded-lg bg-muted border border-border">
            <p className="text-sm text-foreground font-medium">
              Create an account to view unit details
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sign in or sign up to access full listing information.
            </p>
          </div>
        )}

        {/* Clerk form */}
        {mode === 'sign-in' ? (
          <SignIn
            appearance={clerkAppearance}
            forceRedirectUrl={redirectUrl ?? '/onboarding'}
          />
        ) : (
          <SignUp
            appearance={clerkAppearance}
            forceRedirectUrl={redirectUrl ?? '/onboarding'}
          />
        )}

        {/* Footer toggle */}
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {mode === 'sign-in' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                onClick={() => setMode('sign-up')}
                className="text-primary font-medium hover:underline underline-offset-4"
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setMode('sign-in')}
                className="text-primary font-medium hover:underline underline-offset-4"
              >
                Sign in
              </button>
            </>
          )}
        </p>

      </div>
    </>
  )
}