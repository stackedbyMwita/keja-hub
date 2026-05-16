import { SignUp } from '@clerk/nextjs'
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense>
      <SignUp
        appearance={{
          elements: {
            // Strip Clerk's card chrome — our layout is the container
            card: 'shadow-none border-0 bg-transparent p-0 w-full',
            footer: 'hidden',

            // Header
            headerTitle: 'text-foreground font-heading text-2xl font-semibold',
            headerSubtitle: 'text-muted-foreground text-sm',

            // Social button (Google)
            socialButtonsBlockButton: 'border border-border bg-background text-foreground hover:bg-muted transition-colors rounded-lg h-11',
            socialButtonsBlockButtonText: 'text-sm font-medium',

            // Divider
            dividerLine: 'bg-border',
            dividerText: 'text-muted-foreground text-xs',

            // Inputs
            formFieldLabel: 'text-sm text-foreground font-medium',
            formFieldInput: 'border border-border bg-background text-foreground rounded-lg h-11 px-3 text-sm focus:ring-2 focus:ring-ring focus:border-transparent transition-all',
            formFieldInputShowPasswordButton: 'text-muted-foreground',

            // Error
            formFieldErrorText: 'text-destructive text-xs',
            alertText: 'text-destructive text-sm',

            // Submit button — uses your primary color
            formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-lg h-11 text-sm font-medium shadow-none',

            // Links
            footerActionLink: 'text-primary hover:text-primary/80 font-medium',
            identityPreviewEditButton: 'text-primary',
          },
          layout: {
            socialButtonsPlacement: 'top',
          },
        }}
      />
    </Suspense>
  )
}